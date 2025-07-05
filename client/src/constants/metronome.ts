export const MIN_BPM = 40;
export const MAX_BPM = 240;
export const DEFAULT_BPM = 120;
export const DEFAULT_BEATS_PER_MEASURE = 4;
export const SECONDS_PER_MINUTE = 60;

export const TICK_TYPE = {
  HI: 'hi',
  LOW: 'low',
} as const;

export type TickType = typeof TICK_TYPE[keyof typeof TICK_TYPE];
