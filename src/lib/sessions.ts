import { db } from '../db';
import { buildProgramSession, PROGRAM_MAP, sessionKey } from '../data/programs';
import type { Exercise, Muscle, ProgramRef, SessionExercise, WorkoutSession } from '../types';
import { toSessionExercise } from './builder';
import { uid } from './utils';

export class ActiveSessionExistsError extends Error {
  constructor() {
    super('A workout is already in progress. Finish or discard it first.');
  }
}

async function ensureNoActive() {
  const active = await db.sessions.where('status').equals('active').first();
  if (active) throw new ActiveSessionExistsError();
}

function musclesOf(exercises: SessionExercise[], map: Record<string, Exercise>): Muscle[] {
  return [...new Set(exercises.flatMap((e) => map[e.exerciseId]?.primary ?? []))];
}

export async function startSession(input: { title: string; exercises: SessionExercise[]; map: Record<string, Exercise>; program?: ProgramRef }) {
  await ensureNoActive();
  const now = Date.now();
  const session: WorkoutSession = {
    id: uid(),
    status: 'active',
    title: input.title,
    startedAt: now,
    muscles: musclesOf(input.exercises, input.map),
    exercises: input.exercises,
    program: input.program,
    updatedAt: now,
  };
  await db.sessions.add(session);
  return session;
}

export async function startProgramSession(programId: string, week: number, session: number, map: Record<string, Exercise>) {
  const program = PROGRAM_MAP[programId];
  if (!program) throw new Error('Unknown program');
  const built = buildProgramSession(program, week, session);
  const exercises = built.exercises
    .filter((x) => map[x.exerciseId])
    .map((x) => {
      const se = toSessionExercise(map[x.exerciseId], x.sets, { reps: x.reps, seconds: x.seconds });
      return x.note ? { ...se, note: x.note } : se;
    });
  if (!(await db.enrollments.get(programId))) {
    await db.enrollments.put({ programId, enrolledAt: Date.now(), completed: [], active: true });
  }
  return startSession({ title: `${program.title} · W${week} S${session}`, exercises, map, program: { programId, week, session } });
}

export async function repeatSession(source: WorkoutSession, map: Record<string, Exercise>) {
  const exercises: SessionExercise[] = source.exercises.map((e) => ({
    uid: uid(),
    exerciseId: e.exerciseId,
    mode: e.mode,
    note: e.note,
    sets: e.sets.map((s) => ({ reps: s.reps, weightKg: s.weightKg, seconds: s.seconds, done: false })),
  }));
  return startSession({ title: source.title, exercises, map });
}

export async function updateActive(id: string, mutate: (s: WorkoutSession) => WorkoutSession) {
  await db.transaction('rw', db.sessions, async () => {
    const s = await db.sessions.get(id);
    if (!s) return;
    await db.sessions.put({ ...mutate(structuredClone(s)), updatedAt: Date.now() });
  });
}

export async function finishSession(id: string, rating?: number, comment?: string) {
  await db.transaction('rw', [db.sessions, db.enrollments], async () => {
    const s = await db.sessions.get(id);
    if (!s) return;
    // Drop exercises where nothing was completed so history stays clean.
    const exercises = s.exercises.map((e) => ({ ...e, sets: e.sets.filter((x) => x.done) })).filter((e) => e.sets.length > 0);
    const done: WorkoutSession = { ...s, exercises, status: 'completed', endedAt: Date.now(), rating, comment, updatedAt: Date.now() };
    await db.sessions.put(done);
    if (s.program) {
      const en = await db.enrollments.get(s.program.programId);
      const key = sessionKey(s.program.week, s.program.session);
      const program = PROGRAM_MAP[s.program.programId];
      if (en && program) {
        const completed = en.completed.includes(key) ? en.completed : [...en.completed, key];
        const total = program.weeks * program.sessionsPerWeek;
        await db.enrollments.put({ ...en, completed, completedAt: completed.length >= total ? Date.now() : en.completedAt });
      }
    }
  });
  return db.sessions.get(id);
}

export async function discardSession(id: string) {
  await db.sessions.delete(id);
}
