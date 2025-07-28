import { createSignal } from 'solid-js';
import { ChevronDownIcon } from '../icons';
import { useAppSelector } from '../../../app/hooks';
import { updateInstrument } from '../../../actions/WorkspaceActions';
import { selectMyUser } from '../../../selectors/workspaceSelectors';
import { InstrumentType } from '../../../audio/instruments/Instrument';
import Dropdown from '../../ui/Dropdown';
import * as styles from './InstrumentSelector.css';

function InstrumentSelector() {
  const myUser = useAppSelector(selectMyUser);
  const [isDropdownOpen, setIsDropdownOpen] = createSignal(false);
  
  const instruments = [
    { value: InstrumentType.PIANO, label: 'Piano', icon: '🎹' },
    { value: InstrumentType.SYNTH, label: 'Synth', icon: '🎛️' },
    { value: InstrumentType.ELECTRIC_BASS, label: 'Electric Bass', icon: '🎸' }
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
          {instruments.map(inst => (
            <button
              class={`${styles.instrumentItem} ${currentInstrument().value === inst.value ? styles.selected : ''}`}
              onClick={() => handleInstrumentSelect(inst.value)}
            >
              <span class={styles.icon}>{inst.icon}</span>
              <span>{inst.label}</span>
            </button>
          ))}
        </div>
      </Dropdown>
    </div>
  );
}

export default InstrumentSelector;