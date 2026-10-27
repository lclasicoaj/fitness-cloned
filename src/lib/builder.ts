import type { Equipment, Exercise, Muscle, SessionExercise, SetMode, WorkoutSet } from '../types';
import { shuffle, uid } from './utils';

export interface BuilderPick {
  uid: string;
  exerciseId: string;
}

export const isAvailable = (ex: Exercise, equipment: Equipment[]) =>
  ex.equipment.every((e) => e === 'bodyweight' || equipment.includes(e));

export function candidatesFor(all: Exercise[], muscle: Muscle, equipment: Equipment[]) {
  return all.filter((ex) => ex.primary.includes(muscle) && isAvailable(ex, equipment));
}

export function generateWorkout(
  all: Exercise[],
  muscles: Muscle[],
  equipment: Equipment[],
  perMuscle: number,
  rand: () => number = Math.random,
): BuilderPick[] {
  const chosen = new Set<string>();
  const picks: BuilderPick[] = [];
  for (const m of muscles) {
    // Prefer compound movements first, then fill with the rest.
    const pool = candidatesFor(all, m, equipment).filter((x) => !chosen.has(x.id));
    const ordered = [...shuffle(pool.filter((x) => x.mechanics === 'compound'), rand), ...shuffle(pool.filter((x) => x.mechanics !== 'compound'), rand)];
    for (const ex of ordered.slice(0, perMuscle)) {
      chosen.add(ex.id);
      picks.push({ uid: uid(), exerciseId: ex.id });
    }
  }
  return picks;
}

/** Replace one pick with another exercise that hits the same primary muscle and is not already used. */
export function shuffleOne(
  all: Exercise[],
  picks: BuilderPick[],
  target: BuilderPick,
  muscles: Muscle[],
  equipment: Equipment[],
  rand: () => number = Math.random,
): BuilderPick[] {
  const current = all.find((x) => x.id === target.exerciseId);
  const used = new Set(picks.map((p) => p.exerciseId));
  const muscle = current?.primary.find((m) => muscles.includes(m)) ?? current?.primary[0] ?? muscles[0];
  if (!muscle) return picks;
  const pool = candidatesFor(all, muscle, equipment).filter((x) => !used.has(x.id));
  if (pool.length === 0) return picks;
  const next = pool[Math.floor(rand() * pool.length)];
  return picks.map((p) => (p.uid === target.uid ? { ...p, exerciseId: next.id } : p));
}

export function defaultSet(mode: SetMode, target?: { reps?: number; seconds?: number }): WorkoutSet {
  if (mode === 'time') return { seconds: target?.seconds ?? 30, done: false };
  if (mode === 'reps') return { reps: target?.reps ?? 10, done: false };
  return { reps: target?.reps ?? 10, weightKg: undefined, done: false };
}

export function toSessionExercise(ex: Exercise, sets: number, target?: { reps?: number; seconds?: number }): SessionExercise {
  // Program targets may override the exercise's default mode (e.g. a timed set for a rep exercise).
  const mode: SetMode = target?.seconds !== undefined && target.reps === undefined ? 'time' : ex.mode;
  return {
    uid: uid(),
    exerciseId: ex.id,
    mode,
    sets: Array.from({ length: Math.max(1, sets) }, () => defaultSet(mode, target)),
  };
}
