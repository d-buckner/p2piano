import HuMIDI from 'humidi';
import * as NoteActions from '../actions/NoteActions';
import InstrumentRegistry from '../audio/instruments/InstrumentRegistry';
import AudioSyncCoordinator from '../audio/syncronization/AudioSyncCoordinator';
import KeyboardController from '../controllers/KeyboardController';
import MetronomeHandlers from '../handlers/MetronomeHandlers';
import RoomHandlers from '../handlers/RoomHandlers';
import RealTimeController from '../networking/RealTimeController';
import WebsocketController from '../networking/transports/WebsocketController';
import type { MessageHandler } from '../networking/AbstractNetworkController';



const RTC_HANDLERS = {
  KEY_DOWN: RoomHandlers.keyDownHandler,
  KEY_UP: RoomHandlers.keyUpHandler,
  SUSTAIN_DOWN: RoomHandlers.sustainDownHandler,
  SUSTAIN_UP: RoomHandlers.sustainUpHandler,
  METRONOME_TICK: MetronomeHandlers.tickHandler,
  METRONOME_START: MetronomeHandlers.startHandler,
  METRONOME_STOP: MetronomeHandlers.stopHandler,
  SET_BPM: MetronomeHandlers.bpmHandler,
} as const;
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

export function register() {
  subscribe(HuMIDI as EventEmitter, MIDI_HANDLERS);
  const websocketController = WebsocketController.getInstance();
  subscribe(RealTimeController.getInstance(), RTC_HANDLERS);
  subscribe(websocketController, WEBSOCKET_HANDLERS);
  window.addEventListener('blur', RoomHandlers.blurHandler);

  const keyboardController = KeyboardController.getInstance();
  keyboardController.registerKeyDownHandler(NoteActions.keyDown);
  keyboardController.registerKeyUpHandler(NoteActions.keyUp);

  // establish websocket connection only after all listeners have been setup
  websocketController.connect();
  AudioSyncCoordinator.start();
}

export function destroy() {
  HuMIDI.reset();
  InstrumentRegistry.empty();
  KeyboardController.getInstance().destroy();
  AudioSyncCoordinator.stop();
  window.removeEventListener('blur', RoomHandlers.blurHandler);
}

function subscribe(
  subscribable: EventEmitter,
  handlers: Record<string, MessageHandler>
) {
  Object.entries(handlers).forEach(([action, handler]) => {
    subscribable.on(action, handler);
  });
}
