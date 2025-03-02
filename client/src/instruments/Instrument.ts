export default class Instrument {
    // eslint-disable-next-line no-unused-vars
    keyUp(midi: number) {
        throw new Error('Not implemented');
    }
    // eslint-disable-next-line no-unused-vars
    keyDown(midi: number, velocity?: number) {
        throw new Error('Not implemented');
    }

    releaseAll() {
        throw new Error('Not implemented');
    }
}

export enum InstrumentType {
    PIANO = 'PIANO',
    SYNTH = 'SYNTH',
    // ELECTRIC_GUITAR = 'ELECTRIC_GUITAR',
    // ACOUSTIC_GUITAR = 'ACOUSTIC_GUITAR',
    ELECTRIC_BASS = 'ELECTRIC_BASS',
}
