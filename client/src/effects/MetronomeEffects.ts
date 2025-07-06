import { createEffect, on } from 'solid-js';
import { store } from '../app/store';
import AudioManager from '../audio/AudioManager';
import { selectMetronome } from '../selectors/metronomeSelectors';
import { selectMyUser } from '../selectors/workspaceSelectors';
import type Metronome from '../audio/metronome/Metronome';


let MetronomeClass: typeof Metronome | null = null;

export function initMetronomeEffects() {
  // Load Metronome module and preload ClickSampler when audio is active
  AudioManager.whenActive(async () => {
    const [metronomeModule, clickSamplerModule] = await Promise.all([
      import('../audio/metronome/Metronome'),
      import('../audio/metronome/ClickSampler')
    ]);
    
    MetronomeClass = metronomeModule.default;
    
    // Preload the ClickSampler so it's ready for the first beat
    await clickSamplerModule.default.initialize();
  });

  // Handle when user becomes/stops being leader
  createEffect(on(
    () => [selectMetronome(store).active, selectMetronome(store).leaderId, selectMyUser(store)?.userId] as const,
    ([active, leaderId, myUserId], prev) => {
      if (!MetronomeClass || !myUserId) return;
      
      const [prevActive, prevLeaderId] = prev || [false, undefined, undefined];
      const isLeader = leaderId === myUserId;
      const wasLeader = prevLeaderId === myUserId;
      
      // User just became leader and metronome is active
      if (active && isLeader && (!wasLeader || !prevActive)) {
        // Broadcast start and run Metronome class
        import('../clients/MetronomeClient').then(({ default: MetronomeClient }) => {
          MetronomeClient.start();
        });
        MetronomeClass.start();
      }
      
      // User stopped being leader or metronome stopped
      if (!active || !isLeader) {
        if (wasLeader && prevActive) {
          // Was leader, now stopping - broadcast stop
          import('../clients/MetronomeClient').then(({ default: MetronomeClient }) => {
            MetronomeClient.stop();
          });
        }
        if (wasLeader) {
          // Stop running Metronome class
          MetronomeClass.stop();
        }
      }
    }
  ));

  // Handle BPM changes - only leader broadcasts
  createEffect(on(
    () => [selectMetronome(store).bpm, selectMetronome(store).leaderId, selectMyUser(store)?.userId] as const,
    ([bpm, leaderId, myUserId], prev) => {
      if (!prev || !myUserId) return; // Skip initial run
      
      const [prevBpm] = prev;
      const isLeader = leaderId === myUserId;
      
      // Only broadcast if you're the leader and BPM actually changed
      if (isLeader && bpm !== prevBpm) {
        import('../clients/MetronomeClient').then(({ default: MetronomeClient }) => {
          MetronomeClient.setBpm(bpm);
        });
      }
    }
  ));
}
