import type { RepForgeDB } from '../db';
import type { Enrollment, Exercise, WorkoutSession } from '../types';

export const BACKUP_APP = 'repforge';
export const BACKUP_VERSION = 1;

export interface Backup {
  app: typeof BACKUP_APP;
  version: number;
  exportedAt: string;
  sessions: WorkoutSession[];
  customExercises: Exercise[];
  favorites: { exerciseId: string; addedAt: number }[];
  enrollments: Enrollment[];
  kv: { key: string; value: unknown }[];
}

export async function createBackup(db: RepForgeDB): Promise<Backup> {
  const [sessions, customExercises, favorites, enrollments, kv] = await Promise.all([
    db.sessions.toArray(),
    db.customExercises.toArray(),
    db.favorites.toArray(),
    db.enrollments.toArray(),
    db.kv.toArray(),
  ]);
  return { app: BACKUP_APP, version: BACKUP_VERSION, exportedAt: new Date().toISOString(), sessions, customExercises, favorites, enrollments, kv };
}

export function validateBackup(data: unknown): Backup {
  if (!data || typeof data !== 'object') throw new Error('Backup file is not valid JSON.');
  const b = data as Partial<Backup>;
  if (b.app !== BACKUP_APP) throw new Error('This file is not a RepForge backup.');
  if (typeof b.version !== 'number' || b.version > BACKUP_VERSION) throw new Error('Backup was created by a newer version of RepForge.');
  const arrays = ['sessions', 'customExercises', 'favorites', 'enrollments', 'kv'] as const;
  for (const k of arrays) {
    if (b[k] !== undefined && !Array.isArray(b[k])) throw new Error(`Backup field "${k}" is malformed.`);
  }
  for (const s of b.sessions ?? []) {
    if (!s || typeof s.id !== 'string' || typeof s.startedAt !== 'number' || !Array.isArray(s.exercises)) {
      throw new Error('Backup contains a malformed workout session.');
    }
  }
  return {
    app: BACKUP_APP,
    version: b.version,
    exportedAt: b.exportedAt ?? '',
    sessions: b.sessions ?? [],
    customExercises: b.customExercises ?? [],
    favorites: b.favorites ?? [],
    enrollments: b.enrollments ?? [],
    kv: b.kv ?? [],
  };
}

export async function restoreBackup(db: RepForgeDB, backup: Backup, mode: 'merge' | 'replace') {
  await db.transaction('rw', [db.sessions, db.customExercises, db.favorites, db.enrollments, db.kv], async () => {
    if (mode === 'replace') {
      await Promise.all([db.sessions.clear(), db.customExercises.clear(), db.favorites.clear(), db.enrollments.clear(), db.kv.clear()]);
    }
    if (mode === 'merge') {
      // Keep the newest copy of each session.
      const existing = new Map((await db.sessions.toArray()).map((s) => [s.id, s]));
      const incoming = backup.sessions.filter((s) => !existing.has(s.id) || (existing.get(s.id)!.updatedAt ?? 0) < (s.updatedAt ?? 0));
      await db.sessions.bulkPut(incoming);
    } else {
      await db.sessions.bulkPut(backup.sessions);
    }
    await db.customExercises.bulkPut(backup.customExercises);
    await db.favorites.bulkPut(backup.favorites);
    await db.enrollments.bulkPut(backup.enrollments);
    await db.kv.bulkPut(backup.kv);
  });
}

export function sessionsToCsv(sessions: WorkoutSession[], nameOf: (id: string) => string) {
  const rows = [['date', 'workout', 'exercise', 'set', 'reps', 'weight_kg', 'seconds', 'completed']];
  for (const s of [...sessions].sort((a, b) => a.startedAt - b.startedAt)) {
    for (const ex of s.exercises) {
      ex.sets.forEach((set, i) => {
        rows.push([
          new Date(s.startedAt).toISOString(),
          s.title,
          nameOf(ex.exerciseId),
          String(i + 1),
          set.reps?.toString() ?? '',
          set.weightKg?.toFixed(2) ?? '',
          set.seconds?.toString() ?? '',
          set.done ? 'yes' : 'no',
        ]);
      });
    }
  }
  return rows.map((r) => r.map((c) => (/[",\n]/.test(c) ? `"${c.replace(/"/g, '""')}"` : c)).join(',')).join('\n');
}

export function downloadFile(name: string, content: string, type: string) {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = name;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
