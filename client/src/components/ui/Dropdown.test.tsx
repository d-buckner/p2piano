import { render, cleanup } from '@solidjs/testing-library';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import Dropdown from './Dropdown';


describe('Dropdown', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    cleanup();
  });

  it('should render trigger element', () => {
    const { getByText } = render(() => (
      <Dropdown
        open={false}
        onOpenChange={() => {}}
        trigger={<button>Open dropdown</button>}
      >
        <div>Dropdown content</div>
      </Dropdown>
    ));
    
    expect(getByText('Open dropdown')).toBeInTheDocument();
  });

  it('should show content when open is true', () => {
    const { getByText } = render(() => (
      <Dropdown
        open={true}
        onOpenChange={() => {}}
        trigger={<button>Trigger</button>}
      >
        <div>Visible content</div>
      </Dropdown>
    ));
    
    expect(getByText('Visible content')).toBeInTheDocument();
  });

  it('should hide content when open is false', () => {
    const { queryByText } = render(() => (
      <Dropdown
        open={false}
        onOpenChange={() => {}}
        trigger={<button>Trigger</button>}
      >
        <div>Hidden content</div>
      </Dropdown>
    ));
    
    expect(queryByText('Hidden content')).not.toBeInTheDocument();
  });

  it('should accept onOpenChange handler', () => {
    const mockOnOpenChange = vi.fn();
    
    expect(() => {
      render(() => (
        <Dropdown
          open={false}
          onOpenChange={mockOnOpenChange}
          trigger={<button>Handler trigger</button>}
        >
          <div>Content</div>
        </Dropdown>
      ));
    }).not.toThrow();
  });

  it('should render with different trigger types', () => {
    const { getByText } = render(() => (
      <Dropdown
        open={false}
        onOpenChange={() => {}}
        trigger={<span>Span trigger</span>}
      >
        <div>Content</div>
      </Dropdown>
    ));
    
    expect(getByText('Span trigger')).toBeInTheDocument();
  });
});
