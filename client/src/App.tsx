import {
  Routes,
  Route,
} from 'react-router-dom';
import { lazy } from 'react';


const RoomCheck = lazy(() => import('./pages/RoomCheck'))
const Home = lazy(() => import('./pages/Home'));
const Donate = lazy(() => import('./pages/Donate'));


export default function App() {
  return (
    <Routes>
      <Route path='/' element={<Home />} />
      <Route path='donate' element={<Donate />} />
      <Route path='assets' element={null} />
      <Route path='*' element={<RoomCheck />} />
    </Routes>
  );
}
