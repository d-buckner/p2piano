import type { JSX } from 'solid-js';

// For now, just pass through children since we're using a global store
export function StoreProvider(props: { children: JSX.Element }) {
  return props.children;
}