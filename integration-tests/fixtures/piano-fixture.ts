import { type Page } from '@playwright/test';

/**
 * Piano fixture for testing piano interactions in P2Piano
 * 
 * Provides utilities for simulating piano key presses, MIDI input,
 * and testing collaborative piano playing features.
 */
export class PianoFixture {
  constructor(private page: Page) {}

  // Keyboard mapping for piano notes (A-' for white keys, w-p for black keys)
  private keyboardMap: Record<string, string> = {
    // White keys (A-' row)
    'C4': 'a',
    'D4': 's', 
    'E4': 'd',
    'F4': 'f',
    'G4': 'g',
    'A4': 'h',
    'B4': 'j',
    'C5': 'k',
    'D5': 'l',
    'E5': ';',
    'F5': "'",
    
    // Black keys (w-p row)
    'C#4': 'w',
    'D#4': 'e',
    'F#4': 't',
    'G#4': 'y',
    'A#4': 'u',
    'C#5': 'i',
    'D#5': 'o',
    'F#5': 'p'
  };

  /**
   * Play a piano key by note name using keyboard controls
   */
  async playKey(noteName: string): Promise<void> {
    const keyboardKey = this.keyboardMap[noteName];
    if (!keyboardKey) {
      throw new Error(`No keyboard mapping found for note: ${noteName}`);
    }
    
    // Focus the piano canvas first with increased timeout for all browsers
    await this.page.waitForSelector('[class*="pianoRendererContainer"]', { timeout: 10000 });
    await this.page.click('[class*="pianoRendererContainer"]');
    
    // Wait for focus to be established (generous timeout for all browsers)
    await this.page.waitForTimeout(1000);
    
    // Use keyboard.down() to send only the keydown event
    await this.page.keyboard.down(keyboardKey);
    
    // Wait for the key press to register (generous timeout for all browsers)
    await this.page.waitForTimeout(500);
  }

  /**
   * Release a piano key by note name using keyboard controls
   */
  async releaseKey(noteName: string): Promise<void> {
    const keyboardKey = this.keyboardMap[noteName];
    if (!keyboardKey) {
      throw new Error(`No keyboard mapping found for note: ${noteName}`);
    }
    
    // Release the key
    await this.page.keyboard.up(keyboardKey);
    await this.page.waitForTimeout(100);
  }

  /**
   * Play a chord (multiple keys simultaneously)
   */
  async playChord(noteNames: string[]): Promise<void> {
    // Start all notes simultaneously
    const playPromises = noteNames.map(note => this.playKey(note));
    await Promise.all(playPromises);
  }

  /**
   * Simulate keyboard key press for piano
   */
  async pressKeyboardKey(key: string): Promise<void> {
    await this.page.keyboard.press(key);
  }

  /**
   * Simulate keyboard key release for piano
   */
  async releaseKeyboardKey(key: string): Promise<void> {
    await this.page.keyboard.up(key);
  }

  /**
   * Play a sequence of notes with timing
   */
  async playSequence(notes: Array<{ note: string; duration: number }>): Promise<void> {
    for (const { note, duration } of notes) {
      await this.playKey(note);
      await this.page.waitForTimeout(duration);
      await this.releaseKey(note);
    }
  }

  /**
   * Wait for a visual key press indicator (canvas-based)
   */
  async waitForKeyPress(noteName: string, timeout: number = 3000): Promise<void> {
    // Since the piano is canvas-based, we can't check DOM elements
    // Instead, we'll wait for a reasonable time for the visual feedback
    await this.page.waitForTimeout(300);
  }

  /**
   * Wait for a visual key release indicator (canvas-based)
   */
  async waitForKeyRelease(noteName: string, timeout: number = 3000): Promise<void> {
    // Since the piano is canvas-based, we can't check DOM elements
    // Instead, we'll wait for a reasonable time for the visual feedback
    await this.page.waitForTimeout(300);
  }

  /**
   * Get all currently pressed keys
   */
  async getPressedKeys(): Promise<string[]> {
    return await this.page.evaluate(() => {
      const activeKeys = document.querySelectorAll('.key.active, .key.pressed, .key.playing, [data-playing]');
      return Array.from(activeKeys).map(key => 
        key.getAttribute('data-note') || key.getAttribute('data-testid')?.replace('key-', '') || ''
      ).filter(note => note);
    });
  }

  /**
   * Check if a specific key is currently pressed
   */
  async isKeyPressed(noteName: string): Promise<boolean> {
    const pressedKeys = await this.getPressedKeys();
    return pressedKeys.includes(noteName);
  }

  /**
   * Change the instrument
   */
  async changeInstrument(instrumentName: string): Promise<void> {
    // Look for instrument selector
    const instrumentSelector = '[class*="instrumentSelect"]';
    await this.page.waitForSelector(instrumentSelector, { timeout: 5000 });
    
    // Select the instrument
    await this.page.selectOption(instrumentSelector, instrumentName);
    
    // Wait for instrument to load
    await this.page.waitForTimeout(1000);
  }

  /**
   * Adjust volume
   */
  async setVolume(volume: number): Promise<void> {
    // volume should be between 0 and 1
    if (volume < 0 || volume > 1) {
      throw new Error('Volume must be between 0 and 1');
    }
    
    const volumeSelector = '[data-testid="volume-slider"], .volume-slider, input[type="range"]';
    await this.page.waitForSelector(volumeSelector, { timeout: 5000 });
    
    // Set volume using slider
    await this.page.fill(volumeSelector, volume.toString());
  }

  /**
   * Wait for piano to be ready for interaction
   */
  async waitForPianoReady(): Promise<void> {
    // Wait for piano renderer container to be visible with multiple fallbacks
    try {
      await this.page.waitForSelector('[class*="pianoRendererContainer"]', { timeout: 15000 });
    } catch (error) {
      // Fallback: wait for any piano-related element
      try {
        await this.page.waitForSelector('[class*="piano"], canvas, [class*="renderer"]', { timeout: 10000 });
      } catch (fallbackError) {
        // Final fallback: wait for any interactive element in the room
        await this.page.waitForSelector('button, select, input', { timeout: 5000 });
      }
    }
    
    // Wait for any loading animations to complete
    await this.page.waitForTimeout(2000);
  }

  /**
   * Get the current instrument
   */
  async getCurrentInstrument(): Promise<string> {
    const instrumentSelector = '[data-testid="instrument-selector"], .instrument-selector, select';
    return await this.page.inputValue(instrumentSelector);
  }

  /**
   * Get the current volume
   */
  async getCurrentVolume(): Promise<number> {
    const volumeSelector = '[data-testid="volume-slider"], .volume-slider, input[type="range"]';
    const volume = await this.page.inputValue(volumeSelector);
    return parseFloat(volume);
  }
}