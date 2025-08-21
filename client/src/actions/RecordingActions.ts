import { store } from '../app/store';
import RecordingClient from '../audio/recording/RecordingClient';
import { sharedStoreRoot } from '../crdt/store';
import { SharedStoreActions } from '../crdt/store/SharedStoreActions';
import { selectRecordingStartTime } from '../selectors/recordingSelectors';
import { selectMyUser, selectUsers } from '../selectors/workspaceSelectors';
import type { InstrumentType } from '../audio/instruments/Instrument';
import type { Note } from '../constants';
import type { SharedRecordingState } from '../crdt/types/StoreTypes';


/**
 * CRDT-based recording actions that synchronize recording state across peers.
 * 
 * This class doesn't need to know about CRDT internals - it just uses the
 * change() method from SharedStoreActions to make modifications.
 */
class RecordingActions extends SharedStoreActions<SharedRecordingState> {
  private recordingClient?: RecordingClient;

  constructor() {
    super('recording', sharedStoreRoot);
  }

  async start() {
    const recordingId = crypto.randomUUID();
    const users = selectUsers(store);
    const metadata = {
      id: recordingId,
      title: new Date().toLocaleString(),
      displayNames: Object.values(users).map(u => u.displayName),
    };

    this.change(recording => {
      recording.active = true;
      recording.leaderId = selectMyUser(store)?.userId ?? '';
      recording.recordingId = recordingId;
      recording.startTimestamp = Math.floor(performance.now());
      recording.items.push(metadata);
    });

    this.recordingClient = new RecordingClient(recordingId);
    await this.recordingClient.initialize();
  }

  stop() {
    this.recordingClient?.close();
    this.recordingClient = undefined;

    this.change(recording => {
      recording.active = false;
      recording.leaderId = '';
      recording.recordingId = '';
      recording.startTimestamp = 0;
    });
  }

  recordKeyDown(note: Note, instrument: InstrumentType, audioDelay?: number) {
    this.ensureClient();
    this.recordingClient!.keyDown(note, instrument, this.getTimestamp(audioDelay));
  }

  recordKeyUp(midi: number, userId: string, audioDelay?: number) {
    this.ensureClient();
    this.recordingClient!.keyUp(midi, userId, this.getTimestamp(audioDelay));
  }

  recordSustainDown(userId: string) {
    this.ensureClient();
    this.recordingClient!.sustainDown(userId, this.getTimestamp());
  }

  recordSustainUp(userId: string) {
    this.ensureClient();
    this.recordingClient!.sustainUp(userId, this.getTimestamp());
  }

  private ensureClient() {
    if (!this.recordingClient) {
      throw new Error('Cannot record before recording client is initialized');
    }
  }

  private getTimestamp(audioDelay = 0): number {
    return Math.floor(performance.now() - selectRecordingStartTime(store) + audioDelay);
  }
}

export default new RecordingActions();
