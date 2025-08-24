import ActiveUsers from './controls/ActiveUsers';
import InstrumentSelector from './controls/InstrumentSelector';
import LatencyIndicator from './controls/LatencyIndicator';
import MetronomeControl from './controls/MetronomeControl';
import MidiControl from './controls/MidiControl';
import * as styles from './Toolbar.css';


function Toolbar() {
  return (
    <div class={styles.toolbar}>
      {/* Mobile+: Metronome, Instrument Selector - always visible */}
      <div class={styles.showFromMobile}>
        <MetronomeControl />
      </div>
      <div class={styles.showFromMobile}>
        <InstrumentSelector />
      </div>
      
      {/* Medium+: Add Recording and Active Users */}
      <div class={styles.showFromMedium}>
        <ActiveUsers />
      </div>
      
      {/* Desktop+: Add MIDI Control and Latency */}
      <div class={styles.showFromDesktop}>
        <MidiControl />
      </div>
      <div class={styles.showFromDesktop}>
        <LatencyIndicator />
      </div>
    </div>
  );
}

export default Toolbar;
