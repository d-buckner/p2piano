import React from 'react';
import {
    Flex,
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

    return <Visualization notes={notes} />;
});

function mapStateToProps(state: RootState) {
    return {
        workspace: selectWorkspace(state),
        notesByMidi: selectNotes(state),
    };
}

export default connect(mapStateToProps)(Room);
