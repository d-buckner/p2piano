# Services Architecture

## Overview

This directory contains the service layer of the application, organized with a reactive state management system.

## Structure

### `/base/`
Contains the base `Service` class that all services should extend to get reactive state management capabilities.

### `/audio/`
Audio-related services including the AudioEngine.

### `/network/`
Network-related services including the NetworkService for peer-to-peer communication.

## Using the Reactive Service Base Class

### 1. Define Your State Interface
```typescript
interface MyServiceState {
  status: 'idle' | 'loading' | 'ready';
  data: any[];
  error: string | null;
}
```

### 2. Extend the Service Class
```typescript
import { Service } from '../base/Service';

export class MyService extends Service<MyServiceState> {
  constructor() {
    super({
      status: 'idle',
      data: [],
      error: null
    });
  }
  
  public async loadData(): Promise<void> {
    this.setState('status', 'loading');
    try {
      const data = await fetchData();
      this.setStates({
        status: 'ready',
        data,
        error: null
      });
    } catch (error) {
      this.setStates({
        status: 'idle',
        error: error.message
      });
    }
  }
}
```

### 3. Consume in Components
```typescript
import { useServiceState } from '../../hooks';

function MyComponent({ myService }: { myService: MyService }) {
  const state = useServiceState(myService);
  
  return (
    <div>
      <div>Status: {state.status}</div>
      <div>Data count: {state.data.length}</div>
      {state.error && <div>Error: {state.error}</div>}
    </div>
  );
}
```

## Benefits

- **Unified Architecture**: All services use the same reactive pattern
- **Type Safety**: Full TypeScript support for state management  
- **Automatic Reactivity**: UI components automatically update when service state changes
- **Service Dependencies**: Services can react to other service state changes
- **Clean Separation**: Business logic in services, reactive consumption in components

## Migration Strategy

For existing services, you can either:

1. **Direct Migration**: Refactor the service to extend `Service<TState>`
2. **Wrapper Pattern**: Create a reactive wrapper around the existing service (see `ReactiveNetworkService.example.ts`)

The wrapper pattern allows gradual migration without breaking existing code.