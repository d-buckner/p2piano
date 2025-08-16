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
    enableMidi: vi.fn(),
    disableMidi: vi.fn(),
    selectMidiInput: vi.fn(),
    setMidiInputs: vi.fn(),
  };
});

vi.mock('../../../selectors/midiSelectors', () => ({
  selectMidiEnabled: vi.fn(),
  selectMidiInputs: vi.fn(),
  selectSelectedMidiInput: vi.fn(),
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
const { selectMidiEnabled, selectMidiInputs, selectSelectedMidiInput } = vi.mocked(await import('../../../selectors/midiSelectors'));

describe('MidiControl', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    
    // Default mock implementations for each selector
    selectMidiEnabled.mockReturnValue(() => false);
    selectMidiInputs.mockReturnValue(() => []);
    selectSelectedMidiInput.mockReturnValue(() => null);
    
    mockUseAppSelector.mockImplementation((selector) => {
      if (selector === selectMidiEnabled) return selectMidiEnabled();
      if (selector === selectMidiInputs) return selectMidiInputs();
      if (selector === selectSelectedMidiInput) return selectSelectedMidiInput();
      return () => null;
    });
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
    selectMidiEnabled.mockReturnValue(() => true);
    selectMidiInputs.mockReturnValue(() => []);
    selectSelectedMidiInput.mockReturnValue(() => null);
    
    mockUseAppSelector.mockImplementation((selector) => {
      if (selector === selectMidiEnabled) return selectMidiEnabled();
      if (selector === selectMidiInputs) return selectMidiInputs();
      if (selector === selectSelectedMidiInput) return selectSelectedMidiInput();
      return () => null;
    });
    
    expect(() => {
      render(() => <MidiControl />);
    }).not.toThrow();
  });
});
