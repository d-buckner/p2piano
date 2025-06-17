import * as NoteActions from '../actions/NoteActions';
import RoomHandlers from '../handlers/RoomHandlers';
import KeyboardController from '../controllers/KeyboardController';
import MidiDeviceController from '../controllers/MidiDeviceController';
import WebsocketController from '../networking/transports/WebsocketController';
import InstrumentRegistry from '../audio/instruments/InstrumentRegistry';
import AudioSyncCoordinator from '../audio/syncronization/AudioSyncCoordinator';
import AbstractNetworkController, { type MessageHandler } from '../networking/AbstractNetworkController';
import RealTimeController from '../networking/RealTimeController';


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
  KEY_DOWN: RoomHandlers.keyDownHandler,
  KEY_UP: RoomHandlers.keyUpHandler,
} as const;

export function register() {
  subscribe(MidiDeviceController.getInstance(), MIDI_HANDLERS);
  subscribe(RealTimeController.getInstance(), RTC_HANDLERS);
  subscribe(WebsocketController.getInstance(), WEBSOCKET_HANDLERS);
  window.addEventListener('blur', RoomHandlers.blurHandler);

  const keyboardController = KeyboardController.getInstance();
  keyboardController.registerKeyDownHandler(NoteActions.keyDown);
  keyboardController.registerKeyUpHandler(NoteActions.keyUp);

  AudioSyncCoordinator.start();
}

export function destroy() {
  // TODO: unsubscribe from all events
  InstrumentRegistry.empty();
  KeyboardController.getInstance().destroy();
  AudioSyncCoordinator.stop();
  window.removeEventListener('blur', RoomHandlers.blurHandler);
}

function subscribe(
  controller: AbstractNetworkController | MidiDeviceController,
  handlers: Record<string, MessageHandler>
) {
  Object.entries(handlers).forEach(([action, handler]) => {
    controller.on(action, handler);
  });
}
