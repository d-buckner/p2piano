import * as styles from './Toolbar.css';
import MetronomeControl from './controls/MetronomeControl';
import MidiControl from './controls/MidiControl';
import InstrumentSelector from './controls/InstrumentSelector';
import ActiveUsers from './controls/ActiveUsers';

function Toolbar() {
  return (
    <div class={styles.toolbar}>
      <MetronomeControl />
      <MidiControl />
      <InstrumentSelector />
      <ActiveUsers />
    </div>
  );
}

export default Toolbar;