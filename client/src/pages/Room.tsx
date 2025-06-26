import { A } from '@solidjs/router';
import { onMount, Show, Switch, Match } from 'solid-js';
import { joinRoom } from '../actions/WorkspaceActions';
import { useAppSelector } from '../app/hooks';
import RoomNav from '../components/RoomNav';
import Visualization from '../components/Visualization';
import { getNotes } from '../lib/NoteHelpers';
import { selectNotes } from '../slices/notesSlice';
import { selectWorkspace } from '../slices/workspaceSlice';
import * as styles from './Room.css';


const Room = () => {
  const workspace = useAppSelector(selectWorkspace);
  const notesByMidi = useAppSelector(selectNotes);

  onMount(() => {
    const roomId = location.pathname.replace('/', '');
    if (!roomId) {
      return;
    }

    joinRoom(roomId);
  });

  return (
    <Switch>
      <Match when={workspace().isLoading !== false}>
        <div class={styles.loadingContainer}>
          <div class={styles.spinner}></div>
        </div>
      </Match>
      <Match when={workspace().isValid === false}>
        <div class={styles.errorContainer}>
          <h1 class={styles.errorHeading}>Room not found</h1>
          <A href='/' class={styles.errorLink}>Go back home</A>
        </div>
      </Match>
      <Match when={true}>
        <div class={`${styles.roomGrid} fade-in`}>
          <nav class={styles.headerArea}>
            <RoomNav workspace={workspace()} />
          </nav>
          <main class={styles.visualArea}>
            <Visualization notes={getNotes(notesByMidi())} />
          </main>
        </div>
      </Match>
    </Switch>
  );
};

export default Room;
