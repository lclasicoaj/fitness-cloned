import 'fake-indexeddb/auto';
import { afterEach, describe, expect, it } from 'vitest';
import { RepForgeDB } from '../db';
import type { WorkoutSession } from '../types';
import { createBackup, restoreBackup, sessionsToCsv, validateBackup } from './backup';

const mk = (id: string, updatedAt: number, title = 'W'): WorkoutSession => ({
  id,
  status: 'completed',
  title,
  startedAt: 1,
  endedAt: 2,
  updatedAt,
  muscles: [],
  exercises: [{ uid: 'u', exerciseId: 'bench', mode: 'weight_reps', sets: [{ weightKg: 60, reps: 8, done: true }] }],
});

let db: RepForgeDB;
afterEach(async () => {
  await db?.delete();
});

describe('backup', () => {
  it('rejects foreign or malformed files', () => {
    expect(() => validateBackup(null)).toThrow();
    expect(() => validateBackup({ app: 'other', version: 1 })).toThrow(/not a RepForge/);
    expect(() => validateBackup({ app: 'repforge', version: 99 })).toThrow(/newer/);
    expect(() => validateBackup({ app: 'repforge', version: 1, sessions: [{ id: 1 }] })).toThrow(/malformed/);
    expect(validateBackup({ app: 'repforge', version: 1 }).sessions).toEqual([]);
  });

  it('round-trips through IndexedDB with merge and replace', async () => {
    db = new RepForgeDB(`test-${Math.random()}`);
    await db.sessions.bulkPut([mk('a', 10, 'old A'), mk('b', 10)]);
    await db.kv.put({ key: 'settings', value: { units: 'lbs' } });
    const backup = validateBackup(JSON.parse(JSON.stringify(await createBackup(db))));
    expect(backup.sessions).toHaveLength(2);

    await db.sessions.put(mk('a', 20, 'newer A'));
    await db.sessions.put(mk('c', 5));
    await restoreBackup(db, backup, 'merge');
    expect((await db.sessions.get('a'))?.title).toBe('newer A');
    expect(await db.sessions.count()).toBe(3);

    await restoreBackup(db, backup, 'replace');
    expect(await db.sessions.count()).toBe(2);
    expect((await db.sessions.get('a'))?.title).toBe('old A');
    expect((await db.kv.get('settings'))?.value).toEqual({ units: 'lbs' });
  });

  it('exports CSV with escaping', () => {
    const csv = sessionsToCsv([mk('a', 1, 'Push, "heavy"')], () => 'Bench');
    const lines = csv.split('\n');
    expect(lines[0]).toBe('date,workout,exercise,set,reps,weight_kg,seconds,completed');
    expect(lines[1]).toContain('"Push, ""heavy"""');
    expect(lines[1]).toContain(',8,60.00,,yes');
  });
});
