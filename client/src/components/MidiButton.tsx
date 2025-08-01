import clsx from 'clsx';
import { toggleMidiEnabled } from '../actions/MidiActions';
import { useAppSelector } from '../app/hooks';
import { selectMidi } from '../selectors/midiSelectors';
import * as styles from './MidiButton.css';
import UsbIcon from './UsbIcon';


function MidiButton() {
  const midi = useAppSelector(selectMidi);

  return (
    <button
      class={clsx(styles.midiButton, midi().enabled && styles.active)}
      onClick={toggleMidiEnabled}
    >
      <UsbIcon />
    </button>
  );
}

export default MidiButton;
