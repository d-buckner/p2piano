import React from 'react';
import {
    Flex,
    Grid,
    GridItem,
    Heading,
    Spinner,
} from '@chakra-ui/react'
import { Link } from 'react-router-dom';
import { RootState } from '../app/store';
import { connect } from 'react-redux';
import { getNotes } from '../lib/NoteHelpers';
import { selectWorkspace, Workspace } from '../slices/workspaceSlice';
import { selectNotes } from '../slices/notesSlice';
import Visualization from '../components/Visualization';

import type { NotesByMidi } from '../constants';
import RoomNav from '../components/RoomNav';

type Props = {
    workspace: Workspace,
    notesByMidi: NotesByMidi,
};

const Room = React.memo(({ workspace, notesByMidi }: Props) => {
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
            templateAreas={`
                "header"
                "visual"
            `}
            gridTemplateRows='32px minmax(0, 1fr)'
            height='100%'
        >
            <GridItem area='header'>
                <RoomNav workspace={workspace} />
            </GridItem>
            <GridItem area='visual'>
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
