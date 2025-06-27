import { updateInstrument } from '../actions/WorkspaceActions';
import { useAppSelector } from '../app/hooks';
import { InstrumentType } from '../audio/instruments/Instrument';
import { selectMyUser, selectUsers } from '../selectors/workspaceSelectors';
import * as styles from './RightOverlay.css';
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
}

export default function RightOverlay() {
  const user = useAppSelector(selectMyUser);
  const users = useAppSelector(selectUsers);
  const { instrument } = user() || {};

  return (
    <div class={styles.rightOverlay}>
      <InstrumentSelect instrument={instrument} />
      <UsersList users={users()} />
    </div>
  );
}

function InstrumentSelect(props: InstrumentSelectProps) {
  return (
    <select
      class={styles.instrumentSelect}
      value={props.instrument ?? InstrumentType.PIANO}
      onChange={e => {
        updateInstrument(e.target.value as InstrumentType)
      }}
    >
      {Object.entries(INSTRUMENTS).map(([type, title], i) => (
        <option
          value={type}
          key={i}
        >
          {title}
        </option>
      ))}
    </select>
  );
}

function UsersList(props: UserListProps) {
  return (
    <ul class={styles.usersList}>
      {Object.values(props.users ?? {}).map(user => (
        <li class={`fade-in ${styles.userItem}`} key={user.userId}>
          <span
            class={styles.userColorIndicator}
            style={{ 'background-color': user.color }}
          />
          <span>{user.displayName}</span>
        </li>
      ))}
    </ul>
  );
}
