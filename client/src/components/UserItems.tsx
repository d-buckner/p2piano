import * as WorkspaceActions from '../actions/WorkspaceActions';
import { useAppSelector } from '../app/hooks';
import { MAX_LATENCY_CUTOFF_MS, MIN_LATENCY_CUTOFF_MS } from '../audio/syncronization/constants';
import { selectPeerConnections } from '../selectors/connectionSelectors';
import { selectUsers } from '../selectors/workspaceSelectors';
import Icon from './Icon';
import * as styles from './UserItems.css';



const MIDPOINT_LATENCY = ((MAX_LATENCY_CUTOFF_MS - MIN_LATENCY_CUTOFF_MS) / 2) + MIN_LATENCY_CUTOFF_MS;

enum SpeedIcon {
  HIGH = 'signal-high',
  MEDIUM = 'signal-medium',
  LOW = 'signal-low',
}

interface PeerIconMap {
  [peerId: string]: SpeedIcon,
}

export default function UserItems() {
  const peerConnections = useAppSelector(selectPeerConnections);
  const users = useAppSelector(selectUsers);

  const peerIcons = Object.entries(peerConnections()).reduce((acc, [peerId, connection]) => {
    if (connection.latency > MAX_LATENCY_CUTOFF_MS) {
      acc[peerId] = SpeedIcon.LOW;
      return acc;
    }
    if (connection.latency > MIDPOINT_LATENCY) {
      acc[peerId] = SpeedIcon.MEDIUM
      return acc;
    }
    acc[peerId] = SpeedIcon.HIGH;
    return acc;
  }, {} as PeerIconMap);

  return (
    <div class={styles.userItemsContainer}>
      {Object.values(users()).map((user, i) => {
        const iconName = peerIcons[user.userId];
        return (
          <div class={styles.userItem} key={i}>
            <div
              class={styles.userColorDot}
              style={{ backgroundColor: user.color }}
            />
            <span
              onClick={updateDisplayName}
              class={styles.userName}
            >
              {user.displayName}
            </span>
            {iconName && <Icon name={iconName} />}
            <span class={styles.spacer} />
          </div>
        )
      })}
    </div>
  );
}

function updateDisplayName() {
  const displayName = prompt('update display name');
  if (displayName) {
    WorkspaceActions.updateDisplayName(displayName);
  }
}
