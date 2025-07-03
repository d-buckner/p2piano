import { createSignal } from 'solid-js';
import * as styles from './Volume.css';


function Volume() {
  const [volume, setVolume] = createSignal(75);
  const [isMuted, setIsMuted] = createSignal(false);

  function handleVolumeChange(e: Event) {
    const target = e.target as HTMLInputElement;
    const newVolume = Number(target.value);
    setVolume(newVolume);
    if (newVolume > 0 && isMuted()) {
      setIsMuted(false);
    }
  }

  function toggleMute() {
    setIsMuted(!isMuted());
  }

  function getVolumeIcon() {
    if (isMuted() || volume() === 0) return '🔇';
    if (volume() < 30) return '🔈';
    if (volume() < 70) return '🔉';
    return '🔊';
  }

  return (
    <div class={styles.volumeContainer}>
      <button
        class={styles.muteButton}
        onClick={toggleMute}
        title={isMuted() ? 'Unmute' : 'Mute'}
      >
        {getVolumeIcon()}
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