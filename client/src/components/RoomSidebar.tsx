import clsx from 'clsx';
import { For } from 'solid-js';
import { updateInstrument } from '../actions/WorkspaceActions';
import { useAppSelector } from '../app/hooks';
import { InstrumentType } from '../audio/instruments/Instrument';
import { MAX_LATENCY_CUTOFF_MS } from '../audio/syncronization/constants';
import { selectPeerConnections } from '../selectors/connectionSelectors';
import { selectMyUser, selectUsers } from '../selectors/workspaceSelectors';
import * as styles from './RoomSidebar.css';
import type { PeerConnections } from '../constants';
import type { User } from '../lib/workspaceTypes';


const INSTRUMENTS: Record<InstrumentType, string> = {
  [InstrumentType.PIANO]: 'Piano',
  [InstrumentType.SYNTH]: 'Synth',
  [InstrumentType.ELECTRIC_BASS]: 'Electric bass',
};

type Users = Record<string, User>;

interface InstrumentSelectProps {
  instrument?: string,
}

interface UserListProps {
  users?: Users,
  peerConnections: () => PeerConnections | undefined,
}

export default function RoomSidebar() {
  const user = useAppSelector(selectMyUser);
  const users = useAppSelector(selectUsers);
  const peerConnections = useAppSelector(selectPeerConnections);
  const { instrument } = user() || {};

  return (
    <div class={styles.roomSidebar}>
      <InstrumentSelect instrument={instrument} />
      <UsersList users={users()} peerConnections={peerConnections} />
    </div>
  );
}

function InstrumentSelect(props: InstrumentSelectProps) {
  return (
    <select
      class={styles.instrumentSelect}
      value={props.instrument ?? InstrumentType.PIANO}
      onChange={e => {
        updateInstrument(e.target.value as InstrumentType);
      }}
    >
      <For each={Object.entries(INSTRUMENTS)}>
        {([type, title]) => (
          <option value={type}>
            {title}
          </option>
        )}
      </For>
    </select>
  );
}

function UsersList(props: UserListProps) {
  return (
    <ul class={styles.usersList}>
      <For each={Object.values(props.users ?? {})}>
        {(user) => (
          <li class={`fade-in ${styles.userItem}`}>
            <span
              class={styles.userColorIndicator}
              style={{ 'background-color': user.color }}
            />
            <span>{user.displayName}</span>
            {(props.peerConnections()?.[user.userId]?.latency ?? 0) > MAX_LATENCY_CUTOFF_MS && (
              <span class={clsx(styles.warningIcon, '.fade-in')}>
                ⚠️
              </span>
            )}
          </li>
        )}
      </For>
    </ul>
  );
}
