import { expect } from 'vitest';
import type { Room } from '../lib/workspaceTypes';
import type { Mock } from 'vitest';

/**
 * Custom assertion helpers for domain-specific testing
 */

/**
 * Assert that a MIDI note value is valid (0-127)
 */
export const expectValidMidiNote = (note: number): void => {
  expect(note).toBeGreaterThanOrEqual(0);
  expect(note).toBeLessThanOrEqual(127);
  expect(Number.isInteger(note)).toBe(true);
};

/**
 * Assert that a velocity value is valid (0-127)
 */
export const expectValidVelocity = (velocity: number): void => {
  expect(velocity).toBeGreaterThanOrEqual(0);
  expect(velocity).toBeLessThanOrEqual(127);
};

/**
 * Assert that a user ID follows expected format
 */
export const expectValidUserId = (userId: string): void => {
  expect(userId).toBeTruthy();
  expect(typeof userId).toBe('string');
  expect(userId.length).toBeGreaterThan(0);
};

/**
 * Assert that a room object has required properties
 */
export const expectValidRoom = (room: Room): void => {
  expect(room).toBeDefined();
  expect(room).toHaveProperty('roomId');
  expect(room).toHaveProperty('users');
  expect(typeof room.roomId).toBe('string');
  if (room.users) {
    expect(typeof room.users).toBe('object');
  }
};

/**
 * Assert that a mock function was called with specific MIDI parameters
 */
export const expectMidiCall = (
  mockFn: Mock,
  note: number,
  velocity?: number,
  userId?: string
): void => {
  if (velocity !== undefined && userId !== undefined) {
    expect(mockFn).toHaveBeenCalledWith(note, velocity, userId);
  } else if (velocity !== undefined) {
    expect(mockFn).toHaveBeenCalledWith(note, velocity);
  } else if (userId !== undefined) {
    expect(mockFn).toHaveBeenCalledWith(note, userId);
  } else {
    expect(mockFn).toHaveBeenCalledWith(note);
  }
};

/**
 * Assert that network call was made with correct parameters
 */
export const expectNetworkCall = (
  mockFetch: Mock,
  url: string,
  options?: RequestInit
): void => {
  if (options) {
    expect(mockFetch).toHaveBeenCalledWith(url, expect.objectContaining(options));
  } else {
    expect(mockFetch).toHaveBeenCalledWith(url, expect.any(Object));
  }
};
