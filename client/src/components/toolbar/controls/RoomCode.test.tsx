import { render, cleanup } from '@solidjs/testing-library';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import RoomCode from './RoomCode';

// Mock dependencies
vi.mock('../../../app/hooks', () => ({
  useAppSelector: vi.fn(),
}));

vi.mock('../../../selectors/workspaceSelectors', () => ({
  selectRoomCode: vi.fn(),
  selectWorkspace: vi.fn(),
}));

const mockUseAppSelector = vi.mocked(await import('../../../app/hooks')).useAppSelector;

describe('RoomCode', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    
    // Default mock implementation
    mockUseAppSelector.mockReturnValue(() => 'ABC123');
  });

  afterEach(() => {
    cleanup();
  });

  it('should render room code', () => {
    const { getByText } = render(() => <RoomCode />);
    
    expect(getByText('ABC123')).toBeInTheDocument();
  });

  it('should render different room codes', () => {
    mockUseAppSelector.mockReturnValue(() => 'XYZ789');
    
    const { getByText } = render(() => <RoomCode />);
    
    expect(getByText('XYZ789')).toBeInTheDocument();
  });

  it('should handle empty room code', () => {
    mockUseAppSelector.mockReturnValue(() => '');
    
    expect(() => {
      render(() => <RoomCode />);
    }).not.toThrow();
  });

  it('should handle null room code', () => {
    mockUseAppSelector.mockReturnValue(() => null);
    
    expect(() => {
      render(() => <RoomCode />);
    }).not.toThrow();
  });

  it('should apply correct CSS classes', () => {
    const { container } = render(() => <RoomCode />);
    
    const roomCode = container.firstChild as HTMLElement;
    expect(roomCode).toHaveClass('roomCode');
  });

  it('should render as a span element', () => {
    const { container } = render(() => <RoomCode />);
    
    const roomCode = container.firstChild as HTMLElement;
    expect(roomCode.tagName).toBe('SPAN');
  });
});