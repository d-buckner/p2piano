import Database from '../clients/Database';

/**
 * Database indexing strategy for p2piano.
 * 
 * This module ensures all required indexes are created for optimal performance.
 * Indexes are created automatically when collections are first accessed.
 */

/**
 * Session collection indexes for authentication and session management.
 */
export function createSessionIndexes() {
  const SessionCollection = Database.collection('session');
  
  // Primary lookup by sessionId (unique)
  SessionCollection.createIndex({ sessionId: 1 }, { unique: true });
  
  // TTL index for automatic session cleanup (24 hours)
  SessionCollection.createIndex({ lastActivity: 1 }, { expireAfterSeconds: 86400 });
  
  // Compound index for IP validation queries
  SessionCollection.createIndex({ sessionId: 1, ipAddress: 1 });
}

/**
 * Room collection indexes for room management and user operations.
 */
export function createRoomIndexes() {
  const RoomCollection = Database.collection('room');
  
  // Primary lookup by roomId (unique)
  RoomCollection.createIndex({ roomId: 1 }, { unique: true });
  
  // TTL index for automatic room cleanup (1.5 hours)
  RoomCollection.createIndex({ createdAt: 1 }, { expireAfterSeconds: 5400 });
  
  // Note: MongoDB will automatically create partial indexes when needed for queries
  // Complex query indexes can be added here when specific query patterns are identified
}

/**
 * Initialize all database indexes.
 * Call this during application startup.
 */
export function initializeIndexes() {
  createSessionIndexes();
  createRoomIndexes();
}

/**
 * Query optimization guidelines:
 * 
 * 1. Session queries:
 *    - Always query by sessionId first
 *    - Include ipAddress in validation queries for compound index usage
 * 
 * 2. Room queries:
 *    - Always query by roomId first
 *    - Use projection to limit returned fields when only specific data is needed
 * 
 * 3. User operations:
 *    - Use $set with dot notation for individual user updates instead of replacing entire users object
 *    - Use $unset for user removal instead of delete + $set
 */
