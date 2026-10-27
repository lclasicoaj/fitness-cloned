import { describe, expect, it } from 'vitest';
import { EXERCISES, EXERCISE_MAP } from './exercises';
import { buildProgramSession, nextProgramSession, PROGRAMS, sessionKey } from './programs';

describe('content', () => {
  it('has unique exercise ids with instructions', () => {
    expect(new Set(EXERCISES.map((e) => e.id)).size).toBe(EXERCISES.length);
    for (const e of EXERCISES) {
      expect(e.instructions.length, e.id).toBeGreaterThan(0);
      expect(e.primary.length, e.id).toBeGreaterThan(0);
    }
  });

  it('references only existing exercises in every program', () => {
    for (const p of PROGRAMS) {
      for (const t of p.templates) {
        for (const x of t.exercises) expect(EXERCISE_MAP[x.exerciseId], `${p.id}:${x.exerciseId}`).toBeDefined();
      }
    }
  });

  it('defines reps or seconds for every program exercise', () => {
    for (const p of PROGRAMS) for (const t of p.templates) for (const x of t.exercises) expect(x.reps !== undefined || x.seconds !== undefined).toBe(true);
  });
});

describe('program progression', () => {
  const program = PROGRAMS.find((p) => p.progression.repsPerWeek || p.progression.secondsPerWeek)!;

  it('increases volume week over week', () => {
    const w1 = buildProgramSession(program, 1, 1);
    const w2 = buildProgramSession(program, 2, 1);
    const sum = (s: typeof w1) => s.exercises.reduce((a, x) => a + (x.reps ?? 0) + (x.seconds ?? 0) + x.sets, 0);
    expect(sum(w2)).toBeGreaterThan(sum(w1));
  });

  it('deloads the final week when configured', () => {
    const p = PROGRAMS.find((x) => x.progression.deloadLastWeek);
    if (!p) return;
    const last = buildProgramSession(p, p.weeks, 1);
    expect(last.title).toContain('deload');
  });

  it('finds the next incomplete session', () => {
    expect(nextProgramSession(program, [])).toEqual({ week: 1, session: 1 });
    const expected = program.sessionsPerWeek > 1 ? { week: 1, session: 2 } : { week: 2, session: 1 };
    expect(nextProgramSession(program, [sessionKey(1, 1)])).toEqual(expected);
    const all = Array.from({ length: program.weeks }, (_, w) => Array.from({ length: program.sessionsPerWeek }, (_, s) => sessionKey(w + 1, s + 1))).flat();
    expect(nextProgramSession(program, all)).toBeNull();
  });
});
