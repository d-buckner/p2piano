import { Box } from '@chakra-ui/react';
import ClientPreferences from '../lib/ClientPreferences';
import DisplayNameModal from '../components/DisplayNameModal';
import Room from './Room';
import { useState } from 'react';


export default function RoomCheck() {
  const [displayName, setDisplayName] = useState<string | null>(ClientPreferences.getDisplayName());
  if (displayName) {
    return <Room />;
  }

  return (
    <Box
      bg='black'
      h='full'
    >
      <DisplayNameModal
        onSubmit={() => {
          setDisplayName(ClientPreferences.getDisplayName());
        }}
      />
    </Box>
  );
}