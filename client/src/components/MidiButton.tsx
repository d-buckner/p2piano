import clsx from 'clsx';
import HuMIDI from 'humidi';
import { createSignal, createEffect } from 'solid-js';
import * as styles from './MidiButton.css';


function MidiButton() {
  const [midiEnabled, setMidiEnabled] = createSignal(false);

  createEffect(() => {
    if (HuMIDI.isEnabled()) {
      setMidiEnabled(true);
    }
  });

  async function handleMidiToggle() {
    if (!midiEnabled()) {
      try {
        await HuMIDI.requestAccess();
        setMidiEnabled(true);
      } catch (error) {
        console.warn('MIDI access denied or failed:', error);
      }
    }
  }

  return (
    <button
      class={clsx(styles.midiButton, midiEnabled() && styles.active)}
      onClick={handleMidiToggle}
    >
      midi
    </button>
  );
}

export default MidiButton;