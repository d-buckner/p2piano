import { createSignal, Show } from 'solid-js';
import { updateDisplayName } from '../actions/WorkspaceActions';
import ClientPreferences from '../lib/ClientPreferences';
import { isIOS } from '../lib/userAgent';
import * as styles from './WelcomeModal.css';
import type { Workspace } from '../app/store';


interface Props {
  onJoin: () => void,
  workspace: Workspace,
}

const WelcomeModal = (props: Props) => {
  const [displayName, setDisplayName] = createSignal<string | undefined>(ClientPreferences.getDisplayName());
  const [isEditing, setIsEditing] = createSignal(false);
  const [tempName, setTempName] = createSignal<string>('');

  const onSubmit = () => {
    if (displayName()?.length && displayName() !== ClientPreferences.getUserDefinedDisplayName()) {
      updateDisplayName(displayName()!);
    }

    props.onJoin();
  };

  const isValidName = (name: string) => {
    return name && name.length >= 2 && name.length <= 20;
  };

  const startEditing = () => {
    setTempName(displayName() || '');
    setIsEditing(true);
    // Focus the input after it renders
    setTimeout(() => {
      const input = document.querySelector(`.${styles.inlineInput}`) as HTMLInputElement;
      if (input) {
        input.focus();
        input.select();
      }
    }, 0);
  };

  const saveEdit = () => {
    const newName = tempName().trim();
    if (isValidName(newName)) {
      setDisplayName(newName);
    }
    setIsEditing(false);
  };

  const cancelEdit = () => {
    setIsEditing(false);
    setTempName('');
  };

  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key === 'Enter') {
      saveEdit();
    } else if (e.key === 'Escape') {
      cancelEdit();
    }
  };

  const getUserCount = () => {
    const users = props.workspace.room?.users;
    return users ? Object.keys(users).length : 0;
  };


  const getContextMessage = () => {
    const count = getUserCount() - 1;
    if (count === 0) {
      return "You'll be the first to play!";
    }

    if (count === 1) {
      return 'Join 1 other person';
    }

    return `Join ${count} other people`;
  };

  return (
    <div class={styles.startModalOverlay}>
      <div class={styles.startModalContent}>
        <h1 class={styles.startModalTitle}>Ready to jam?</h1>
        <p class={styles.contextMessage}>
          {getContextMessage()}
        </p>

        <div class={styles.joiningAs}>
          Joining as 
          <Show when={!isEditing()}>
            <button 
              class={styles.displayNameButton}
              onClick={startEditing}
            >
              {displayName()}
            </button>
          </Show>
          <Show when={isEditing()}>
            <input
              class={styles.inlineInput}
              value={tempName()}
              onInput={(e) => setTempName((e.target as HTMLInputElement).value)}
              onBlur={saveEdit}
              onKeyDown={handleKeyDown}
              placeholder="Enter name"
            />
          </Show>
        </div>

        <Show when={isIOS()}>
          <p class={styles.iosCheck}>
            Unsilence your phone to hear everyone
          </p>
        </Show>

        <div class={styles.buttonGroup}>
          <button
            class={styles.backHomeButton}
            onClick={() => window.location.href = '/'}
          >
            Back Home
          </button>
          <button
            class={styles.startPlayingButton}
            onClick={() => onSubmit()}
          >
            Start Playing
          </button>
        </div>
      </div>
    </div>
  );
};

export default WelcomeModal;
