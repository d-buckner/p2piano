import HuMIDI from 'humidi';
import * as NoteActions from '../actions/NoteActions';
import InstrumentRegistry from '../audio/instruments/InstrumentRegistry';
import AudioSyncCoordinator from '../audio/syncronization/AudioSyncCoordinator';
import KeyboardController from '../controllers/KeyboardController';
import { sharedStoreRoot } from '../crdt';
import MetronomeHandlers from '../handlers/MetronomeHandlers';
import RoomHandlers from '../handlers/RoomHandlers';
import RealTimeController from '../networking/RealTimeController';
import WebsocketController from '../networking/transports/WebsocketController';
import type { MessageHandler } from '../networking/AbstractNetworkController';



// Create handlers object that will be populated based on CRDT availability
let RTC_HANDLERS: Record<string, MessageHandler>;
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
} as const;

interface EventEmitter {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  on(event: string | symbol, listener: (...args: any[]) => void): any;
}

export async function register() {
  subscribe(HuMIDI as EventEmitter, MIDI_HANDLERS);
  const websocketController = WebsocketController.getInstance();
  const realTimeController = RealTimeController.getInstance();
  
  subscribe(websocketController, WEBSOCKET_HANDLERS);
  window.addEventListener('blur', RoomHandlers.blurHandler);

  const keyboardController = KeyboardController.getInstance();
  keyboardController.registerKeyDownHandler(NoteActions.keyDown);
  keyboardController.registerKeyUpHandler(NoteActions.keyUp);

  // Configure RTC handlers first
  RTC_HANDLERS = {
    KEY_DOWN: RoomHandlers.keyDownHandler,
    KEY_UP: RoomHandlers.keyUpHandler,
    SUSTAIN_DOWN: RoomHandlers.sustainDownHandler,
    SUSTAIN_UP: RoomHandlers.sustainUpHandler,
    METRONOME_TICK: MetronomeHandlers.tickHandler,
  };

  // Subscribe to RTC handlers
  subscribe(realTimeController, RTC_HANDLERS);

  // Establish websocket connection first
  websocketController.connect();
  
  // Wait for ROOM_JOIN before initializing CRDT system
  await new Promise<void>((resolve) => {
    const handleRoomJoin = () => {
      realTimeController.off('ROOM_JOIN', handleRoomJoin);
      resolve();
    };
    
    realTimeController.on('ROOM_JOIN', handleRoomJoin);
  });

  // Now initialize CRDT system after room has been joined and userId is set
  await sharedStoreRoot.initialize(realTimeController);
  AudioSyncCoordinator.start();
}

export function destroy() {
  HuMIDI.reset();
  InstrumentRegistry.empty();
  KeyboardController.getInstance().destroy();
  AudioSyncCoordinator.stop();
  window.removeEventListener('blur', RoomHandlers.blurHandler);
  
  // Dispose CRDT system
  sharedStoreRoot.dispose();
}

function subscribe(
  subscribable: EventEmitter,
  handlers: Record<string, MessageHandler>
) {
  Object.entries(handlers).forEach(([action, handler]) => {
    subscribable.on(action, handler);
  });
}
