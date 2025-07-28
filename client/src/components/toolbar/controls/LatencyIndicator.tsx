import { useAppSelector } from '../../../app/hooks';
import { selectMinLatency } from '../../../selectors/connectionSelectors';
import Tooltip from '../../ui/Tooltip';
import { WifiIcon } from '../icons';
import * as styles from './LatencyIndicator.css';


function LatencyIndicator() {
  const latency = useAppSelector(selectMinLatency);
  const connectionQuality = latency() < 20 ? 'good' : latency() < 50 ? 'fair' : 'poor';
  
  const qualityClass = {
    good: styles.good,
    fair: styles.fair,
    poor: styles.poor
  }[connectionQuality];

  return (
    <Tooltip text="Connection Quality">
      <div class={styles.latencyIndicator}>
        <WifiIcon size={12} class={qualityClass} />
        <span class={styles.latencyValue}>{Math.floor(latency())}ms</span>
      </div>
    </Tooltip>
  );
}

export default LatencyIndicator;
