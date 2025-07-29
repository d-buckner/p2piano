import { createSignal, createEffect, onCleanup, For } from 'solid-js';
import { useAppSelector } from '../../../app/hooks';
import { MIN_BPM, MAX_BPM } from '../../../constants/metronome';
import { metronomeActions } from '../../../crdt';
import { selectMetronome } from '../../../selectors/metronomeSelectors';
import { selectMyUser } from '../../../selectors/workspaceSelectors';
import Dropdown from '../../ui/Dropdown';
import Tooltip from '../../ui/Tooltip';
import { ChevronDownIcon, PlayIcon, StopIcon } from '../icons';
import * as styles from './MetronomeControl.css';


function MetronomeControl() {
  const metronome = useAppSelector(selectMetronome);
  const myUser = useAppSelector(selectMyUser);
  const [isDropdownOpen, setIsDropdownOpen] = createSignal(false);
  const [isPulsing, setIsPulsing] = createSignal(false);

  // Pulse animation effect
  createEffect(() => {
    let interval: number;
    if (metronome().active) {
      const beatInterval = 60000 / metronome().bpm;
      interval = setInterval(() => {
        setIsPulsing(true);
        setTimeout(() => setIsPulsing(false), 100);
      }, beatInterval);
    }
    onCleanup(() => clearInterval(interval));
  });

  const toggleMetronome = () => {
    const newActive = !metronome().active;
    
    if (newActive) {
      // Starting metronome - become leader
      const myUserId = myUser()?.userId;
      if (!myUserId) return;
      metronomeActions.start(myUserId);
      return;
    }
    
    // Stopping metronome
    metronomeActions.stop();
  };

  const handleBpmChange = (e: Event) => {
    const target = e.target as HTMLInputElement;
    const newBpm = Number(target.value);
    metronomeActions.setBpm(newBpm);
  };

  const timeSignatures = [
    { value: 4, label: '4/4' },
    { value: 3, label: '3/4' },
    { value: 2, label: '2/4' },
  ];

  const handleTimeSignatureChange = (beats: number) => {
    metronomeActions.setBeatsPerMeasure(beats);
  };

  return (
    <div class={styles.metronomeControl}>
      <div class={styles.metronomeContainer}>
        <Tooltip text="Start/Stop Metronome" shortcut="Space">
          <button
            class={`${styles.toggleButton} ${metronome().active ? styles.active : ''}`}
            onClick={toggleMetronome}
          >
            <div class={`${styles.iconWrapper} ${isPulsing() && metronome().active ? styles.pulse : ''}`}>
              {metronome().active ? <StopIcon size={16} /> : <PlayIcon size={16} />}
            </div>
          </button>
        </Tooltip>
        
        <Dropdown
          open={isDropdownOpen()}
          onOpenChange={setIsDropdownOpen}
          trigger={
            <button
              class={`${styles.dropdownTrigger} ${isDropdownOpen() ? styles.dropdownOpen : ''}`}
            >
              <span class={styles.bpmValue}>{metronome().bpm}</span>
              <span class={styles.bpmLabel}>BPM</span>
              <ChevronDownIcon size={12} class={`${styles.chevron} ${isDropdownOpen() ? styles.chevronRotated : ''}`} />
            </button>
          }
        >
          <div class={styles.dropdownContent}>
            <h3 class={styles.dropdownTitle}>Metronome</h3>
            
            <div class={styles.control}>
              <div class={styles.controlHeader}>
                <label class={styles.label}>BPM</label>
                <span class={styles.value}>{metronome().bpm}</span>
              </div>
              <input
                type="range"
                value={metronome().bpm}
                onInput={handleBpmChange}
                class={styles.slider}
                min={MIN_BPM}
                max={MAX_BPM}
                style={{
                  background: `linear-gradient(to right, var(--colors-primary) 0%, var(--colors-primary) ${((metronome().bpm - MIN_BPM) / (MAX_BPM - MIN_BPM)) * 100}%, var(--colors-background) ${((metronome().bpm - MIN_BPM) / (MAX_BPM - MIN_BPM)) * 100}%, var(--colors-background) 100%)`
                }}
              />
              <div class={styles.sliderLabels}>
                <span>{MIN_BPM}</span>
                <span>{MAX_BPM}</span>
              </div>
            </div>
            
            <div class={styles.control}>
              <label class={styles.label}>Time Signature</label>
              <div class={styles.timeSignatureGrid}>
                <For each={timeSignatures}>{sig => (
                  <button
                    class={`${styles.timeSignatureButton} ${metronome().beatsPerMeasure === sig.value ? styles.selected : ''}`}
                    onClick={() => handleTimeSignatureChange(sig.value)}
                  >
                    {sig.label}
                  </button>
                )}</For>
              </div>
            </div>
          </div>
        </Dropdown>
      </div>
    </div>
  );
}

export default MetronomeControl;
