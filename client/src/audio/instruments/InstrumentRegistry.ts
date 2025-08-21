import AudioManager from '../AudioManager';
import { type ConcreteInstrument, type Instrument, InstrumentType } from './Instrument';


interface InstrumentModule {
  default: ConcreteInstrument
}

export default class InstrumentRegistry {
  private static instruments: Map<string, Instrument> = new Map();
  private constructor() { }

  static register(identifier: string, instrumentType: InstrumentType) {
    AudioManager.whenActive(async () => {
      const IR = InstrumentRegistry;
      const instrument = await IR.loadInstrument(instrumentType);
      if (!instrument) return;

      IR.get(identifier)?.releaseAll();
      IR.instruments.set(identifier, instrument);
    });
  }

  static get(identifier: string): Instrument | null {
    return InstrumentRegistry.instruments.get(identifier) || null;
  }

  static unregister(identifier: string) {
    InstrumentRegistry.get(identifier)?.releaseAll();
    InstrumentRegistry.instruments.delete(identifier);
  }

  static empty() {
    InstrumentRegistry.instruments = new Map();
  }

  private static async loadInstrument(instrumentType: InstrumentType): Promise<Instrument | undefined> {
    let module: InstrumentModule | undefined;
    switch (instrumentType) {
      case InstrumentType.PIANO:
        module = await import('./Piano');
        break;
      case InstrumentType.SYNTH:
        module = await import('./Synth');
        break;
      case InstrumentType.ELECTRIC_BASS:
        module = await import('./ElectricBass');
        break;
    }

    if (!module) {
      return;
    }

    return new module.default();
  }
}
