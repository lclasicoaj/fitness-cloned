import { describe, expect, it } from 'vitest';
import type { WorkoutSession } from '../types';
import { DAY_MS, dailyCounts, dayStreak, exerciseHistory, newRecordsIn, personalRecords, sessionVolume, startOfDay, weekStreak, weeklyVolume } from './stats';

let n = 0;
function session(startedAt: number, sets: { w?: number; r?: number; done?: boolean }[], exerciseId = 'bench'): WorkoutSession {
  n++;
  return {
    id: `s${n}`,
    status: 'completed',
    title: 'Test',
    startedAt,
    endedAt: startedAt + 3_600_000,
    updatedAt: startedAt,
    muscles: [],
    exercises: [{ uid: `u${n}`, exerciseId, mode: 'weight_reps', sets: sets.map((s) => ({ weightKg: s.w, reps: s.r, done: s.done ?? true })) }],
  };
}

const NOW = new Date(2025, 5, 18, 12).getTime(); // Wednesday

describe('stats', () => {
  it('only counts completed weighted sets toward volume', () => {
    const s = session(NOW, [{ w: 100, r: 5 }, { w: 100, r: 5, done: false }, { r: 10 }]);
    expect(sessionVolume(s)).toBe(500);
  });

  it('builds per-exercise history sorted by date', () => {
    const a = session(NOW, [{ w: 100, r: 5 }]);
    const b = session(NOW - DAY_MS, [{ w: 90, r: 5 }]);
    const h = exerciseHistory([a, b], 'bench');
    expect(h.map((p) => p.maxWeight)).toEqual([90, 100]);
    expect(h[1].e1rm).toBeCloseTo(116.67, 2);
  });

  it('computes day streaks ending today or yesterday', () => {
    const days = [0, 1, 2, 4].map((d) => session(NOW - d * DAY_MS, [{ w: 10, r: 1 }]));
    expect(dayStreak(days, NOW)).toBe(3);
    expect(dayStreak(days.slice(1), NOW)).toBe(2);
    expect(dayStreak(days.slice(3), NOW)).toBe(0);
  });

  it('computes week streaks', () => {
    const weeks = [0, 7, 14, 28].map((d) => session(NOW - d * DAY_MS, [{ w: 10, r: 1 }]));
    expect(weekStreak(weeks, NOW)).toBe(3);
  });

  it('aggregates weekly volume and daily counts', () => {
    const a = session(NOW, [{ w: 50, r: 10 }]);
    const b = session(NOW - DAY_MS, [{ w: 50, r: 10 }]);
    const c = session(NOW - 7 * DAY_MS, [{ w: 10, r: 10 }]);
    const weekly = weeklyVolume([a, b, c]);
    expect(weekly.map((w) => w.volume)).toEqual([100, 1000]);
    expect(dailyCounts([a, b, c]).get(startOfDay(NOW))).toBe(1);
  });

  it('detects personal records', () => {
    const old = session(NOW - 7 * DAY_MS, [{ w: 100, r: 5 }]);
    const same = session(NOW, [{ w: 100, r: 5 }]);
    const better = session(NOW, [{ w: 105, r: 5 }]);
    expect(newRecordsIn(same, [old])).toHaveLength(0);
    expect(newRecordsIn(better, [old])).toHaveLength(1);
    expect(personalRecords([old, better])[0].maxWeight).toBe(105);
  });
});
