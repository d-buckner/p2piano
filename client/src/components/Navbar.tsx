import { Flex } from '@chakra-ui/react';
import { Link} from 'react-router-dom';

export default function Navbar() {
  return (
    <Flex 
      justifyContent='space-between'
      alignItems='center'
      height='2em'
      padding='0 1em'
    >
      <Link to='/'>
        p2piano
      </Link>
      <Link
        to='/donate'
      >
        donate
      </Link>
    </Flex>
  );
}
