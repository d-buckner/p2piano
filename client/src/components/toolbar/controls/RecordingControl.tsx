import clsx from 'clsx';
import { createSignal, createEffect, For } from 'solid-js';
import Dropdown from '../../ui/Dropdown';
import Tooltip from '../../ui/Tooltip';
import { CircleIcon, SquareIcon } from '../icons';
import * as styles from './RecordingControl.css';


function RecordingControl() {
  const [isRecording, setIsRecording] = createSignal(false);
  const [recordingTime, setRecordingTime] = createSignal(0);
  const [showRecordingsDropdown, setShowRecordingsDropdown] = createSignal(false);
  
  // Mock recordings for UI demo
  const recordings = [
    { id: 1, name: 'Recording 1', date: '2024-03-20 14:30' },
    { id: 2, name: 'Recording 2', date: '2024-03-20 15:45' },
    { id: 3, name: 'Recording 3', date: '2024-03-21 10:15' }
  ];

  // Timer effect
  createEffect(() => {
    let interval: number;
    if (isRecording()) {
      interval = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);
    } else {
      setRecordingTime(0);
    }
    return () => clearInterval(interval);
  });

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleRecordClick = () => {
    if (!isRecording()) {
      setIsRecording(true);
    } else {
      setIsRecording(false);
      setShowRecordingsDropdown(true);
    }
  };

  return (
    <div class={styles.recordingControl}>
      <Dropdown
        open={showRecordingsDropdown()}
        onOpenChange={setShowRecordingsDropdown}
        trigger={
          <Tooltip text={isRecording() ? 'Stop Recording' : 'Start Recording'} shortcut="R">
            <button
              class={clsx(styles.recordButton, { [styles.recording]: isRecording() })}
              onClick={handleRecordClick}
            >
              {isRecording() ? <SquareIcon size={14} /> : <CircleIcon size={14} />}
              <span>{isRecording() ? formatTime(recordingTime()) : 'REC'}</span>
            </button>
          </Tooltip>
        }
      >
        <div class={styles.dropdownContent}>
          <h3 class={styles.dropdownTitle}>Recordings</h3>
          <div class={styles.recordingsList}>
            <For each={recordings}>{rec => (
              <button class={styles.recordingItem} aria-label={`Play recording: ${rec.name}`}>
                <span>{rec.name}</span>
                <span class={styles.recordingDate}>{rec.date}</span>
              </button>
            )}</For>
          </div>
        </div>
      </Dropdown>
    </div>
  );
}

export default RecordingControl;
