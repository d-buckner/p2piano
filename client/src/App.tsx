import {
  Routes,
  Route,
  useLocation,
} from 'react-router-dom';
import Home from './pages/Home';
import Room from './pages/Room';
import { Box } from '@chakra-ui/react'
import { joinRoom } from './actions/WorkspaceActions';
import { useEffect, useState } from 'react';
import ClientPreferences from './lib/ClientPreferences';
import DisplayNameModal from './components/DisplayNameModal';
import Donate from './pages/Donate';


const App = () => {
  const [displayName, setDisplayName] = useState<string | null>(ClientPreferences.getDisplayName());
  const location = useLocation();

  useEffect(() => {
    const roomId = location.pathname.replace('/', '');
    if (!roomId || !displayName) {
      return;
    }

    joinRoom(roomId);
  }, [location, displayName]);

  return (
    <Routes>
      <Route path='/' element={<Home />} />
      <Route path='donate' element={<Donate />} />
      <Route path='assets' element={null} />
      <Route path='*' element={<RoomCheck />} />
    </Routes>
  );

  function RoomCheck() {
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
}

export default App;
