import { useState } from 'react';
import AudioManager from '../audio/AudioManager';
import SettingsModal from '../components/settings/SettingsModal';
import ClientPreferences from '../lib/ClientPreferences';
import Room from './Room';
import * as styles from './RoomCheck.css';


export default function RoomCheck() {
  const [accepted, setAccepted] = useState<boolean>(
    AudioManager.active && !!ClientPreferences.getDisplayName()
  );
  if (accepted) {
    return <Room />;
  }

  return (
    <div className={styles.roomCheckContainer}>
      <SettingsModal
        onSubmit={() => {
          setAccepted(true);
        }}
      />
    </div>
  );
}