import { useService } from '../core/hooks/useService';
import { useServiceState } from '../core/hooks/useServiceState';
import { ServiceTokens } from '../core/ServiceTokens';
import Icon from './Icon';
import * as styles from './Volume.css';


function Volume() {
  const audioEngine = useService(ServiceTokens.AudioEngine);
  const audioState = useServiceState(ServiceTokens.AudioEngine);

  function handleVolumeChange(e: Event) {
    const target = e.target as HTMLInputElement;
    const newVolume = Number(target.value);
    const volumeValue = Math.max(newVolume, 1) / 100;
    
    // Set volume (this will automatically update reactive state)
    audioEngine.setVolume(volumeValue);
    
    // If volume is increased while muted, unmute automatically
    if (newVolume > 0 && audioState.isMuted) {
      audioEngine.unmute();
    }
  }

  function toggleMute() {
    if (audioState.isMuted) {
      audioEngine.unmute();
    } else {
      audioEngine.mute();
    }
  }

  function getVolumeIconName() {
    const volumePercent = audioState.volume * 100;
    if (audioState.isMuted || volumePercent === 0) return 'volume-muted';
    if (volumePercent < 30) return 'volume-low';
    if (volumePercent < 70) return 'volume-medium';
    return 'volume-full';
  }

  const muteLabel = () => audioState.isMuted ? 'Unmute' : 'Mute';

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
        value={audioState.isMuted ? 0 : Math.round(audioState.volume * 100)}
        onInput={handleVolumeChange}
        class={styles.volumeSlider}
      />
      <span class={styles.volumeLabel}>
        {audioState.isMuted ? 0 : Math.round(audioState.volume * 100)}%
      </span>
    </div>
  );
}

export default Volume;
