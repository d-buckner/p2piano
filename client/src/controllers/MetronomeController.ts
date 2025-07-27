import { createEffect, on } from 'solid-js';
import { store } from '../app/store';
import AudioManager from '../audio/AudioManager';
import Logger from '../lib/Logger';
import { selectMetronome } from '../selectors/metronomeSelectors';
import { selectMyUser } from '../selectors/workspaceSelectors';
import type Metronome from '../audio/metronome/Metronome';

/**
 * Controls the audio metronome based on CRDT state changes.
 * Only the leader runs the audio metronome.
 */
export class MetronomeController {
  private metronome: typeof Metronome | null = null;
  private initialized = false;

  async initialize() {
    // Load Metronome module and preload ClickSampler when audio is active
    AudioManager.whenActive(async () => {
      if (this.initialized) return;
      
      const [metronomeModule, clickSamplerModule] = await Promise.all([
        import('../audio/metronome/Metronome'),
        import('../audio/metronome/ClickSampler')
      ]);
      
      this.metronome = metronomeModule.default;
      
      // Preload the ClickSampler so it's ready for the first beat
      await clickSamplerModule.default.initialize();
      this.initialized = true;
    });

    // Watch for leadership changes
    createEffect(on(
      () => [selectMetronome(store).active, selectMetronome(store).leaderId, selectMyUser(store)?.userId] as const,
      ([active, leaderId, myUserId], prev) => {
        if (!this.metronome || !myUserId) return;
        
        const [prevActive, prevLeaderId] = prev || [false, undefined, undefined];
        const isLeader = leaderId === myUserId;
        const wasLeader = prevLeaderId === myUserId;
        
        Logger.DEBUG('[CRDT] MetronomeController state change:', { active, isLeader, wasLeader, prevActive });
        
        // User just became leader and metronome is active
        if (active && isLeader && (!wasLeader || !prevActive)) {
          Logger.INFO('[CRDT] MetronomeController starting audio metronome');
          this.metronome.start();
        }
        
        // User stopped being leader or metronome stopped
        if (!active || !isLeader) {
          if (wasLeader) {
            Logger.INFO('[CRDT] MetronomeController stopping audio metronome');
            this.metronome.stop();
          }
        }
      }
    ));
  }
}

// Singleton instance
export const metronomeController = new MetronomeController();
