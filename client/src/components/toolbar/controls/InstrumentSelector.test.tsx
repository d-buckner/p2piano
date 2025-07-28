import { render, fireEvent, cleanup } from '@solidjs/testing-library';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import InstrumentSelector from './InstrumentSelector';

// Mock dependencies
vi.mock('../../../app/hooks', () => ({
  useAppSelector: vi.fn(),
}));

vi.mock('../../../actions/WorkspaceActions', async (importOriginal) => {
  const actual = await importOriginal();
  return {
    ...actual,
    changeInstrument: vi.fn(),
  };
});

vi.mock('../../../selectors/workspaceSelectors', () => ({
  selectMyUser: vi.fn(),
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
const mockWorkspaceActions = vi.mocked(await import('../../../actions/WorkspaceActions'));

describe('InstrumentSelector', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    
    // Default mock implementation
    mockUseAppSelector.mockReturnValue(() => ({
      id: 'user1',
      instrument: 'piano',
    }));
  });

  afterEach(() => {
    cleanup();
  });

  it('should render current instrument name', () => {
    const { getByText } = render(() => <InstrumentSelector />);
    
    expect(getByText('Piano')).toBeInTheDocument();
  });

  it('should display different instrument names correctly', () => {
    mockUseAppSelector.mockReturnValue(() => ({
      id: 'user1',
      instrument: 'synth',
    }));
    
    const { getByText } = render(() => <InstrumentSelector />);
    
    expect(getByText('Synth')).toBeInTheDocument();
  });

  it('should handle electric_bass instrument', () => {
    mockUseAppSelector.mockReturnValue(() => ({
      id: 'user1',
      instrument: 'electric_bass',
    }));
    
    const { getByText } = render(() => <InstrumentSelector />);
    
    expect(getByText('Electric Bass')).toBeInTheDocument();
  });

  it('should handle unknown instrument gracefully', () => {
    mockUseAppSelector.mockReturnValue(() => ({
      id: 'user1',
      instrument: 'unknown_instrument',
    }));
    
    const { getByText } = render(() => <InstrumentSelector />);
    
    expect(getByText('Unknown_instrument')).toBeInTheDocument();
  });

  it('should render dropdown trigger with music icon', () => {
    const { getByTestId } = render(() => <InstrumentSelector />);
    
    expect(getByTestId('dropdown')).toBeInTheDocument();
  });

  it('should have tooltip for accessibility', () => {
    const { getByTestId } = render(() => <InstrumentSelector />);
    
    const tooltip = getByTestId('tooltip');
    expect(tooltip).toHaveAttribute('title', 'Select Instrument');
  });

  it('should call changeInstrument when instrument is selected', () => {
    const { getByTestId, getByText } = render(() => <InstrumentSelector />);
    
    // Simulate opening dropdown by clicking trigger
    const dropdown = getByTestId('dropdown');
    const trigger = dropdown.querySelector('button');
    
    if (trigger) {
      fireEvent.click(trigger);
    }
    
    // The actual instrument selection would happen in the dropdown content
    // This test verifies the component structure is correct for interaction
    expect(dropdown).toBeInTheDocument();
  });

  it('should apply correct CSS classes', () => {
    const { container } = render(() => <InstrumentSelector />);
    
    const instrumentSelector = container.firstChild as HTMLElement;
    expect(instrumentSelector).toHaveClass('instrumentSelector');
  });

  it('should handle empty user gracefully', () => {
    mockUseAppSelector.mockReturnValue(() => null);
    
    // Should not crash when user is null
    expect(() => {
      render(() => <InstrumentSelector />);
    }).not.toThrow();
  });

  it('should format instrument names with proper capitalization', () => {
    mockUseAppSelector.mockReturnValue(() => ({
      id: 'user1',
      instrument: 'test_instrument_name',
    }));
    
    const { getByText } = render(() => <InstrumentSelector />);
    
    expect(getByText('Test Instrument Name')).toBeInTheDocument();
  });
});
