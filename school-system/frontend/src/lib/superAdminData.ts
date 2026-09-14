import { useCallback, useEffect, useSyncExternalStore } from "react";
import { request } from "./api";

type ResourceState<T> = {
  data: T | null;
  error: string | null;
  loading: boolean;
  updatedAt: number;
};

const RESOURCE_TTL_MS = 60_000;
const emptyState: ResourceState<never> = {
  data: null,
  error: null,
  loading: true,
  updatedAt: 0,
};

const createResource = <T>(path: string) => {
  let state: ResourceState<T> = emptyState as ResourceState<T>;
  let pending: Promise<T> | null = null;
  const listeners = new Set<() => void>();

  const notify = () => listeners.forEach((listener) => listener());
  const setState = (next: ResourceState<T>) => {
    state = next;
    notify();
  };

  const load = (force = false): Promise<T> => {
    if (!force && state.data !== null && Date.now() - state.updatedAt < RESOURCE_TTL_MS) {
      return Promise.resolve(state.data);
    }
    if (pending) return pending;

    setState({ ...state, loading: true, error: null });
    pending = request<T>(path)
      .then((data) => {
        setState({ data, error: null, loading: false, updatedAt: Date.now() });
        return data;
      })
      .catch((error: unknown) => {
        setState({
          ...state,
          loading: false,
          error: error instanceof Error ? error.message : "Unable to load data.",
        });
        throw error;
      })
      .finally(() => {
        pending = null;
      });
    return pending;
  };

  return {
    subscribe: (listener: () => void) => {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
    getSnapshot: () => state,
    load,
    invalidate: () => setState({ ...state, updatedAt: 0 }),
  };
};

const platformStatistics = createResource<any>("/superadmin/platform/statistics");
const schools = createResource<any[]>("/superadmin/schools");

const useResource = <T>(resource: ReturnType<typeof createResource<T>>) => {
  const state = useSyncExternalStore(
    resource.subscribe,
    resource.getSnapshot,
    resource.getSnapshot,
  );

  useEffect(() => {
    void resource.load().catch(() => undefined);
  }, [resource]);

  return {
    data: state.data,
    loading: state.loading,
    error: state.error,
    refresh: useCallback(() => resource.load(true), [resource]),
  };
};

export const useSuperAdminPlatformStatistics = () => useResource(platformStatistics);
export const useSuperAdminSchools = () => useResource(schools);

export const refreshSuperAdminPlatformStatistics = () => {
  platformStatistics.invalidate();
  return platformStatistics.load(true);
};
export const refreshSuperAdminSchools = () => {
  schools.invalidate();
  return schools.load(true);
};

export const invalidateSuperAdminPlatformStatistics = () => platformStatistics.invalidate();
export const invalidateSuperAdminSchools = () => schools.invalidate();
