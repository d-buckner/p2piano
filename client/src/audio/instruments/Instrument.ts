export interface Instrument {
    keyUp(midi: number, delay?: number): void;
    keyDown(midi: number, delay?: number, velocity?: number): void;
    releaseAll(): void;
}

export interface ConcreteInstrument {
    new(): Instrument
}

export enum InstrumentType {
    PIANO = 'PIANO',
    SYNTH = 'SYNTH',
    ELECTRIC_BASS = 'ELECTRIC_BASS',
}
