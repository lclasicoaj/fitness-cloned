import type { WorkoutSession, WorkoutSet } from '../types';
import { oneRepMax } from './calculators';

export const DAY_MS = 86_400_000;

export const setVolume = (s: WorkoutSet) => (s.done && s.weightKg && s.reps ? s.weightKg * s.reps : 0);

export function startOfDay(t: number) {
  const d = new Date(t);
  d.setHours(0, 0, 0, 0);
  return d.getTime();
}

/** Monday 00:00 local time of the week containing t. */
export function startOfWeek(t: number) {
  const d = new Date(startOfDay(t));
  const dow = (d.getDay() + 6) % 7;
  d.setDate(d.getDate() - dow);
  return d.getTime();
}

export function sessionVolume(s: WorkoutSession) {
  return s.exercises.reduce((acc, ex) => acc + ex.sets.reduce((a, set) => a + setVolume(set), 0), 0);
}

export const completedSets = (s: WorkoutSession) => s.exercises.reduce((a, ex) => a + ex.sets.filter((x) => x.done).length, 0);

export const sessionDuration = (s: WorkoutSession) => (s.endedAt ?? s.startedAt) - s.startedAt;

export interface ExercisePoint {
  date: number;
  sessionId: string;
  maxWeight: number;
  e1rm: number;
  volume: number;
  bestReps: number;
  bestSeconds: number;
}

export function exerciseHistory(sessions: WorkoutSession[], exerciseId: string): ExercisePoint[] {
  const pts: ExercisePoint[] = [];
  for (const s of sessions) {
    if (s.status !== 'completed') continue;
    const sets = s.exercises.filter((e) => e.exerciseId === exerciseId).flatMap((e) => e.sets.filter((x) => x.done));
    if (sets.length === 0) continue;
    pts.push({
      date: s.startedAt,
      sessionId: s.id,
      maxWeight: Math.max(0, ...sets.map((x) => x.weightKg ?? 0)),
      e1rm: Math.max(0, ...sets.map((x) => (x.weightKg && x.reps ? oneRepMax(x.weightKg, x.reps) : 0))),
      volume: sets.reduce((a, x) => a + setVolume(x), 0),
      bestReps: Math.max(0, ...sets.map((x) => x.reps ?? 0)),
      bestSeconds: Math.max(0, ...sets.map((x) => x.seconds ?? 0)),
    });
  }
  return pts.sort((a, b) => a.date - b.date);
}

export function weeklyVolume(sessions: WorkoutSession[], exerciseId?: string) {
  const map = new Map<number, number>();
  for (const s of sessions) {
    if (s.status !== 'completed') continue;
    const wk = startOfWeek(s.startedAt);
    const vol = s.exercises
      .filter((e) => !exerciseId || e.exerciseId === exerciseId)
      .reduce((a, e) => a + e.sets.reduce((b, x) => b + setVolume(x), 0), 0);
    map.set(wk, (map.get(wk) ?? 0) + vol);
  }
  return [...map.entries()].sort((a, b) => a[0] - b[0]).map(([week, volume]) => ({ week, volume }));
}

/** Consecutive days (ending today or yesterday) with at least one completed workout. */
export function dayStreak(sessions: WorkoutSession[], now = Date.now()) {
  const days = new Set(sessions.filter((s) => s.status === 'completed').map((s) => startOfDay(s.startedAt)));
  let cursor = startOfDay(now);
  if (!days.has(cursor)) cursor -= DAY_MS;
  let streak = 0;
  while (days.has(cursor)) {
    streak++;
    cursor = startOfDay(cursor - DAY_MS / 2);
  }
  return streak;
}

/** Consecutive ISO weeks (ending this or last week) with at least one workout. */
export function weekStreak(sessions: WorkoutSession[], now = Date.now()) {
  const weeks = new Set(sessions.filter((s) => s.status === 'completed').map((s) => startOfWeek(s.startedAt)));
  let cursor = startOfWeek(now);
  if (!weeks.has(cursor)) cursor = startOfWeek(cursor - DAY_MS);
  let streak = 0;
  while (weeks.has(cursor)) {
    streak++;
    cursor = startOfWeek(cursor - DAY_MS);
  }
  return streak;
}

export interface PersonalRecord {
  exerciseId: string;
  maxWeight: number;
  maxWeightDate: number;
  e1rm: number;
  e1rmDate: number;
  bestReps: number;
  bestSeconds: number;
}

export function personalRecords(sessions: WorkoutSession[]): PersonalRecord[] {
  const map = new Map<string, PersonalRecord>();
  for (const s of sessions) {
    if (s.status !== 'completed') continue;
    for (const ex of s.exercises) {
      for (const set of ex.sets) {
        if (!set.done) continue;
        const pr = map.get(ex.exerciseId) ?? {
          exerciseId: ex.exerciseId,
          maxWeight: 0,
          maxWeightDate: 0,
          e1rm: 0,
          e1rmDate: 0,
          bestReps: 0,
          bestSeconds: 0,
        };
        if ((set.weightKg ?? 0) > pr.maxWeight) {
          pr.maxWeight = set.weightKg ?? 0;
          pr.maxWeightDate = s.startedAt;
        }
        const e = set.weightKg && set.reps ? oneRepMax(set.weightKg, set.reps) : 0;
        if (e > pr.e1rm) {
          pr.e1rm = e;
          pr.e1rmDate = s.startedAt;
        }
        pr.bestReps = Math.max(pr.bestReps, set.reps ?? 0);
        pr.bestSeconds = Math.max(pr.bestSeconds, set.seconds ?? 0);
        map.set(ex.exerciseId, pr);
      }
    }
  }
  return [...map.values()];
}

/** PRs achieved in `session` compared with all earlier completed sessions. */
export function newRecordsIn(session: WorkoutSession, previous: WorkoutSession[]) {
  const before = new Map(personalRecords(previous.filter((s) => s.id !== session.id && s.startedAt < session.startedAt)).map((p) => [p.exerciseId, p]));
  const now = personalRecords([{ ...session, status: 'completed' }]);
  return now.filter((p) => {
    const b = before.get(p.exerciseId);
    if (!b) return p.maxWeight > 0;
    return p.maxWeight > b.maxWeight || p.e1rm > b.e1rm + 0.01;
  });
}

export function dailyCounts(sessions: WorkoutSession[]) {
  const map = new Map<number, number>();
  for (const s of sessions) {
    if (s.status !== 'completed') continue;
    const d = startOfDay(s.startedAt);
    map.set(d, (map.get(d) ?? 0) + 1);
  }
  return map;
}
