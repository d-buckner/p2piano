import HuMIDI from 'humidi';
import * as NoteActions from '../actions/NoteActions';
import RoomHandlers from '../handlers/RoomHandlers';
import KeyboardController from '../controllers/KeyboardController';
import WebsocketController from '../networking/transports/WebsocketController';
import InstrumentRegistry from '../audio/instruments/InstrumentRegistry';
import AudioSyncCoordinator from '../audio/syncronization/AudioSyncCoordinator';
import RealTimeController from '../networking/RealTimeController';

import type { MessageHandler } from '../networking/AbstractNetworkController';


const RTC_HANDLERS = {
  KEY_DOWN: RoomHandlers.keyDownHandler,
  KEY_UP: RoomHandlers.keyUpHandler,
} as const;
const WEBSOCKET_HANDLERS = {
  ROOM_JOIN: RoomHandlers.roomJoinHandler,
  USER_CONNECT: RoomHandlers.userConnectHandler,
  USER_DISCONNECT: RoomHandlers.userDisconnectHandler,
  USER_UPDATE: RoomHandlers.userUpdateHandler,
  disconnect: RoomHandlers.roomDisconnectHandler,
} as const;
const MIDI_HANDLERS = {
  noteon: RoomHandlers.keyDownHandler,
  noteoff: RoomHandlers.keyUpHandler,
} as const;

type Subscribable = any & {
  on: (action: string, handler: Function) => void;
};

export function register() {
  subscribe(HuMIDI, MIDI_HANDLERS);
  subscribe(RealTimeController.getInstance(), RTC_HANDLERS);
  subscribe(WebsocketController.getInstance(), WEBSOCKET_HANDLERS);
  window.addEventListener('blur', RoomHandlers.blurHandler);

  const keyboardController = KeyboardController.getInstance();
  keyboardController.registerKeyDownHandler(NoteActions.keyDown);
  keyboardController.registerKeyUpHandler(NoteActions.keyUp);

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
  subscribable: Subscribable,
  handlers: Record<string, MessageHandler>
) {
  Object.entries(handlers).forEach(([action, handler]) => {
    subscribable.on(action, handler);
  });
}
