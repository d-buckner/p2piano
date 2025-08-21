import clsx from 'clsx';
import { createSignal, createEffect, For } from 'solid-js';
import recordingActions from '../../../actions/RecordingActions';
import { useAppSelector } from '../../../app/hooks';
import Playback from '../../../audio/recording/Playback';
import { selectIsRecording, selectRecordings, selectRecordingStartTime } from '../../../selectors/recordingSelectors';
import { selectMyUser } from '../../../selectors/workspaceSelectors';
import Dropdown from '../../ui/Dropdown';
import Tooltip from '../../ui/Tooltip';
import { CircleIcon, SquareIcon } from '../icons';
import * as styles from './RecordingControl.css';


function RecordingControl() {
  const isRecording = useAppSelector(selectIsRecording);
  const recordingStartTime = useAppSelector(selectRecordingStartTime);
  const recordings = useAppSelector(selectRecordings);
  const myUser = useAppSelector(selectMyUser);
  const [recordingTime, setRecordingTime] = createSignal(0);
  const [showRecordingsDropdown, setShowRecordingsDropdown] = createSignal(false);
  
  // Timer effect
  createEffect(() => {
    let interval: NodeJS.Timeout;
    if (isRecording()) {
      interval = setInterval(() => {
        const elapsed = Math.floor((performance.now() - recordingStartTime()) / 1000);
        setRecordingTime(elapsed);
      }, 1000);
    } else {
      setRecordingTime(Math.floor(performance.now()));
    }
    return () => clearInterval(interval);
  });

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleRecordClick = async () => {
    const user = myUser();
    if (!user) return;

    if (!isRecording()) {
      recordingActions.start();
    } else {
      recordingActions.stop();
      setShowRecordingsDropdown(true);
    }
  };

  const handlePlayRecording = async (recordingId: string) => {
    const playback = await Playback.load(recordingId);
    playback.start();
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
            <For each={recordings()}>{rec => (
              <button 
                class={styles.recordingItem} 
                aria-label={`Play recording: ${rec.title}`}
                onClick={() => handlePlayRecording(rec.id)}
              >
                <span>{rec.title}</span>
              </button>
            )}</For>
          </div>
        </div>
      </Dropdown>
    </div>
  );
}

export default RecordingControl;
