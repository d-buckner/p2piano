import { createSignal, onMount, Show } from 'solid-js';
import AudioManager from '../audio/AudioManager';
import SettingsModal from '../components/settings/SettingsModal';
import ClientPreferences from '../lib/ClientPreferences';
import registerServiceWorker from '../lib/registerServiceWorker';
import Room from './Room';
import * as styles from './RoomCheck.css';


export default function RoomCheck() {
  const [accepted, setAccepted] = createSignal<boolean>(
    AudioManager.active && !!ClientPreferences.getDisplayName()
  );

  onMount(registerServiceWorker);

  return (
    <Show
      when={accepted()}
      fallback={
        <div class={styles.roomCheckContainer}>
          <SettingsModal onSubmit={() => setAccepted(true)} />
        </div>
      }
    >
      <Room />
    </Show>
  );
}