import Tooltip from '../../ui/Tooltip';
import { SettingsIcon } from '../icons';
import * as styles from './SettingsButton.css';


function SettingsButton() {
  const handleSettingsClick = () => {
    // Placeholder for settings functionality
    console.log('Settings clicked');
  };

  return (
    <Tooltip text="Settings">
      <button
        class={styles.settingsButton}
        onClick={handleSettingsClick}
      >
        <SettingsIcon size={14} />
      </button>
    </Tooltip>
  );
}

export default SettingsButton;
