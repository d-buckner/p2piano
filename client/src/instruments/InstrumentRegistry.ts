import ElectricBass from './ElectricBass';
import { Instrument, InstrumentType } from './Instrument';
import Piano from './Piano';
import Synth from './Synth';


export default class InstrumentRegistry {
  private static peerInstruments: Map<string, Instrument> = new Map();
  private constructor() { }

  static register(peerId: string, instrumentType: InstrumentType) {
    InstrumentRegistry.get(peerId)?.releaseAll();
    InstrumentRegistry.peerInstruments.set(peerId, createInstrument(instrumentType))
  }

  static get(peerId: string): Instrument | null {
    return InstrumentRegistry.peerInstruments.get(peerId) || null;
  }

  static unregister(peerId: string) {
    InstrumentRegistry.get(peerId)?.releaseAll();
    InstrumentRegistry.peerInstruments.delete(peerId);
  }

  static empty() {
    InstrumentRegistry.peerInstruments = new Map();
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
