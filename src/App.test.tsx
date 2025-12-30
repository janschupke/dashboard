import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';

import App from './App';
import { AuthContext, type AuthContextType } from './contexts/AuthContext';
import { MockToastProvider } from './test/mocks/componentMocks';

// Mock the AuthProvider to control authentication state
const createMockAuthProvider = (authState: Partial<AuthContextType>) => {
  const defaultAuthState: AuthContextType = {
    isAuthenticated: false,
    isLoading: false,
    login: vi.fn().mockResolvedValue(false),
    logout: vi.fn().mockResolvedValue(undefined),
    checkAuth: vi.fn().mockResolvedValue(undefined),
    ...authState,
  };

  return ({ children }: { children: React.ReactNode }) => (
    <AuthContext.Provider value={defaultAuthState}>{children}</AuthContext.Provider>
  );
};

// Mock the AuthProvider module
vi.mock('./contexts/AuthContext', () => ({
  AuthProvider: ({ children }: { children: React.ReactNode }) => children,
}));

describe('App', () => {
  it('renders login form when unauthenticated', () => {
    const MockAuthProvider = createMockAuthProvider({
      isAuthenticated: false,
      isLoading: false,
    });

    render(
      <MockAuthProvider>
        <MockToastProvider>
          <App />
        </MockToastProvider>
      </MockAuthProvider>,
    );

    // The app should show login form in test environment
    expect(screen.getByText('header.title')).toBeInTheDocument();
    expect(screen.getByText('auth.prompt')).toBeInTheDocument();
  });

  it('renders loading spinner when authentication is loading', () => {
    const MockAuthProvider = createMockAuthProvider({ isLoading: true });

    render(
      <MockAuthProvider>
        <MockToastProvider>
          <App />
        </MockToastProvider>
      </MockAuthProvider>,
    );

    expect(screen.getByText('general.loading')).toBeInTheDocument();
  });

  it('renders authenticated app when user is authenticated', () => {
    const MockAuthProvider = createMockAuthProvider({
      isAuthenticated: true,
      isLoading: false,
    });

    render(
      <MockAuthProvider>
        <MockToastProvider>
          <App />
        </MockToastProvider>
      </MockAuthProvider>,
    );

    // Check for the authenticated app root element
    expect(screen.getByTestId('app-root')).toBeInTheDocument();
  });
});
