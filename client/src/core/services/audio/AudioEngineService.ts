import { InstrumentType, type Instrument } from '../../../audio/instruments/Instrument';
import { Service } from '../base/Service';
import { AudioCodecs } from './AudioCodecs';
import { type AudioEvent, type NoteStartEvent, type NoteEndEvent, type SustainStartEvent, type SustainEndEvent, AudioEventType } from './AudioEngine';
import type { INetworkService } from '../network/INetworkService';
import type * as Tone from 'tone';


// AudioEngine state enum
enum AudioEngineStatus {
  INACTIVE = 'inactive',
  STARTING = 'starting',
  ACTIVE = 'active',
}

// Reactive state interface for AudioEngine
interface AudioEngineState {
  status: AudioEngineStatus;
  volume: number;
  isMuted: boolean;
  activeInstruments: string[];
  lastError: string | null;
  isInitialized: boolean;
}

// Type for instrument module dynamic imports
interface InstrumentModule {
  default: new () => Instrument;
}

export class AudioEngineService extends Service<AudioEngineState> {
  private status: AudioEngineStatus = AudioEngineStatus.INACTIVE;
  private tone: typeof Tone | null = null;
  private instruments = new Map<string, Instrument>();
  private activeCallbacks: (() => void)[] = [];

  constructor(private networkService: INetworkService) {
    // Initialize reactive state
    super({
      status: AudioEngineStatus.INACTIVE,
      volume: 0.8,
      isMuted: false,
      activeInstruments: [],
      lastError: null,
      isInitialized: false,
    });

    // Register audio-related codecs
    this.setupAudioCodecs();
  }

  public async initialize(): Promise<void> {
    if (this.status !== AudioEngineStatus.INACTIVE) {
      return;
    }

    this.status = AudioEngineStatus.STARTING;
    this.setStates({
      status: AudioEngineStatus.STARTING,
      lastError: null
    });

    try {
      // Dynamic import of Tone.js
      this.tone = await import('tone');

      // Create optimized audio context
      this.tone.setContext(new this.tone.Context({
        latencyHint: 'interactive',
        lookAhead: 0,
      }));

      await this.tone.start();

      // Execute any queued callbacks
      this.activeCallbacks.forEach(cb => cb());
      this.activeCallbacks = [];
      this.status = AudioEngineStatus.ACTIVE;
      this.setStates({
        status: AudioEngineStatus.ACTIVE,
        lastError: null,
        isInitialized: true,
      });

      // Apply current volume and mute state to Tone.js
      this.setVolume(this.getState('volume'));
      if (this.getState('isMuted')) {
        this.tone.getDestination().mute = true;
      }
    } catch (error) {
      this.status = AudioEngineStatus.INACTIVE;
      this.setStates({
        status: AudioEngineStatus.INACTIVE,
        lastError: error instanceof Error ? error.message : 'Failed to initialize audio engine'
      });
      throw error;
    }
  }

  public isReady(): boolean {
    return this.status === AudioEngineStatus.ACTIVE;
  }

  public setVolume(volume: number): void {
    // Clamp volume between 0 and 1
    const clampedVolume = Math.max(0, Math.min(1, volume));
    this.setState('volume', clampedVolume);

    if (!this.isReady() || !this.tone) return;

    // Convert 0-1 range to decibels using logarithmic scale
    const dbVolume = clampedVolume === 0 ? -60 : 20 * Math.log10(clampedVolume);
    this.tone.getDestination().volume.value = dbVolume;
  }

  public mute(): void {
    this.setState('isMuted', true);
    if (!this.isReady() || !this.tone) return;
    this.tone.getDestination().mute = true;
  }

  public unmute(): void {
    this.setState('isMuted', false);
    if (!this.isReady() || !this.tone) return;
    this.tone.getDestination().mute = false;
  }

  public async registerInstrument(instrumentId: string, instrumentType: InstrumentType): Promise<void> {
    const executeRegistration = async (): Promise<void> => {
      // Remove existing instrument if any
      const existingInstrument = this.instruments.get(instrumentId);
      if (existingInstrument) {
        existingInstrument.releaseAll();
      }

      // Load new instrument
      const instrument = await this.loadInstrument(instrumentType);
      if (instrument) {
        this.instruments.set(instrumentId, instrument);
        this.updateActiveInstruments();
      }
    };

    if (this.isReady()) {
      await executeRegistration();
      return;
    }
    // Queue for when audio context is ready
    this.activeCallbacks.push(() => {
      executeRegistration().catch(error => {
        console.error(`Failed to register instrument ${instrumentId}:`, error);
      });
    });
  }

  public unregisterInstrument(instrumentId: string): void {
    const instrument = this.instruments.get(instrumentId);
    if (instrument) {
      instrument.releaseAll();
      this.instruments.delete(instrumentId);
      this.updateActiveInstruments();
    }
  }

  public scheduleEvent(event: AudioEvent): void {
    if (!this.isReady()) {
      console.warn('AudioEngine not ready, cannot schedule event:', event);
      return;
    }

    const instrument = this.instruments.get(event.instrumentId);
    if (!instrument) {
      console.warn('No instrument found for ID:', event.instrumentId);
      return;
    }

    switch (event.type) {
      case AudioEventType.NOTE_START:
        this.handleNoteStart(instrument, event);
        break;
      case AudioEventType.NOTE_END:
        this.handleNoteEnd(instrument, event);
        break;
      case AudioEventType.SUSTAIN_START:
        this.handleSustainStart(instrument, event);
        break;
      case AudioEventType.SUSTAIN_END:
        this.handleSustainEnd(instrument, event);
        break;
    }
  }

  private handleNoteStart(instrument: Instrument, event: NoteStartEvent): void {
    instrument.keyDown(event.midi, event.delay, event.velocity);
  }

  private handleNoteEnd(instrument: Instrument, event: NoteEndEvent): void {
    instrument.keyUp(event.midi, event.delay);
  }

  private handleSustainStart(instrument: Instrument, event: SustainStartEvent): void {
      instrument.sustainDown?.(event.delay);
  }

  private handleSustainEnd(instrument: Instrument, event: SustainEndEvent): void {
    instrument.sustainUp?.(event.delay);
  }

  private async loadInstrument(instrumentType: InstrumentType): Promise<Instrument | undefined> {
    // Dynamic import based on instrument type
    let module: InstrumentModule | undefined;

    switch (instrumentType) {
      case InstrumentType.PIANO:
        module = await import('../../../audio/instruments/Piano');
        break;
      case InstrumentType.SYNTH:
        module = await import('../../../audio/instruments/Synth');
        break;
      case InstrumentType.ELECTRIC_BASS:
        module = await import('../../../audio/instruments/ElectricBass');
        break;
    }

    if (!module) {
      console.error('Failed to load instrument module for type:', instrumentType);
      return undefined;
    }

    return new module.default();
  }

  private setupAudioCodecs(): void {
    // Register audio-specific codecs for optimized network transport
    this.networkService.registerCodec('KEY_DOWN', AudioCodecs.KeyDown);
    this.networkService.registerCodec('KEY_UP', AudioCodecs.KeyUp);
  }

  // Cleanup method
  public destroy(): void {
    // Release all instruments
    for (const instrument of this.instruments.values()) {
      instrument.releaseAll();
    }
    this.instruments.clear();

    // Reset internal state
    this.status = AudioEngineStatus.INACTIVE;
    this.activeCallbacks = [];
    this.tone = null;
    
    // Reset reactive state
    this.setStates({
      status: AudioEngineStatus.INACTIVE,
      volume: 0.8,
      isMuted: false,
      activeInstruments: [],
      isInitialized: false,
      lastError: null
    });
  }

  /**
   * Update the reactive state with current active instruments
   */
  private updateActiveInstruments(): void {
    const instrumentIds = Array.from(this.instruments.keys());
    this.setState('activeInstruments', instrumentIds);
  }

  /**
   * Get current volume (reactive state)
   */
  public getVolume(): number {
    return this.getState('volume');
  }

  /**
   * Check if audio is muted (reactive state)
   */
  public isMuted(): boolean {
    return this.getState('isMuted');
  }

  /**
   * Get current engine state (reactive state)
   */
  public getStatus(): AudioEngineStatus {
    return this.getState('status');
  }

  /**
   * Get list of active instrument IDs (reactive state)
   */
  public getActiveInstruments(): string[] {
    return this.getState('activeInstruments');
  }

  /**
   * Clear any error state
   */
  public clearError(): void {
    this.setState('lastError', null);
  }
}
