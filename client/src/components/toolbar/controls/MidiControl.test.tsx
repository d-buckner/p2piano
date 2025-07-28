import { render, cleanup } from '@solidjs/testing-library';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import MidiControl from './MidiControl';

// Mock dependencies
vi.mock('../../../app/hooks', () => ({
  useAppSelector: vi.fn(),
}));

vi.mock('../../../actions/MidiActions', async (importOriginal) => {
  const actual = await importOriginal();
  return {
    ...actual,
    toggleMidiEnabled: vi.fn(),
  };
});

vi.mock('../../../selectors/midiSelectors', () => ({
  selectMidi: vi.fn(),
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

vi.mock('../../UsbIcon', () => ({
  default: (props: any) => <svg data-testid="usb-icon" {...props} />
}));

vi.mock('humidi', () => ({
  default: {
    getInputs: vi.fn(() => []),
  },
}));

const mockUseAppSelector = vi.mocked(await import('../../../app/hooks')).useAppSelector;

describe('MidiControl', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    
    // Default mock implementation
    mockUseAppSelector.mockReturnValue(() => ({
      enabled: false,
      hasAccess: false,
    }));
  });

  afterEach(() => {
    cleanup();
  });

  it('should render MIDI text when disabled', () => {
    const { getByText } = render(() => <MidiControl />);
    
    expect(getByText('MIDI')).toBeInTheDocument();
  });

  it('should render USB icon', () => {
    const { getByTestId } = render(() => <MidiControl />);
    
    expect(getByTestId('usb-icon')).toBeInTheDocument();
  });

  it('should show Enable MIDI tooltip when disabled', () => {
    const { getByTestId } = render(() => <MidiControl />);
    
    const tooltip = getByTestId('tooltip');
    expect(tooltip).toHaveAttribute('title', 'Enable MIDI');
  });

  it('should render differently when enabled', () => {
    mockUseAppSelector.mockReturnValue(() => ({
      enabled: true,
      hasAccess: true,
    }));
    
    const { getByTestId } = render(() => <MidiControl />);
    
    expect(getByTestId('dropdown')).toBeInTheDocument();
  });

  it('should show MIDI Device Settings tooltip when enabled', () => {
    mockUseAppSelector.mockReturnValue(() => ({
      enabled: true,
      hasAccess: true,
    }));
    
    const { getByTestId } = render(() => <MidiControl />);
    
    const tooltip = getByTestId('tooltip');
    expect(tooltip).toHaveAttribute('title', 'MIDI Device Settings');
  });

  it('should render component structure', () => {
    const { container } = render(() => <MidiControl />);
    
    const midiControl = container.firstChild as HTMLElement;
    expect(midiControl).toBeTruthy();
  });

  it('should handle different MIDI states', () => {
    mockUseAppSelector.mockReturnValue(() => ({
      enabled: false,
      hasAccess: true,
    }));
    
    expect(() => {
      render(() => <MidiControl />);
    }).not.toThrow();
  });
});