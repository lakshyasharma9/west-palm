import { createContext, useContext, useState } from "react";
import { QueryClient, QueryClientProvider, useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import * as api from "./api";
import type { Query, Project } from "./mockData";

// Create QueryClient with optimized configuration
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes - data stays fresh
      gcTime: 10 * 60 * 1000, // 10 minutes - cache garbage collection
      refetchOnWindowFocus: false, // Don't refetch on window focus
      refetchOnReconnect: true, // Refetch on reconnect
      retry: 1, // Retry failed requests once
    },
  },
});

interface StoreValue {
  queries: Query[];
  projects: Project[];
  refreshQueries: () => Promise<void>;
  refreshProjects: () => Promise<void>;
  loading: boolean;
  queriesLoading: boolean;
  projectsLoading: boolean;
}

const StoreContext = createContext<StoreValue | null>(null);

function StoreProviderInner({ children }: { children: React.ReactNode }) {
  const queryClient = useQueryClient();

  // Queries with React Query
  const {
    data: queries = [],
    isLoading: queriesLoading,
    refetch: refetchQueries,
  } = useQuery({
    queryKey: ['queries'],
    queryFn: async () => {
      const result = await api.getQueries();
      return result.success ? result.queries : [];
    },
    enabled: api.isAuthenticated(), // Only fetch if authenticated
  });

  // Projects with React Query
  const {
    data: projects = [],
    isLoading: projectsLoading,
    refetch: refetchProjects,
  } = useQuery({
    queryKey: ['projects'],
    queryFn: async () => {
      const result = await api.getProjects();
      return result.success ? result.projects : [];
    },
    staleTime: 0, // Always fetch fresh data
    gcTime: 0, // Don't cache
  });

  const refreshQueries = async () => {
    await refetchQueries();
  };

  const refreshProjects = async () => {
    await refetchProjects();
  };

  const loading = queriesLoading || projectsLoading;

  const value = {
    queries,
    projects,
    refreshQueries,
    refreshProjects,
    loading,
    queriesLoading,
    projectsLoading,
  };

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export function StoreProvider({ children }: { children: React.ReactNode }) {
  return (
    <QueryClientProvider client={queryClient}>
      <StoreProviderInner>{children}</StoreProviderInner>
    </QueryClientProvider>
  );
}

export function useStore() {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error("useStore must be used within StoreProvider");
  return ctx;
}

// Export queryClient for direct access
export { queryClient };
