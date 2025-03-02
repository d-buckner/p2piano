const DIATONIC_PITCH_CLASSES = new Set([0, 2, 4, 5, 7, 9, 11]);
export const DIATONIC_STEP = 2;

function isDiatonic(midi: number): boolean {
  return DIATONIC_PITCH_CLASSES.has(midi % 12);
}

export function getClosestDiatonicLeft(midi: number): number {
  return getClosestDiatonic(midi, -1);
}

export function getClosestDiatonicRight(midi: number): number {
  return getClosestDiatonic(midi, 1);
}

function getClosestDiatonic(midi: number, direction: 1 | -1): number {
  if (isDiatonic(midi)) {
    return midi;
  }
  return getClosestDiatonic(midi + direction, direction);
}