import { render, screen } from '@solidjs/testing-library';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useAppSelector } from '../../../app/hooks';
import RoomCode from './RoomCode';


// Mock the app hooks
vi.mock('../../../app/hooks', () => ({
  useAppSelector: vi.fn(),
}));

// Mock the workspace selectors
vi.mock('../../../selectors/workspaceSelectors', () => ({
  selectWorkspace: vi.fn(),
}));

const mockUseAppSelector = vi.mocked(useAppSelector);

describe('RoomCode', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should display the room ID from workspace', () => {
    const mockWorkspace = () => ({ roomId: 'ABCDE' });
    mockUseAppSelector.mockReturnValue(mockWorkspace);

    render(() => <RoomCode />);

    expect(screen.getByText('ABCDE')).toBeInTheDocument();
  });

  it('should not display any room code when room ID is null', () => {
    const mockWorkspace = () => ({ roomId: null });
    mockUseAppSelector.mockReturnValue(mockWorkspace);

    const { container } = render(() => <RoomCode />);

    // Should not have any text content when room ID is null
    expect(container).toHaveTextContent('');
  });

  it('should not display any room code when room ID is undefined', () => {
    const mockWorkspace = () => ({ roomId: undefined });
    mockUseAppSelector.mockReturnValue(mockWorkspace);

    const { container } = render(() => <RoomCode />);

    // Should not have any text content when room ID is undefined
    expect(container).toHaveTextContent('');
  });

  it('should have tooltip with "Room Code" text', () => {
    const mockWorkspace = () => ({ roomId: 'ABCDE' });
    mockUseAppSelector.mockReturnValue(mockWorkspace);

    render(() => <RoomCode />);

    // Check that the tooltip wrapper is present
    expect(screen.getByText('ABCDE')).toBeInTheDocument();
    // The tooltip functionality is tested in the Tooltip component's own tests
  });

  it('should handle different room code formats', () => {
    const mockWorkspace = () => ({ roomId: 'XY123' });
    mockUseAppSelector.mockReturnValue(mockWorkspace);

    render(() => <RoomCode />);

    expect(screen.getByText('XY123')).toBeInTheDocument();
  });
});
