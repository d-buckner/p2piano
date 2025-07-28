import * as styles from './ToolbarLeft.css';
import MetronomeControl from './controls/MetronomeControl';
import MidiControl from './controls/MidiControl';
import RecordingControl from './controls/RecordingControl';
import InstrumentSelector from './controls/InstrumentSelector';

function ToolbarLeft() {
  return (
    <div class={styles.toolbarLeft}>
      <h1 class={styles.appName}>p2piano</h1>
      <div class={styles.controls}>
        <MetronomeControl />
        <MidiControl />
        <RecordingControl />
        <InstrumentSelector />
      </div>
    </div>
  );
}

export default ToolbarLeft;