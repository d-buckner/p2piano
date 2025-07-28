import { render, cleanup } from '@solidjs/testing-library';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import LatencyIndicator from './LatencyIndicator';

// Mock dependencies
vi.mock('../../../app/hooks', () => ({
  useAppSelector: vi.fn(),
}));

vi.mock('../../../selectors/connectionSelectors', () => ({
  selectMinLatency: vi.fn(),
}));

vi.mock('../../ui/Tooltip', () => ({
  default: (props: any) => (
    <div data-testid="tooltip" title={props.text}>
      {props.children}
    </div>
  )
}));

const mockUseAppSelector = vi.mocked(await import('../../../app/hooks')).useAppSelector;

describe('LatencyIndicator', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    
    // Default mock implementation
    mockUseAppSelector.mockReturnValue(() => 42);
  });

  afterEach(() => {
    cleanup();
  });

  it('should render latency value', () => {
    const { getByText } = render(() => <LatencyIndicator />);
    
    expect(getByText('42ms')).toBeInTheDocument();
  });

  it('should display different latency values', () => {
    mockUseAppSelector.mockReturnValue(() => 125);
    
    const { getByText } = render(() => <LatencyIndicator />);
    
    expect(getByText('125ms')).toBeInTheDocument();
  });

  it('should handle zero latency', () => {
    mockUseAppSelector.mockReturnValue(() => 0);
    
    const { getByText } = render(() => <LatencyIndicator />);
    
    expect(getByText('0ms')).toBeInTheDocument();
  });

  it('should render wifi icon', () => {
    const { container } = render(() => <LatencyIndicator />);
    
    const svg = container.querySelector('svg');
    expect(svg).toBeInTheDocument();
  });

  it('should have tooltip', () => {
    const { getByTestId } = render(() => <LatencyIndicator />);
    
    const tooltip = getByTestId('tooltip');
    expect(tooltip).toHaveAttribute('title', 'Connection Quality');
  });

  it('should render component structure', () => {
    const { container } = render(() => <LatencyIndicator />);
    
    const latencyIndicator = container.firstChild as HTMLElement;
    expect(latencyIndicator).toBeTruthy();
  });

  it('should handle high latency values', () => {
    mockUseAppSelector.mockReturnValue(() => 999);
    
    const { getByText } = render(() => <LatencyIndicator />);
    
    expect(getByText('999ms')).toBeInTheDocument();
  });

  it('should floor decimal latency values', () => {
    mockUseAppSelector.mockReturnValue(() => 42.7);
    
    const { getByText } = render(() => <LatencyIndicator />);
    
    expect(getByText('42ms')).toBeInTheDocument();
  });
});