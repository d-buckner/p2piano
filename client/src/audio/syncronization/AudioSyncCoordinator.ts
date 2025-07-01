import { removePeerConnection, setMaxLatency, updatePeerLatency } from '../../actions/ConnectionActions';
import { store } from '../../app/store';
import Logger from '../../lib/Logger';
import RollingAvg from '../../lib/RollingAvg';
import RealTimeController from '../../networking/RealTimeController';
import { ACTION } from '../../networking/transports/WebRtcController';
import { selectConnectedPeerIds } from '../../selectors/connectionSelectors';
import { selectUserId } from '../../selectors/workspaceSelectors';
import { MAX_LATENCY_CUTOFF_MS, MIN_LATENCY_CUTOFF_MS } from './constants';




/**
 * AudioSyncCoordinator is responsible for coordinating the audio synchronization process.
 *
 * To do this, it first samples latencies by measuring the round trip time (PING + PONG)
 * for each peer. These latency samples are then smoothed via rolling avg, before we calculate
 * the max latency across peers (within our cutoff window). The max latency and individual latency
 * values are used to determine the audio playback delay for each user.
 *
 * For example, imagine we have 3 peers with the following avg latencies:
 *   - peer 1: 35ms
 *   - peer 2: 15ms
 *   - peer 3: 120ms
 *
 * To find the max latency, we exclude peer 3 since 120ms is beyond our cutoff and find the max between peer 1 and 2
 * which is 50ms. That dictates that for:
 *   - peer 1, we don't wait at all before triggering playback for their instrument since it's the max latency
 *   - peer 2, we wait 20ms (max - latency) before triggering playback for their instrument
 *   - peer 3, we don't wait before triggering playback for their instrument, since it's already coming in noticeably late
 *   - for ourselves, we wait 35ms before triggering playback for our own instrument
 *
 * To visualize this, the first | represents the time a user started playing a note and the second | represents when it
 * was received by us:
 *   Peer 1    |-----------------|playback (35ms latency, 0ms audio delay)
 *   Peer 2    |-----------|------playback (15ms latency, 20ms audio delay)
 *   Peer 3    |------------------------------------------|playback (120ms latency, 0ms audio delay, past latency cutoff)
 *   Ourselves ||-----------------playback (0ms latency, 35ms audio delay)
 *
 * Since there's no way to ensure time scheduling of this precision in js, the playback engine uses the WebAudio
 * scheduling capabilities via tone.js.
 *
 * Relevant resources:
 *   - https://en.wikipedia.org/wiki/Network_Time_Protocol
 *   - https://en.wikipedia.org/wiki/Precision_Time_Protocol
 */

const SAMPLES_PER_MINUTE = 120;
/**
 * window sample size
 *
 * it's a tradeoff between synchronization accuracy (lower is better) and
 * consistency in playback audio offset (higher is better)
 */
const WINDOW_SIZE = 3;

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

interface PeerLeftMessage {
  userId: string
}

class AudioSyncCoordinator {
  private peerLatencyWindows: PeerLatencyWindows;
  private isRunning: boolean;
  private myUserId?: string;

  constructor() {
    this.isRunning = false;
    this.peerLatencyWindows = {};
    this.onPing = this.onPing.bind(this);
    this.onPong = this.onPong.bind(this);
    this.onPeerLeft = this.onPeerLeft.bind(this);
    this.tick = this.tick.bind(this);
  }

  public start() {
    if (this.isRunning) {
      return;
    }

    this.isRunning = true;
    const realTimeController = RealTimeController.getInstance();
    realTimeController.on(SYNC_EVENT.LATENCY_PING, this.onPing);
    realTimeController.on(SYNC_EVENT.LATENCY_PONG, this.onPong);
    realTimeController.on(ACTION.USER_DISCONNECT, this.onPeerLeft)
    realTimeController.once(ACTION.SIGNAL, this.tick);
  }

  public stop() {
    this.isRunning = false;
    this.peerLatencyWindows = {};
    const realTimeController = RealTimeController.getInstance();
    realTimeController.off(SYNC_EVENT.LATENCY_PING, this.onPing);
    realTimeController.off(SYNC_EVENT.LATENCY_PONG, this.onPong);
  }

  public removePeer(peerId: string) {
    delete this.peerLatencyWindows[peerId];
    removePeerConnection(peerId);
  }

  private tick() {
    if (!this.isRunning) {
      return;
    }

    selectConnectedPeerIds(store).forEach(peerId => {
      const pingTime = performance.now();
      try {
        this.verifyMyUserId();
        RealTimeController.getInstance().sendToPeer(
          peerId,
          SYNC_EVENT.LATENCY_PING,
          {
            pingTime,
            peerId: this.myUserId!,
          }
        );
      } catch {
        // gracefully handle sample failure, we'll keep trying at the sample rate
        return;
      }

      if (!this.peerLatencyWindows[peerId]) {
        this.peerLatencyWindows[peerId] = new RollingAvg(WINDOW_SIZE);
      }
    });

    const maxLatency = Object
      .values(this.peerLatencyWindows)
      .reduce((currentMax, window) => {
        if (window.avg > MAX_LATENCY_CUTOFF_MS || window.avg < MIN_LATENCY_CUTOFF_MS) {
          // ignore client due to excessive latency
          return currentMax;
        }

        return truncate(Math.max(currentMax, window.avg));
      }, 0);

    setMaxLatency(maxLatency);

    setTimeout(this.tick, 60_000 / SAMPLES_PER_MINUTE);
  }

  private onPing(response: SamplingMessage) {
    try {
      this.verifyMyUserId();
      RealTimeController.getInstance().sendToPeer(
        response.peerId,
        SYNC_EVENT.LATENCY_PONG,
        {
          pingTime: response.pingTime,
          peerId: this.myUserId!,
        });
    } catch {
      return;
    }
  }

  private onPong(response: SamplingMessage) {
    const { peerId, pingTime } = response;
    const latency = truncate((performance.now() - pingTime) / 2);
    const peerLatencyWindow = this.peerLatencyWindows[peerId];
    peerLatencyWindow.add(latency);

    // @ts-expect-error LATENCY_DEBUG not on window, but it's nice to be able to enable in console
    if (window.LATENCY_DEBUG) {
      Logger.INFO(`Peer ${peerId} latency: ${peerLatencyWindow.avg}`);
    }

    updatePeerLatency(peerId, truncate(peerLatencyWindow.avg));
  }

  private onPeerLeft(message: PeerLeftMessage) {
    this.removePeer(message.userId);
  }

  private verifyMyUserId() {
    if (!this.myUserId) {
      this.myUserId = selectUserId(store);
      throw new Error('User id not yet retrieved'); // TODO: ensure room bootstrap is complete before initializing
    }
  }
}

function truncate(val: number) {
  return Math.floor(val * 100) / 100;
}

export default new AudioSyncCoordinator();
