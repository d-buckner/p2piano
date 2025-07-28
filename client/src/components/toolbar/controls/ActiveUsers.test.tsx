import { render, cleanup } from '@solidjs/testing-library';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import ActiveUsers from './ActiveUsers';

// Mock dependencies
vi.mock('../../../app/hooks', () => ({
  useAppSelector: vi.fn(),
}));

vi.mock('../../../selectors/workspaceSelectors', () => ({
  selectUsers: vi.fn(),
}));

vi.mock('../../ui/Dropdown', () => ({
  default: (props: any) => (
    <div data-testid="dropdown">
      {props.trigger}
      {props.open && <div data-testid="dropdown-content">{props.children}</div>}
    </div>
  )
}));

vi.mock('../../ui/Tooltip', () => ({
  default: (props: any) => (
    <div data-testid="tooltip" title={props.text}>
      {props.children}
    </div>
  )
}));

const mockUseAppSelector = vi.mocked(await import('../../../app/hooks')).useAppSelector;

describe('ActiveUsers', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    
    // Default mock implementation with multiple users
    mockUseAppSelector.mockReturnValue(() => [
      { id: 'user1', displayName: 'John Doe', instrument: 'piano' },
      { id: 'user2', displayName: 'Jane Smith', instrument: 'synth' },
      { id: 'user3', displayName: 'Bob Wilson', instrument: 'electric_bass' }
    ]);
  });

  afterEach(() => {
    cleanup();
  });

  it('should display correct user count', () => {
    const { getByText } = render(() => <ActiveUsers />);
    
    expect(getByText('3')).toBeInTheDocument();
  });

  it('should display single user count correctly', () => {
    mockUseAppSelector.mockReturnValue(() => [
      { id: 'user1', displayName: 'Solo User', instrument: 'piano' }
    ]);
    
    const { getByText } = render(() => <ActiveUsers />);
    
    expect(getByText('1')).toBeInTheDocument();
  });

  it('should handle empty user list', () => {
    mockUseAppSelector.mockReturnValue(() => []);
    
    const { getByText } = render(() => <ActiveUsers />);
    
    expect(getByText('0')).toBeInTheDocument();
  });

  it('should render users icon', () => {
    const { container } = render(() => <ActiveUsers />);
    
    const svg = container.querySelector('svg');
    expect(svg).toBeInTheDocument();
  });

  it('should have tooltip with user count', () => {
    const { getByTestId } = render(() => <ActiveUsers />);
    
    const tooltip = getByTestId('tooltip');
    expect(tooltip).toHaveAttribute('title', 'Active Users (3)');
  });

  it('should update tooltip text with different user counts', () => {
    mockUseAppSelector.mockReturnValue(() => [
      { id: 'user1', displayName: 'User One', instrument: 'piano' }
    ]);
    
    const { getByTestId } = render(() => <ActiveUsers />);
    
    const tooltip = getByTestId('tooltip');
    expect(tooltip).toHaveAttribute('title', 'Active Users (1)');
  });

  it('should apply correct CSS classes', () => {
    const { container } = render(() => <ActiveUsers />);
    
    const activeUsers = container.firstChild as HTMLElement;
    expect(activeUsers).toHaveClass('activeUsers');
  });

  it('should render dropdown structure correctly', () => {
    const { getByTestId } = render(() => <ActiveUsers />);
    
    expect(getByTestId('dropdown')).toBeInTheDocument();
  });

  it('should handle large user counts', () => {
    const manyUsers = Array.from({ length: 25 }, (_, i) => ({
      id: `user${i + 1}`,
      displayName: `User ${i + 1}`,
      instrument: 'piano'
    }));
    
    mockUseAppSelector.mockReturnValue(() => manyUsers);
    
    const { getByText } = render(() => <ActiveUsers />);
    
    expect(getByText('25')).toBeInTheDocument();
  });

  it('should handle users with different instruments', () => {
    mockUseAppSelector.mockReturnValue(() => [
      { id: 'user1', displayName: 'Piano Player', instrument: 'piano' },
      { id: 'user2', displayName: 'Synth Player', instrument: 'synth' },
      { id: 'user3', displayName: 'Bass Player', instrument: 'electric_bass' }
    ]);
    
    const { getByText } = render(() => <ActiveUsers />);
    
    // Should still show total count regardless of instruments
    expect(getByText('3')).toBeInTheDocument();
  });
});