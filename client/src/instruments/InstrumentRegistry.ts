import AcousticGuitar from './AcousticGuitar';
import ElectricBass from './ElectricBass';
import ElectricGuitar from './ElectricGuitar';
import Instrument, { InstrumentType } from './Instrument';
import Piano from './Piano';
import Synth from './Synth';


export default class InstrumentRegistry {
    private static peerInstruments: Map<string, Instrument> = new Map();
    private constructor() {}

    static register(peerId: string, instrumentType: InstrumentType) {
        InstrumentRegistry.get(peerId)?.releaseAll();
        InstrumentRegistry.peerInstruments.set(peerId, createInstrument(instrumentType))
    }

    static get(peerId: string): Instrument | null {
        return InstrumentRegistry.peerInstruments.get(peerId) || null;
    }

    static deregister(peerId: string) {
        InstrumentRegistry.get(peerId)?.releaseAll();
        InstrumentRegistry.peerInstruments.delete(peerId);
    }

    static empty() {
        InstrumentRegistry.peerInstruments = new Map();
    }
}

const instrumentConstructors = {
    [InstrumentType.PIANO]: Piano,
    [InstrumentType.SYNTH]: Synth,
    // [InstrumentType.ELECTRIC_GUITAR]: ElectricGuitar,
    // [InstrumentType.ACOUSTIC_GUITAR]: AcousticGuitar,
    [InstrumentType.ELECTRIC_BASS]: ElectricBass,
}

function createInstrument(type: InstrumentType): Instrument {
    const constructor = instrumentConstructors[type];
    if (!constructor) {
        throw new Error('Unknown instrument type');
    }

    return new constructor();
}
