import { render, cleanup } from '@solidjs/testing-library';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import RecordingControl from './RecordingControl';

// Mock the store state instead of individual selectors
vi.mock('../../../app/hooks', () => ({
  useAppSelector: vi.fn((selector) => {
    const mockState = {
      recording: {
        isRecording: false,
        recordingStartTime: Date.now(),
        recordings: [],
        selectedRecordingId: null,
        playbackStatus: 'STOPPED',
        isLoaded: true,
        currentRecordingId: null,
        playbackTimestamp: 0,
        playbackDuration: 0
      },
      workspace: {
        myUser: { id: 'test', name: 'Test User' }
      }
    };
    // Return a function that returns the selector result (mimicking createMemo)
    return () => selector(mockState);
  })
}));

vi.mock('../../../actions/RecordingActions', () => ({
  startRecording: vi.fn(),
  stopRecording: vi.fn(),
  selectRecording: vi.fn(),
  playRecording: vi.fn(),
  pausePlayback: vi.fn(),
  resumePlayback: vi.fn(),
  stopPlayback: vi.fn(),
  deleteRecording: vi.fn(),
  renameRecording: vi.fn(),
}));

describe('RecordingControl', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    cleanup();
  });

  it('should render without crashing', () => {
    const { container } = render(() => <RecordingControl />);
    expect(container).toBeInTheDocument();
  });

  it('should render the record button', () => {
    const { getByTestId } = render(() => <RecordingControl />);
    const recordButton = getByTestId('record-button');
    expect(recordButton).toBeInTheDocument();
  });

  it('should render the default recording selector text', () => {
    const { getByText } = render(() => <RecordingControl />);
    expect(getByText('Select recording')).toBeInTheDocument();
  });

  it('should render all control buttons', () => {
    const { getByTestId, container } = render(() => <RecordingControl />);
    
    // Record button
    expect(getByTestId('record-button')).toBeInTheDocument();
    
    // Should have multiple buttons for different controls
    const buttons = container.querySelectorAll('button');
    expect(buttons.length).toBeGreaterThan(1);
  });

  it('should have proper button structure', () => {
    const { getByTestId } = render(() => <RecordingControl />);
    const recordButton = getByTestId('record-button');
    
    expect(recordButton.tagName).toBe('BUTTON');
    expect(recordButton).toBeInstanceOf(HTMLButtonElement);
  });
});
