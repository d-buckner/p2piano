import { createMemo } from 'solid-js';
import { useStore } from './store';
import type { RootState } from './store';

// Custom hooks for accessing state
export const useAppSelector = <T>(selector: (state: RootState) => T): () => T => {
  const { state } = useStore();
  return createMemo(() => selector(state));
};

export const useAppDispatch = () => {
  const { setState } = useStore();
  
  // Return a function that can dispatch actions
  return () => {
    setState((prevState) => {
      // Here you would implement the reducer logic
      // For now, we'll need to handle this in individual components
      // or create action handlers separately
      return prevState;
    });
  };
};
