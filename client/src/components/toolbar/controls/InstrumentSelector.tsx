import { createSignal, For } from 'solid-js';
import { updateInstrument } from '../../../actions/WorkspaceActions';
import { useAppSelector } from '../../../app/hooks';
import { InstrumentType } from '../../../audio/instruments/Instrument';
import { selectMyUser } from '../../../selectors/workspaceSelectors';
import Dropdown from '../../ui/Dropdown';
import { ChevronDownIcon } from '../icons';
import * as styles from './InstrumentSelector.css';


function InstrumentSelector() {
  const myUser = useAppSelector(selectMyUser);
  const [isDropdownOpen, setIsDropdownOpen] = createSignal(false);
  
  const instruments = [
    { value: InstrumentType.PIANO, label: 'Piano', icon: '🎹' },
    { value: InstrumentType.SYNTH, label: 'Synth', icon: '🎛️' },
    { value: InstrumentType.ELECTRIC_BASS, label: 'Bass', icon: '🎸' }
  ];

  const currentInstrument = () => {
    const userInstrument = myUser()?.instrument;
    return instruments.find(i => i.value === userInstrument) || instruments[0];
  };

  const handleInstrumentSelect = (instrumentType: InstrumentType) => {
    updateInstrument(instrumentType);
    setIsDropdownOpen(false);
  };

  return (
    <div class={styles.instrumentSelector}>
      <Dropdown
        open={isDropdownOpen()}
        onOpenChange={setIsDropdownOpen}
        trigger={
          <button
            class={`${styles.selectorButton} ${isDropdownOpen() ? styles.open : ''}`}
          >
            <span class={styles.icon}>{currentInstrument()?.icon}</span>
            <span>{currentInstrument()?.label}</span>
            <ChevronDownIcon size={12} class={`${styles.chevron} ${isDropdownOpen() ? styles.chevronRotated : ''}`} />
          </button>
        }
      >
        <div class={styles.dropdownContent}>
          <For each={instruments}>{inst => (
            <button
              class={`${styles.instrumentItem} ${currentInstrument().value === inst.value ? styles.selected : ''}`}
              onClick={() => handleInstrumentSelect(inst.value)}
            >
              <span class={styles.icon}>{inst.icon}</span>
              <span>{inst.label}</span>
            </button>
          )}</For>
        </div>
      </Dropdown>
    </div>
  );
}

export default InstrumentSelector;
