import {
    Box,
    Button,
    ButtonGroup,
    Select,
} from '@chakra-ui/react';
import { connect } from 'react-redux';
import { getMyUser } from '../lib/WorkspaceHelper';
import { updateInstrument } from '../actions/WorkspaceActions';
import { InstrumentType } from '../instruments/Instrument';

import type { User } from '../lib/workspaceTypes';

const INSTRUMENTS: Record<InstrumentType, string> = {
    [InstrumentType.PIANO]: 'Piano',
    [InstrumentType.SYNTH]: 'Synth',
    [InstrumentType.ELECTRIC_GUITAR]: 'Electric guitar',
    [InstrumentType.ACOUSTIC_GUITAR]: 'Acoustic guitar',
    [InstrumentType.ELECTRIC_BASS]: 'Electric bass',
};

type Props = {
    user: User | null | undefined,
};

function Toolbar(props: Props) {
    const { user } = props;
    const { instrument } = user || {};

    return (
        <Box
            pos='absolute'
            right='0'
            h='14px'
        >
            <Select
                size='sm'
                color='white'
                value={instrument}
                defaultValue={InstrumentType.PIANO}
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
        </Box >
    );
}

function mapStateToProps() {
    return {
        user: getMyUser(),
    };
}

export default connect(mapStateToProps)(Toolbar);
