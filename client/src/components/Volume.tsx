import { createSignal } from 'solid-js';
import AudioManager from '../audio/AudioManager';
import Icon from './Icon';
import * as styles from './Volume.css';


function Volume() {
  const [volume, setVolume] = createSignal(100);
  const [isMuted, setIsMuted] = createSignal(false);

  function handleVolumeChange(e: Event) {
    const target = e.target as HTMLInputElement;
    const newVolume = Number(target.value);
    setVolume(Math.max(newVolume, 1));
    if (newVolume > 0 && isMuted()) {
      setIsMuted(false);
      AudioManager.unmute();
    }
    AudioManager.setVolume(newVolume / 100);
  }

  function toggleMute() {
    const newMuted = !isMuted();
    setIsMuted(newMuted);
    if (newMuted) {
      AudioManager.mute();
    } else {
      AudioManager.unmute();
    }
  }

  function getVolumeIconName() {
    if (isMuted() || volume() === 0) return 'volume-muted';
    if (volume() < 30) return 'volume-low';
    if (volume() < 70) return 'volume-medium';
    return 'volume-full';
  }

  const muteLabel = () => isMuted() ? 'Unmute' : 'Mute';

  return (
    <div class={styles.volumeContainer}>
      <button
        class={styles.muteButton}
        onClick={toggleMute}
        title={muteLabel()}
        aria-label={muteLabel()}
      >
        <Icon name={getVolumeIconName()} />
      </button>
      <input
        type="range"
        min="0"
        max="100"
        value={isMuted() ? 0 : volume()}
        onInput={handleVolumeChange}
        class={styles.volumeSlider}
      />
      <span class={styles.volumeLabel}>{isMuted() ? 0 : volume()}%</span>
    </div>
  );
}

export default Volume;
