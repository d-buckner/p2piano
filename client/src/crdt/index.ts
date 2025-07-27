import { MetronomeActions } from '../actions/MetronomeActions';
import { SharedStoreRoot } from './store/SharedStoreRoot';

// Single instance of the shared store root
export const sharedStoreRoot = new SharedStoreRoot();

// Action instances
export const metronomeActions = new MetronomeActions(sharedStoreRoot);
