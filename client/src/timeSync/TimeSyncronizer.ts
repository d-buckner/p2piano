import WebRtcController from '../controllers/WebRtcController';
import RollingAvg from '../lib/RollingAvg';
import { getMyUserId } from '../lib/WorkspaceHelper';


const MAX_LATENCY_CUTOFF_MS = 100;
const MIN_LATENCY_CUTOFF_MS = 20;
const SAMPLES_PER_MINUTE = 500;
const SMOOTHING_WINDOW_SECONDS = 2;

const WINDOW_SIZE = Math.floor(SAMPLES_PER_MINUTE / 60 * SMOOTHING_WINDOW_SECONDS);

const SYNC_EVENT = {
  LATENCY_PING: 'LATENCY_PING',
  LATENCY_PONG: 'LATENCY_PONG',
} as const;

interface SyncMetadata {
  [peerId: string]: {
    pingTime: number,
    latency: number,
    window: RollingAvg,
  },
}

interface SamplingMessage {
  pingTime: number,
  peerId: string,
}

export class TimeSyncronizer {
  static instance?: TimeSyncronizer;
  private webrtcController: WebRtcController;
  private peerMetadata: SyncMetadata;
  private maxLatency: number;
  private myUserId?: string;

  public static getInstance(): TimeSyncronizer {
    if (!TimeSyncronizer.instance) {
      TimeSyncronizer.instance = new TimeSyncronizer();
    }

    return TimeSyncronizer.instance;
  }

  private constructor() {
    this.webrtcController = WebRtcController.getInstance();
    this.webrtcController.on(SYNC_EVENT.LATENCY_PING, this.onPing.bind(this));
    this.webrtcController.on(SYNC_EVENT.LATENCY_PONG, this.onPong.bind(this));
    this.maxLatency = 0;
    this.peerMetadata = {};
    this.tick = this.tick.bind(this);
    this.tick();
  }

  public getDelayForPeer(peerId: string): number {
    const peerLatency = this.peerMetadata[peerId]?.window.avg;
    const delay = this.maxLatency - (peerLatency ?? 0);
    if (peerLatency === undefined || delay < MIN_LATENCY_CUTOFF_MS) {
      return 0;
    }

    return delay;
  }

  public getSelfDelay(): number {
    return this.maxLatency < MIN_LATENCY_CUTOFF_MS
      ? 0
      : this.maxLatency;
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
        // gracefully handle sending failures
        return;
      }

      if (this.peerMetadata[peerId]) {
        this.peerMetadata[peerId].pingTime = pingTime;
        return;
      }

      this.peerMetadata[peerId] = {
        latency: 0,
        pingTime,
        window: new RollingAvg(WINDOW_SIZE),
      };
    });

    this.maxLatency = Object
      .values(this.peerMetadata)
      .reduce((currentMax, peerMetadata) => {
        if (peerMetadata.window.avg > MAX_LATENCY_CUTOFF_MS) {
          return 0;
        }

        return Math.max(currentMax, peerMetadata.window.avg);
      }, 0);

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
    this.peerMetadata[peerId].window.add(latency);
  }

  private verifyMyUserId() {
    if (!this.myUserId) {
      this.myUserId = getMyUserId();
      throw new Error('User id not yet retreived');
    }
  }
}
