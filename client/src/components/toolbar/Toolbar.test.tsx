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

  it('should render toolbar structure', () => {
    const { container } = render(() => <Toolbar />);
    const toolbar = container.firstChild as HTMLElement;
    
    expect(toolbar).toBeTruthy();
    expect(toolbar.tagName).toBe('DIV');
  });

  it('should have multiple child components', () => {
    const { container } = render(() => <Toolbar />);
    const toolbar = container.firstChild as HTMLElement;
    const children = Array.from(toolbar.children);
    
    // Should have 5 children (one for each control)
    expect(children.length).toBeGreaterThan(0);
    expect(children).toHaveLength(5);
  });

  it('should render without errors', () => {
    expect(() => {
      render(() => <Toolbar />);
    }).not.toThrow();
  });
});
