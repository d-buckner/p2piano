import HuMIDI from 'humidi';
import { createSignal, Show, createMemo, For } from 'solid-js';
import { toggleMidiEnabled } from '../../../actions/MidiActions';
import { useAppSelector } from '../../../app/hooks';
import { selectMidi } from '../../../selectors/midiSelectors';
import Dropdown from '../../ui/Dropdown';
import Tooltip from '../../ui/Tooltip';
import UsbIcon from '../../UsbIcon';
import { ChevronDownIcon } from '../icons';
import * as styles from './MidiControl.css';


function MidiControl() {
  const midi = useAppSelector(selectMidi);
  const [selectedDevice, setSelectedDevice] = createSignal<MIDIInput | null>(null);
  const [isDropdownOpen, setIsDropdownOpen] = createSignal(false);
  
  // Get actual MIDI devices from humidi
  const midiDevices = createMemo(() => {
    try {
      // Only try to get devices if MIDI is enabled/has access
      if (midi().hasAccess) {
        return HuMIDI.getInputs();
      }
      return [];
    } catch {
      return []; // Return empty array if MIDI access not available
    }
  });

  const handleDeviceSelect = (device: MIDIInput) => {
    setSelectedDevice(device);
    setIsDropdownOpen(false);
  };

  const handleDisconnect = () => {
    toggleMidiEnabled();
    setSelectedDevice(null);
    setIsDropdownOpen(false);
  };

  const handleButtonClick = async () => {
    if (!midi().enabled) {
      // Toggle MIDI enabled - this will request access if needed
      toggleMidiEnabled();
      
      // After enabling, try to select the first device if available
      setTimeout(() => {
        const devices = midiDevices();
        if (devices.length > 0) {
          setSelectedDevice(devices[0]);
        }
      }, 100); // Small delay to allow access to be granted
    } else if (midi().enabled) {
      setIsDropdownOpen(!isDropdownOpen());
    }
  };

  return (
    <div class={styles.midiControl}>
      <Show
        when={midi().enabled}
        fallback={
          <Tooltip text="Enable MIDI">
            <button
              class={styles.midiButton}
              onClick={handleButtonClick}
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
                class={`${styles.midiButton} ${styles.active}`}
                onClick={() => setIsDropdownOpen(!isDropdownOpen())}
              >
                <UsbIcon width={14} height={14} />
                <span>{selectedDevice()?.name || 'MIDI'}</span>
                <Show when={midiDevices().length > 1}>
                  <ChevronDownIcon size={12} class={`${styles.chevron} ${isDropdownOpen() ? styles.chevronRotated : ''}`} />
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
                  class={`${styles.deviceItem} ${selectedDevice()?.id === device.id ? styles.selected : ''}`}
                  onClick={() => handleDeviceSelect(device)}
                >
                  <span>{device.name}</span>
                  <Show when={selectedDevice()?.id === device.id}>
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
