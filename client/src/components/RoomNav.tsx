import { useNavigate } from '@solidjs/router';
import clsx from 'clsx';
import * as WorkspaceActions from '../actions/WorkspaceActions';
import * as styles from './RoomNav.css';
import Toolbar from './Toolbar';
import LatencyIndicator from './toolbar/controls/LatencyIndicator';
import ActiveUsers from './toolbar/controls/ActiveUsers';
import InviteButton from './toolbar/controls/InviteButton';
import RoomCode from './toolbar/controls/RoomCode';
import type { Workspace } from '../app/store';


type Props = {
  workspace: Workspace;
};

function RoomNav(props: Props) {
  const navigate = useNavigate();


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
      <div class={clsx(styles.navRight, styles.rightControls)}>
        <LatencyIndicator />
        <InviteButton />
        <RoomCode />
      </div>
    </nav>
  );
}

export default RoomNav;
