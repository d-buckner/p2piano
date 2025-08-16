import HuMIDI, { type MIDIInput } from 'humidi';
import { midiStore, setMidiStore } from '../stores/MidiStore';


export async function enableMidi() {
  if (midiStore.hasAccess) {
    setMidiStore('enabled', true);
    midiStore.selectedInput?.enable();
    return;
  }

  try {
    await HuMIDI.requestAccess();
    setMidiAccess(true);
    setMidiStore('enabled', true);

    const inputs = HuMIDI.getInputs();
    if (!inputs.length) return;

    const [defaultInput, ...otherInputs] = inputs;
    selectMidiInput(defaultInput);
    defaultInput.enable();

    otherInputs.forEach(input => {
      input.disable();
    });
  } catch (error) {
    // Handle permission denied, device errors, etc.
    console.error('Failed to enable MIDI:', error);
    setMidiStore('enabled', false); // Reset state on failure
    throw error; // Re-throw so component can handle it
  }
}

export function disableMidi() {
  setMidiStore('enabled', false);
  midiStore.inputs.forEach(input => input.disable());
}

export function selectMidiInput(input: MIDIInput) {
  setMidiStore('selectedInput', input);
}

export function setMidiAccess(hasAccess: boolean) {
  setMidiStore('hasAccess', hasAccess);
}

export function setMidiInputs(inputs: MIDIInput[]) {
  setMidiStore('inputs', inputs);
}

export async function toggleMidiEnabled() {
  if (midiStore.enabled) {
    disableMidi();
  } else {
    await enableMidi();
  }
}
