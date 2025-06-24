import {
  Text,
  Heading,
  Center,
  Input,
  Stack,
  HStack,
  Button,
  Spinner,
} from '@chakra-ui/react';
import { useNavigate } from "react-router-dom";
import { createNewRoom, getRoom } from '../clients/RoomClient';
import { useCallback, useState } from 'react';
import { dispatch } from '../app/store';
import { setRoom } from '../slices/workspaceSlice';

import type { ChangeEvent } from 'react';
import AudioManager from '../audio/AudioManager';


export default function RoomCard() {
  const [isRoomError, setRoomError] = useState(false);
  const [isRoomCreating, setRoomCreating] = useState(false);
  const navigate = useNavigate();

  const navigateToRoom = useCallback((roomId: string) => navigate(`/${roomId}`), [navigate]);

  const createRoom = useCallback(async () => {
    AudioManager.activate();
    setRoomCreating(true);
    const room = await createNewRoom();
    dispatch(setRoom({ room }));
    navigateToRoom(room.roomId);
  }, [navigateToRoom]);

  const onRoomCodeChange = async (e: ChangeEvent<HTMLInputElement>) => {
    const roomId = e.target.value.toLowerCase();
    if (roomId.length !== 5) {
      setRoomError(false);
      return;
    }

    try {
      const room = await getRoom(roomId);
      dispatch(setRoom({ room }));
    } catch {
      setRoomError(true);
      return;
    }

    setRoomError(false);
    navigateToRoom(roomId);
  }

  return (
    <Center py={6} height='70%'>
      <Stack>
        <Heading
          pt={8}
          mb={4}
          fontSize='8xl'
          textAlign='center'

        >
          p2piano
        </Heading>
        <Heading
          fontSize='xl'
          textAlign='center'
        >
          a collaboration space for the musically inclined
        </Heading>
        <HStack p={6} alignSelf='center'>
          <Button
            bg='background'
            h="47px"
            _hover={{ bg: "gray" }}
            border="1px solid white"
            rounded='md'
            onClick={createRoom}
            disabled={isRoomCreating}
          >
            {
              isRoomCreating
                ? <Spinner />
                : 'create room'
            }
          </Button>
          <Text>or</Text>
          <Input
            placeholder='join room code'
            size='lg'
            maxLength={5}
            width='10rem'
            textAlign='center'
            onChange={onRoomCodeChange}
            isInvalid={isRoomError}
            errorBorderColor='red.300'
            textTransform='lowercase'
          />
        </HStack>
      </Stack>
    </Center>
  );
}
