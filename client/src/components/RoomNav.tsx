import React from 'react';
import { Flex, Link } from '@chakra-ui/react';
import { useNavigate } from 'react-router-dom';
import * as WorkspaceActions from '../actions/WorkspaceActions';
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
    } catch (e) {
      await navigator.clipboard.writeText(window.location.href);
    }
  }

  function navigateHome() {
    navigate('/');
    WorkspaceActions.destroyRoom();
  }

  return (
    <Flex
      w='full'
      boxShadow='2xl'
      padding='4px 16px'
      backgroundColor='#424242'
      justifyContent='space-between'
      color='white'
      as='nav'
    >
      <Link onClick={navigateHome}>p2piano</Link>
      <Toolbar />
      <Link onClick={shareRoom} whiteSpace='nowrap'>
        room: <b>{workspace.roomId}</b>
      </Link>
    </Flex>
  );
}

export default React.memo(RoomNav);
