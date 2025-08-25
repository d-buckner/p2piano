import { A } from '@solidjs/router';
import { createSignal, onMount, Switch, Match, Show } from 'solid-js';
import { joinRoom } from '../actions/WorkspaceActions';
import { useAppSelector } from '../app/hooks';
import AudioManager from '../audio/AudioManager';
import PianoRenderer from '../components/PianoRenderer';
import RoomNav from '../components/RoomNav';
import WelcomeModal from '../components/WelcomeModal';
import { metronomeController } from '../controllers/MetronomeController';
import ClientPreferences from '../lib/ClientPreferences';
import registerServiceWorker from '../lib/registerServiceWorker';
import { selectWorkspace } from '../selectors/workspaceSelectors';
import * as styles from './Room.css';


const Room = () => {
  const workspace = useAppSelector(selectWorkspace);
  const [hasDisplayName, setHasDisplayName] = createSignal<boolean>(ClientPreferences.hasUserDefinedDisplayName());
  const [audioActivated, setAudioActivated] = createSignal(AudioManager.active);

  const start = async () => {
    setHasDisplayName(true);
    await AudioManager.activate();
    setAudioActivated(true);
  };

  onMount(() => {
    registerServiceWorker();
    
    const roomId = location.pathname.replace('/', '');
    if (!roomId) {
      return;
    }

    joinRoom(roomId);
    metronomeController.initialize();
  });

  return (
    <>
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
        <Match when={workspace().isValid}>
          <div class={`${styles.roomGrid} fade-in`}>
            <nav class={styles.headerArea}>
              <RoomNav workspace={workspace()} />
            </nav>
            <main class={styles.visualArea}>
              <PianoRenderer />
            </main>
          </div>
        </Match>
      </Switch>

      <Show when={(!hasDisplayName() || !audioActivated()) && workspace().isValid}>
        <WelcomeModal onJoin={start} workspace={workspace()} />
      </Show>
    </>
  );
};

export default Room;
