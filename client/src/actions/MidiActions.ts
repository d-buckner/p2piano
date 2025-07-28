import HuMIDI from 'humidi';
import { setStore, store } from '../app/store';
import { selectMidiAccess, selectMidiEnabled } from '../selectors/midiSelectors';


export function setMidiEnabled(enabled: boolean) {
  setStore('midi', 'enabled', enabled);
}

export function setMidiAccess(hasAccess: boolean) {
  setStore('midi', 'hasAccess', hasAccess);
}

export function toggleMidiEnabled() {
  if (!selectMidiAccess(store)) {
    HuMIDI.requestAccess().then(() => setMidiAccess(true));
  }
  setStore('midi', 'enabled', !selectMidiEnabled(store));
}
