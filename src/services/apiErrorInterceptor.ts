import { storageManager } from './storageManager';

import type { APILogDetails } from './storageManager';

export interface APIError {
  apiCall: string;
  reason: string;
  details?: Record<string, unknown>;
}

export const interceptAPIError = (error: APIError): void => {
  // Prevent error from appearing in console
  const originalConsoleError = console.error;
  console.error = () => {}; // Temporarily suppress console.error

  // Log the error to our storage system
  storageManager.addLog({
    level: 'error',
    apiCall: error.apiCall,
    reason: error.reason,
    details: error.details as APILogDetails,
  });

  // Restore console.error
  console.error = originalConsoleError;
};

export const interceptAPIWarning = (warning: APIError): void => {
  // Prevent warning from appearing in console
  const originalConsoleWarn = console.warn;
  console.warn = () => {}; // Temporarily suppress console.warn

  // Log the warning to our storage system
  storageManager.addLog({
    level: 'warning',
    apiCall: warning.apiCall,
    reason: warning.reason,
    details: warning.details as APILogDetails,
  });

  // Restore console.warn
  console.warn = originalConsoleWarn;
};

// Global error handler for unhandled fetch errors
export const setupGlobalErrorHandling = (): void => {
  // Override console.error to catch network errors
  const originalConsoleError = console.error;
  console.error = (...args: unknown[]) => {
    // Check if this is a network error (like 429)
    const message = args.join(' ');
    if (
      message.includes('429') ||
      message.includes('Too Many Requests') ||
      message.includes('fetch')
    ) {
      // Don't log to console, just return
      return;
    }
    // For other errors, log normally
    originalConsoleError(...args);
  };

  // Override console.warn to catch network warnings
  const originalConsoleWarn = console.warn;
  console.warn = (...args: unknown[]) => {
    // Check if this is a network warning
    const message = args.join(' ');
    if (
      message.includes('429') ||
      message.includes('Too Many Requests') ||
      message.includes('fetch')
    ) {
      // Don't log to console, just return
      return;
    }
    // For other warnings, log normally
    originalConsoleWarn(...args);
  };

  // Add global error and unhandledrejection handlers
  if (typeof window !== 'undefined') {
    window.onerror = function (message, source, lineno, colno, error) {
      storageManager.addLog({
        level: 'error',
        apiCall: 'window.onerror',
        reason: String(message),
        details: {
          source: String(source),
          lineno: lineno ?? '',
          colno: colno ?? '',
          errorName: error && error.name ? error.name : '',
          errorMessage: error && error.message ? error.message : '',
        },
      });
      return false;
    };
    window.onunhandledrejection = function (event) {
      storageManager.addLog({
        level: 'error',
        apiCall: 'window.onunhandledrejection',
        reason: String(event.reason),
        details: {
          errorName: event.reason && event.reason.name ? event.reason.name : '',
          errorMessage: event.reason && event.reason.message ? event.reason.message : '',
        },
      });
      return false;
    };
  }
};
