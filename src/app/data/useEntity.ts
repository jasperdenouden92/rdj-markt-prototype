/**
 * React hooks for entity data fetching with caching and mutations.
 */

import { useState, useEffect, useCallback, useRef } from "react";
import * as api from "./api";
import type { EntityType } from "./api";

// Simple in-memory cache to avoid re-fetching on navigation
const cache: Record<string, { data: any[]; timestamp: number }> = {};
const CACHE_TTL = 30_000; // 30 seconds

export function useEntityList<T = any>(entity: EntityType) {
  const [data, setData] = useState<T[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const mountedRef = useRef(true);

  const fetch = useCallback(async (skipCache = false) => {
    const cacheKey = entity;
    const cached = cache[cacheKey];

    if (!skipCache && cached && Date.now() - cached.timestamp < CACHE_TTL) {
      setData(cached.data);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const items = await api.list<T>(entity);
      if (mountedRef.current) {
        setData(items);
        cache[cacheKey] = { data: items, timestamp: Date.now() };
      }
    } catch (err: any) {
      console.error(`useEntityList(${entity}) error:`, err);
      if (mountedRef.current) {
        setError(err.message || "Failed to fetch");
      }
    } finally {
      if (mountedRef.current) setLoading(false);
    }
  }, [entity]);

  useEffect(() => {
    mountedRef.current = true;
    fetch();
    return () => { mountedRef.current = false; };
  }, [fetch]);

  const refetch = useCallback(() => fetch(true), [fetch]);

  return { data, loading, error, refetch };
}

export function useEntity<T = any>(entity: EntityType, id: string | null | undefined) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(!!id);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) {
      setData(null);
      setLoading(false);
      return;
    }

    let cancelled = false;
    setLoading(true);
    setError(null);

    api.get<T>(entity, id)
      .then((item) => {
        if (!cancelled) setData(item);
      })
      .catch((err) => {
        if (!cancelled) {
          console.error(`useEntity(${entity}, ${id}) error:`, err);
          setError(err.message);
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => { cancelled = true; };
  }, [entity, id]);

  return { data, loading, error };
}

export function useEntityMutations<T extends { id?: string }>(entity: EntityType) {
  const [saving, setSaving] = useState(false);

  const createItem = useCallback(async (data: Partial<T>): Promise<T> => {
    setSaving(true);
    try {
      const result = await api.create<T>(entity, data);
      // Invalidate cache
      delete cache[entity];
      return result;
    } finally {
      setSaving(false);
    }
  }, [entity]);

  const updateItem = useCallback(async (id: string, data: Partial<T>): Promise<T> => {
    setSaving(true);
    try {
      const result = await api.update<T>(entity, id, data);
      delete cache[entity];
      return result;
    } finally {
      setSaving(false);
    }
  }, [entity]);

  const patchItem = useCallback(async (id: string, data: Partial<T>): Promise<T> => {
    setSaving(true);
    try {
      const result = await api.patch<T>(entity, id, data);
      delete cache[entity];
      return result;
    } finally {
      setSaving(false);
    }
  }, [entity]);

  const deleteItem = useCallback(async (id: string): Promise<void> => {
    setSaving(true);
    try {
      await api.remove(entity, id);
      delete cache[entity];
    } finally {
      setSaving(false);
    }
  }, [entity]);

  return { createItem, updateItem, patchItem, deleteItem, saving };
}

/** Invalidate all cached data */
export function invalidateAllCaches() {
  for (const key of Object.keys(cache)) {
    delete cache[key];
  }
}
