import HuMIDI from 'humidi';
import { midiStore, setMidiStore } from '../stores/MidiStore';


export function setMidiEnabled(enabled: boolean) {
  setMidiStore('enabled', enabled);
}

export function setMidiAccess(hasAccess: boolean) {
  setMidiStore('hasAccess', hasAccess);
}

export function toggleMidiEnabled() {
  if (!midiStore.hasAccess) {
    HuMIDI.requestAccess().then(() => setMidiAccess(true));
  }
  setMidiStore('enabled', !midiStore.enabled);
}
