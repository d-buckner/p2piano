import { useCallback, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { dispatch } from '../app/store';
import AudioManager from '../audio/AudioManager';
import { createNewRoom, getRoom } from '../clients/RoomClient';
import { setRoom } from '../slices/workspaceSlice';
import * as styles from './RoomCard.css';
import type { ChangeEvent } from 'react';


export default function RoomCard() {
  const [isRoomError, setRoomError] = useState(false);
  const [isRoomCreating, setRoomCreating] = useState(false);
  const navigate = useNavigate();

  const navigateToRoom = useCallback((roomId: string) => navigate(`/${roomId}`), [navigate]);

  const createRoom = useCallback(async () => {
    AudioManager.activate();
    setRoomCreating(true);
    const room = await createNewRoom();
    dispatch(setRoom({ room }));
    navigateToRoom(room.roomId);
  }, [navigateToRoom]);

  const onRoomCodeChange = async (e: ChangeEvent<HTMLInputElement>) => {
    const roomId = e.target.value.toLowerCase();
    if (roomId.length !== 5) {
      setRoomError(false);
      return;
    }

    try {
      const room = await getRoom(roomId);
      dispatch(setRoom({ room }));
    } catch {
      setRoomError(true);
      return;
    }

    setRoomError(false);
    navigateToRoom(roomId);
  }

  return (
    <div className={styles.container}>
      <div className={styles.content}>
        <h2 className={styles.mainHeading}>
          p2piano
        </h2>
        <h3 className={styles.subHeading}>
          a collaboration space for the musically inclined
        </h3>
        <div className={styles.actions}>
          <button
            className={styles.button}
            onClick={createRoom}
            disabled={isRoomCreating}
          >
            {
              isRoomCreating
                ? <div className={styles.spinner} />
                : 'create room'
            }
          </button>
          <span className={styles.orText}>or</span>
          <input
            placeholder='join room code'
            maxLength={5}
            className={`${styles.input} ${isRoomError ? styles.inputError : ''}`}
            onChange={onRoomCodeChange}
          />
        </div>
      </div>
    </div>
  );
}
