import clsx from 'clsx';
import { createSignal, createEffect, onCleanup, For } from 'solid-js';
import MetronomeActions from '../../../actions/MetronomeActions';
import { useAppSelector } from '../../../app/hooks';
import { MIN_BPM, MAX_BPM } from '../../../constants/metronome';
import { selectMetronome } from '../../../selectors/metronomeSelectors';
import { selectMyUser } from '../../../selectors/workspaceSelectors';
import Dropdown from '../../ui/Dropdown';
import Tooltip from '../../ui/Tooltip';
import { ChevronDownIcon, PlayIcon, StopIcon } from '../icons';
import * as styles from './MetronomeControl.css';


const timeSignatures = [
  { value: 4, label: '4/4' },
  { value: 3, label: '3/4' },
  { value: 2, label: '2/4' },
] as const;

function MetronomeControl() {
  const metronome = useAppSelector(selectMetronome);
  const myUser = useAppSelector(selectMyUser);
  const [isDropdownOpen, setIsDropdownOpen] = createSignal(false);
  const [isPulsing, setIsPulsing] = createSignal(false);

  // Pulse animation effect
  createEffect(() => {
    let interval: NodeJS.Timeout;
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

    if (!newActive) {
      MetronomeActions.stop();
      return;
    }

    // Starting metronome - become leader
    const myUserId = myUser()?.userId;
    if (myUserId) {
      MetronomeActions.start(myUserId);
    };
  };

  const handleBpmChange = (e: Event) => {
    const target = e.target as HTMLInputElement;
    const newBpm = Number(target.value);
    MetronomeActions.setBpm(newBpm);
  };

  return (
    <div class={styles.metronomeControl}>
      <div class={styles.metronomeContainer}>
        <Tooltip text='Start/Stop Metronome'>
          <button
            class={clsx(styles.toggleButton, { [styles.active]: metronome().active })}
            onClick={toggleMetronome}
          >
            <div class={clsx(styles.iconWrapper, { [styles.pulse]: isPulsing() && metronome().active })}>
              {metronome().active ? <StopIcon size={16} /> : <PlayIcon size={16} />}
            </div>
          </button>
        </Tooltip>

        <Dropdown
          open={isDropdownOpen()}
          onOpenChange={setIsDropdownOpen}
          trigger={
            <button
              class={clsx(styles.dropdownTrigger, { [styles.dropdownOpen]: isDropdownOpen() })}
            >
              <span class={styles.bpmValue}>{metronome().bpm}</span>
              <span class={styles.bpmLabel}>BPM</span>
              <ChevronDownIcon size={12} class={clsx(styles.chevron, { [styles.chevronRotated]: isDropdownOpen() })} />
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
                    class={clsx(styles.timeSignatureButton, { [styles.selected]: metronome().beatsPerMeasure === sig.value })}
                    onClick={() => MetronomeActions.setBeatsPerMeasure(sig.value)}
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
