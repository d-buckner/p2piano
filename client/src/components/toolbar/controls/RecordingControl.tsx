import clsx from 'clsx';
import { createSignal, createEffect, For } from 'solid-js';
import { 
  startRecording, 
  stopRecording, 
  selectRecording,
  playRecording,
  pausePlayback,
  resumePlayback,
  stopPlayback,
  previousRecording,
  nextRecording,
  deleteRecording,
  renameRecording
} from '../../../actions/RecordingActions';
import type { RecordingMetadata } from '../../../audio/recording/types';
import { useAppSelector } from '../../../app/hooks';
import { selectIsRecording, selectRecordings, selectRecordingStartTime, selectSelectedRecording, selectPlaybackStatus, selectPlaybackDuration } from '../../../selectors/recordingSelectors';
import { selectMyUser } from '../../../selectors/workspaceSelectors';
import { PlaybackStatus } from '../../../stores/RecordingStore';
import Dropdown from '../../ui/Dropdown';
import Tooltip from '../../ui/Tooltip';
import { CircleIcon, SquareIcon, PlayIcon, PauseIcon, StopIcon, ChevronDownIcon, PreviousIcon, NextIcon, EditIcon, TrashIcon } from '../icons';
import * as styles from './RecordingControl.css';


function RecordingControl() {
  const isRecording = useAppSelector(selectIsRecording);
  const recordingStartTime = useAppSelector(selectRecordingStartTime);
  const recordings = useAppSelector(selectRecordings);
  const selectedRecording = useAppSelector(selectSelectedRecording);
  const playbackStatus = useAppSelector(selectPlaybackStatus);
  const playbackDuration = useAppSelector(selectPlaybackDuration);
  const myUser = useAppSelector(selectMyUser);
  const [recordingTime, setRecordingTime] = createSignal(0);
  const [showRecordingsDropdown, setShowRecordingsDropdown] = createSignal(false);
  const [searchTerm, setSearchTerm] = createSignal('');
  const [editingRecordingId, setEditingRecordingId] = createSignal<string | null>(null);
  const [editingTitle, setEditingTitle] = createSignal('');
  let editInputRef: HTMLInputElement;
  
  // Timer effect
  createEffect(() => {
    let interval: NodeJS.Timeout;
    if (isRecording()) {
      interval = setInterval(() => {
        const elapsed = Math.floor((performance.now() - recordingStartTime()) / 1000);
        setRecordingTime(elapsed);
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

  const getCurrentRecordingDuration = () => {
    const duration = playbackDuration();
    return duration ? formatTime(duration) : '--:--';
  };

  const handleRecordClick = async () => {
    const user = myUser();
    if (!user) return;

    if (!isRecording()) {
      startRecording();
    } else {
      stopRecording();
    }
  };

  const handlePlayPause = async () => {
    if (playbackStatus() === PlaybackStatus.PLAYING) {
      await pausePlayback();
    } else if (playbackStatus() === PlaybackStatus.PAUSED) {
      await resumePlayback();
    } else {
      await playRecording();
    }
  };

  const handleStop = async () => {
    await stopPlayback();
  };

  const handlePrevious = async () => {
    await previousRecording();
  };

  const handleNext = async () => {
    await nextRecording();
  };

  const handleRecordingSelect = async (recordingId: string) => {
    await selectRecording(recordingId);
    setShowRecordingsDropdown(false);
    setSearchTerm('');
  };

  const filteredRecordings = () => {
    const term = searchTerm().toLowerCase();
    if (!term) return recordings();
    return recordings().filter(rec => 
      rec.title.toLowerCase().includes(term) ||
      rec.displayNames.some(name => name.toLowerCase().includes(term))
    );
  };

  const getCurrentRecordingTitle = () => {
    const current = selectedRecording();
    return current?.title || 'Select recording';
  };

  const handleStartEdit = (recording: RecordingMetadata, e: Event) => {
    e.stopPropagation();
    setEditingRecordingId(recording.id);
    setEditingTitle(recording.title);
    
    // Focus and select text after the input is rendered
    queueMicrotask(() => {
      editInputRef?.focus();
      editInputRef?.select();
    });
  };

  const handleSaveEdit = async (recordingId: string) => {
    if (editingTitle().trim()) {
      await renameRecording(recordingId, editingTitle().trim());
    }
    setEditingRecordingId(null);
    setEditingTitle('');
  };

  const handleCancelEdit = () => {
    setEditingRecordingId(null);
    setEditingTitle('');
  };

  const handleDeleteRecording = async (recordingId: string, e: Event) => {
    e.stopPropagation();
    if (confirm('Delete this recording? This cannot be undone.')) {
      await deleteRecording(recordingId);
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
      {/* Main Control */}
      <div class={styles.mainControl}>
        {/* Record Button */}
        <Tooltip text={isRecording() ? 'Stop Recording' : 'Start Recording'}>
          <button
            class={clsx(styles.controlButton, styles.recordButton, { [styles.recording]: isRecording() })}
            onClick={handleRecordClick}
          >
            {isRecording() ? <SquareIcon size={12} /> : <CircleIcon size={12} />}
          </button>
        </Tooltip>

        {/* Play/Stop Button */}
        <Tooltip text={playbackStatus() === PlaybackStatus.PLAYING ? 'Stop' : 'Play'}>
          <button
            class={clsx(styles.controlButton, styles.playButton, { [styles.playing]: playbackStatus() === PlaybackStatus.PLAYING })}
            onClick={playbackStatus() === PlaybackStatus.PLAYING ? handleStop : handlePlayPause}
            disabled={!selectedRecording()}
          >
            {playbackStatus() === PlaybackStatus.PLAYING ? <StopIcon size={12} /> : <PlayIcon size={12} />}
          </button>
        </Tooltip>

        {/* Recording Info & Selector */}
        <Dropdown
          open={showRecordingsDropdown()}
          onOpenChange={(open) => {
            // Don't close dropdown while editing
            if (!open && editingRecordingId()) return;
            setShowRecordingsDropdown(open);
          }}
          trigger={
            <button class={styles.infoButton}>
              <div class={styles.recordingInfo}>
                {isRecording() ? (
                  <>
                    <span class={styles.recordingLabel}>REC</span>
                    <span class={styles.recordingTime}>{formatTime(recordingTime())}</span>
                  </>
                ) : (
                  <span class={styles.currentTitle}>{getCurrentRecordingTitle()}</span>
                )}
              </div>
              <ChevronDownIcon size={10} />
            </button>
          }
        >
          <div class={styles.dropdownContent}>
            {/* Search Input */}
            <div class={styles.searchContainer}>
              <input
                type="text"
                placeholder="Search recordings..."
                value={searchTerm()}
                onInput={(e) => setSearchTerm(e.currentTarget.value)}
                class={styles.searchInput}
              />
            </div>
            
            {/* Recordings List */}
            <div class={styles.recordingsList}>
              {filteredRecordings().length === 0 ? (
                <div class={styles.emptyState}>
                  {recordings().length === 0 ? 'No recordings yet' : 'No matching recordings'}
                </div>
              ) : (
                <For each={filteredRecordings()}>{rec => {
                  const isSelected = selectedRecording()?.id === rec.id;
                  
                  return (
                    <div class={clsx(styles.recordingItem, { [styles.selected]: isSelected })}>
                      <button 
                        class={styles.recordingSelect}
                        onClick={() => handleRecordingSelect(rec.id)}
                      >
                        <div class={styles.recordingItemInfo}>
                          {editingRecordingId() === rec.id ? (
                            <div onClick={(e) => e.stopPropagation()}>
                              <input
                                ref={editInputRef}
                                type="text"
                                value={editingTitle()}
                                onInput={(e) => {
                                  e.stopPropagation();
                                  setEditingTitle(e.currentTarget.value);
                                }}
                                onKeyDown={(e) => {
                                  if (e.key === 'Enter') {
                                    e.preventDefault();
                                    handleSaveEdit(rec.id);
                                  } else if (e.key === 'Escape') {
                                    e.preventDefault();
                                    handleCancelEdit();
                                  }
                                }}
                                onBlur={() => handleSaveEdit(rec.id)}
                                onClick={(e) => e.stopPropagation()}
                                class={styles.editInput}
                              />
                            </div>
                          ) : (
                            <div class={styles.recordingItemTitle}>{rec.title}</div>
                          )}
                          <div class={styles.recordingMeta}>
                            {formatTime(rec.duration)} • {rec.displayNames.join(', ')}
                          </div>
                        </div>
                      </button>
                      
                      <div class={styles.recordingActions}>
                        <Tooltip text="Rename">
                          <button
                            class={styles.actionButton}
                            onClick={(e) => handleStartEdit(rec, e)}
                          >
                            <EditIcon size={14} />
                          </button>
                        </Tooltip>
                        <Tooltip text="Delete">
                          <button
                            class={styles.actionButton}
                            onClick={(e) => handleDeleteRecording(rec.id, e)}
                          >
                            <TrashIcon size={14} />
                          </button>
                        </Tooltip>
                      </div>
                    </div>
                  );
                }}</For>
              )}
            </div>
          </div>
        </Dropdown>
      </div>
    </div>
  );
}

export default RecordingControl;
