type RequestIdleCallback = (callback: IdleRequestCallback) => void;

// zero-cost (after module-resolution) ponyfill
export const requestIdleCallback: RequestIdleCallback = typeof window !== 'undefined' && window.requestIdleCallback
  ? window.requestIdleCallback
  : setTimeout;
