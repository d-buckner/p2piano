import clsx from 'clsx';
import { createSignal } from 'solid-js';
import * as styles from './Metronome.css';


function Metronome() {
  const [bpm, setBpm] = createSignal(120);
  const [metronomeActive, setMetronomeActive] = createSignal(false);

  function handleBpmChange(e: Event) {
    const target = e.target as HTMLInputElement;
    setBpm(Number(target.value));
  }

  function toggleMetronome() {
    setMetronomeActive(!metronomeActive());
  }

  return (
    <div class={styles.metronomeContainer}>
      <button
        class={clsx(styles.metronomeButton, metronomeActive() && styles.active)}
        onClick={toggleMetronome}
      >
        {metronomeActive() ? '◼' : '▶'}
      </button>
      <div class={styles.bpmControl}>
        <button
          class={clsx(styles.bpmButton, styles.bpmButtonMinus)}
          onClick={() => setBpm(Math.max(40, bpm() - 1))}
        >
          −
        </button>
        <input
          type="number"
          value={bpm()}
          onInput={handleBpmChange}
          min="40"
          max="240"
          class={styles.bpmInput}
        />
        <button
          class={clsx(styles.bpmButton, styles.bpmButtonPlus)}
          onClick={() => setBpm(Math.min(240, bpm() + 1))}
        >
          +
        </button>
      </div>
      <span class={styles.bpmLabel}>BPM</span>
    </div>
  );
}

export default Metronome;