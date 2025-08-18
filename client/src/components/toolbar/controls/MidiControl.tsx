import clsx from 'clsx';
import HuMIDI, { type DeviceMetadata } from 'humidi';
import { createSignal, Show, For } from 'solid-js';
import * as MidiActions from '../../../actions/MidiActions';
import { useAppSelector } from '../../../app/hooks';
import { selectMidiEnabled, selectMidiInputs, selectSelectedMidiInput } from '../../../selectors/midiSelectors';
import Dropdown from '../../ui/Dropdown';
import Tooltip from '../../ui/Tooltip';
import UsbIcon from '../../UsbIcon';
import { ChevronDownIcon } from '../icons';
import * as styles from './MidiControl.css';


function MidiControl() {
  const midiEnabled = useAppSelector(selectMidiEnabled);
  const midiDevices = useAppSelector(selectMidiInputs);
  const selectedInput = useAppSelector(selectSelectedMidiInput);
  const [isDropdownOpen, setIsDropdownOpen] = createSignal(false);

  const handleDeviceSelect = (device: DeviceMetadata) => {
    MidiActions.selectMidiInput(device);
    HuMIDI.enableDevice(device.id);
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

      if (Object.keys(midiDevices()).length) {
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
                <Show when={Object.keys(midiDevices()).length > 1}>
                  <ChevronDownIcon size={12} class={clsx(styles.chevron, { [styles.chevronRotated]: isDropdownOpen() })} />
                </Show>
              </button>
            </Tooltip>
          }
        >
          <div class={styles.dropdownContent}>
            <h3 class={styles.dropdownTitle}>MIDI Devices</h3>
            <div class={styles.deviceList}>
              <Show 
                when={Object.keys(midiDevices()).length > 0} 
                fallback={
                  <div class={styles.deviceItem}>
                    <span>No devices connected</span>
                  </div>
                }
              >
                <For each={Object.values(midiDevices())}>{device => (
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
              </Show>
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
