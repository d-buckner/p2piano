import React from 'react';
import { useNavigate } from 'react-router-dom';
import * as WorkspaceActions from '../actions/WorkspaceActions';
import * as styles from './RoomNav.css';
import Toolbar from './Toolbar';
import type { Workspace } from '../slices/workspaceSlice';




type Props = {
  workspace: Workspace;
};

function RoomNav({ workspace }: Props) {
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
    <nav className={styles.roomNav}>
      <a onClick={navigateHome} className={styles.navLink}>p2piano</a>
      <Toolbar />
      <a onClick={shareRoom} className={styles.navLink}>
        room: <span className={styles.roomId}>{workspace.roomId}</span>
      </a>
    </nav>
  );
}

export default React.memo(RoomNav);
