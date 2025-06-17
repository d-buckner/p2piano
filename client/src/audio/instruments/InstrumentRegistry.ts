import ElectricBass from './ElectricBass';
import { type Instrument, InstrumentType } from './Instrument';
import Piano from './Piano';
import Synth from './Synth';


export default class InstrumentRegistry {
  private static userInstruments: Map<string, Instrument> = new Map();
  private constructor() { }

  static register(userId: string, instrumentType: InstrumentType) {
    InstrumentRegistry.get(userId)?.releaseAll();
    InstrumentRegistry.userInstruments.set(userId, createInstrument(instrumentType))
  }

  static get(userId: string): Instrument | null {
    return InstrumentRegistry.userInstruments.get(userId) || null;
  }

  static unregister(userId: string) {
    InstrumentRegistry.get(userId)?.releaseAll();
    InstrumentRegistry.userInstruments.delete(userId);
  }

  static empty() {
    InstrumentRegistry.userInstruments = new Map();
  }
}

const concreteInstruments = {
  [InstrumentType.PIANO]: Piano,
  [InstrumentType.SYNTH]: Synth,
  [InstrumentType.ELECTRIC_BASS]: ElectricBass,
} as const;

function createInstrument(type: InstrumentType): Instrument {
  const ConcreteInstrument = concreteInstruments[type];
  if (!ConcreteInstrument) {
    throw new Error('Unknown instrument type');
  }

  return new ConcreteInstrument();
}
