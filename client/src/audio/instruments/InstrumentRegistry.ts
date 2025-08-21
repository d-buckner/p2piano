import AudioManager from '../AudioManager';
import { type ConcreteInstrument, type Instrument, InstrumentType } from './Instrument';


interface InstrumentModule {
  default: ConcreteInstrument
}

export default class InstrumentRegistry {
  private static userInstruments: Map<string, Instrument> = new Map();
  private constructor() { }

  static register(userId: string, instrumentType: InstrumentType) {
    AudioManager.whenActive(async () => {
      const IR = InstrumentRegistry;
      const instrument = await IR.loadInstrument(instrumentType);
      if (!instrument) return;

      IR.get(userId)?.releaseAll();
      IR.userInstruments.set(userId, instrument);
    });
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
