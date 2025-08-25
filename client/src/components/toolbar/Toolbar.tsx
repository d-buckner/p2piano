import ActiveUsers from './controls/ActiveUsers';
import InstrumentSelector from './controls/InstrumentSelector';
import LatencyIndicator from './controls/LatencyIndicator';
import MetronomeControl from './controls/MetronomeControl';
import MidiControl from './controls/MidiControl';
import RecordingControl from './controls/RecordingControl';
import { useAppSelector } from '../../app/hooks';
import { selectUserCount } from '../../selectors/workspaceSelectors';
import * as styles from './Toolbar.css';


function Toolbar() {
  const userCount = useAppSelector(selectUserCount);
  const hasOtherPeers = userCount > 1;

  return (
    <div class={styles.toolbar}>
      {/* Mobile+: Core controls - always visible */}
      <div class={styles.showFromMobile}>
        <MetronomeControl />
      </div>
      <div class={styles.showFromMobile}>
        <InstrumentSelector />
      </div>
      
      {/* Tablet+: Add Recording */}
      <div class={styles.showFromTablet}>
        <RecordingControl />
      </div>
      
      {/* Desktop+: Add collaboration features */}
      <div class={styles.showFromDesktop}>
        <ActiveUsers />
      </div>
      <div class={styles.showFromDesktop}>
        <MidiControl />
      </div>
      
      {/* Large+: Add advanced monitoring */}
      {hasOtherPeers && (
        <div class={styles.showFromLarge}>
          <LatencyIndicator />
        </div>
      )}
    </div>
  );
}

export default Toolbar;
