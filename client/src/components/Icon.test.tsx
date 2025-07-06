import { describe, it, expect } from 'vitest';
import { render } from 'solid-js/web';
import Icon from './Icon';

describe('Icon', () => {
  it('should render icon component', () => {
    const container = document.createElement('div');
    render(() => Icon({ name: 'test-icon' }), container);
    const img = container.querySelector('img');
    expect(img).toBeTruthy();
  });

  it('should generate correct icon path', () => {
    const container = document.createElement('div');
    render(() => Icon({ name: 'arrow-left' }), container);
    const img = container.querySelector('img');
    expect(img?.getAttribute('src')).toBe('/assets/img/arrow-left.svg');
  });

  it('should set alt text and dimensions', () => {
    const container = document.createElement('div');
    render(() => Icon({ name: 'zoom-in' }), container);
    const img = container.querySelector('img');
    expect(img?.getAttribute('alt')).toBe('zoom-in');
    expect(img?.getAttribute('width')).toBe('16');
    expect(img?.getAttribute('height')).toBe('16');
  });

  it('should handle different icon names', () => {
    const container = document.createElement('div');
    render(() => Icon({ name: 'signal-high' }), container);
    const img = container.querySelector('img');
    expect(img?.getAttribute('src')).toBe('/assets/img/signal-high.svg');
    expect(img?.getAttribute('alt')).toBe('signal-high');
  });
});
