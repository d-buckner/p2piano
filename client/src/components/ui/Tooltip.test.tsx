import { render, cleanup } from '@solidjs/testing-library';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import Tooltip from './Tooltip';


describe('Tooltip', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    cleanup();
  });

  it('should render children', () => {
    const { getByText } = render(() => (
      <Tooltip text="Test tooltip">
        <span>Child content</span>
      </Tooltip>
    ));
    
    expect(getByText('Child content')).toBeInTheDocument();
  });

  it('should render with button child', () => {
    const { getByRole } = render(() => (
      <Tooltip text="Button tooltip">
        <button>Click me</button>
      </Tooltip>
    ));
    
    expect(getByRole('button')).toBeInTheDocument();
  });

  it('should handle empty tooltip text', () => {
    const { getByText } = render(() => (
      <Tooltip text="">
        <span>No tooltip</span>
      </Tooltip>
    ));
    
    expect(getByText('No tooltip')).toBeInTheDocument();
  });

  it('should render with different text content', () => {
    const { getByText } = render(() => (
      <Tooltip text="Different tooltip">
        <div>Different content</div>
      </Tooltip>
    ));
    
    expect(getByText('Different content')).toBeInTheDocument();
  });

  it('should render multiple times without error', () => {
    expect(() => {
      render(() => (
        <Tooltip text="First">
          <span>First</span>
        </Tooltip>
      ));
      
      render(() => (
        <Tooltip text="Second">
          <span>Second</span>
        </Tooltip>
      ));
    }).not.toThrow();
  });
});
