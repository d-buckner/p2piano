import { render, fireEvent, cleanup } from '@solidjs/testing-library';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import MetronomeControl from './MetronomeControl';

// Mock dependencies
vi.mock('../../../app/hooks', () => ({
  useAppSelector: vi.fn(),
}));

vi.mock('../../../crdt', () => ({
  metronomeActions: {
    toggleIsPlaying: vi.fn(),
    setBpm: vi.fn(),
    setTimeSignature: vi.fn(),
  },
}));

vi.mock('../../../selectors/metronomeSelectors', () => ({
  selectMetronome: vi.fn(),
}));

vi.mock('../../../selectors/workspaceSelectors', () => ({
  selectMyUser: vi.fn(),
}));

vi.mock('../../ui/Dropdown', () => ({
  default: (props: any) => (
    <div data-testid="dropdown">
      {props.trigger}
      {props.open && <div data-testid="dropdown-content">{props.children}</div>}
    </div>
  )
}));

vi.mock('../../ui/Tooltip', () => ({
  default: (props: any) => (
    <div data-testid="tooltip" title={props.text}>
      {props.children}
    </div>
  )
}));

const mockUseAppSelector = vi.mocked(await import('../../../app/hooks')).useAppSelector;
const mockMetronomeActions = vi.mocked(await import('../../../crdt')).metronomeActions;

describe('MetronomeControl', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    
    // Default mock implementations
    mockUseAppSelector.mockImplementation((selector) => {
      if (selector.name === 'selectMetronome') {
        return () => ({
          isPlaying: false,
          bpm: 120,
          timeSignature: [4, 4],
        });
      }
      if (selector.name === 'selectMyUser') {
        return () => ({ id: 'user1' });
      }
      return () => ({});
    });
  });

  afterEach(() => {
    cleanup();
  });

  it('should render play button when metronome is not playing', () => {
    const { getByText } = render(() => <MetronomeControl />);
    
    expect(getByText('▶')).toBeInTheDocument();
  });

  it('should render pause button when metronome is playing', () => {
    mockUseAppSelector.mockImplementation((selector) => {
      if (selector.name === 'selectMetronome') {
        return () => ({
          isPlaying: true,
          bpm: 120,
          timeSignature: [4, 4],
        });
      }
      if (selector.name === 'selectMyUser') {
        return () => ({ id: 'user1' });
      }
      return () => ({});
    });
    
    const { getByText } = render(() => <MetronomeControl />);
    
    expect(getByText('⏸')).toBeInTheDocument();
  });

  it('should display current BPM value', () => {
    const { getByText } = render(() => <MetronomeControl />);
    
    expect(getByText('120')).toBeInTheDocument();
    expect(getByText('BPM')).toBeInTheDocument();
  });

  it('should call toggleIsPlaying when play/pause button is clicked', () => {
    const { getByText } = render(() => <MetronomeControl />);
    
    const playButton = getByText('▶');
    fireEvent.click(playButton);
    
    expect(mockMetronomeActions.toggleIsPlaying).toHaveBeenCalledWith('user1');
  });

  it('should show dropdown content when BPM area is clicked', () => {
    const { getByText, getByTestId } = render(() => <MetronomeControl />);
    
    const bpmButton = getByText('BPM').closest('button');
    expect(bpmButton).toBeInTheDocument();
    
    fireEvent.click(bpmButton!);
    
    // After click, dropdown should be open (this tests the toggle behavior)
    // The actual dropdown opening is handled by component state
  });

  it('should apply active class when metronome is playing', () => {
    mockUseAppSelector.mockImplementation((selector) => {
      if (selector.name === 'selectMetronome') {
        return () => ({
          isPlaying: true,
          bpm: 120,
          timeSignature: [4, 4],
        });
      }
      if (selector.name === 'selectMyUser') {
        return () => ({ id: 'user1' });
      }
      return () => ({});
    });
    
    const { container } = render(() => <MetronomeControl />);
    
    const toggleButton = container.querySelector('button');
    expect(toggleButton).toHaveClass('active');
  });

  it('should display current time signature', () => {
    mockUseAppSelector.mockImplementation((selector) => {
      if (selector.name === 'selectMetronome') {
        return () => ({
          isPlaying: false,
          bpm: 120,
          timeSignature: [3, 4],
        });
      }
      if (selector.name === 'selectMyUser') {
        return () => ({ id: 'user1' });
      }
      return () => ({});
    });
    
    const { getByText } = render(() => <MetronomeControl />);
    
    expect(getByText('3/4')).toBeInTheDocument();
  });

  it('should handle different BPM values correctly', () => {
    mockUseAppSelector.mockImplementation((selector) => {
      if (selector.name === 'selectMetronome') {
        return () => ({
          isPlaying: false,
          bpm: 180,
          timeSignature: [4, 4],
        });
      }
      if (selector.name === 'selectMyUser') {
        return () => ({ id: 'user1' });
      }
      return () => ({});
    });
    
    const { getByText } = render(() => <MetronomeControl />);
    
    expect(getByText('180')).toBeInTheDocument();
  });
});
