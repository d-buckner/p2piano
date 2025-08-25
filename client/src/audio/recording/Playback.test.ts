import { describe, it, expect, vi, beforeEach } from 'vitest';
import { KeyActions } from '../../constants';
import { NoteManager } from '../../lib/NoteManager';
import InstrumentRegistry from '../instruments/InstrumentRegistry';
import Playback from './Playback';
import RecordingClient from './RecordingClient';
import type { KeyDownEvent, KeyUpEvent } from './types';

// Mock dependencies
vi.mock('../instruments/InstrumentRegistry');
vi.mock('./RecordingClient');
vi.mock('../../lib/NoteManager');
vi.mock('tone', () => ({
  getTransport: vi.fn(() => ({
    start: vi.fn(),
    stop: vi.fn(),
    schedule: vi.fn((callback) => {
      // Immediately execute callback for test
      callback();
      return 123; // Return mock event ID
    }),
    clear: vi.fn()
  }))
}));

describe('Playback', () => {
  let mockInstrument: {
    keyDown: ReturnType<typeof vi.fn>;
    keyUp: ReturnType<typeof vi.fn>;
    sustainDown?: ReturnType<typeof vi.fn>;
    sustainUp?: ReturnType<typeof vi.fn>;
  };
  let mockClient: {
    initialize: ReturnType<typeof vi.fn>;
    getEventsByRecording: ReturnType<typeof vi.fn>;
  };

  beforeEach(() => {
    vi.clearAllMocks();
    
    mockInstrument = {
      keyDown: vi.fn(),
      keyUp: vi.fn(),
      sustainDown: vi.fn(),
      sustainUp: vi.fn()
    };
    
    mockClient = {
      initialize: vi.fn().mockResolvedValue(undefined),
      getEventsByRecording: vi.fn().mockResolvedValue({ events: [], hasMore: false })
    };
    
    vi.mocked(InstrumentRegistry.get).mockReturnValue(mockInstrument);
    vi.mocked(RecordingClient).mockImplementation(() => mockClient);
  });

  it('should emit NoteManager events during playback', async () => {
    const keyDownEvent: KeyDownEvent = {
      type: KeyActions.KEY_DOWN,
      midi: 60,
      velocity: 100,
      color: 'blue',
      instrument: 'Piano',
      timestamp: 0, // Set to 0 so it executes immediately
      recordingId: 'test',
      userId: 'user1'
    };

    const keyUpEvent: KeyUpEvent = {
      type: KeyActions.KEY_UP,
      midi: 60,
      timestamp: 100, // Small delay so it executes shortly after
      recordingId: 'test',
      userId: 'user1'
    };

    mockClient.getEventsByRecording.mockResolvedValue({
      events: [keyDownEvent, keyUpEvent],
      hasMore: false
    });

    const playback = await Playback.load('test-recording');
    await playback.start();

    // Verify instrument methods were called
    expect(mockInstrument.keyDown).toHaveBeenCalledWith(60, 0, 100);
    expect(mockInstrument.keyUp).toHaveBeenCalledWith(60, 100);

    // Events should execute immediately due to mock

    // Verify NoteManager events were emitted
    expect(NoteManager.startNote).toHaveBeenCalledWith(60, 'user1', 'blue');
    expect(NoteManager.endNote).toHaveBeenCalledWith(60, 'user1');
  });
});
