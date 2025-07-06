import { render, fireEvent, cleanup } from '@solidjs/testing-library';
import HuMIDI from 'humidi';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { setMidiEnabled } from '../actions/MidiActions';
import MidiButton from './MidiButton';

// Mock dependencies at module level
vi.mock('../actions/MidiActions', () => ({
  setMidiEnabled: vi.fn(),
}));

vi.mock('humidi', () => ({
  default: {
    requestAccess: vi.fn(),
  },
}));

vi.mock('../app/hooks', () => ({
  useAppSelector: vi.fn(),
}));

const mockSetMidiEnabled = vi.mocked(setMidiEnabled);
const mockHuMIDI = vi.mocked(HuMIDI);
const mockUseAppSelector = vi.mocked(await import('../app/hooks')).useAppSelector;

describe('MidiButton', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    cleanup();
  });

  it('should render inactive button when MIDI is disabled', () => {
    mockUseAppSelector.mockReturnValue(() => ({ enabled: false }));
    
    const { getByRole } = render(() => <MidiButton />);
    const button = getByRole('button');
    
    expect(button).toBeInTheDocument();
    // Verify visual state (button should not appear active)
    expect(button.className).not.toContain('active');
  });

  it('should render active button when MIDI is enabled', () => {
    mockUseAppSelector.mockReturnValue(() => ({ enabled: true }));
    
    const { getByRole } = render(() => <MidiButton />);
    const button = getByRole('button');
    
    expect(button).toBeInTheDocument();
    // Verify visual state (button should appear active)
    expect(button.className).toContain('active');
  });

  it('should display USB icon to indicate MIDI functionality', () => {
    mockUseAppSelector.mockReturnValue(() => ({ enabled: false }));
    
    const { container } = render(() => <MidiButton />);
    const svg = container.querySelector('svg');
    
    // Verify icon is present for user recognition
    expect(svg).toBeInTheDocument();
  });

  it('should request MIDI access when user clicks disabled button', async () => {
    mockUseAppSelector.mockReturnValue(() => ({ enabled: false }));
    mockHuMIDI.requestAccess.mockResolvedValue(undefined);
    
    const { getByRole } = render(() => <MidiButton />);
    const button = getByRole('button');
    
    fireEvent.click(button);
    
    // Verify browser MIDI access is requested
    expect(mockHuMIDI.requestAccess).toHaveBeenCalled();
    
    // Wait for async operation
    await new Promise(resolve => setTimeout(resolve, 0));
    
    // Verify app state is updated on success
    expect(mockSetMidiEnabled).toHaveBeenCalledWith(true);
  });

  it('should not request access when MIDI is already enabled', () => {
    mockUseAppSelector.mockReturnValue(() => ({ enabled: true }));
    
    const { getByRole } = render(() => <MidiButton />);
    const button = getByRole('button');
    
    fireEvent.click(button);
    
    // Should not make unnecessary requests
    expect(mockHuMIDI.requestAccess).not.toHaveBeenCalled();
    expect(mockSetMidiEnabled).not.toHaveBeenCalled();
  });

  it('should handle MIDI access denial gracefully', async () => {
    mockUseAppSelector.mockReturnValue(() => ({ enabled: false }));
    const error = new Error('MIDI access denied');
    mockHuMIDI.requestAccess.mockRejectedValue(error);
    
    const { getByRole } = render(() => <MidiButton />);
    const button = getByRole('button');
    
    fireEvent.click(button);
    
    expect(mockHuMIDI.requestAccess).toHaveBeenCalled();
    
    // Wait for async operation
    await new Promise(resolve => setTimeout(resolve, 0));
    
    // Should not enable MIDI on failure - this is the observable behavior
    expect(mockSetMidiEnabled).not.toHaveBeenCalled();
    
    // Button should remain in disabled state
    expect(button.className).not.toContain('active');
  });
});
