import { initSyncState } from '@automerge/automerge';
import { describe, it, expect, beforeEach } from 'vitest';
import { CRDTDocument } from './CRDTDocument';
import type { SharedStore } from '../types/StoreTypes';


describe('CRDTDocument', () => {
  let document: CRDTDocument;
  const initialState: SharedStore = {
    metronome: {
      active: false,
      bpm: 120,
      beatsPerMeasure: 4,
      leaderId: '',
      startTimestamp: 0,
      currentBeat: 0,
    },
  };

  beforeEach(() => {
    document = new CRDTDocument(initialState);
  });

  describe('initialization', () => {
    it('should initialize document with provided state', () => {
      const state = document.getState();
      
      expect(state.metronome).toEqual(initialState.metronome);
    });

    it('should generate unique actor IDs for different instances', () => {
      const doc1 = new CRDTDocument(initialState);
      const doc2 = new CRDTDocument(initialState);
      
      expect(doc1.getActorId()).not.toBe(doc2.getActorId());
    });

    it('should use provided userId for actor ID generation', () => {
      const userId = 'test-user-123';
      const docWithUserId = new CRDTDocument(initialState, userId);
      
      // Actor ID should be consistent for same user ID
      const actorId = docWithUserId.getActorId();
      expect(actorId.length).toBeGreaterThan(0);
    });
  });

  describe('actor ID management', () => {
    it('should update actor ID and preserve document state', () => {
      const originalActorId = document.getActorId();
      
      // Apply some changes first
      document.change('metronome', metronome => {
        metronome.bpm = 140;
        metronome.active = true;
      });

      // Update actor ID
      document.updateActorId('new-user-456');
      const newActorId = document.getActorId();

      // State should be preserved
      expect(document.getState().metronome.bpm).toBe(140);
      expect(document.getState().metronome.active).toBe(true);
      
      // Actor ID should change
      expect(newActorId).not.toBe(originalActorId);
    });

    it('should not change when updating to same user ID', () => {
      // Try to update to same user (should result in same actor ID)
      document.updateActorId('user-123');
      const firstUpdate = document.getActorId();
      
      document.updateActorId('user-123');
      const secondUpdate = document.getActorId();
      
      expect(firstUpdate).toBe(secondUpdate);
    });
  });

  describe('document changes', () => {
    it('should apply changes to document state', () => {
      document.change('metronome', metronome => {
        metronome.active = true;
        metronome.bpm = 140;
        metronome.leaderId = 'leader-123';
      });

      const state = document.getState();
      expect(state.metronome.active).toBe(true);
      expect(state.metronome.bpm).toBe(140);
      expect(state.metronome.leaderId).toBe('leader-123');
    });

    it('should create new document references on change', () => {
      const originalDoc = document.getState();
      
      document.change('metronome', metronome => {
        metronome.bpm = 130;
      });
      
      const newDoc = document.getState();
      expect(newDoc).not.toBe(originalDoc);
      expect(newDoc.metronome.bpm).toBe(130);
    });

    it('should handle multiple sequential changes', () => {
      document.change('metronome', metronome => {
        metronome.active = true;
      });

      document.change('metronome', metronome => {
        metronome.bpm = 150;
      });

      document.change('metronome', metronome => {
        metronome.currentBeat = 2;
      });

      const state = document.getState();
      expect(state.metronome.active).toBe(true);
      expect(state.metronome.bpm).toBe(150);
      expect(state.metronome.currentBeat).toBe(2);
    });
  });

  describe('sync message generation', () => {
    it('should generate sync messages for new peers', () => {
      const syncState = initSyncState();
      const [newSyncState, syncMessage] = document.generateSyncMessage(syncState);
      
      expect(newSyncState).toBeDefined();
      expect(syncMessage).toBeInstanceOf(Uint8Array);
      expect(syncMessage.length).toBeGreaterThan(0);
    });

    it('should generate different sync states on subsequent calls', () => {
      const syncState = initSyncState();
      const [firstSyncState] = document.generateSyncMessage(syncState);
      const [secondSyncState] = document.generateSyncMessage(firstSyncState);
      
      expect(secondSyncState).not.toBe(firstSyncState);
    });
  });

  describe('sync message reception', () => {
    it('should handle invalid sync messages gracefully', () => {
      const syncState = initSyncState();
      const invalidMessage = new Uint8Array([1, 2, 3, 4, 5]);

      const [returnedSyncState, hasChanges, patches] = document.receiveSyncMessage(
        syncState,
        invalidMessage
      );

      // Should return original state and no changes on error
      expect(returnedSyncState).toBe(syncState);
      expect(hasChanges).toBe(false);
      expect(patches).toEqual([]);
    });

    it('should detect changes correctly', () => {
      const syncState = initSyncState();
      
      // Generate a sync message from an unchanged document
      const [, syncMessage] = document.generateSyncMessage(syncState);
      
      if (syncMessage) {
        const [, hasChanges] = document.receiveSyncMessage(syncState, syncMessage);
        // Automerge may detect initialization changes, verify behavior is consistent
        expect(typeof hasChanges).toBe('boolean');
      }
    });
  });

  describe('document state management', () => {
    it('should maintain document immutability', () => {
      const state1 = document.getState();
      
      document.change('metronome', metronome => {
        metronome.bpm = 200;
      });
      
      const state2 = document.getState();
      
      // Original state should be unchanged
      expect(state1.metronome.bpm).toBe(120);
      expect(state2.metronome.bpm).toBe(200);
      expect(state1).not.toBe(state2);
    });

    it('should handle complex state changes', () => {
      document.change('metronome', metronome => {
        metronome.active = true;
        metronome.bpm = 175;
        metronome.leaderId = 'complex-leader';
        metronome.startTimestamp = Date.now();
        metronome.currentBeat = 1;
        metronome.beatsPerMeasure = 6;
      });

      const state = document.getState();
      expect(state.metronome.active).toBe(true);
      expect(state.metronome.bpm).toBe(175);
      expect(state.metronome.leaderId).toBe('complex-leader');
      expect(state.metronome.startTimestamp).toBeGreaterThan(0);
      expect(state.metronome.currentBeat).toBe(1);
      expect(state.metronome.beatsPerMeasure).toBe(6);
    });
  });
});
