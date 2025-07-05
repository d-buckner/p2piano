import clsx from 'clsx';
import HuMIDI from 'humidi';
import { setMidiEnabled } from '../actions/MidiActions';
import { useAppSelector } from '../app/hooks';
import { selectMidi } from '../selectors/midiSelectors';
import * as styles from './MidiButton.css';
import UsbIcon from './UsbIcon';


function MidiButton() {
  const midi = useAppSelector(selectMidi);

  async function handleMidiToggle() {
    if (!midi().enabled) {
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
      class={clsx(styles.midiButton, midi().enabled && styles.active)}
      onClick={handleMidiToggle}
    >
      <UsbIcon />
    </button>
  );
}

export default MidiButton;