/**
 * Utilities for safe error handling and message extraction
 */

/**
 * Safely extracts error message from unknown error type
 */
export function getErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }
  return String(error);
}

/**
 * Safely extracts error stack from unknown error type
 */
export function getErrorStack(error: unknown): string | undefined {
  if (error instanceof Error) {
    return error.stack;
  }
  return undefined;
}

/**
 * Creates a safe error info object from unknown error
 */
export function getErrorInfo(error: unknown): { message: string; stack?: string } {
  return {
    message: getErrorMessage(error),
    stack: getErrorStack(error)
  };
}