import { useNavigate } from '@solidjs/router';
import { createSignal } from 'solid-js';
import { setStore } from '../app/store';
import AudioManager from '../audio/AudioManager';
import { createNewRoom, getRoom } from '../clients/RoomClient';
import * as styles from './RoomCard.css';


export default function RoomCard() {
  const [isRoomError, setRoomError] = createSignal(false);
  const [isRoomCreating, setRoomCreating] = createSignal(false);
  const navigate = useNavigate();

  const navigateToRoom = (roomId: string) => navigate(`/${roomId}`);

  const createRoom = async () => {
    AudioManager.activate();
    setRoomCreating(true);
    const room = await createNewRoom();
    setStore('workspace', 'room', room);
    navigateToRoom(room.roomId);
  };

  const onRoomCodeChange = async (e: Event) => {
    const target = e.target as HTMLInputElement;
    const roomId = target.value.toLowerCase();
    if (roomId.length !== 5) {
      setRoomError(false);
      return;
    }

    try {
      const room = await getRoom(roomId);
      setStore('workspace', 'room', room);
    } catch {
      setRoomError(true);
      return;
    }

    setRoomError(false);
    navigateToRoom(roomId);
  };

  return (
    <div class={styles.container}>
      <div class={styles.content}>
        <h2 class={styles.mainHeading}>
          p2piano
        </h2>
        <h3 class={styles.subHeading}>
          a collaboration space for the musically inclined
        </h3>
        <div class={styles.actions}>
          <button
            class={styles.button}
            onClick={createRoom}
            disabled={isRoomCreating()}
          >
            {
              isRoomCreating()
                ? <div class={styles.spinner} />
                : 'create room'
            }
          </button>
          <span class={styles.orText}>or</span>
          <input
            placeholder='join room code'
            maxLength={5}
            class={`${styles.input} ${isRoomError() ? styles.inputError : ''}`}
            onChange={onRoomCodeChange}
          />
        </div>
      </div>
    </div>
  );
}
