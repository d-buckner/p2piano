import { A } from '@solidjs/router';
import clsx from 'clsx';
import * as WorkspaceActions from '../actions/WorkspaceActions';
import * as styles from './RoomNav.css';
import Toolbar from './Toolbar';
import InviteButton from './toolbar/controls/InviteButton';
import RoomCode from './toolbar/controls/RoomCode';


function RoomNav() {
  return (
    <nav class={styles.roomNav}>
      <div class={styles.navLeft}>
        <A href='/' onClick={WorkspaceActions.destroyRoom} class={styles.navLink}>p2piano</A>
      </div>
      <div class={styles.navCenter}>
        <Toolbar />
      </div>
      <div class={clsx(styles.navRight, styles.rightControls)}>
        {/* Mobile+: Always show Invite Button */}
        <div class={styles.showFromMobile}>
          <InviteButton />
        </div>

        {/* Medium+: Add Room Code */}
        <div class={styles.showFromMedium}>
          <RoomCode />
        </div>

      </div>
    </nav >
  );
}

export default RoomNav;
