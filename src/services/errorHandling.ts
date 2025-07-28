import { interceptAPIError } from './apiErrorInterceptor';

import type { APIError } from './apiErrorInterceptor';
import type { AppError } from '../types/errors';

/**
 * Centralized error handler for managing application errors
 * Provides error tracking, listener notifications, and error reporting
 */
export class ErrorHandler {
  private static errors: AppError[] = [];
  private static listeners: ((error: AppError) => void)[] = [];

  /**
   * Adds a new error to the error handler and notifies listeners
   *
   * @param {Omit<AppError, 'id' | 'timestamp'>} error - The error to add (without id and timestamp)
   * @returns {string} The unique error ID
   */
  static addError(error: Omit<AppError, 'id' | 'timestamp'>): string {
    const appError: AppError = {
      ...error,
      id: Math.random().toString(36).substr(2, 9),
      timestamp: Date.now(),
    };

    this.errors.push(appError);
    this.notifyListeners(appError);

    // Log to API log system if type is 'api'
    if (appError.type === 'api') {
      const apiCall =
        typeof appError.context?.apiCall === 'string' ? appError.context.apiCall : 'unknown';
      const apiError: APIError = {
        apiCall,
        reason: appError.message,
        details: appError.context,
      };
      interceptAPIError(apiError);
    }

    // Log to console in development
    if (import.meta.env.DEV) {
      console.error('Application Error:', appError);
    }

    return appError.id;
  }

  /**
   * Gets all tracked errors
   *
   * @returns {AppError[]} Array of all tracked errors
   */
  static getErrors(): AppError[] {
    return [...this.errors];
  }

  /**
   * Clears all tracked errors
   */
  static clearErrors(): void {
    this.errors = [];
  }

  /**
   * Adds a listener to be notified when new errors occur
   *
   * @param {function} listener - Function to call when an error occurs
   * @returns {function} Function to remove the listener
   */
  static addListener(listener: (error: AppError) => void): () => void {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter((l) => l !== listener);
    };
  }

  /**
   * Notifies all registered listeners of a new error
   *
   * @param {AppError} error - The error to notify listeners about
   */
  private static notifyListeners(error: AppError): void {
    this.listeners.forEach((listener) => {
      try {
        listener(error);
      } catch (e) {
        console.error('Error in error listener:', e);
      }
    });
  }
}

/**
 * Utility function that retries a function with exponential backoff
 *
 * @template T - The return type of the function
 * @param {function} fn - The function to retry
 * @param {number} maxRetries - Maximum number of retry attempts (default: 3)
 * @param {number} delay - Base delay between retries in milliseconds (default: 1000)
 * @returns {Promise<T>} Promise that resolves with the function result or rejects after max retries
 *
 * @example
 * ```typescript
 * const result = await withRetry(
 *   () => fetch('/api/data'),
 *   3, // max retries
 *   1000 // base delay
 * );
 * ```
 */
export function withRetry<T>(
  fn: () => Promise<T>,
  maxRetries: number = 3,
  delay: number = 1000,
): Promise<T> {
  return new Promise((resolve, reject) => {
    let attempts = 0;

    const attempt = async () => {
      try {
        const result = await fn();
        resolve(result);
      } catch (error) {
        attempts++;

        // Log API error if present
        const apiError: APIError = {
          apiCall: 'withRetry',
          reason: error instanceof Error ? error.message : 'Unknown error',
          details: { error },
        };
        interceptAPIError(apiError);

        if (attempts >= maxRetries) {
          reject(error);
          return;
        }

        setTimeout(attempt, delay * attempts);
      }
    };

    attempt();
  });
}
