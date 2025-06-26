import {
  Flex,
  Grid,
  GridItem,
  Heading,
  Spinner,
} from '@chakra-ui/react'
import React, { useEffect } from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
import { joinRoom } from '../actions/WorkspaceActions';
import RoomNav from '../components/RoomNav';
import Visualization from '../components/Visualization';
import { getNotes } from '../lib/NoteHelpers';
import { selectNotes } from '../slices/notesSlice';
import { selectWorkspace, type Workspace } from '../slices/workspaceSlice';
import type { RootState } from '../app/store';
import type { NotesByMidi } from '../constants';



type Props = {
  workspace: Workspace,
  notesByMidi: NotesByMidi,
};

const Room = React.memo(({ workspace, notesByMidi }: Props) => {
  useEffect(() => {
    const roomId = location.pathname.replace('/', '');
    if (!roomId) {
      return;
    }

    joinRoom(roomId);
  }, []);

  if (workspace.isLoading !== false) {
    return (
      <Flex
        justifyContent='center'
        alignItems='center'
        h='full'
        backgroundColor='black'
        color='white'
      >
        <Spinner />
      </Flex>
    );
  }


  if (workspace.isValid === false) {
    return (
      <Flex
        justifyContent='center'
        alignItems='center'
        flexDirection='column'
        h='full'
        backgroundColor='black'
        color='white'
      >
        <Heading textAlign='center'>Room not found</Heading>
        <Link to='/'>Go back home</Link>
      </Flex>
    );
  }

  const notes = getNotes(notesByMidi);

  return (
    <Grid
      templateAreas={'"header""visual"'}
      gridTemplateRows='32px minmax(0, 1fr)'
      height='100%'
      className='fade-in'
    >
      <GridItem area='header' as='nav'>
        <RoomNav workspace={workspace} />
      </GridItem>
      <GridItem area='visual' as='main'>
        <Visualization notes={notes} />
      </GridItem>
    </Grid>
  );
});

function mapStateToProps(state: RootState) {
  return {
    workspace: selectWorkspace(state),
    notesByMidi: selectNotes(state),
  };
}

export default connect(mapStateToProps)(Room);
