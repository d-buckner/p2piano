import { useState } from 'react';
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
  Button,
  useDisclosure,
  Input,
  FormControl,
  FormLabel,
  HStack,
  Checkbox,
  useClipboard,
} from '@chakra-ui/react'
import ClientPreferences from '../../lib/ClientPreferences';
import AudioManager from '../../audio/AudioManager';
import { useNavigate } from 'react-router-dom';
import HuMIDI from 'humidi';
import DisplayName from './DisplayName';

import type { KeyboardEvent } from 'react';


interface Props {
  onSubmit: () => void,
};

interface LabelProps {
  label: string
}

function SettingsModal(props: Props) {
  const navigate = useNavigate();
  const { onCopy, hasCopied } = useClipboard(location.href);
  const [displayName, setDisplayName] = useState<string>(ClientPreferences.getDisplayName() ?? '');
  const [hasDisplayNameError, setDisplayNameError] = useState<boolean>(false);

  const onDisplayNameChange = (displayName: string) => {
    const isValid = !!displayName && (
      displayName.length >= 3 ||
      displayName.length <= 12
    );
    setDisplayNameError(!isValid);
    setDisplayName(displayName);
  }

  const { onClose } = useDisclosure();
  return (
    <Modal
      isOpen={true}
      onClose={onClose}
    >
      <ModalOverlay />
      <ModalContent>
        <ModalCloseButton onClick={() => navigate('/')} />
        <ModalHeader>Settings</ModalHeader>

        <ModalBody display='flex' flexDir='column'>
          <DisplayName
            name={displayName}
            hasError={hasDisplayNameError}
            onChange={onDisplayNameChange}
          />
          <FormControl as='fieldset' display='flex' flexDir='column'>
            <Label label='midi' />
            <Checkbox
              onChange={HuMIDI.requestAccess}
              mb='1em'
            >
              enable usb midi (browser will ask for permissions)
            </Checkbox>
          </FormControl>
          <FormControl as='fieldset' display='flex' flexDir='column'>
            <Label label='sharable room code' />
            <HStack>
              <Input value={location.href} readOnly />
              <Button onClick={() => onCopy(location.href)}>{hasCopied ? 'copied!' : 'copy'}</Button>
            </HStack>
          </FormControl>
          <Button
            justifySelf='end'
            mt={4}
            bg='#151f21'
            color='white'
            rounded='md'
            onClick={onSubmit}
          >
            let's go
          </Button>

          {/* {!isIOS() && <p>UNMUTE YOUR PHONE</p>} */}
        </ModalBody>
      </ModalContent>
    </Modal>
  )

  function Label(props: LabelProps) {
    return (
      <FormLabel fontFamily='heading' fontWeight='bold'>
        {props.label}
      </FormLabel>
    );
  }

  function onSubmit() {
    AudioManager.activate();
    ClientPreferences.setDisplayName(displayName);
    onClose();
    props.onSubmit();
  }
}

export default SettingsModal;
