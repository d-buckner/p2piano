import { Button } from '@chakra-ui/react';
import HuMIDI from 'humidi';
import Icon from './Icon';


function Toolbar() {
  return (
    <Button
      color='foreground'
      onClick={HuMIDI.requestAccess}
      backgroundColor='unset'
      height='24px'
      mr='4px'
      _hover={{ bg: 'gray' }}
    >
      <Icon name='usb-cable' />
    </Button>
  );
}

export default Toolbar;
