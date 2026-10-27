import { describe, expect, it } from 'vitest';
import { EXERCISES, EXERCISE_MAP } from '../data/exercises';
import { MUSCLES } from '../data/taxonomy';
import { candidatesFor, generateWorkout, isAvailable, shuffleOne, toSessionExercise } from './builder';

describe('builder', () => {
  it('treats bodyweight as always available', () => {
    const pushup = EXERCISES.find((e) => e.equipment.every((x) => x === 'bodyweight'))!;
    expect(isAvailable(pushup, [])).toBe(true);
    const barbell = EXERCISES.find((e) => e.equipment.includes('barbell'))!;
    expect(isAvailable(barbell, ['dumbbell'])).toBe(false);
  });

  it('has at least one bodyweight exercise for every muscle', () => {
    for (const m of MUSCLES) expect(candidatesFor(EXERCISES, m.id, []).length, m.id).toBeGreaterThan(0);
  });

  it('generates unique exercises honouring equipment and count', () => {
    const picks = generateWorkout(EXERCISES, ['chest', 'back', 'quads'], ['dumbbell', 'bench'], 2);
    expect(picks.length).toBeLessThanOrEqual(6);
    expect(picks.length).toBeGreaterThanOrEqual(3);
    expect(new Set(picks.map((p) => p.exerciseId)).size).toBe(picks.length);
    for (const p of picks) expect(isAvailable(EXERCISE_MAP[p.exerciseId], ['dumbbell', 'bench'])).toBe(true);
  });

  it('shuffles one exercise without duplicating', () => {
    const picks = generateWorkout(EXERCISES, ['chest'], ['dumbbell', 'barbell', 'bench'], 1);
    const next = shuffleOne(EXERCISES, picks, picks[0], ['chest'], ['dumbbell', 'barbell', 'bench']);
    expect(next[0].exerciseId).not.toBe(picks[0].exerciseId);
    expect(EXERCISE_MAP[next[0].exerciseId].primary).toContain('chest');
  });

  it('creates session exercises with timed overrides', () => {
    const ex = EXERCISES.find((e) => e.mode === 'reps')!;
    const timed = toSessionExercise(ex, 3, { seconds: 40 });
    expect(timed.mode).toBe('time');
    expect(timed.sets).toHaveLength(3);
    expect(timed.sets[0].seconds).toBe(40);
  });
});
