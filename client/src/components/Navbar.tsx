import { Button, Flex } from '@chakra-ui/react';
import { useNavigate } from 'react-router-dom';

export default function Navbar() {
  const navigate = useNavigate();

  return (
    <Flex justifyContent='space-between'>
      <Button
        as='a'
        height='32px'
        _hover={{ bg: "gray" }}
        onClick={() => navigate('/')}
        background='none'
      >
        p2piano
      </Button>
      <Button
        as='a'
        height='32px'
        _hover={{ bg: "gray" }}
        onClick={() => navigate('/donate')}
        background='none'
      >
        donate
      </Button>
    </Flex>
  );
}
