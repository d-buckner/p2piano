import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent } from '@solidjs/testing-library';
import AudioManager from '../audio/AudioManager';
import Volume from './Volume';

// Mock AudioManager
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
    vi.restoreAllMocks();
  });

  describe('initial state', () => {
    it('should default to 100% volume', () => {
      render(() => <Volume />);
      
      const slider = screen.getByRole('slider');
      const label = screen.getByText('100%');
      
      expect(slider).toHaveValue('100');
      expect(label).toBeInTheDocument();
    });

    it('should not be muted initially', () => {
      render(() => <Volume />);
      
      const muteButton = screen.getByTitle('Mute');
      expect(muteButton).toBeInTheDocument();
    });

    it('should show volume icon for high volume', () => {
      render(() => <Volume />);
      
      const muteButton = screen.getByRole('button');
      expect(muteButton.textContent).toBe('🔊');
    });
  });

  describe('volume slider', () => {
    it('should call AudioManager.setVolume with 0-1 range when changed', () => {
      render(() => <Volume />);
      
      const slider = screen.getByRole('slider');
      
      fireEvent.input(slider, { target: { value: '50' } });
      
      expect(mockAudioManager.setVolume).toHaveBeenCalledWith(0.5);
    });

    it('should update volume display when changed', () => {
      render(() => <Volume />);
      
      const slider = screen.getByRole('slider');
      
      fireEvent.input(slider, { target: { value: '75' } });
      
      expect(screen.getByText('75%')).toBeInTheDocument();
    });

    it('should unmute when volume is moved above 0 while muted', () => {
      render(() => <Volume />);
      
      const muteButton = screen.getByTitle('Mute');
      fireEvent.click(muteButton);
      
      expect(mockAudioManager.mute).toHaveBeenCalled();
      vi.clearAllMocks();
      
      const slider = screen.getByRole('slider');
      fireEvent.input(slider, { target: { value: '50' } });
      
      expect(mockAudioManager.unmute).toHaveBeenCalled();
      expect(mockAudioManager.setVolume).toHaveBeenCalledWith(0.5);
    });

    it('should not unmute when volume is set to 0', () => {
      render(() => <Volume />);
      
      const muteButton = screen.getByTitle('Mute');
      fireEvent.click(muteButton);
      
      vi.clearAllMocks();
      
      const slider = screen.getByRole('slider');
      fireEvent.input(slider, { target: { value: '0' } });
      
      expect(mockAudioManager.unmute).not.toHaveBeenCalled();
      expect(mockAudioManager.setVolume).toHaveBeenCalledWith(0);
    });
  });

  describe('mute button', () => {
    it('should toggle mute state when clicked', () => {
      render(() => <Volume />);
      
      const muteButton = screen.getByTitle('Mute');
      fireEvent.click(muteButton);
      
      expect(mockAudioManager.mute).toHaveBeenCalled();
      expect(screen.getByTitle('Unmute')).toBeInTheDocument();
    });

    it('should call AudioManager.unmute when unmuting', () => {
      render(() => <Volume />);
      
      const muteButton = screen.getByTitle('Mute');
      fireEvent.click(muteButton); // Mute first
      
      vi.clearAllMocks();
      
      const unmuteButton = screen.getByTitle('Unmute');
      fireEvent.click(unmuteButton);
      
      expect(mockAudioManager.unmute).toHaveBeenCalled();
    });

    it('should show muted volume display when muted', () => {
      render(() => <Volume />);
      
      const muteButton = screen.getByTitle('Mute');
      fireEvent.click(muteButton);
      
      expect(screen.getByDisplayValue('0')).toBeInTheDocument();
      expect(screen.getByText('0%')).toBeInTheDocument();
    });
  });

  describe('volume icon', () => {
    it('should show mute icon when muted', () => {
      render(() => <Volume />);
      
      const muteButton = screen.getByRole('button');
      fireEvent.click(muteButton);
      
      expect(muteButton.textContent).toBe('🔇');
    });

    it('should show mute icon when volume is 0', () => {
      render(() => <Volume />);
      
      const slider = screen.getByRole('slider');
      fireEvent.input(slider, { target: { value: '0' } });
      
      const muteButton = screen.getByRole('button');
      expect(muteButton.textContent).toBe('🔇');
    });

    it('should show low volume icon for volume < 30', () => {
      render(() => <Volume />);
      
      const slider = screen.getByRole('slider');
      fireEvent.input(slider, { target: { value: '20' } });
      
      const muteButton = screen.getByRole('button');
      expect(muteButton.textContent).toBe('🔈');
    });

    it('should show medium volume icon for 30 <= volume < 70', () => {
      render(() => <Volume />);
      
      const slider = screen.getByRole('slider');
      fireEvent.input(slider, { target: { value: '50' } });
      
      const muteButton = screen.getByRole('button');
      expect(muteButton.textContent).toBe('🔉');
    });

    it('should show high volume icon for volume >= 70', () => {
      render(() => <Volume />);
      
      const slider = screen.getByRole('slider');
      fireEvent.input(slider, { target: { value: '80' } });
      
      const muteButton = screen.getByRole('button');
      expect(muteButton.textContent).toBe('🔊');
    });
  });
});