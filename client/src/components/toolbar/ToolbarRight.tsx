import * as styles from './ToolbarRight.css';
import LatencyIndicator from './controls/LatencyIndicator';
import ActiveUsers from './controls/ActiveUsers';
import InviteButton from './controls/InviteButton';
import RoomCode from './controls/RoomCode';

function ToolbarRight() {
  return (
    <div class={styles.toolbarRight}>
      <LatencyIndicator />
      <ActiveUsers />
      <InviteButton />
      <RoomCode />
    </div>
  );
}

export default ToolbarRight;