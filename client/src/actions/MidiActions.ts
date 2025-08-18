import HuMIDI, { type DeviceMetadata } from 'humidi';
import { midiStore, setMidiStore } from '../stores/MidiStore';


const Attributes = {
  ENABLED: 'enabled',
  HAS_ACCESS: 'hasAccess',
  INPUTS: 'inputs',
  SELECTED_INPUT_ID: 'selectedInputId',
} as const;

export async function enableMidi() {
  if (midiStore.hasAccess) {
    setMidiStore(Attributes.ENABLED, true);
    if (midiStore.selectedInputId) {
      HuMIDI.enableDevice(midiStore.selectedInputId);
    }
    return;
  }

  try {
    await HuMIDI.requestAccess();
    setMidiAccess(true);
    setMidiStore(Attributes.ENABLED, true);

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
    setMidiStore(Attributes.ENABLED, false); // Reset state on failure
    throw error; // Re-throw so component can handle it
  }
}

export function syncDevices() {
  setMidiInputs(HuMIDI.getInputs());
}

export function disableMidi() {
  setMidiStore(Attributes.ENABLED, false);
  Object.values(midiStore.inputs).forEach(input => HuMIDI.disableDevice(input.id));
}

export function selectMidiInput(input: DeviceMetadata) {
  setMidiStore(Attributes.SELECTED_INPUT_ID, input.id);
}

export function selectMidiInputById(deviceId: string) {
  setMidiStore(Attributes.SELECTED_INPUT_ID, deviceId);
}

export function setMidiAccess(hasAccess: boolean) {
  setMidiStore(Attributes.HAS_ACCESS, hasAccess);
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
  
  setMidiStore(Attributes.INPUTS, inputsRecord);
  setMidiStore(Attributes.SELECTED_INPUT_ID, currentSelectedInputId);

}

export async function toggleMidiEnabled() {
  if (midiStore.enabled) {
    disableMidi();
  } else {
    await enableMidi();
  }
}
