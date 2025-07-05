import { useNavigate } from '@solidjs/router';
import clsx from 'clsx';
import * as WorkspaceActions from '../actions/WorkspaceActions';
import * as styles from './RoomNav.css';
import Toolbar from './Toolbar';
import type { Workspace } from '../app/store';


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
      <a onClick={navigateHome} class={clsx(styles.navLink, styles.navLeft)}>p2piano</a>
      <div class={styles.navCenter}>
        <Toolbar />
      </div>
      <a onClick={shareRoom} class={clsx(styles.navLink, styles.navRight)}>
        room: <span class={styles.roomId}>{props.workspace.roomId}</span>
      </a>
    </nav>
  );
}

export default RoomNav;
