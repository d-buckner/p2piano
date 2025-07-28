import { useAppSelector } from '../../../app/hooks';
import { selectWorkspace } from '../../../selectors/workspaceSelectors';
import Tooltip from '../../ui/Tooltip';
import * as styles from './RoomCode.css';


function RoomCode() {
  const workspace = useAppSelector(selectWorkspace);
  const roomCode = workspace().roomId || '';

  return (
    <Tooltip text="Room Code">
      <div class={styles.roomCode}>
        {roomCode}
      </div>
    </Tooltip>
  );
}

export default RoomCode;
