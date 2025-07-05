import Metronome from './Metronome';
import MidiButton from './MidiButton';
import * as styles from './Toolbar.css';
import Volume from './Volume';


function Toolbar() {
  return (
    <div class={styles.toolbar}>
      <MidiButton />
      <Metronome />
      <Volume />
    </div>
  );
}

export default Toolbar;