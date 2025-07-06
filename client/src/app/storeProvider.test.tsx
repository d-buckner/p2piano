import { describe, it, expect } from 'vitest';
import { render } from 'solid-js/web';
import { StoreProvider } from './storeProvider';

describe('StoreProvider', () => {
  it('should render children', () => {
    const container = document.createElement('div');
    const TestChild = () => 'Test Content';
    
    render(() => <StoreProvider children={<TestChild />} />, container);
    
    expect(container.textContent).toBe('Test Content');
  });

  it('should pass through children unchanged', () => {
    const container = document.createElement('div');
    const children = <div>Hello World</div>;
    
    render(() => <StoreProvider children={children} />, container);
    
    expect(container.innerHTML).toContain('Hello World');
  });
});