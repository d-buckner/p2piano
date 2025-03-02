import React from 'react';
import {Flex, Link} from '@chakra-ui/react';
import {useNavigate} from 'react-router-dom';
import * as WorkspaceActions from '../actions/WorkspaceActions';
import {getUsersArray, isConnectionWebRtc} from '../lib/WorkspaceHelper';

import type {Workspace} from '../slices/workspaceSlice';

type Props = {
  workspace: Workspace;
};

function RoomNav({workspace}: Props) {
  const navigate = useNavigate();

  async function shareRoom() {
    try {
      await navigator.share({
        title: 'p2piano',
        text: 'Play piano with me on p2piano!',
        url: window.location.href,
      });
    } catch (e) {
      await navigator.clipboard.writeText(window.location.href);
    }
  }

  function navigateHome() {
    navigate('/');
    WorkspaceActions.destroyRoom();
  }

  function updateDisplayName() {
    const displayName = prompt('update display name');
    if (displayName) {
      WorkspaceActions.updateDisplayName(displayName);
    }
  }

  return (
    <Flex
      w='full'
      boxShadow='2xl'
      justifyContent='space-between'
      padding='4px 16px'
      backgroundColor='#424242'
      color='white'
    >
      <Link onClick={navigateHome} fontFamily='Mortina Two'>p2piano</Link>
      <Flex>
        {getUsersArray().map((user, i) => (
          <div style={{display: 'flex', alignItems: 'center'}} key={i}>
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
                fontWeight: isConnectionWebRtc(user.userId)
                  ? 'bold'
                  : 'normal',
              }}
            >
              {user.displayName}
            </b>
          </div>
        ))}
      </Flex>
      <Link onClick={shareRoom} whiteSpace='nowrap'>
        room: <b>{workspace.roomId}</b>
      </Link>
    </Flex>
  );
}

export default React.memo(RoomNav);
