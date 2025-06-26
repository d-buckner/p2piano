import { connect } from 'react-redux';
import { updateInstrument } from '../actions/WorkspaceActions';
import { InstrumentType } from '../audio/instruments/Instrument';
import { selectMyUser, selectUsers } from '../slices/workspaceSlice';
import * as styles from './RightOverlay.css';
import type { RootState } from '../app/store';
import type { User } from '../lib/workspaceTypes';


const INSTRUMENTS: Record<InstrumentType, string> = {
  [InstrumentType.PIANO]: 'Piano',
  [InstrumentType.SYNTH]: 'Synth',
  [InstrumentType.ELECTRIC_BASS]: 'Electric bass',
};

type Users = Record<string, User>;

type Props = {
  user?: User,
  users?: Users,
};

interface InstrumentSelectProps {
  instrument?: string,
}

interface UserListProps {
  users?: Users,
}

function RightOverlay(props: Props) {
  const { user, users } = props;
  const { instrument } = user || {};

  return (
    <div className={styles.rightOverlay}>
      <InstrumentSelect instrument={instrument} />
      <UsersList users={users} />
    </div>
  );
}

function InstrumentSelect(props: InstrumentSelectProps) {
  return (
    <select
      className={styles.instrumentSelect}
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
    <ul className={styles.usersList}>
      {Object.values(props.users ?? {}).map((user, i) => (
        <li
          className={`fade-in ${styles.userItem}`}
          key={i}
        >
          <span
            className={styles.userColorIndicator}
            style={{ backgroundColor: user.color }}
          />
          <span>{user.displayName}</span>
        </li>
      ))}
    </ul>
  );
}

function mapStateToProps(state: RootState) {
  return {
    user: selectMyUser(state),
    users: selectUsers(state),
  };
}

export default connect(mapStateToProps)(RightOverlay);
