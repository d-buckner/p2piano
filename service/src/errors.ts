/**
 * Custom error classes for consistent error handling across the application.
 * 
 * Provides standardized error types with proper error codes and messages
 * for different failure scenarios in HTTP and WebSocket contexts.
 */


// Base application error with standard properties.
export abstract class AppError extends Error {
  abstract readonly code: string;
  abstract readonly statusCode: number;
  
  constructor(message: string, public readonly context?: Record<string, any>) {
    super(message);
    this.name = this.constructor.name;
    
    // Ensure proper stack trace in V8
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, this.constructor);
    }
  }
}

/**
 * Room not found error.
 */
export class RoomNotFoundError extends AppError {
  readonly code = 'ROOM_NOT_FOUND';
  readonly statusCode = 404;
  
  constructor(message: string, context?: Record<string, any>) {
    super(message, context);
  }
}

/**
 * Session not found error.
 */
export class SessionNotFoundError extends AppError {
  readonly code = 'SESSION_NOT_FOUND';
  readonly statusCode = 404;
  
  constructor(message: string, context?: Record<string, any>) {
    super(message, context);
  }
}

/**
 * Authentication-related errors.
 */
export class AuthenticationError extends AppError {
  readonly code = 'AUTH_ERROR';
  readonly statusCode = 401;
  
  constructor(message = 'Authentication failed', context?: Record<string, any>) {
    super(message, context);
  }
}

/**
 * Room operation errors.
 */
export class RoomError extends AppError {
  readonly code = 'ROOM_ERROR';
  readonly statusCode = 400;
  
  constructor(message: string, context?: Record<string, any>) {
    super(message, context);
  }
}

/**
 * WebSocket connection errors.
 */
export class WebSocketError extends AppError {
  readonly code = 'WS_ERROR';
  readonly statusCode = 400;
  
  constructor(message: string, context?: Record<string, any>) {
    super(message, context);
  }
}

/**
 * Database operation errors.
 */
export class DatabaseError extends AppError {
  readonly code = 'DATABASE_ERROR';
  readonly statusCode = 500;
  
  constructor(message = 'Database operation failed', context?: Record<string, any>) {
    super(message, context);
  }
}
