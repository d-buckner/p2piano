/**
 * Utility functions for converting between user IDs and Automerge actor IDs.
 * Automerge requires actor IDs to be hex strings.
 */

/**
 * Generate a random hex actor ID for temporary use
 */
export function generateRandomHexActorId(): string {
  // Generate 16 random bytes (32 hex characters)
  const bytes = new Uint8Array(16);
  crypto.getRandomValues(bytes);
  return Array.from(bytes, byte => byte.toString(16).padStart(2, '0')).join('');
}

/**
 * Convert a user ID to a deterministic hex actor ID
 */
export function toHex(userId: string): string {
  // Create a simple hash of the user ID and convert to hex
  let hash = 0;
  for (let i = 0; i < userId.length; i++) {
    const char = userId.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  
  // Convert to positive number and pad to ensure we have enough hex digits
  const positiveHash = Math.abs(hash);
  const hexHash = positiveHash.toString(16).padStart(8, '0');
  
  // Pad to 32 characters (16 bytes) by repeating the hash
  return (hexHash + hexHash + hexHash + hexHash).substring(0, 32);
}

