import clsx from 'clsx';
import { createSignal, createEffect, For } from 'solid-js';
import recordingActions from '../../../actions/RecordingActions';
import { useAppSelector } from '../../../app/hooks';
import Playback from '../../../audio/recording/Playback';
import { selectIsRecording, selectRecordings, selectRecordingStartTime } from '../../../selectors/recordingSelectors';
import { selectMyUser } from '../../../selectors/workspaceSelectors';
import Dropdown from '../../ui/Dropdown';
import Tooltip from '../../ui/Tooltip';
import { CircleIcon, SquareIcon, PlayIcon, StopIcon, ChevronDownIcon } from '../icons';
import * as styles from './RecordingControl.css';


function RecordingControl() {
  const isRecording = useAppSelector(selectIsRecording);
  const recordingStartTime = useAppSelector(selectRecordingStartTime);
  const recordings = useAppSelector(selectRecordings);
  const myUser = useAppSelector(selectMyUser);
  const [recordingTime, setRecordingTime] = createSignal(0);
  const [showRecordingsDropdown, setShowRecordingsDropdown] = createSignal(false);
  const [currentPlayback, setCurrentPlayback] = createSignal<Playback | null>(null);
  const [playingRecordingId, setPlayingRecordingId] = createSignal<string | null>(null);
  
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
    }
  };

  const handlePlayRecording = async (recordingId: string) => {
    const current = currentPlayback();
    if (current) {
      current.stop();
    }
    
    const playback = await Playback.load(recordingId);
    await playback.start();
    setCurrentPlayback(playback);
    setPlayingRecordingId(recordingId);
  };

  const handleStopPlayback = () => {
    const playback = currentPlayback();
    if (playback) {
      playback.stop();
      setCurrentPlayback(null);
      setPlayingRecordingId(null);
    }
  };

  const formatRecordingDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } catch {
      return dateString;
    }
  };

  return (
    <div class={styles.recordingControl}>
      {/* Record Button */}
      <Tooltip text={isRecording() ? 'Stop Recording' : 'Start Recording'}>
        <button
          class={clsx(styles.recordButton, { [styles.recording]: isRecording() })}
          onClick={handleRecordClick}
        >
          {isRecording() ? <SquareIcon size={14} /> : <CircleIcon size={14} />}
          <span>{isRecording() ? formatTime(recordingTime()) : 'REC'}</span>
        </button>
      </Tooltip>

      {/* Recordings Dropdown */}
      <Dropdown
        open={showRecordingsDropdown()}
        onOpenChange={setShowRecordingsDropdown}
        trigger={
          <Tooltip text="Browse Recordings">
            <button class={styles.browseButton}>
              <ChevronDownIcon size={14} />
            </button>
          </Tooltip>
        }
      >
        <div class={styles.dropdownContent}>
          <div class={styles.dropdownHeader}>
            <h3 class={styles.dropdownTitle}>Recordings</h3>
            {playingRecordingId() && (
              <button 
                class={styles.stopButton}
                onClick={handleStopPlayback}
                aria-label="Stop playback"
              >
                <StopIcon size={12} />
              </button>
            )}
          </div>
          
          <div class={styles.recordingsList}>
            {recordings().length === 0 ? (
              <div class={styles.emptyState}>No recordings yet</div>
            ) : (
              <For each={recordings()}>{rec => {
                const isPlaying = playingRecordingId() === rec.id;
                return (
                  <button 
                    class={clsx(styles.recordingItem, { [styles.playing]: isPlaying })}
                    aria-label={`${isPlaying ? 'Stop' : 'Play'} recording: ${rec.title}`}
                    onClick={() => isPlaying ? handleStopPlayback() : handlePlayRecording(rec.id)}
                  >
                    <div class={styles.recordingInfo}>
                      <div class={styles.recordingTitle}>{rec.title}</div>
                      <div class={styles.recordingMeta}>
                        {formatRecordingDate(rec.title)} • {rec.displayNames.join(', ')}
                      </div>
                    </div>
                    <div class={styles.playButton}>
                      {isPlaying ? <StopIcon size={12} /> : <PlayIcon size={12} />}
                    </div>
                  </button>
                );
              }}</For>
            )}
          </div>
        </div>
      </Dropdown>
    </div>
  );
}

export default RecordingControl;
