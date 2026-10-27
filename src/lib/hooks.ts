import { useCallback, useEffect, useMemo, useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../db';
import { EXERCISES } from '../data/exercises';
import { DEFAULT_SETTINGS, type Exercise, type Settings } from '../types';

export function useSettings(): Settings {
  const row = useLiveQuery(() => db.kv.get('settings'), []);
  return useMemo(() => ({ ...DEFAULT_SETTINGS, ...((row?.value as Partial<Settings>) ?? {}) }), [row]);
}

export async function saveSettings(patch: Partial<Settings>) {
  const row = await db.kv.get('settings');
  const next = { ...DEFAULT_SETTINGS, ...((row?.value as Partial<Settings>) ?? {}), ...patch };
  await db.kv.put({ key: 'settings', value: next });
  if (patch.theme) {
    localStorage.setItem('rf-theme', patch.theme);
    applyTheme(patch.theme);
  }
}

export function applyTheme(theme: Settings['theme']) {
  const dark = theme === 'dark' || (theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);
  document.documentElement.classList.toggle('dark', dark);
}

export function useExercises() {
  const custom = useLiveQuery(() => db.customExercises.toArray(), []);
  return useMemo(() => {
    const all: Exercise[] = [...EXERCISES, ...(custom ?? [])];
    const map: Record<string, Exercise> = Object.fromEntries(all.map((e) => [e.id, e]));
    return { all, map, loaded: custom !== undefined };
  }, [custom]);
}

export const exerciseName = (map: Record<string, Exercise>, id: string) => map[id]?.name ?? 'Deleted exercise';

export function useFavorites() {
  const rows = useLiveQuery(() => db.favorites.toArray(), []);
  const ids = useMemo(() => new Set((rows ?? []).map((r) => r.exerciseId)), [rows]);
  const toggle = useCallback(async (exerciseId: string) => {
    const has = await db.favorites.get(exerciseId);
    if (has) await db.favorites.delete(exerciseId);
    else await db.favorites.put({ exerciseId, addedAt: Date.now() });
  }, []);
  return { ids, toggle };
}

export function useActiveSession() {
  return useLiveQuery(() => db.sessions.where('status').equals('active').first(), []);
}

export function useCompletedSessions() {
  return useLiveQuery(() => db.sessions.where('status').equals('completed').sortBy('startedAt'), []);
}

export function useOnline() {
  const [online, setOnline] = useState(typeof navigator === 'undefined' ? true : navigator.onLine);
  useEffect(() => {
    const on = () => setOnline(true);
    const off = () => setOnline(false);
    window.addEventListener('online', on);
    window.addEventListener('offline', off);
    return () => {
      window.removeEventListener('online', on);
      window.removeEventListener('offline', off);
    };
  }, []);
  return online;
}

/** localStorage-backed state (used for lightweight UI state such as the builder). */
export function useStoredState<T>(key: string, initial: T) {
  const [value, setValue] = useState<T>(() => {
    try {
      const raw = localStorage.getItem(key);
      return raw ? ({ ...initial, ...JSON.parse(raw) } as T) : initial;
    } catch {
      return initial;
    }
  });
  useEffect(() => {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch {
      /* storage full or unavailable */
    }
  }, [key, value]);
  return [value, setValue] as const;
}

export function useNow(intervalMs = 1000, enabled = true) {
  const [now, setNow] = useState(Date.now());
  useEffect(() => {
    if (!enabled) return;
    const id = setInterval(() => setNow(Date.now()), intervalMs);
    return () => clearInterval(id);
  }, [intervalMs, enabled]);
  return now;
}
