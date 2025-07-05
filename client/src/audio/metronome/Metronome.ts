import {getTransport} from 'tone';
import { store } from '../../app/store';
import MetronomeClient from '../../clients/MetronomeClient';
import { TICK_TYPE } from '../../constants/metronome';
import { selectMaxLatency } from '../../selectors/connectionSelectors';
import { selectMetronome } from '../../selectors/metronomeSelectors';
import ClickSampler from './ClickSampler';


class Metronome {
  private static currentBeat = 0;
  private static loopId: number | null = null;

  private constructor() { }

  static start() {
    this.stop(); // Stop any existing metronome
    this.currentBeat = 0;
    
    // Broadcast start to other clients
    MetronomeClient.start();
    
    // Set transport BPM
    const bpm = selectMetronome(store).bpm;
    getTransport().bpm.value = bpm;
    
    // Schedule repeat using quarter notes (will follow Transport BPM)
    this.loopId = getTransport().scheduleRepeat(() => {
      this.playBeat();
    }, '4n', 0);
    
    // Start the transport
    getTransport().start();
  }

  static stop() {
    const transport = getTransport();
    if (this.loopId !== null) {
      transport.clear(this.loopId);
      this.loopId = null;
    }
    
    transport.stop();
    // Broadcast stop to other clients
    MetronomeClient.stop();
  }

  static restart() {
    if (selectMetronome(store).active) {
      this.start();
    }
  }

  private static playBeat() {
    const metronome = selectMetronome(store);
    const maxLatency = selectMaxLatency(store);
    
    // Update Transport BPM in case it changed
    getTransport().bpm.value = metronome.bpm;
    
    // Determine tick type
    const tickType = this.currentBeat === 0 ? TICK_TYPE.HI : TICK_TYPE.LOW;
    
    // Broadcast to other clients immediately
    MetronomeClient.tick(tickType);
    
    // Play locally with max latency delay (leader delays their own audio)
    if (tickType === TICK_TYPE.HI) {
      ClickSampler.high(maxLatency);
    } else {
      ClickSampler.low(maxLatency);
    }
    
    this.currentBeat = (this.currentBeat + 1) % metronome.beatsPerMeasure;
  }
}

export default Metronome;