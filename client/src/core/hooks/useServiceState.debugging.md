# Debugging Reactive Service State

The `useServiceState` hook returns a proxy object that can be challenging to debug in Chrome DevTools. Here are several ways to inspect the actual state values:

## Method 1: Use the `__debug` property (Recommended)

In Chrome DevTools, you can directly access the `__debug` property to see all current state values:

```javascript
// In your component
const audioState = useServiceState(audioEngine);

// In Chrome DevTools console, expand the audioState object and look for __debug
// Or access it directly:
console.log(audioState.__debug);
// Output: { volume: 0.8, isMuted: false, engineState: 'active', ... }
```

## Method 2: Use the `debugServiceState` helper function

```javascript
import { debugServiceState } from '../core/hooks';

// In your component or console
const audioState = useServiceState(audioEngine);
console.log(debugServiceState(audioState));
// Output: { volume: 0.8, isMuted: false, engineState: 'active', ... }
```

## Method 3: Use the global helper (available in console)

The `debugServiceState` function is automatically available in the browser console:

```javascript
// In Chrome DevTools console
debugServiceState(audioState);
// Output: { volume: 0.8, isMuted: false, engineState: 'active', ... }
```

## Method 4: Use JSON.stringify

```javascript
const audioState = useServiceState(audioEngine);
console.log(JSON.stringify(audioState, null, 2));
// Output: Pretty-printed JSON of current state
```

## Method 5: Check if object is reactive

You can verify if an object is a reactive service state proxy:

```javascript
console.log(audioState.__reactive); // true
console.log(Object.prototype.toString.call(audioState)); // "[object ServiceState]"
```

## Debugging in Components

Here's how to debug service state within your components:

```typescript
function MyComponent({ audioEngine }: { audioEngine: AudioEngineService }) {
  const audioState = useServiceState(audioEngine);

  // Debug current state
  console.log('Current audio state:', audioState.__debug);

  // Or use the helper
  console.log('Current audio state:', debugServiceState(audioState));

  // Access individual properties normally
  return (
    <div>
      <div>Volume: {audioState.volume}</div>
      <div>Muted: {audioState.isMuted ? 'Yes' : 'No'}</div>
    </div>
  );
}
```

## Best Practices

1. **Use `__debug` in DevTools**: This gives you immediate access to current state values
2. **Use `debugServiceState()` in code**: This is safer and more explicit when debugging programmatically
3. **Remember reactivity**: The debug snapshot shows current values, but the proxy properties are reactive signals
4. **Check `__reactive`**: Use this to verify you're working with a reactive proxy

The proxy object maintains full reactivity while providing easy debugging access to the underlying state values.