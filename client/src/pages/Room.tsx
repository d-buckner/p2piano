import React, { useEffect } from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
import { joinRoom } from '../actions/WorkspaceActions';
import RoomNav from '../components/RoomNav';
import Visualization from '../components/Visualization';
import { getNotes } from '../lib/NoteHelpers';
import { selectNotes } from '../slices/notesSlice';
import { selectWorkspace, type Workspace } from '../slices/workspaceSlice';
import * as styles from './Room.css';
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
      <div className={styles.loadingContainer}>
        <div className={styles.spinner}></div>
      </div>
    );
  }


  if (workspace.isValid === false) {
    return (
      <div className={styles.errorContainer}>
        <h1 className={styles.errorHeading}>Room not found</h1>
        <Link to='/' className={styles.errorLink}>Go back home</Link>
      </div>
    );
  }

  const notes = getNotes(notesByMidi);

  return (
    <div className={`${styles.roomGrid} fade-in`}>
      <nav className={styles.headerArea}>
        <RoomNav workspace={workspace} />
      </nav>
      <main className={styles.visualArea}>
        <Visualization notes={notes} />
      </main>
    </div>
  );
});

function mapStateToProps(state: RootState) {
  return {
    workspace: selectWorkspace(state),
    notesByMidi: selectNotes(state),
  };
}

export default connect(mapStateToProps)(Room);
