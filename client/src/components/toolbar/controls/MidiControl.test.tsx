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
  default: (props: { trigger: unknown; open: boolean; children: unknown }) => (
    <div data-testid="dropdown">
      {props.trigger}
      {props.open && <div data-testid="dropdown-content">{props.children}</div>}
    </div>
  )
}));

vi.mock('../../ui/Tooltip', () => ({
  default: (props: { text: string; children: unknown }) => (
    <div data-testid="tooltip" title={props.text}>
      {props.children}
    </div>
  )
}));

vi.mock('../../UsbIcon', () => ({
  default: (props: Record<string, unknown>) => <svg data-testid="usb-icon" {...props} />
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

  it('should render without errors', () => {
    expect(() => {
      render(() => <MidiControl />);
    }).not.toThrow();
  });

  it('should handle different MIDI states', () => {
    mockUseAppSelector.mockReturnValue(() => ({
      enabled: true,
      hasAccess: true,
    }));
    
    expect(() => {
      render(() => <MidiControl />);
    }).not.toThrow();
  });
});
