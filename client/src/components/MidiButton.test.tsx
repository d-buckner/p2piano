import { render, fireEvent, cleanup } from '@solidjs/testing-library';
import HuMIDI from 'humidi';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { toggleMidiEnabled } from '../actions/MidiActions';
import MidiButton from './MidiButton';

// Mock dependencies at module level
vi.mock('../actions/MidiActions', () => ({
  toggleMidiEnabled: vi.fn(),
}));

vi.mock('humidi', () => ({
  default: {
    requestAccess: vi.fn(),
  },
}));

vi.mock('../app/hooks', () => ({
  useAppSelector: vi.fn(),
}));

const mockToggleMidiEnabled = vi.mocked(toggleMidiEnabled);
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

  it('should call toggleMidiEnabled when button is clicked', () => {
    mockUseAppSelector.mockReturnValue(() => ({ enabled: false }));
    
    const { getByRole } = render(() => <MidiButton />);
    const button = getByRole('button');
    
    fireEvent.click(button);
    
    // Verify toggle action is called
    expect(mockToggleMidiEnabled).toHaveBeenCalled();
  });

  it('should call toggleMidiEnabled regardless of current state', () => {
    mockUseAppSelector.mockReturnValue(() => ({ enabled: true }));
    
    const { getByRole } = render(() => <MidiButton />);
    const button = getByRole('button');
    
    fireEvent.click(button);
    
    // Toggle should always be called
    expect(mockToggleMidiEnabled).toHaveBeenCalled();
  });

  it('should render consistently regardless of click handling', () => {
    mockUseAppSelector.mockReturnValue(() => ({ enabled: false }));
    
    const { getByRole } = render(() => <MidiButton />);
    const button = getByRole('button');
    
    // Test that the component renders properly
    expect(button).toBeInTheDocument();
    expect(button.className).not.toContain('active');
    
    // Click should not affect rendering immediately (state updates are external)
    fireEvent.click(button);
    expect(mockToggleMidiEnabled).toHaveBeenCalled();
  });
});
