import clsx from 'clsx';
import { createSignal, onCleanup } from 'solid-js';
import { setMetronomeActive, setMetronomeBpm, setMetronomeLeader } from '../actions/MetronomeActions';
import { useAppSelector } from '../app/hooks';
import MetronomeClient from '../clients/MetronomeClient';
import { MIN_BPM, MAX_BPM } from '../constants/metronome';
import { selectMetronome } from '../selectors/metronomeSelectors';
import { selectMyUser } from '../selectors/workspaceSelectors';
import * as styles from './Metronome.css';


function Metronome() {
  const metronome = useAppSelector(selectMetronome);
  const myUser = useAppSelector(selectMyUser);
  
  const isLeader = () => metronome().leaderId === myUser()?.userId;
  
  const [holdTimeout, setHoldTimeout] = createSignal<number | null>(null);
  const [holdInterval, setHoldInterval] = createSignal<number | null>(null);
  const [holdCount, setHoldCount] = createSignal(0);
  
  onCleanup(() => {
    const timeout = holdTimeout();
    const interval = holdInterval();
    if (timeout) clearTimeout(timeout);
    if (interval) clearInterval(interval);
  });

  function handleBpmChange(e: Event) {
    const target = e.target as HTMLInputElement;
    const newBpm = Number(target.value);
    
    // Always update optimistically
    setMetronomeBpm(newBpm);
    
    // If you're the leader, effects will broadcast
    // If you're a follower, send request to leader
    if (!isLeader()) {
      MetronomeClient.setBpm(newBpm);
    }
  }

  function toggleMetronome() {
    const newActive = !metronome().active;
    
    if (newActive) {
      // Starting metronome - become leader
      const myUserId = myUser()?.userId;
      setMetronomeActive(true);
      setMetronomeLeader(myUserId);
    } else {
      // Stopping metronome - optimistically update
      setMetronomeActive(false);
      setMetronomeLeader(undefined);
      
      // If you're not the leader, also send request
      if (!isLeader()) {
        MetronomeClient.stop();
      }
    }
  }

  function changeBpm(delta: number) {
    const currentBpm = metronome().bpm;
    const newBpm = Math.max(MIN_BPM, Math.min(MAX_BPM, currentBpm + delta));
    
    if (newBpm !== currentBpm) {
      // Always update optimistically
      setMetronomeBpm(newBpm);
      
      // If you're a follower, also send request to leader
      if (!isLeader()) {
        MetronomeClient.setBpm(newBpm);
      }
    }
  }

  function startHold(delta: number) {
    // Clear any existing timers
    const existingTimeout = holdTimeout();
    const existingInterval = holdInterval();
    if (existingTimeout) clearTimeout(existingTimeout);
    if (existingInterval) clearInterval(existingInterval);
    
    // Initial change and reset counter
    changeBpm(delta);
    setHoldCount(0);
    
    // Start repeating after a grace period
    const timeout = window.setTimeout(() => {
      scheduleNextChange(delta);
      setHoldTimeout(null); // Clear timeout reference
    }, 500); // 500ms grace period before repeating
    
    setHoldTimeout(timeout);
  }

  function scheduleNextChange(delta: number) {
    const count = holdCount();
    setHoldCount(count + 1);
    
    // speed increase: starts at 200ms, decreases by 10ms each step, minimum 100ms
    const delay = Math.max(100, 200 - count * 10);
    
    const timeout = window.setTimeout(() => {
      changeBpm(delta);
      scheduleNextChange(delta); // Schedule the next one
    }, delay);
    
    setHoldInterval(timeout);
  }

  function stopHold() {
    const timeout = holdTimeout();
    const interval = holdInterval();
    if (timeout) {
      clearTimeout(timeout);
      setHoldTimeout(null);
    }
    if (interval) {
      clearTimeout(interval);
      setHoldInterval(null);
    }
    setHoldCount(0);
  }


  return (
    <div class={styles.metronomeContainer}>
      <button
        class={clsx(styles.metronomeButton, metronome().active && styles.active)}
        onClick={toggleMetronome}
      >
        {metronome().active ? '◼' : '▶'}
      </button>
      <div class={styles.bpmControl}>
        <button
          class={clsx(styles.bpmButton, styles.bpmButtonMinus)}
          onMouseDown={() => startHold(-1)}
          onMouseUp={stopHold}
          onMouseLeave={stopHold}
          disabled={metronome().bpm <= MIN_BPM}
        >
          −
        </button>
        <input
          type="number"
          value={metronome().bpm}
          onInput={handleBpmChange}
          min="40"
          max="240"
          class={styles.bpmInput}
        />
        <button
          class={clsx(styles.bpmButton, styles.bpmButtonPlus)}
          onMouseDown={() => startHold(1)}
          onMouseUp={stopHold}
          onMouseLeave={stopHold}
          disabled={metronome().bpm >= MAX_BPM}
        >
          +
        </button>
      </div>
      <span class={styles.bpmLabel}>BPM</span>
    </div>
  );
}

export default Metronome;
