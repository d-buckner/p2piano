import { render, screen, fireEvent } from '@solidjs/testing-library';
import { createSignal } from 'solid-js';
import { describe, expect, it, vi, beforeEach } from 'vitest';


const [mockWorkspace, setMockWorkspace] = createSignal({
  isLoading: false,
  isValid: undefined,
  room: undefined,
  roomId: undefined,
  userId: undefined,
});

const [mockNotes] = createSignal({});

vi.mock('../app/hooks', () => ({
  useAppSelector: vi.fn((selector) => {
    const selectorStr = selector.toString();
    if (selectorStr.includes('workspace')) return mockWorkspace;
    if (selectorStr.includes('notes')) return mockNotes;
    return () => ({});
  }),
}));

vi.mock('../actions/WorkspaceActions', () => ({
  joinRoom: vi.fn(),
}));

vi.mock('../audio/AudioManager', () => ({
  default: {
    active: false,
    activate: vi.fn(),
  },
}));

vi.mock('../controllers/MetronomeController', () => ({
  metronomeController: {
    initialize: vi.fn(),
  },
}));

vi.mock('../lib/registerServiceWorker', () => ({
  default: vi.fn(),
}));

vi.mock('../lib/ClientPreferences', () => ({
  default: {
    hasUserDefinedDisplayName: () => false,
  },
}));

vi.mock('../components/PianoRenderer', () => ({
  default: (props: { notes: unknown }) => <div data-testid="piano-renderer">{JSON.stringify(props.notes)}</div>
}));

vi.mock('../components/RoomNav', () => ({
  default: (props: { workspace: unknown }) => <div data-testid="room-nav">{JSON.stringify(props.workspace)}</div>
}));

vi.mock('../components/WelcomeModal', () => ({
  default: (props: { onJoin: () => void; workspace: unknown }) => (
    <div data-testid="welcome-modal">
      <button onClick={() => props.onJoin()}>Join Room</button>
      <div data-testid="workspace-data">{JSON.stringify(props.workspace)}</div>
    </div>
  )
}));

vi.mock('@solidjs/router', () => ({
  A: (props: { href: string; children: unknown }) => (
    <a href={props.href} data-testid="router-link">{props.children}</a>
  )
}));

describe('Room', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    Object.defineProperty(window, 'location', {
      value: { pathname: '/test-room-123' },
      writable: true,
    });
    
    setMockWorkspace({
      isLoading: false,
      isValid: undefined,
      room: undefined,
      roomId: undefined,
      userId: undefined,
    });
  });

  it('should initialize room on mount with room ID from URL', async () => {
    const { default: Room } = await import('./Room');
    const { joinRoom } = await import('../actions/WorkspaceActions');
    const { metronomeController } = await import('../controllers/MetronomeController');
    const registerServiceWorker = (await import('../lib/registerServiceWorker')).default;

    render(() => <Room />);

    expect(registerServiceWorker).toHaveBeenCalled();
    expect(joinRoom).toHaveBeenCalledWith('test-room-123');
    expect(metronomeController.initialize).toHaveBeenCalled();
  });

  it('should not join room when no room ID in URL', async () => {
    const { default: Room } = await import('./Room');
    const { joinRoom } = await import('../actions/WorkspaceActions');
    
    Object.defineProperty(window, 'location', {
      value: { pathname: '/' },
      writable: true,
    });

    render(() => <Room />);

    expect(joinRoom).not.toHaveBeenCalled();
  });

  it('should show loading state while room is loading', async () => {
    const { default: Room } = await import('./Room');
    
    setMockWorkspace({
      isLoading: true,
      isValid: undefined,
      room: undefined,
      roomId: 'test-room',
      userId: undefined,
    });

    render(() => <Room />);

    expect(document.querySelector('[class*="loadingContainer"]')).toBeInTheDocument();
    expect(document.querySelector('[class*="spinner"]')).toBeInTheDocument();
  });

  it('should show error state when room is invalid', async () => {
    const { default: Room } = await import('./Room');
    
    setMockWorkspace({
      isLoading: false,
      isValid: false,
      room: undefined,
      roomId: 'invalid-room',
      userId: undefined,
    });

    render(() => <Room />);

    expect(screen.getByText('Room not found')).toBeInTheDocument();
    expect(screen.getByTestId('router-link')).toHaveAttribute('href', '/');
    expect(screen.getByText('Go back home')).toBeInTheDocument();
  });

  it('should show room interface when valid', async () => {
    const { default: Room } = await import('./Room');
    
    const mockRoom = {
      roomId: 'test-room',
      users: { 'user-1': { userId: 'user-1', displayName: 'Test User' } }
    };

    setMockWorkspace({
      isLoading: false,
      isValid: true,
      room: mockRoom,
      roomId: 'test-room',
      userId: 'user-1',
    });

    render(() => <Room />);

    expect(screen.getByTestId('room-nav')).toBeInTheDocument();
    expect(screen.getByTestId('piano-renderer')).toBeInTheDocument();
    
    expect(screen.getByTestId('room-nav')).toHaveTextContent('"roomId":"test-room"');
    expect(screen.getByTestId('piano-renderer')).toHaveTextContent('{}');
  });

  it('should show welcome modal for users without display name or inactive audio', async () => {
    const { default: Room } = await import('./Room');
    
    setMockWorkspace({
      isLoading: false,
      isValid: true,
      room: { roomId: 'test-room', users: {} },
      roomId: 'test-room',
      userId: 'user-1',
    });

    render(() => <Room />);

    expect(screen.getByTestId('welcome-modal')).toBeInTheDocument();
    expect(screen.getByTestId('workspace-data')).toHaveTextContent('"roomId":"test-room"');
  });

  it('should activate audio when join button is clicked in welcome modal', async () => {
    const { default: Room } = await import('./Room');
    const AudioManager = (await import('../audio/AudioManager')).default;
    
    setMockWorkspace({
      isLoading: false,
      isValid: true,
      room: { roomId: 'test-room', users: {} },
      roomId: 'test-room',
      userId: 'user-1',
    });

    render(() => <Room />);

    const joinButton = screen.getByText('Join Room');
    fireEvent.click(joinButton);

    expect(AudioManager.activate).toHaveBeenCalled();
  });
});
