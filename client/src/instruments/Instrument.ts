export interface Instrument {
    keyUp(midi: number): void;
    keyDown(midi: number, delay?: number, velocity?: number): void;
    releaseAll(): void;
}

export enum InstrumentType {
    PIANO = 'PIANO',
    SYNTH = 'SYNTH',
    // ELECTRIC_GUITAR = 'ELECTRIC_GUITAR',
    // ACOUSTIC_GUITAR = 'ACOUSTIC_GUITAR',
    ELECTRIC_BASS = 'ELECTRIC_BASS',
}
