// ═══════════════════════════════════════════════════════════════
// src/core/queryClient.js
// TanStack Query client with sensible defaults for a government
// registry: conservative stale times, retry limiting.
// ═══════════════════════════════════════════════════════════════
import { QueryClient } from '@tanstack/react-query';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 30,       // Data considered fresh for 30s
      gcTime: 1000 * 60 * 5,     // Garbage-collect unused cache after 5min
      retry: 2,                   // Retry failed queries twice before erroring
      refetchOnWindowFocus: false, // Prevent unexpected re-fetches in forms
    },
    mutations: {
      retry: 0,                   // Never retry mutations automatically
    },
  },
});