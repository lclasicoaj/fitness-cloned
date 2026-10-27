import Dexie, { type EntityTable } from 'dexie';
import type { Enrollment, Exercise, WorkoutSession } from './types';

export interface Favorite {
  exerciseId: string;
  addedAt: number;
}

export interface KV {
  key: string;
  value: unknown;
}

export class RepForgeDB extends Dexie {
  sessions!: EntityTable<WorkoutSession, 'id'>;
  customExercises!: EntityTable<Exercise, 'id'>;
  favorites!: EntityTable<Favorite, 'exerciseId'>;
  enrollments!: EntityTable<Enrollment, 'programId'>;
  kv!: EntityTable<KV, 'key'>;

  constructor(name = 'repforge') {
    super(name);
    this.version(1).stores({
      sessions: 'id, status, startedAt',
      customExercises: 'id, name',
      favorites: 'exerciseId',
      enrollments: 'programId',
      kv: 'key',
    });
  }
}

export const db = new RepForgeDB();
