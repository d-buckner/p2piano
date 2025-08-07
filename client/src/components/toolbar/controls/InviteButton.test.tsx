import { fireEvent, render, screen, waitFor } from '@solidjs/testing-library';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import InviteButton from './InviteButton';

// Mock the clipboard API
const mockWriteText = vi.fn();
Object.defineProperty(navigator, 'clipboard', {
  value: {
    writeText: mockWriteText,
  },
  writable: true,
});

// Mock window.location
Object.defineProperty(window, 'location', {
  value: {
    href: 'http://localhost:3000/room/ABCDE',
  },
  writable: true,
});

describe('InviteButton', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.clearAllTimers();
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('should render invite button with correct text and icon', () => {
    render(() => <InviteButton />);

    expect(screen.getByRole('button', { name: /invite/i })).toBeInTheDocument();
    expect(screen.getByText('Invite')).toBeInTheDocument();
  });

  it('should open modal when invite button is clicked', async () => {
    render(() => <InviteButton />);

    const inviteButton = screen.getByRole('button', { name: /invite/i });
    fireEvent.click(inviteButton);

    await waitFor(() => {
      expect(screen.getByText('Invite to Room')).toBeInTheDocument();
    });
  });

  it('should display current URL in the modal input', async () => {
    render(() => <InviteButton />);

    const inviteButton = screen.getByRole('button', { name: /invite/i });
    fireEvent.click(inviteButton);

    await waitFor(() => {
      const input = screen.getByDisplayValue('http://localhost:3000/room/ABCDE');
      expect(input).toBeInTheDocument();
      expect(input).toHaveAttribute('readonly');
    });
  });

  it('should close modal when close is triggered', async () => {
    render(() => <InviteButton />);

    const inviteButton = screen.getByRole('button', { name: /invite/i });
    fireEvent.click(inviteButton);

    await waitFor(() => {
      expect(screen.getByText('Invite to Room')).toBeInTheDocument();
    });

    // Close the modal by clicking the close button
    const closeButton = screen.getByText('×');
    fireEvent.click(closeButton);

    await waitFor(() => {
      expect(screen.queryByText('Invite to Room')).not.toBeInTheDocument();
    });
  });

  it('should copy link to clipboard when copy button is clicked', async () => {
    mockWriteText.mockResolvedValue(undefined);

    render(() => <InviteButton />);

    const inviteButton = screen.getByRole('button', { name: /invite/i });
    fireEvent.click(inviteButton);

    await waitFor(() => {
      expect(screen.getByText('Invite to Room')).toBeInTheDocument();
    });

    const allButtons = screen.getAllByRole('button');
    const copyButton = allButtons.find(button => button.className.includes('copyButton'))!;
    fireEvent.click(copyButton);

    expect(mockWriteText).toHaveBeenCalledWith('http://localhost:3000/room/ABCDE');
  });

  it('should show copied confirmation after successful copy', async () => {
    mockWriteText.mockResolvedValue(undefined);

    render(() => <InviteButton />);

    const inviteButton = screen.getByRole('button', { name: /invite/i });
    fireEvent.click(inviteButton);

    await waitFor(() => {
      expect(screen.getByText('Invite to Room')).toBeInTheDocument();
    });

    const allButtons = screen.getAllByRole('button');
    const copyButton = allButtons.find(button => button.className.includes('copyButton'))!;
    fireEvent.click(copyButton);

    await waitFor(() => {
      expect(screen.getByText('Link copied to clipboard!')).toBeInTheDocument();
    });
  });

  it('should hide copied confirmation after timeout', async () => {
    mockWriteText.mockResolvedValue(undefined);

    render(() => <InviteButton />);

    const inviteButton = screen.getByRole('button', { name: /invite/i });
    fireEvent.click(inviteButton);

    await waitFor(() => {
      expect(screen.getByText('Invite to Room')).toBeInTheDocument();
    });

    const allButtons = screen.getAllByRole('button');
    const copyButton = allButtons.find(button => button.className.includes('copyButton'))!;
    fireEvent.click(copyButton);

    await waitFor(() => {
      expect(screen.getByText('Link copied to clipboard!')).toBeInTheDocument();
    });

    // Fast-forward time to trigger timeout
    vi.advanceTimersByTime(2000);

    await waitFor(() => {
      expect(screen.queryByText('Link copied to clipboard!')).not.toBeInTheDocument();
    });
  });

  it('should update URL dynamically based on window.location', async () => {
    // Change the location
    window.location.href = 'http://localhost:3000/room/XYZKL';

    render(() => <InviteButton />);

    const inviteButton = screen.getByRole('button', { name: /invite/i });
    fireEvent.click(inviteButton);

    await waitFor(() => {
      expect(screen.getByDisplayValue('http://localhost:3000/room/XYZKL')).toBeInTheDocument();
    });
  });
});
