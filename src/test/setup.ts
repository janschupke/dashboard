import '@testing-library/jest-dom';
import { vi, beforeEach, afterEach, beforeAll, afterAll } from 'vitest';

import { server } from './mocks/server';
import '../i18n/config';
// Mock i18n t to return keys for predictable testing
vi.mock('react-i18next', async (orig) => {
  const actual = await (orig() as Promise<Record<string, unknown>>);
  return {
    ...actual,
    useTranslation: () => ({ t: (k: string) => k, i18n: { language: 'en' } }),
  };
});

// Mock i18next directly to return keys
vi.mock('../i18n/config', () => ({
  default: {
    t: (key: string, options?: Record<string, unknown>) => {
      // Return the key with interpolated values if options provided
      if (options) {
        return Object.entries(options).reduce(
          (str, [k, v]) => str.replace(`{{${k}}}`, String(v)),
          key,
        );
      }
      return key;
    },
  },
}));

// Patch fetch to handle relative URLs in test environment
// This patch only normalizes the URL and then calls the current global fetch (which may be a mock)
globalThis.fetch = ((prevFetch) => (input: RequestInfo | URL, init?: RequestInit) => {
  let url = input;
  if (typeof input === 'string' && input.startsWith('/')) {
    url = `http://localhost:3000${input}`;
  } else if (input instanceof Request && input.url.startsWith('/')) {
    url = new Request(`http://localhost:3000${input.url}`, input);
  }
  return prevFetch(url, init);
})(globalThis.fetch);

// Set base URL for jsdom environment
if (typeof window !== 'undefined' && window.location) {
  window.location.href = 'http://localhost:3000/';
}

// Setup MSW server
// Establish API mocking before all tests
beforeAll(() => {
  server.listen({ onUnhandledRequest: 'warn' });
});

// Reset handlers after each test (important for test isolation)
afterEach(() => {
  server.resetHandlers();
});

// Clean up after all tests
afterAll(() => {
  server.close();
});

// Mock IntersectionObserver
(
  globalThis as typeof globalThis & { IntersectionObserver: ReturnType<typeof vi.fn> }
).IntersectionObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}));

// Mock ResizeObserver
(globalThis as typeof globalThis & { ResizeObserver: ReturnType<typeof vi.fn> }).ResizeObserver = vi
  .fn()
  .mockImplementation(() => ({
    observe: vi.fn(),
    unobserve: vi.fn(),
    disconnect: vi.fn(),
  }));

// Mock matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation((query) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(), // deprecated
    removeListener: vi.fn(), // deprecated
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});

// Mock localStorage
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
  length: 0,
  key: vi.fn(),
};
Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
});

// Mock sessionStorage
const sessionStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
  length: 0,
  key: vi.fn(),
};
Object.defineProperty(window, 'sessionStorage', {
  value: sessionStorageMock,
});

// Mock console methods to reduce noise in tests
const originalConsoleError = console.error;
const originalConsoleWarn = console.warn;

beforeEach(() => {
  console.error = vi.fn();
  console.warn = vi.fn();
});

afterEach(() => {
  console.error = originalConsoleError;
  console.warn = originalConsoleWarn;
});
