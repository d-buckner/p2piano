import { render, cleanup } from '@solidjs/testing-library';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import Modal from './Modal';


describe('Modal', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    cleanup();
  });

  it('should not render when closed', () => {
    const { queryByText } = render(() => (
      <Modal open={false} onClose={() => {}} title="Hidden Modal">
        <div>Hidden content</div>
      </Modal>
    ));
    
    expect(queryByText('Hidden Modal')).not.toBeInTheDocument();
    expect(queryByText('Hidden content')).not.toBeInTheDocument();
  });

  it('should render basic structure when open', () => {
    const { container } = render(() => (
      <Modal open={true} onClose={() => {}} title="Basic Modal">
        <div>Basic content</div>
      </Modal>
    ));
    
    // Should render something when open
    expect(container.firstChild).toBeTruthy();
  });

  it('should render without title', () => {
    const { container } = render(() => (
      <Modal open={true} onClose={() => {}}>
        <div>No title content</div>
      </Modal>
    ));
    
    expect(container.firstChild).toBeTruthy();
  });

  it('should handle onClose function prop', () => {
    const mockOnClose = vi.fn();
    
    expect(() => {
      render(() => (
        <Modal open={true} onClose={mockOnClose} title="Handler Modal">
          <div>Content</div>
        </Modal>
      ));
    }).not.toThrow();
  });

  it('should accept JSX children', () => {
    expect(() => {
      render(() => (
        <Modal open={true} onClose={() => {}} title="JSX Modal">
          <div>
            <span>Nested</span>
            <button>Button</button>
          </div>
        </Modal>
      ));
    }).not.toThrow();
  });
});
