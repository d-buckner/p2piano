import ActiveUsers from './controls/ActiveUsers';
import InviteButton from './controls/InviteButton';
import LatencyIndicator from './controls/LatencyIndicator';
import RoomCode from './controls/RoomCode';
import * as styles from './ToolbarRight.css';


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
