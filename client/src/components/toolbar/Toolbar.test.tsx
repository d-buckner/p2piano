import { render, cleanup } from '@solidjs/testing-library';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import Toolbar from './Toolbar';

// Mock the child components
vi.mock('./controls/MetronomeControl', () => ({
  default: () => <div data-testid="metronome-control">MetronomeControl</div>
}));

vi.mock('./controls/InstrumentSelector', () => ({
  default: () => <div data-testid="instrument-selector">InstrumentSelector</div>
}));

vi.mock('./controls/ActiveUsers', () => ({
  default: () => <div data-testid="active-users">ActiveUsers</div>
}));

vi.mock('./controls/MidiControl', () => ({
  default: () => <div data-testid="midi-control">MidiControl</div>
}));

vi.mock('./controls/LatencyIndicator', () => ({
  default: () => <div data-testid="latency-indicator">LatencyIndicator</div>
}));

describe('Toolbar', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    cleanup();
  });

  it('should render all toolbar components', () => {
    const { getByTestId } = render(() => <Toolbar />);
    
    expect(getByTestId('metronome-control')).toBeInTheDocument();
    expect(getByTestId('instrument-selector')).toBeInTheDocument();
    expect(getByTestId('active-users')).toBeInTheDocument();
    expect(getByTestId('midi-control')).toBeInTheDocument();
    expect(getByTestId('latency-indicator')).toBeInTheDocument();
  });

  it('should have proper toolbar structure with CSS classes', () => {
    const { container } = render(() => <Toolbar />);
    const toolbar = container.firstChild as HTMLElement;
    
    expect(toolbar).toHaveClass('toolbar');
    expect(toolbar.tagName).toBe('DIV');
  });

  it('should apply responsive visibility classes correctly', () => {
    const { container } = render(() => <Toolbar />);
    const toolbar = container.firstChild as HTMLElement;
    const children = Array.from(toolbar.children);
    
    // Should have 5 children (one for each control)
    expect(children).toHaveLength(5);
    
    // Each child should have a responsive visibility class
    children.forEach(child => {
      const classList = Array.from(child.classList);
      const hasVisibilityClass = classList.some(className => 
        className.includes('showFromMobile') || 
        className.includes('showFromMedium') || 
        className.includes('showFromDesktop')
      );
      expect(hasVisibilityClass).toBe(true);
    });
  });

  it('should render components in correct responsive order', () => {
    const { container } = render(() => <Toolbar />);
    const toolbar = container.firstChild as HTMLElement;
    const children = Array.from(toolbar.children);
    
    // Check that mobile components come first
    const firstChild = children[0].querySelector('[data-testid="metronome-control"]');
    const secondChild = children[1].querySelector('[data-testid="instrument-selector"]');
    
    expect(firstChild).toBeInTheDocument();
    expect(secondChild).toBeInTheDocument();
  });
});
