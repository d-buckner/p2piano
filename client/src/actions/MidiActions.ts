import HuMIDI, { type DeviceMetadata } from 'humidi';
import { midiStore, setMidiStore } from '../stores/MidiStore';


export async function enableMidi() {
  if (midiStore.hasAccess) {
    setMidiStore('enabled', true);
    if (midiStore.selectedInputId) {
      HuMIDI.enableDevice(midiStore.selectedInputId);
    }
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
    HuMIDI.enableDevice(defaultInput.id);

    otherInputs.forEach(input => {
      HuMIDI.disableDevice(input.id);
    });
  } catch (error) {
    // Handle permission denied, device errors, etc.
    console.error('Failed to enable MIDI:', error);
    setMidiStore('enabled', false); // Reset state on failure
    throw error; // Re-throw so component can handle it
  }
}

export function syncDevices() {
  setMidiInputs(HuMIDI.getInputs());
}

export function disableMidi() {
  setMidiStore('enabled', false);
  Object.values(midiStore.inputs).forEach(input => HuMIDI.disableDevice(input.id));
}

export function selectMidiInput(input: DeviceMetadata) {
  setMidiStore('selectedInputId', input.id);
}

export function selectMidiInputById(deviceId: string) {
  setMidiStore('selectedInputId', deviceId);
}

export function setMidiAccess(hasAccess: boolean) {
  setMidiStore('hasAccess', hasAccess);
}

export function setMidiInputs(inputs: DeviceMetadata[]) {
  const inputsRecord = inputs.reduce((acc, input) => {
    acc[input.id] = input;
    return acc;
  }, {} as Record<string, DeviceMetadata>);
  
  let currentSelectedInputId = midiStore.selectedInputId;
  
  // Clear selected input if it's no longer available
  if (currentSelectedInputId && !inputsRecord[currentSelectedInputId]) {
    currentSelectedInputId = null;
  }
  
  // Auto-select first device if none selected and devices are available
  if (!currentSelectedInputId && inputs.length > 0) {
    currentSelectedInputId = inputs[0].id;
  }
  
  setMidiStore('inputs', inputsRecord);
  setMidiStore('selectedInputId', currentSelectedInputId);

}

export async function toggleMidiEnabled() {
  if (midiStore.enabled) {
    disableMidi();
  } else {
    await enableMidi();
  }
}
