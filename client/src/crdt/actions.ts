import { MetronomeActions } from '../actions/MetronomeActions';
import { sharedStoreRoot } from './store';

// Action instances that can be imported statically
export const metronomeActions = new MetronomeActions(sharedStoreRoot);
