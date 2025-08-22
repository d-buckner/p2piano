export interface BaseInstrument {
    keyUp(midi: number, delay?: number): void;
    keyDown(midi: number, delay?: number, velocity?: number): void;
    sustainDown?(delay?: number): void;
    sustainUp?(delay?: number): void;
    releaseAll(): void;
}

export type Instrument = {
    type: InstrumentType;
} & BaseInstrument;

export interface ConcreteInstrument {
    new(): Instrument
}

export enum InstrumentType {
    PIANO = 'PIANO',
    SYNTH = 'SYNTH',
    ELECTRIC_BASS = 'ELECTRIC_BASS',
}
