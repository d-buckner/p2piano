import { useNavigate } from '@solidjs/router';
import * as WorkspaceActions from '../actions/WorkspaceActions';
import * as styles from './RoomNav.css';
import Toolbar from './Toolbar';
import type { Workspace } from '../slices/workspaceSlice';


type Props = {
  workspace: Workspace;
};

function RoomNav(props: Props) {
  const navigate = useNavigate();

  async function shareRoom() {
    try {
      await navigator.share({
        title: 'p2piano',
        text: 'Play piano with me on p2piano!',
        url: window.location.href,
      });
    } catch {
      await navigator.clipboard.writeText(window.location.href);
    }
  }

  function navigateHome() {
    navigate('/');
    WorkspaceActions.destroyRoom();
  }

  return (
    <nav class={styles.roomNav}>
      <a onClick={navigateHome} class={styles.navLink}>p2piano</a>
      <Toolbar />
      <a onClick={shareRoom} class={styles.navLink}>
        room: <span class={styles.roomId}>{props.workspace.roomId}</span>
      </a>
    </nav>
  );
}

export default RoomNav;
