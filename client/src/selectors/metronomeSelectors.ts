import { selectSharedState } from '../app/store';
import type { RootState } from '../app/store';


export const selectMetronome = (state: RootState) => selectSharedState(state).metronome;
