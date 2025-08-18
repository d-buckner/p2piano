import { describe, it, expect, vi, beforeEach } from 'vitest';
import { setMidiStore } from '../stores/MidiStore';
import { disableMidi, setMidiInputs } from './MidiActions';
import type { DeviceMetadata } from 'humidi';


// Mock the store
let mockMidiStore: {
  inputs: Record<string, DeviceMetadata>;
  enabled: boolean;
  hasAccess: boolean;
  selectedInputId: string | null;
};

vi.mock('../stores/MidiStore', () => ({
  setMidiStore: vi.fn(),
  get midiStore() {
    return mockMidiStore;
  },
}));

const mockSetMidiStore = vi.mocked(setMidiStore);

describe('MidiActions', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockMidiStore = {
      inputs: {},
      enabled: false,
      hasAccess: false,
      selectedInputId: null,
    };
  });

  describe('disableMidi', () => {
    it('should disable MIDI', () => {
      disableMidi();
      
      expect(mockSetMidiStore).toHaveBeenCalledWith('enabled', false);
    });
  });

  describe('setMidiInputs', () => {
    const mockDevice1: DeviceMetadata = {
      id: 'device1',
      name: 'Piano 1',
      manufacturer: 'Test',
      state: 'connected',
      enabled: true,
    };
    
    const mockDevice2: DeviceMetadata = {
      id: 'device2', 
      name: 'Piano 2',
      manufacturer: 'Test',
      state: 'connected',
      enabled: true,
    };

    it('should convert array to record and update store', () => {
      setMidiInputs([mockDevice1, mockDevice2]);
      
      expect(mockSetMidiStore).toHaveBeenCalledWith('inputs', {
        device1: mockDevice1,
        device2: mockDevice2,
      });
    });

    it('should auto-select first device when none selected', () => {
      mockMidiStore.selectedInputId = null;
      
      setMidiInputs([mockDevice1, mockDevice2]);
      
      expect(mockSetMidiStore).toHaveBeenCalledWith('selectedInputId', 'device1');
    });

    it('should not change selection when device already selected and still available', () => {
      mockMidiStore.selectedInputId = 'device1';
      
      setMidiInputs([mockDevice1, mockDevice2]);
      
      expect(mockSetMidiStore).toHaveBeenCalledWith('selectedInputId', 'device1');
    });

    it('should auto-select new device when current device disconnects', () => {
      mockMidiStore.selectedInputId = 'device1';
      
      setMidiInputs([mockDevice2]); // device1 no longer available, device2 becomes selected
      
      expect(mockSetMidiStore).toHaveBeenCalledWith('selectedInputId', 'device2');
    });

    it('should clear selection when no devices available', () => {
      mockMidiStore.selectedInputId = 'device1';
      
      setMidiInputs([]);
      
      expect(mockSetMidiStore).toHaveBeenCalledWith('inputs', {});
      expect(mockSetMidiStore).toHaveBeenCalledWith('selectedInputId', null);
    });

    it('should handle single device correctly', () => {
      mockMidiStore.selectedInputId = null;
      
      setMidiInputs([mockDevice1]);
      
      expect(mockSetMidiStore).toHaveBeenCalledWith('inputs', { device1: mockDevice1 });
      expect(mockSetMidiStore).toHaveBeenCalledWith('selectedInputId', 'device1');
    });

    it('should preserve selection when device order changes', () => {
      mockMidiStore.selectedInputId = 'device2';
      
      // Same devices, different order - selection should remain stable
      setMidiInputs([mockDevice2, mockDevice1]);
      
      expect(mockSetMidiStore).toHaveBeenCalledWith('selectedInputId', 'device2');
    });

    it('should auto-select first device when selected device disconnects from multiple', () => {
      const mockDevice3: DeviceMetadata = {
        id: 'device3',
        name: 'Piano 3',
        manufacturer: 'Test',
        state: 'connected',
        enabled: true,
      };
      
      mockMidiStore.selectedInputId = 'device2';
      
      // device2 disconnects, device1 and device3 remain
      setMidiInputs([mockDevice1, mockDevice3]);
      
      expect(mockSetMidiStore).toHaveBeenCalledWith('selectedInputId', 'device1');
    });
  });
});
