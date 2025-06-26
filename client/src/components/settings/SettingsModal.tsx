import HuMIDI from 'humidi';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
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
  const [hasCopied, setHasCopied] = useState(false);
  const [displayName, setDisplayName] = useState<string>(ClientPreferences.getDisplayName() ?? '');
  const [hasDisplayNameError, setDisplayNameError] = useState<boolean>(!isDisplayNameValid(displayName));

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
  }

  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modalContent}>
        <button 
          className={styles.modalCloseButton}
          onClick={() => navigate('/')}
        >
          ×
        </button>
        <div className={styles.modalHeader}>Settings</div>

        <div className={styles.modalBody}>
          <DisplayName
            name={displayName}
            hasError={hasDisplayNameError}
            onChange={onDisplayNameChange}
          />
          <fieldset className={styles.fieldset}>
            <Label label='midi' />
            <div className={styles.checkboxContainer}>
              <input
                type="checkbox"
                className={styles.checkbox}
                onChange={HuMIDI.requestAccess}
              />
              <span>enable usb midi (browser will ask for permissions)</span>
            </div>
          </fieldset>
          <fieldset className={styles.fieldset}>
            <Label label='sharable room code' />
            <div className={styles.hstack}>
              <input 
                className={styles.input}
                value={location.href} 
                readOnly 
              />
              <button 
                className={styles.copyButton}
                onClick={() => onCopy(location.href)}
              >
                {hasCopied ? 'copied!' : 'copy'}
              </button>
            </div>
          </fieldset>
          <button
            className={styles.primaryButton}
            onClick={hasDisplayNameError ? noop : onSubmit}
            disabled={hasDisplayNameError}
          >
            let's go
          </button>

          {/* {!isIOS() && <p>UNMUTE YOUR PHONE</p>} */}
        </div>
      </div>
    </div>
  )

  function Label(props: LabelProps) {
    return (
      <label style={{ fontFamily: 'Ysabeau Office, sans-serif', fontWeight: 'bold', marginBottom: '0.5rem' }}>
        {props.label}
      </label>
    );
  }

  function onSubmit() {
    AudioManager.activate();
    ClientPreferences.setDisplayName(displayName);
    props.onSubmit();
  }
}

export default SettingsModal;
