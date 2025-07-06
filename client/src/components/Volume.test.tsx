import { render, fireEvent, cleanup } from '@solidjs/testing-library';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import AudioManager from '../audio/AudioManager';
import Volume from './Volume';

// Mock AudioManager at module level
vi.mock('../audio/AudioManager', () => ({
  default: {
    setVolume: vi.fn(),
    mute: vi.fn(),
    unmute: vi.fn(),
  },
}));

const mockAudioManager = vi.mocked(AudioManager);

describe('Volume', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    cleanup();
  });

  it('should display initial volume at 100%', () => {
    const { getByDisplayValue, getByText } = render(() => <Volume />);
    
    expect(getByDisplayValue('100')).toBeInTheDocument();
    expect(getByText('100%')).toBeInTheDocument();
  });

  it('should show appropriate volume icon for current level', () => {
    const { getByAltText } = render(() => <Volume />);
    
    // High volume should show full icon
    expect(getByAltText('volume-full')).toBeInTheDocument();
  });

  it('should provide accessible mute button', () => {
    const { getByTitle } = render(() => <Volume />);
    
    const muteButton = getByTitle('Mute');
    expect(muteButton).toBeInTheDocument();
    expect(muteButton.tagName).toBe('BUTTON');
  });

  it('should update volume when user moves slider', () => {
    const { getByRole, getByText } = render(() => <Volume />);
    const slider = getByRole('slider') as HTMLInputElement;
    
    fireEvent.input(slider, { target: { value: '50' } });
    
    // Verify UI updates
    expect(getByText('50%')).toBeInTheDocument();
    expect(slider.value).toBe('50');
    
    // Verify audio system is notified
    expect(mockAudioManager.setVolume).toHaveBeenCalledWith(0.5);
  });

  it('should change icon to reflect volume level', () => {
    const { getByRole, getByAltText } = render(() => <Volume />);
    const slider = getByRole('slider') as HTMLInputElement;
    
    fireEvent.input(slider, { target: { value: '50' } });
    expect(getByAltText('volume-medium')).toBeInTheDocument();
    
    fireEvent.input(slider, { target: { value: '20' } });
    expect(getByAltText('volume-low')).toBeInTheDocument();
  });


  it('should mute audio when mute button is clicked', () => {
    const { getByTitle, getByText, getByAltText } = render(() => <Volume />);
    const muteButton = getByTitle('Mute');
    
    fireEvent.click(muteButton);
    
    // Verify UI changes to muted state
    expect(getByTitle('Unmute')).toBeInTheDocument();
    expect(getByText('0%')).toBeInTheDocument();
    expect(getByAltText('volume-muted')).toBeInTheDocument();
    
    // Verify audio system is muted
    expect(mockAudioManager.mute).toHaveBeenCalled();
  });

  it('should unmute audio when unmute button is clicked', () => {
    const { getByTitle } = render(() => <Volume />);
    
    // First mute
    const muteButton = getByTitle('Mute');
    fireEvent.click(muteButton);
    
    // Then unmute
    const unmuteButton = getByTitle('Unmute');
    fireEvent.click(unmuteButton);
    
    // Verify back to unmuted state
    expect(getByTitle('Mute')).toBeInTheDocument();
    expect(mockAudioManager.unmute).toHaveBeenCalled();
  });

  it('should unmute when user moves slider while muted', () => {
    const { getByTitle, getByRole, getByText } = render(() => <Volume />);
    const muteButton = getByTitle('Mute');
    const slider = getByRole('slider') as HTMLInputElement;
    
    // Mute first
    fireEvent.click(muteButton);
    expect(getByText('0%')).toBeInTheDocument();
    
    // Move slider while muted
    fireEvent.input(slider, { target: { value: '50' } });
    
    // Should automatically unmute
    expect(getByText('50%')).toBeInTheDocument();
    expect(getByTitle('Mute')).toBeInTheDocument();
    expect(mockAudioManager.unmute).toHaveBeenCalled();
  });

  it('should enforce minimum volume of 1% for usability', () => {
    const { getByRole, getByText } = render(() => <Volume />);
    const slider = getByRole('slider') as HTMLInputElement;
    
    fireEvent.input(slider, { target: { value: '0' } });
    
    // Volume display should show minimum 1%
    expect(getByText('1%')).toBeInTheDocument();
    // But actual audio level can be 0
    expect(mockAudioManager.setVolume).toHaveBeenCalledWith(0);
  });

  it('should show low volume icon when volume is at minimum', () => {
    const { getByRole, getByAltText } = render(() => <Volume />);
    const slider = getByRole('slider') as HTMLInputElement;
    
    fireEvent.input(slider, { target: { value: '0' } });
    
    // Since volume is clamped to 1, should show low volume icon
    expect(getByAltText('volume-low')).toBeInTheDocument();
  });
});
