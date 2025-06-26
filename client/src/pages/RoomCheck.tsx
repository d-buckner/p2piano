import { Box } from '@chakra-ui/react';
import { useState } from 'react';
import AudioManager from '../audio/AudioManager';
import SettingsModal from '../components/settings/SettingsModal';
import ClientPreferences from '../lib/ClientPreferences';
import Room from './Room';


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