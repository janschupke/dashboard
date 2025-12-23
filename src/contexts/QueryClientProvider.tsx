import React from 'react';
import { QueryClient, QueryClientProvider as TanStackQueryClientProvider } from '@tanstack/react-query';

import { DATA_FETCH_TIMEOUT_MS } from '../services/dataFetcher';

// Create a QueryClient with configuration that matches our existing behavior
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Stale time: how long data is considered fresh (prevents unnecessary refetches)
      staleTime: 0, // Always consider data stale to allow per-tile configuration
      // Cache time: how long unused data stays in cache (now called gcTime in v5)
      gcTime: 5 * 60 * 1000, // 5 minutes (default)
      // Retry configuration
      retry: 1, // Retry once on failure
      retryDelay: 1000, // 1 second delay between retries
      // Refetch configuration
      refetchOnWindowFocus: false, // We handle this per-tile
      refetchOnReconnect: true,
      refetchOnMount: true,
      // Network mode
      networkMode: 'online',
    },
    mutations: {
      retry: 1,
    },
  },
});

interface QueryClientProviderProps {
  children: React.ReactNode;
}

export const QueryClientProvider: React.FC<QueryClientProviderProps> = ({ children }) => {
  return (
    <TanStackQueryClientProvider client={queryClient}>
      {children}
    </TanStackQueryClientProvider>
  );
};

// Export the queryClient instance for direct access if needed
export { queryClient };
