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
    this.loopId = getTransport().scheduleRepeat((time) => {
      this.handleBeat(time);
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

  private static handleBeat(time: number) {
    const maxLatency = selectMaxLatency(store);
    // Determine tick type
    const tickType = this.currentBeat === 0 ? TICK_TYPE.HI : TICK_TYPE.LOW;
    // Schedule audio at precise time with latency compensation using Tone.js scheduler
    // This avoids JS timing dependency by letting Tone.js handle the exact timing
    if (tickType === TICK_TYPE.HI) {
      ClickSampler.scheduleHigh(time + maxLatency / 1000);
    } else {
      ClickSampler.scheduleLow(time + maxLatency / 1000);
    }
    // Broadcast to other clients immediately
    MetronomeClient.tick(tickType);

    const metronome = selectMetronome(store);
    // Update Transport BPM in case it changed
    getTransport().bpm.value = metronome.bpm;
    
    this.currentBeat = (this.currentBeat + 1) % metronome.beatsPerMeasure;
  }
}

export default Metronome;
