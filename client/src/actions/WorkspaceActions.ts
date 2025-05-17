import { batch } from 'react-redux';
import { dispatch } from '../app/store';
import { createSession, getRoom } from '../clients/RoomClient';
import Session from '../lib/Session';
import WebRtcController from '../controllers/WebRtcController';
import WebsocketController from '../controllers/WebsocketController';
import ClientPreferences from '../lib/ClientPreferences';
import { setRoomId, setValidity, reset, setIsLoading, setMidiRange as setMidiRangeAC, setRoom } from '../slices/workspaceSlice';
import * as RoomActionBridge from '../lib/RoomActionBridge';
import { getMyUser, getWorkspace } from '../lib/WorkspaceHelper';
import { MidiRange } from '../constants';
import { getClosestDiatonicLeft, getClosestDiatonicRight } from '../lib/TheoryUtils';
import { InstrumentType } from '../instruments/Instrument';

export async function joinRoom(roomId: string) {
  batch(() => {
    dispatch(setRoomId({ roomId }));
    dispatch(setIsLoading({ isLoading: true }));
  });
  let isValid = true;
  try {
    const { room } = getWorkspace();
    if (!room) {
      const room = await getRoom(roomId);
      dispatch(setRoom({ room }));
    }
    if (!Session.getSessionId()) {
      const session = await createSession();
      // @ts-ignore
      Session.setSessionId(session.sessionId);
    }
  } catch {
    isValid = false;
  }

  batch(() => {
    dispatch(setValidity({ isValid }));
    dispatch(setIsLoading({ isLoading: false }));
  });

  if (isValid) {
    RoomActionBridge.register();
  }
}

export function updateDisplayName(displayName: string) {
  // TODO: update optimistically
  const user = getMyUser();
  if (!user) {
    return;
  }
  ClientPreferences.setDisplayName(displayName);
  WebsocketController.getInstance().send('USER_UPDATE', {
    ...user,
    displayName,
  });
}

export function updateInstrument(instrument: InstrumentType) {
  // TODO: update optimistically
  const user = getMyUser();
  if (!user) {
    return;
  }
  WebsocketController.getInstance().send('USER_UPDATE', {
    ...user,
    instrument,
  });
}

export function setMidiRange(midiRange: MidiRange) {
  dispatch(setMidiRangeAC({ midiRange }));
}

export function midiRangeZoomIn() {
  const { midiRange } = getWorkspace();
  setMidiRange([getClosestDiatonicRight(midiRange[0] + 1), getClosestDiatonicLeft(midiRange[1] - 1)]);
}

export function midiRangeZoomOut() {
  const { midiRange } = getWorkspace();
  setMidiRange([getClosestDiatonicLeft(midiRange[0] - 1), getClosestDiatonicRight(midiRange[1] + 1)]);
}

export function midiRangeShiftLeft() {
  const { midiRange } = getWorkspace();
  setMidiRange([getClosestDiatonicLeft(midiRange[0] - 1), getClosestDiatonicLeft(midiRange[1] - 1)]);
}

export function midiRangeShiftRight() {
  const { midiRange } = getWorkspace();
  setMidiRange([getClosestDiatonicRight(midiRange[0] + 1), getClosestDiatonicRight(midiRange[1] + 1)]);
}

export function destroyRoom() {
  RoomActionBridge.destroy();
  WebRtcController.destroy();
  WebsocketController.destroy();
  dispatch(reset());
}
