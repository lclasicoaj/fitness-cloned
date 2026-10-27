export type Muscle =
  | 'chest'
  | 'back'
  | 'lats'
  | 'traps'
  | 'shoulders'
  | 'biceps'
  | 'triceps'
  | 'forearms'
  | 'abs'
  | 'obliques'
  | 'lower_back'
  | 'glutes'
  | 'quads'
  | 'hamstrings'
  | 'calves';

export type Equipment =
  | 'bodyweight'
  | 'dumbbell'
  | 'barbell'
  | 'kettlebell'
  | 'band'
  | 'plate'
  | 'pullup_bar'
  | 'bench'
  | 'machine'
  | 'cable';

export type SetMode = 'weight_reps' | 'reps' | 'time';
export type ExerciseCategory = 'strength' | 'core' | 'cardio' | 'mobility';

export interface Exercise {
  id: string;
  name: string;
  primary: Muscle[];
  secondary: Muscle[];
  equipment: Equipment[];
  mode: SetMode;
  mechanics: 'compound' | 'isolation';
  category: ExerciseCategory;
  instructions: string[];
  custom?: boolean;
  createdAt?: number;
}

export interface WorkoutSet {
  reps?: number;
  weightKg?: number;
  seconds?: number;
  done: boolean;
}

export interface SessionExercise {
  uid: string;
  exerciseId: string;
  mode: SetMode;
  sets: WorkoutSet[];
  note?: string;
}

export interface ProgramRef {
  programId: string;
  week: number;
  session: number;
}

export interface WorkoutSession {
  id: string;
  status: 'active' | 'completed';
  title: string;
  startedAt: number;
  endedAt?: number;
  muscles: Muscle[];
  exercises: SessionExercise[];
  rating?: number;
  comment?: string;
  program?: ProgramRef;
  updatedAt: number;
}

export interface Enrollment {
  programId: string;
  enrolledAt: number;
  completed: string[];
  active: boolean;
  completedAt?: number;
}

export type Units = 'kg' | 'lbs';
export type Theme = 'system' | 'light' | 'dark';

export interface Settings {
  units: Units;
  restSeconds: number;
  defaultSets: number;
  exercisesPerMuscle: number;
  theme: Theme;
  sound: boolean;
  vibration: boolean;
}

export const DEFAULT_SETTINGS: Settings = {
  units: 'kg',
  restSeconds: 90,
  defaultSets: 3,
  exercisesPerMuscle: 2,
  theme: 'system',
  sound: true,
  vibration: true,
};
