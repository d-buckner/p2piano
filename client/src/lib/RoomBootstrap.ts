import { preloadSamples } from 'd-piano';
import HuMIDI from 'humidi';
import * as MidiActions from '../actions/MidiActions';
import * as NoteActions from '../actions/NoteActions';
import InstrumentRegistry from '../audio/instruments/InstrumentRegistry';
import AudioSyncCoordinator from '../audio/synchronization/AudioSyncCoordinator';
import KeyboardController from '../controllers/KeyboardController';
import RoomHandlers from '../handlers/RoomHandlers';
import RealTimeController from '../networking/RealTimeController';
import WebsocketController from '../networking/transports/WebsocketController';
import type { MessageHandler } from '../networking/AbstractNetworkController';

/**
 * RoomBootstrap handles room initialization in 3 progressive phases:
 * 1. bootstrap() - Essential UI and local piano (must complete first)
 * 2. enableCollaboration() - Real-time features (background)
 * 3. loadEnhancements() - MIDI and advanced features (background)
 */


// Keep disposal callbacks for dynamically loaded modules
let disposalCallbacks: (() => void)[] = [];
const WEBSOCKET_HANDLERS = {
  ROOM_JOIN: RoomHandlers.roomJoinHandler,
  USER_CONNECT: RoomHandlers.userConnectHandler,
  USER_DISCONNECT: RoomHandlers.userDisconnectHandler,
  USER_UPDATE: RoomHandlers.userUpdateHandler,
  NEWER_CONNECTION: RoomHandlers.newerConnectionHandler,
} as const;
const MIDI_HANDLERS = {
  noteon: RoomHandlers.keyDownHandler,
  noteoff: RoomHandlers.keyUpHandler,
  sustainon: RoomHandlers.sustainDownHandler,
  sustainoff: RoomHandlers.sustainUpHandler,
  inputconnected: MidiActions.syncDevices,
  inputdisconnected: MidiActions.syncDevices,
} as const;

interface EventEmitter {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  on(event: string | symbol, listener: (...args: any[]) => void): any;
}

/**
 * Phase 1: Essential startup - get users playing immediately
 * This is the only phase that blocks the UI
 */
export function bootstrap() {
  window.addEventListener('blur', RoomHandlers.blurHandler);
  // Essential keyboard input for local piano playing
  const keyboardController = KeyboardController.getInstance();
  keyboardController.registerKeyDownHandler(NoteActions.keyDown);
  keyboardController.registerKeyUpHandler(NoteActions.keyUp);

  // Start WebSocket connection (don't wait for it)
  const websocketController = WebsocketController.getInstance();
  // Subscribe to WebSocket handlers
  subscribe(websocketController, WEBSOCKET_HANDLERS);
  websocketController.connect();
}

/**
 * Phase 2: Enable real-time collaboration features
 * Runs in background after bootstrap() completes
 */
export async function enableCollaboration() {
  const NOTE_HANDLERS = {
    KEY_DOWN: RoomHandlers.keyDownHandler,
    KEY_UP: RoomHandlers.keyUpHandler,
    SUSTAIN_DOWN: RoomHandlers.sustainDownHandler,
    SUSTAIN_UP: RoomHandlers.sustainUpHandler,
  };
  const realTimeController = RealTimeController.getInstance();
  subscribe(realTimeController, NOTE_HANDLERS);
  const { default: MetronomeHandlers } = await import('../handlers/MetronomeHandlers');
  subscribe(realTimeController, {
    METRONOME_TICK: MetronomeHandlers.tickHandler,
  });
  
  // Dynamically import and initialize CRDT system (heavy Automerge loading)
  const { sharedStoreRoot } = await import('../crdt');
  await sharedStoreRoot.initialize(realTimeController);
  disposalCallbacks.push(() => sharedStoreRoot.dispose());
  AudioSyncCoordinator.start();
  preloadSamples(1);
}

/**
 * Phase 3: Load advanced features and enhancements
 * Runs in background - these features are nice-to-have
*/
export async function loadEnhancements() {
  // MIDI device integration
  subscribe(HuMIDI as EventEmitter, MIDI_HANDLERS);
  // Check if MIDI permissions are already granted and enable if so
  if (await HuMIDI.hasPermissions()) {
    await HuMIDI.requestAccess();
    await MidiActions.enableMidi();
  }
  
  // Initialize MIDI input device tracking (after permissions check)
  MidiActions.syncDevices();
}

/**
 * Cleanup all initialized systems
 */
export function cleanup() {
  HuMIDI.reset();
  InstrumentRegistry.empty();
  KeyboardController.getInstance().destroy();
  AudioSyncCoordinator.stop();
  window.removeEventListener('blur', RoomHandlers.blurHandler);

  // Call all disposal callbacks for dynamically loaded modules
  disposalCallbacks.forEach(dispose => dispose());
  disposalCallbacks = [];
}

/**
 * Helper function to subscribe event handlers
 */
function subscribe(
  subscribable: EventEmitter,
  handlers: Record<string, MessageHandler>
) {
  Object.entries(handlers).forEach(([action, handler]) => {
    subscribable.on(action, handler);
  });
}
