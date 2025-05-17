import WebRtcController from '../controllers/WebRtcController';
import RollingAvg from './RollingAvg';
import { getMyUserId } from './WorkspaceHelper';

/**
 * TimeSync is responsible for syncronizing playback across users.
 * 
 * To do this, it first samples latencies by measuring the round trip time (PING + PONG)
 * for each peer. These latency samples are then smoothed via rolling avg, before we calculate
 * the max latency across peers (within our cutoff window). The max latency and individual latency
 * values are used to determine the audio playback delay for each user.
 * 
 * For example: imagine we have 3 peers with the following avg latencies:
 *   - peer 1: 50ms
 *   - peer 2: 30ms
 *   - peer 3: 500ms
 * 
 * To find the max latency, we exclude peer 3 since 500ms is beyond our cuttoff and find the max between peer 1 and 2
 * which is 50ms. That dictates that for:
 *   - peer 1, we don't wait at all before triggering playback for their instrument since it's the max latency
 *   - peer 2, we wait 20ms (max - latency) before triggering playback for their instrument
 *   - peer 3, we don't wait before triggering playback for their instrument, since it's already coming in noticably late
 *   - for ourselves, we wait 50ms before triggering playback for our own instrumentinstrument
 * 
 * To visualize this, the first | represents the time a user started playing a note and the second | represents when it
 * was recieved by us:
 *   Peer 1    |-----------------|playback
 *   Peer 2    |-----------|------playback
 *   Peer 3    |------------------------------------------|playback (oh well, at least we still hear them)
 *   Ourselves ||-----------------playback
 * 
 * Since there's no way to ensure time scheduling of this precision in js, the playback engine uses the WebAudio
 * scheduling capabilities via tone.js.
 */

// tuning values
const MAX_LATENCY_CUTOFF_MS = 100;
const MIN_LATENCY_CUTOFF_MS = 20;
const SAMPLES_PER_MINUTE = 500;
/**
 * time window to smooth peer latency values
 * 
 * it's a tradeoff between syncronization accuracy (lower is better) and
 * consistency in playback audio offset (higher is better)
 */
const SMOOTHING_WINDOW_SECONDS = 2;

// window sample size
const WINDOW_SIZE = Math.floor(SAMPLES_PER_MINUTE / 60 * SMOOTHING_WINDOW_SECONDS);

const SYNC_EVENT = {
  LATENCY_PING: 'LATENCY_PING',
  LATENCY_PONG: 'LATENCY_PONG',
} as const;

interface PeerLatencyWindows {
  [peerId: string]: RollingAvg
}

interface SamplingMessage {
  pingTime: number,
  peerId: string,
}

export default class TimeSync {
  static instance?: TimeSync;
  private webrtcController: WebRtcController;
  private peerLatencyWindows: PeerLatencyWindows;
  private maxLatency: number;
  private myUserId?: string;

  public static getInstance(): TimeSync {
    if (!TimeSync.instance) {
      TimeSync.instance = new TimeSync();
    }

    return TimeSync.instance;
  }

  private constructor() {
    this.webrtcController = WebRtcController.getInstance();
    this.webrtcController.on(SYNC_EVENT.LATENCY_PING, this.onPing.bind(this));
    this.webrtcController.on(SYNC_EVENT.LATENCY_PONG, this.onPong.bind(this));
    this.maxLatency = 0;
    this.peerLatencyWindows = {};
    this.tick = this.tick.bind(this);
    this.tick();
  }

  public removePeer(peerId: string) {
    delete this.peerLatencyWindows[peerId];
  }

  public getAudioDelay(userId: string): number {
    return userId === this.myUserId
      ? this.getDelayForSelf()
      : this.getDelayForPeer(userId);
  }

  private getDelayForPeer(peerId: string): number {
    const peerAvg = this.peerLatencyWindows[peerId]?.avg ?? 0;
    const delay = this.maxLatency - peerAvg;
    if (delay < MIN_LATENCY_CUTOFF_MS) {
      // ignore unperceptable delay
      return 0;
    }

    return Math.max(delay, 0);
  }

  private getDelayForSelf(): number {
    return this.maxLatency;
  }

  private tick() {
    this.webrtcController.getActivePeerIds().forEach(peerId => {
      const pingTime = performance.now();
      try {
        this.verifyMyUserId();
        this.webrtcController.sendToPeer(peerId, SYNC_EVENT.LATENCY_PING, {
          pingTime,
          peerId: this.myUserId!,
        });
      } catch (err) {
        // gracefully handle sample failure, we'll keep trying at the sample rate
        return;
      }

      if (!this.peerLatencyWindows[peerId]) {
        this.peerLatencyWindows[peerId] = new RollingAvg(WINDOW_SIZE);
      }
    });

    this.maxLatency = Object
      .values(this.peerLatencyWindows)
      .reduce((currentMax, peerLatency) => {
        if (peerLatency.avg > MAX_LATENCY_CUTOFF_MS) {
          // ignore client due to excessive latency
          return currentMax;
        }

        return Math.floor(Math.max(currentMax, peerLatency.avg));
      }, 0);

    // @ts-ignore
    if (window.DEBUG_LATENCY) {
      this.logLatencies();
    }

    setTimeout(this.tick, 60_000 / SAMPLES_PER_MINUTE);
  }

  private onPing(response: SamplingMessage) {
    try {
      this.verifyMyUserId();
      this.webrtcController.sendToPeer(response.peerId, SYNC_EVENT.LATENCY_PONG, {
        pingTime: response.pingTime,
        peerId: this.myUserId!,
      });
    } catch (err) {
      return;
    }
  }

  private onPong(response: SamplingMessage) {
    const { peerId, pingTime } = response;
    const latency = (performance.now() - pingTime) / 2;
    const peerLatencyWindow = this.peerLatencyWindows[peerId];
    peerLatencyWindow.add(latency);
  }

  private verifyMyUserId() {
    if (!this.myUserId) {
      this.myUserId = getMyUserId();
      throw new Error('User id not yet retreived'); // TODO: ensure room bootstap is complete before initializing
    }
  }

  private logLatencies() {
    const table = Object.entries(this.peerLatencyWindows).map(([peerId, window]) => ({
      user: peerId,
      ping: Math.floor(window.avg),
      'playback offset': this.getAudioDelay(peerId),
    }));

    if (Object.values(table).length) {
      console.table(table);
    }
  }
}
