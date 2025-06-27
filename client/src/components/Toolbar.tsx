import HuMIDI from 'humidi';
import Icon from './Icon';
import * as styles from './Toolbar.css';


function Toolbar() {
  return (
    <button
      class={styles.toolbarButton}
      onClick={HuMIDI.requestAccess}
    >
      <Icon name='usb-cable' />
    </button>
  );
}

export default Toolbar;
