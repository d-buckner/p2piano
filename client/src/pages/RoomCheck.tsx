import { Box } from '@chakra-ui/react';
import SettingsModal from '../components/settings/SettingsModal';
import Room from './Room';
import { useState } from 'react';
import AudioManager from '../audio/AudioManager';
import ClientPreferences from '../lib/ClientPreferences';


export default function RoomCheck() {
  const [accepted, setAccepted] = useState<boolean>(
    AudioManager.active && !!ClientPreferences.getDisplayName()
  );
  if (accepted) {
    return <Room />;
  }

  return (
    <Box
      bg='black'
      h='full'
    >
      <SettingsModal
        onSubmit={() => {
          setAccepted(true);
        }}
      />
    </Box>
  );
}