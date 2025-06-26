import {
  Box,
  List,
  ListItem,
  Select,
} from '@chakra-ui/react';
import { connect } from 'react-redux';
import { updateInstrument } from '../actions/WorkspaceActions';
import { InstrumentType } from '../audio/instruments/Instrument';
import { selectMyUser, selectUsers } from '../slices/workspaceSlice';
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
    <Box
      zIndex={1}
      color='foreground'
      backgroundColor='background'
      pos='absolute'
      right='0'
      h='14px'
    >
      <InstrumentSelect instrument={instrument} />
      <UsersList users={users} />
    </Box >
  );
}

function InstrumentSelect(props: InstrumentSelectProps) {
  return (
    <Select
      zIndex="1"
      size='sm'
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
    </Select>
  );
}

function UsersList(props: UserListProps) {
  return (
    <List p='16px'>
      {Object.values(props.users ?? {}).map((user, i) => (
        <ListItem
          className='fade-in'
          display='flex'
          justifyContent='end'
          alignItems='center'
          key={i}
        >
          <Box
            as='span'
            backgroundColor={user.color}
            borderRadius='4px'
            height='8px'
            width='8px'
            m='8px'
          />
          <span>{user.displayName}</span>
        </ListItem>
      ))}
    </List>
  );
}

function mapStateToProps(state: RootState) {
  return {
    user: selectMyUser(state),
    users: selectUsers(state),
  };
}

export default connect(mapStateToProps)(RightOverlay);
