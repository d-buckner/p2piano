import { Route } from '@solidjs/router';
import { lazy } from 'solid-js';


const RoomEntryGuard = lazy(() => import('./pages/RoomEntryGuard'));
const Home = lazy(() => import('./pages/Home'));
const Donate = lazy(() => import('./pages/Donate'));

export default function App() {
  return (
    <>
      <Route path='/' component={Home} />
      <Route path='/donate' component={Donate} />
      <Route path='/*' component={RoomEntryGuard} />
    </>
  );
}
