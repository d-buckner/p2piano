import * as NoteActions from '../actions/NoteActions';
import RoomHandlers from '../handlers/RoomHandlers';
import KeyboardController from '../controllers/KeyboardController';
import MidiDeviceController from '../controllers/MidiDeviceController';
import WebRtcController from '../controllers/WebRtcController';
import WebsocketController from '../controllers/WebsocketController';
import InstrumentRegistry from '../instruments/InstrumentRegistry';
import TimeSync from './TimeSync';

const RTC_HANDLERS = {
  KEY_DOWN: RoomHandlers.keyDownHandler,
  KEY_UP: RoomHandlers.keyUpHandler,
} as const;
const WEBSOCKET_HANDLERS = {
  ROOM_JOIN: RoomHandlers.roomJoinHandler,
  USER_CONNECT: RoomHandlers.userConnectHandler,
  USER_DISCONNECT: RoomHandlers.userDisconnectHandler,
  USER_UPDATE: RoomHandlers.userUpdateHandler,
  KEY_DOWN: RoomHandlers.keyDownHandler,
  KEY_UP: RoomHandlers.keyUpHandler,
  disconnect: RoomHandlers.roomDisconnectHandler,
} as const;
const MIDI_HANDLERS = {
  KEY_DOWN: RoomHandlers.keyDownHandler,
  KEY_UP: RoomHandlers.keyUpHandler,
} as const;

export function register() {
  subscribe(MidiDeviceController.getInstance(), MIDI_HANDLERS);
  subscribe(WebRtcController.getInstance(), RTC_HANDLERS);
  subscribe(WebsocketController.getInstance(), WEBSOCKET_HANDLERS);
  window.addEventListener('blur', RoomHandlers.blurHandler);

  const keyboardController = KeyboardController.getInstance();
  keyboardController.registerKeyDownHandler(NoteActions.keyDown);
  keyboardController.registerKeyUpHandler(NoteActions.keyUp);
}

export function destroy() {
  // TODO: unsubscribe from all events
  InstrumentRegistry.empty();
  KeyboardController.getInstance().destroy();
  window.removeEventListener('blur', RoomHandlers.blurHandler);
}

function subscribe(controller: any, handlers: any) {
  Object.entries(handlers).forEach(([action, handler]) => {
    controller.on(action, handler);
  });
}
