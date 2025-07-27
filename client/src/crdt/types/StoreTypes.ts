/**
 * Store type definitions for the p2piano CRDT framework.
 * 
 * This file defines the specific SharedStore structure
 * based on the current p2piano application collaborative requirements.
 */

/**
 * Shared state that is synchronized across all peers via CRDT.
 * Only contains metronome state for musical coordination.
 */
export interface SharedStore {
  /** Metronome state for musical synchronization */
  metronome: SharedMetronomeState;
}

/**
 * Metronome state that must stay synchronized across all peers
 */
export interface SharedMetronomeState {
  /** Whether metronome is currently active */
  active: boolean;
  
  /** Beats per minute */
  bpm: number;
  
  /** Time signature - beats per measure */
  beatsPerMeasure: number;
  
  /** ID of the user who controls the metronome */
  leaderId: string;
  
  /** Current beat position (0-based within measure) */
  currentBeat: number;
  
  /** Timestamp of when metronome was started (for sync) */
  startTimestamp: number;
}


/**
 * Default/initial state values
 */
export const initialSharedStore: SharedStore = {
  metronome: {
    active: false,
    bpm: 120,
    beatsPerMeasure: 4,
    leaderId: '',
    currentBeat: 0,
    startTimestamp: 0,
  },
};

/**
 * Type utilities for working with store types
 */
export type SharedStoreKey = keyof SharedStore;
export type SharedStateFromKey<K extends SharedStoreKey> = SharedStore[K];
