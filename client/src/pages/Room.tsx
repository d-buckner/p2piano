import { A } from '@solidjs/router';
import { onMount, Switch, Match } from 'solid-js';
import { joinRoom } from '../actions/WorkspaceActions';
import { useAppSelector } from '../app/hooks';
import PianoRenderer from '../components/PianoRenderer';
import RoomNav from '../components/RoomNav';
import { metronomeController } from '../controllers/MetronomeController';
import { selectNotes } from '../selectors/noteSelectors';
import { selectWorkspace } from '../selectors/workspaceSelectors';
import * as styles from './Room.css';


const Room = () => {
  const workspace = useAppSelector(selectWorkspace);
  const notes = useAppSelector(selectNotes);

  onMount(() => {
    const roomId = location.pathname.replace('/', '');
    if (!roomId) {
      return;
    }

    joinRoom(roomId);
    metronomeController.initialize();
  });

  return (
    <Switch>
      <Match when={workspace().isLoading !== false}>
        <div class={styles.loadingContainer}>
          <div class={styles.spinner} />
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
            <PianoRenderer notes={notes()} />
          </main>
        </div>
      </Match>
    </Switch>
  );
};

export default Room;
