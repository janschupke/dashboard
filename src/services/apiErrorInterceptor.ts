import { storageManager } from './storageManager';

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
          errorName: error?.name ?? '',
          errorMessage: error?.message ?? '',
        },
      });
      return false;
    };
    window.onunhandledrejection = function (event) {
      const reason = event.reason as { name?: string; message?: string } | undefined;
      storageManager.addLog({
        level: 'error',
        apiCall: 'window.onunhandledrejection',
        reason: String(event.reason),
        details: {
          errorName: reason?.name ?? '',
          errorMessage: reason?.message ?? '',
        },
      });
      return false;
    };
  }
};
