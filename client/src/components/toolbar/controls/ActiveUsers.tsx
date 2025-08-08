import { createSignal, Show, For } from 'solid-js';
import { useAppSelector } from '../../../app/hooks';
import { InstrumentType } from '../../../audio/instruments/Instrument';
import { selectPeerConnections } from '../../../selectors/connectionSelectors';
import { selectUsersArray, selectMyUser } from '../../../selectors/workspaceSelectors';
import Dropdown from '../../ui/Dropdown';
import { UsersIcon } from '../icons';
import * as styles from './ActiveUsers.css';


function ActiveUsers() {
  const users = useAppSelector(selectUsersArray);
  const myUser = useAppSelector(selectMyUser);
  const peerConnections = useAppSelector(selectPeerConnections);
  const [isDropdownOpen, setIsDropdownOpen] = createSignal(false);

  const getInstrumentLabel = (instrument: string) => {
    const instrumentMap = {
      [InstrumentType.PIANO]: 'Piano',
      [InstrumentType.SYNTH]: 'Synth',
      [InstrumentType.ELECTRIC_BASS]: 'Electric Bass',
    };
    return instrumentMap[instrument as InstrumentType] || instrument;
  };

  const getInstrumentIcon = (instrument: string) => {
    const iconMap = {
      [InstrumentType.PIANO]: '🎹',
      [InstrumentType.SYNTH]: '🎛️',
      [InstrumentType.ELECTRIC_BASS]: '🎸',
    };
    return iconMap[instrument as InstrumentType] || '🎵';
  };

  const getUserLatency = (userId: string) => {
    const connection = peerConnections()[userId];
    return connection ? Math.floor(connection.latency) : 0;
  };

  const isCurrentUser = (userId: string) => {
    return myUser()?.userId === userId;
  };

  // Fallback to ensure we always have some data to display
  const displayUsers = () => {
    const realUsers = users();
    if (realUsers.length === 0) {
      // Show current user as fallback
      const currentUser = myUser();
      return currentUser ? [currentUser] : [];
    }
    return realUsers;
  };

  return (
    <div class={styles.activeUsers}>
      <Dropdown
        open={isDropdownOpen()}
        onOpenChange={setIsDropdownOpen}
        trigger={
          <button class={styles.usersButton} aria-label="Show active users">
            <UsersIcon size={14} class={styles.icon} />
            <div class={styles.userAvatars}>
              <For each={displayUsers().slice(0, 4)}>{user => (
                <div
                  class={styles.avatar}
                  style={{ 'background-color': user.color || 'var(--colors-primary)' }}
                  title={user.displayName || 'User'}
                >
                  {(user.displayName || 'U')[0].toUpperCase()}
                </div>
              )}</For>
              <Show when={displayUsers().length > 4}>
                <div class={styles.avatar} style={{ 'background-color': 'var(--colors-muted)' }}>
                  +{displayUsers().length - 4}
                </div>
              </Show>
            </div>
          </button>
        }
      >
        <div class={styles.dropdownContent}>
          <h3 class={styles.dropdownTitle}>Active Users ({displayUsers().length})</h3>
          <div class={styles.usersList}>
            <For each={displayUsers()}>{user => (
              <div class={`${styles.userItem} ${isCurrentUser(user.userId) ? styles.currentUser : ''}`}>
                <div class={styles.userInfo}>
                  <div
                    class={styles.userAvatar}
                    style={{ 'background-color': user.color || 'var(--colors-primary)' }}
                  >
                    {(user.displayName || 'U')[0].toUpperCase()}
                  </div>
                  <div class={styles.userDetails}>
                    <span class={styles.userName}>
                      {user.displayName || 'Unknown User'}
                      <Show when={isCurrentUser(user.userId)}>
                        <span class={styles.youBadge}>(You)</span>
                      </Show>
                    </span>
                    <div class={styles.userMeta}>
                      <span class={styles.instrumentInfo}>
                        <span class={styles.instrumentIcon}>{getInstrumentIcon(user.instrument || 'PIANO')}</span>
                        {getInstrumentLabel(user.instrument || 'PIANO')}
                      </span>
                      <Show when={!isCurrentUser(user.userId)}>
                        <span class={styles.latencyInfo}>
                          {getUserLatency(user.userId)}ms
                        </span>
                      </Show>
                    </div>
                  </div>
                </div>
              </div>
            )}</For>
          </div>
        </div>
      </Dropdown>
    </div>
  );
}

export default ActiveUsers;
