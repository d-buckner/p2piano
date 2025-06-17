import { Flex } from '@chakra-ui/react';
import { connect } from 'react-redux';
import { selectMaxLatency, selectPeerConnections } from '../slices/connectionSlice';
import { selectUsers } from '../slices/workspaceSlice';
import * as WorkspaceActions from '../actions/WorkspaceActions';
import { MAX_LATENCY_CUTOFF_MS, MIN_LATENCY_CUTOFF_MS } from '../audio/syncronization/constants';
import Icon from './Icon';

import type { Room } from '../lib/workspaceTypes';
import type { RootState } from '../app/store';

const MIDPOINT_LATENCY = ((MAX_LATENCY_CUTOFF_MS - MIN_LATENCY_CUTOFF_MS) / 2) + MIN_LATENCY_CUTOFF_MS;

enum SpeedIcon {
  HIGH = 'signal-high',
  MEDIUM = 'signal-medium',
  LOW = 'signal-low',
}

interface PeerIconMap {
  [peerId: string]: SpeedIcon,
}

interface PropsFromState {
  peerIcons: PeerIconMap,
  users: Room['users'],
  maxLatency: number,
}

const UserItems = (props: PropsFromState) => (
  // @ts-ignore
  <Flex>
    {Object.values(props.users).map((user, i) => {
      const iconName = props.peerIcons[user.userId];
      return (
        <div style={{ display: 'flex', alignItems: 'center' }} key={i}>
          <div
            style={{
              borderRadius: '50%',
              width: '8px',
              height: '8px',
              backgroundColor: user.color,
            }}
          />
          <span
            onClick={updateDisplayName}
            style={{
              cursor: 'pointer',
              margin: '0 4px',
            }}
          >
            {user.displayName}
          </span>
          {iconName && <Icon name={iconName} />}
          <span style={{ margin: '0 4px' }} />
        </div>
      )
    })}
  </Flex >
);

function updateDisplayName() {
  const displayName = prompt('update display name');
  if (displayName) {
    WorkspaceActions.updateDisplayName(displayName);
  }
}

function mapStateToProps(state: RootState) {
  const peerIcons = Object.entries(selectPeerConnections(state)).reduce((acc, [peerId, connection]) => {
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

  return {
    maxLatency: selectMaxLatency(state),
    peerIcons,
    users: selectUsers(state)
  }
}

export default connect(mapStateToProps)(UserItems);
