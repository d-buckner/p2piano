import { render } from '@solidjs/testing-library';
import { describe, expect, it, vi } from 'vitest';
import Home from './Home';


vi.mock('@solidjs/router', () => ({
  useNavigate: () => vi.fn(),
  A: (props: { href: string; children: unknown }) => <a href={props.href}>{props.children}</a>
}));

vi.mock('../actions/RoomActions', () => ({
  setRoom: vi.fn()
}));

vi.mock('../audio/AudioManager', () => ({
  default: {
    activate: vi.fn()
  }
}));

vi.mock('../clients/RoomClient', () => ({
  createNewRoom: vi.fn().mockResolvedValue({ roomId: 'test-room' })
}));

vi.mock('../components/LandingPiano', () => ({
  default: () => <div data-testid="landing-piano">Mocked LandingPiano</div>
}));

vi.mock('../components/HomeLayout', () => ({
  default: (props: { children: unknown }) => <div data-testid="home-layout">{props.children}</div>
}));

describe('Home', () => {
  it('should render without errors', () => {
    expect(() => render(() => <Home />)).not.toThrow();
  });

  it('should render HomeLayout component', () => {
    const { getByTestId } = render(() => <Home />);
    expect(getByTestId('home-layout')).toBeInTheDocument();
  });

  it('should render landing piano component', () => {
    const { getByTestId } = render(() => <Home />);
    expect(getByTestId('landing-piano')).toBeInTheDocument();
  });
});
