import { useNavigate } from '@solidjs/router';
import HuMIDI from 'humidi';
import { createSignal } from 'solid-js';
import AudioManager from '../../audio/AudioManager';
import ClientPreferences from '../../lib/ClientPreferences';
import DisplayName from './DisplayName';
import * as styles from './SettingsModal.css';



const noop = () => { };


interface Props {
  onSubmit: () => void,
};

interface LabelProps {
  label: string
}

function SettingsModal(props: Props) {
  const navigate = useNavigate();
  const [hasCopied, setHasCopied] = createSignal(false);
  const initialDisplayName = ClientPreferences.getDisplayName() ?? '';
  const [displayName, setDisplayName] = createSignal<string>(initialDisplayName);
  const [hasDisplayNameError, setDisplayNameError] = createSignal<boolean>(!isDisplayNameValid(initialDisplayName));

  const onCopy = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setHasCopied(true);
      setTimeout(() => setHasCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy text: ', err);
    }
  };

  function isDisplayNameValid(name: string) {
    return !!name &&
      name.length >= 3 &&
      name.length <= 12;
  }
  const onDisplayNameChange = (name: string) => {
    setDisplayName(name);
    setDisplayNameError(!isDisplayNameValid(name));
  };

  const onSubmit = () => {
    AudioManager.activate();
    ClientPreferences.setDisplayName(displayName());
    props.onSubmit();
  };

  return (
    <div class={styles.modalOverlay}>
      <div class={styles.modalContent}>
        <button 
          class={styles.modalCloseButton}
          onClick={() => navigate('/')}
        >
          ×
        </button>
        <div class={styles.modalHeader}>Settings</div>

        <div class={styles.modalBody}>
          <DisplayName
            name={displayName()}
            hasError={hasDisplayNameError()}
            onChange={onDisplayNameChange}
            onSubmit={onSubmit}
          />
          <fieldset class={styles.fieldset}>
            <Label label='midi' />
            <div class={styles.checkboxContainer}>
              <input
                type="checkbox"
                class={styles.checkbox}
                onChange={HuMIDI.requestAccess}
              />
              <span>enable usb midi (browser will ask for permissions)</span>
            </div>
          </fieldset>
          <fieldset class={styles.fieldset}>
            <Label label='sharable room code' />
            <div class={styles.hstack}>
              <input 
                class={styles.input}
                value={location.href} 
                readOnly 
              />
              <button 
                class={styles.copyButton}
                onClick={() => onCopy(location.href)}
              >
                {hasCopied() ? 'copied!' : 'copy'}
              </button>
            </div>
          </fieldset>
          <button
            class={styles.primaryButton}
            onClick={() => hasDisplayNameError() ? noop() : onSubmit()}
            disabled={hasDisplayNameError()}
          >
            let's go
          </button>
        </div>
      </div>
    </div>
  )

  function Label(props: LabelProps) {
    return (
      <label class={styles.label}>
        {props.label}
      </label>
    );
  }
}

export default SettingsModal;
