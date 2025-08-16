import clsx from 'clsx';
import { createSignal, Show, For } from 'solid-js';
import * as MidiActions from '../../../actions/MidiActions';
import { useAppSelector } from '../../../app/hooks';
import { selectMidiEnabled, selectMidiInputs, selectSelectedMidiInput } from '../../../selectors/midiSelectors';
import Dropdown from '../../ui/Dropdown';
import Tooltip from '../../ui/Tooltip';
import UsbIcon from '../../UsbIcon';
import { ChevronDownIcon } from '../icons';
import * as styles from './MidiControl.css';
import type { MIDIInput } from 'humidi';


function MidiControl() {
  const midiEnabled = useAppSelector(selectMidiEnabled);
  const midiDevices = useAppSelector(selectMidiInputs);
  const selectedInput = useAppSelector(selectSelectedMidiInput);
  const [isDropdownOpen, setIsDropdownOpen] = createSignal(false);

  const handleDeviceSelect = (device: MIDIInput) => {
    MidiActions.selectMidiInput(device);
    device.enable();
    setIsDropdownOpen(false);
  };

  const handleDisconnect = () => {
    MidiActions.disableMidi();
    setIsDropdownOpen(false);
  };

  const onToggle = async (e: MouseEvent) => {
    e.stopPropagation(); // Prevent Dropdown's handler from firing
    
    if (midiEnabled()) {
      setIsDropdownOpen(!isDropdownOpen());

      if (midiDevices().length) {
        return;
      }
    }

    try {
      await MidiActions.enableMidi();
    } catch {
      // Error is already logged in the action
      // TODO: Show user notification about MIDI access failure
    }
  };

  return (
    <div class={styles.midiControl}>
      <Show
        when={midiEnabled()}
        fallback={
          <Tooltip text="Enable MIDI">
            <button
              class={styles.midiButton}
              onClick={onToggle}
            >
              <UsbIcon width={14} height={14} />
              <span>MIDI</span>
            </button>
          </Tooltip>
        }
      >
        <Dropdown
          open={isDropdownOpen()}
          onOpenChange={setIsDropdownOpen}
          trigger={
            <Tooltip text="MIDI Device Settings">
              <button
                class={clsx(styles.midiButton, styles.active)}
                onClick={onToggle}
              >
                <UsbIcon width={14} height={14} />
                <span>{selectedInput()?.name || 'MIDI'}</span>
                <Show when={midiDevices().length > 1}>
                  <ChevronDownIcon size={12} class={clsx(styles.chevron, { [styles.chevronRotated]: isDropdownOpen() })} />
                </Show>
              </button>
            </Tooltip>
          }
        >
          <div class={styles.dropdownContent}>
            <h3 class={styles.dropdownTitle}>MIDI Devices</h3>
            <div class={styles.deviceList}>
              <For each={midiDevices()}>{device => (
                <button
                  class={clsx(styles.deviceItem, { [styles.selected]: selectedInput()?.id === device.id })}
                  onClick={() => handleDeviceSelect(device)}
                >
                  <span>{device.name}</span>
                  <Show when={selectedInput()?.id === device.id}>
                    <span class={styles.checkmark}>✓</span>
                  </Show>
                </button>
              )}</For>
            </div>
            <div class={styles.divider} />
            <button
              class={styles.disconnectButton}
              onClick={handleDisconnect}
            >
              Disconnect MIDI
            </button>
          </div>
        </Dropdown>
      </Show>
    </div>
  );
}

export default MidiControl;
