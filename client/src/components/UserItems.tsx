import { Flex } from '@chakra-ui/react';
import { RootState } from '../app/store';
import { connect } from 'react-redux';
import { selectMaxLatency, selectPeerConnections } from '../slices/connectionSlice';
import { selectUsers } from '../slices/workspaceSlice';
import { PeerConnections } from '../constants';
import { Room } from '../lib/workspaceTypes';
import * as WorkspaceActions from '../actions/WorkspaceActions';


interface PropsFromState {
  peerConnections: PeerConnections,
  users: Room['users'],
  maxLatency: number,
}

const UserItems = (props: PropsFromState) => (
  // @ts-ignore
  <Flex>
    {Object.values(props.users).map((user, i) => {
      const peerConnection = props.peerConnections[user.userId];
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
          <b
            onClick={updateDisplayName}
            style={{
              cursor: 'pointer',
              margin: '0 12px 0 4px',
            }}
          >
            {peerConnection
              ? `${user.displayName} (${peerConnection.latency}ms)`
              : user.displayName
            }
          </b>
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
  return {
    maxLatency: selectMaxLatency(state),
    peerConnections: selectPeerConnections(state),
    users: selectUsers(state)
  }
}

export default connect(mapStateToProps)(UserItems);
