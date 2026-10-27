import type { Equipment, ExerciseCategory } from '../types';

export type ProgramLevel = 'beginner' | 'intermediate' | 'advanced';

export interface ProgramExercise {
  exerciseId: string;
  sets: number;
  reps?: number;
  seconds?: number;
  note?: string;
}

export interface ProgramSessionTemplate {
  title: string;
  focus: string;
  exercises: ProgramExercise[];
}

export interface Progression {
  repsPerWeek?: number;
  secondsPerWeek?: number;
  extraSetEvery?: number;
  deloadLastWeek?: boolean;
}

export interface Program {
  id: string;
  title: string;
  tagline: string;
  description: string;
  level: ProgramLevel;
  category: ExerciseCategory;
  weeks: number;
  sessionsPerWeek: number;
  minutes: number;
  equipment: Equipment[];
  templates: ProgramSessionTemplate[];
  progression: Progression;
  notes: string[];
}

const e = (exerciseId: string, sets: number, target: { reps?: number; seconds?: number }, note?: string): ProgramExercise => ({
  exerciseId,
  sets,
  ...target,
  note,
});

// Original programs written for RepForge.
export const PROGRAMS: Program[] = [
  {
    id: 'home-foundations',
    title: 'Home Foundations',
    tagline: 'Zero equipment, real progress.',
    description:
      'A four-week, full-body plan for complete beginners training in their living room. Each session pairs a push, a squat, a hinge and a core move, adding a little volume every week.',
    level: 'beginner',
    category: 'strength',
    weeks: 4,
    sessionsPerWeek: 3,
    minutes: 30,
    equipment: ['bodyweight'],
    progression: { repsPerWeek: 1, secondsPerWeek: 5 },
    notes: ['Rest 60–90 s between sets.', 'If a push-up is too hard, switch to incline push-ups on a sofa or table.', 'Stop each set 1–2 reps before failure.'],
    templates: [
      {
        title: 'Full body A',
        focus: 'Push + squat',
        exercises: [e('bodyweight-squat', 3, { reps: 12 }), e('push-up', 3, { reps: 6 }), e('glute-bridge', 3, { reps: 12 }), e('plank', 3, { seconds: 25 })],
      },
      {
        title: 'Full body B',
        focus: 'Lunge + pike',
        exercises: [e('reverse-lunge', 3, { reps: 8 }, 'per leg'), e('pike-push-up', 3, { reps: 6 }), e('superman', 3, { seconds: 20 }), e('dead-bug', 3, { reps: 10 })],
      },
      {
        title: 'Full body C',
        focus: 'Conditioning',
        exercises: [e('jump-squat', 3, { reps: 8 }), e('diamond-push-up', 3, { reps: 5 }), e('single-leg-glute-bridge', 3, { reps: 8 }, 'per leg'), e('mountain-climber', 3, { seconds: 25 })],
      },
    ],
  },
  {
    id: 'gym-starter',
    title: 'Gym Starter Full Body',
    tagline: 'Walk into the gym with a plan.',
    description:
      'Six weeks of simple full-body sessions built around the main free-weight and machine lifts. Add a small amount of weight whenever you complete every set at the top of the rep target.',
    level: 'beginner',
    category: 'strength',
    weeks: 6,
    sessionsPerWeek: 3,
    minutes: 50,
    equipment: ['barbell', 'dumbbell', 'bench', 'machine', 'cable'],
    progression: { repsPerWeek: 0, extraSetEvery: 3, deloadLastWeek: true },
    notes: ['Warm up with two light sets before the first exercise.', 'Use the same weight for all sets; increase it next session if all reps were completed.', 'Final week is a lighter deload week.'],
    templates: [
      {
        title: 'Day A',
        focus: 'Squat + press',
        exercises: [e('goblet-squat', 3, { reps: 10 }), e('db-bench-press', 3, { reps: 10 }), e('lat-pulldown', 3, { reps: 10 }), e('db-lateral-raise', 2, { reps: 12 }), e('plank', 2, { seconds: 30 })],
      },
      {
        title: 'Day B',
        focus: 'Hinge + pull',
        exercises: [e('db-rdl', 3, { reps: 10 }), e('db-shoulder-press', 3, { reps: 10 }), e('seated-cable-row', 3, { reps: 10 }), e('db-curl', 2, { reps: 12 }), e('cable-pushdown', 2, { reps: 12 })],
      },
      {
        title: 'Day C',
        focus: 'Machines',
        exercises: [e('leg-press', 3, { reps: 12 }), e('machine-chest-press', 3, { reps: 10 }), e('db-row', 3, { reps: 10 }, 'per arm'), e('leg-curl', 2, { reps: 12 }), e('crunch', 2, { reps: 15 })],
      },
    ],
  },
  {
    id: 'glute-builder',
    title: 'Glute Builder',
    tagline: 'Six weeks, three blocks, stronger hips.',
    description:
      'A glute-focused plan in three two-week blocks: learn the patterns, build volume, then push intensity. Works at home with dumbbells and bands, or in any gym.',
    level: 'beginner',
    category: 'strength',
    weeks: 6,
    sessionsPerWeek: 3,
    minutes: 45,
    equipment: ['dumbbell', 'band', 'bench'],
    progression: { repsPerWeek: 1, extraSetEvery: 2 },
    notes: ['Pause for one second at the top of every hip thrust and bridge.', 'Keep 1–2 reps in reserve on compound lifts.', 'Pair with 7,000+ daily steps for best results.'],
    templates: [
      {
        title: 'Thrust day',
        focus: 'Hip extension',
        exercises: [e('db-hip-thrust', 3, { reps: 10 }), e('goblet-squat', 3, { reps: 10 }), e('band-lateral-walk', 3, { reps: 15 }, 'steps each way'), e('donkey-kick', 2, { reps: 12 }, 'per leg')],
      },
      {
        title: 'Hinge day',
        focus: 'Hamstrings + glutes',
        exercises: [e('db-rdl', 3, { reps: 10 }), e('bulgarian-split-squat', 3, { reps: 8 }, 'per leg'), e('single-leg-glute-bridge', 3, { reps: 10 }, 'per leg'), e('band-kickback', 2, { reps: 15 }, 'per leg')],
      },
      {
        title: 'Pump day',
        focus: 'Volume + burn',
        exercises: [e('db-lunge', 3, { reps: 10 }, 'per leg'), e('glute-bridge', 3, { reps: 20 }), e('step-up', 3, { reps: 10 }, 'per leg'), e('band-lateral-walk', 2, { reps: 20 }, 'steps each way')],
      },
    ],
  },
  {
    id: 'core-control',
    title: 'Core Control',
    tagline: 'Stability that carries over to everything.',
    description:
      'Short, focused core sessions that train anti-extension, anti-rotation and trunk endurance. Use it on its own or as a finisher after any workout.',
    level: 'intermediate',
    category: 'core',
    weeks: 4,
    sessionsPerWeek: 3,
    minutes: 20,
    equipment: ['bodyweight'],
    progression: { repsPerWeek: 2, secondsPerWeek: 5 },
    notes: ['Quality over speed: keep your lower back neutral.', 'Breathe out fully during the hardest part of each rep.'],
    templates: [
      {
        title: 'Anti-extension',
        focus: 'Front line',
        exercises: [e('plank', 3, { seconds: 30 }), e('dead-bug', 3, { reps: 10 }), e('hollow-hold', 3, { seconds: 20 }), e('leg-raise', 3, { reps: 10 })],
      },
      {
        title: 'Rotation',
        focus: 'Obliques',
        exercises: [e('side-plank', 3, { seconds: 25 }, 'per side'), e('bicycle-crunch', 3, { reps: 16 }), e('russian-twist', 3, { reps: 16 }), e('bird-dog', 3, { reps: 10 })],
      },
      {
        title: 'Endurance',
        focus: 'Whole trunk',
        exercises: [e('mountain-climber', 3, { seconds: 30 }), e('superman', 3, { seconds: 25 }), e('crunch', 3, { reps: 15 }), e('plank', 2, { seconds: 40 })],
      },
    ],
  },
  {
    id: 'conditioning-circuits',
    title: 'Conditioning Circuits',
    tagline: 'Sweat-heavy intervals, no gym required.',
    description:
      'Four weeks of interval circuits that alternate lower-body power, upper-body work and core. Move from one exercise to the next with minimal rest and rest 60 s between rounds.',
    level: 'intermediate',
    category: 'cardio',
    weeks: 4,
    sessionsPerWeek: 3,
    minutes: 25,
    equipment: ['bodyweight'],
    progression: { secondsPerWeek: 5, repsPerWeek: 1 },
    notes: ['Each "set" is one round of the circuit.', 'Land softly on all jumps; swap jumps for marching if you need low impact.'],
    templates: [
      {
        title: 'Circuit 1',
        focus: 'Legs + lungs',
        exercises: [e('jumping-jack', 4, { seconds: 30 }), e('jump-squat', 4, { reps: 10 }), e('mountain-climber', 4, { seconds: 30 }), e('push-up', 4, { reps: 8 })],
      },
      {
        title: 'Circuit 2',
        focus: 'Total body',
        exercises: [e('high-knees', 4, { seconds: 30 }), e('burpee', 4, { reps: 6 }), e('skater-hop', 4, { seconds: 30 }), e('plank', 4, { seconds: 30 })],
      },
      {
        title: 'Circuit 3',
        focus: 'Power + core',
        exercises: [e('jump-squat', 4, { reps: 10 }), e('bicycle-crunch', 4, { reps: 20 }), e('burpee', 4, { reps: 6 }), e('hollow-hold', 4, { seconds: 20 })],
      },
    ],
  },
  {
    id: 'upper-lower-strength',
    title: 'Upper / Lower Strength',
    tagline: 'Four days a week, barbell-focused.',
    description:
      'An eight-week upper/lower split for lifters with some experience. Heavy compound lifts first, accessories after. Every fourth week adds a set; the last week is a deload.',
    level: 'advanced',
    category: 'strength',
    weeks: 8,
    sessionsPerWeek: 4,
    minutes: 60,
    equipment: ['barbell', 'dumbbell', 'bench', 'pullup_bar', 'cable'],
    progression: { extraSetEvery: 4, deloadLastWeek: true },
    notes: ['Main lifts: work up to a weight you could lift 2 more times.', 'Track your estimated 1RM on the Stats page.', 'Deload: same exercises, one fewer set, lighter weight.'],
    templates: [
      {
        title: 'Upper – heavy',
        focus: 'Bench + row',
        exercises: [e('bb-bench-press', 4, { reps: 5 }), e('bb-row', 4, { reps: 6 }), e('db-shoulder-press', 3, { reps: 8 }), e('pull-up', 3, { reps: 6 }), e('bb-curl', 2, { reps: 10 })],
      },
      {
        title: 'Lower – heavy',
        focus: 'Squat',
        exercises: [e('bb-back-squat', 4, { reps: 5 }), e('db-rdl', 3, { reps: 8 }), e('bulgarian-split-squat', 3, { reps: 8 }, 'per leg'), e('db-calf-raise', 3, { reps: 12 }), e('hanging-knee-raise', 3, { reps: 10 })],
      },
      {
        title: 'Upper – volume',
        focus: 'Press + pull',
        exercises: [e('bb-overhead-press', 4, { reps: 6 }), e('lat-pulldown', 3, { reps: 10 }), e('db-bench-press', 3, { reps: 10 }), e('seated-cable-row', 3, { reps: 10 }), e('cable-pushdown', 3, { reps: 12 })],
      },
      {
        title: 'Lower – volume',
        focus: 'Deadlift',
        exercises: [e('bb-deadlift', 3, { reps: 5 }), e('hip-thrust', 3, { reps: 8 }), e('goblet-squat', 3, { reps: 12 }), e('nordic-curl', 3, { reps: 5 }), e('side-plank', 3, { seconds: 30 }, 'per side')],
      },
    ],
  },
];

export const PROGRAM_MAP: Record<string, Program> = Object.fromEntries(PROGRAMS.map((p) => [p.id, p]));

export interface BuiltSession {
  week: number;
  session: number;
  title: string;
  focus: string;
  exercises: ProgramExercise[];
}

export function buildProgramSession(program: Program, week: number, session: number): BuiltSession {
  const tpl = program.templates[(session - 1) % program.templates.length];
  const w = week - 1;
  const p = program.progression;
  const isDeload = p.deloadLastWeek && week === program.weeks;
  const exercises = tpl.exercises.map((x) => {
    let sets = x.sets + (p.extraSetEvery ? Math.floor(w / p.extraSetEvery) : 0);
    if (isDeload) sets = Math.max(1, x.sets - 1);
    return {
      ...x,
      sets,
      reps: x.reps !== undefined ? x.reps + (isDeload ? 0 : (p.repsPerWeek ?? 0) * w) : undefined,
      seconds: x.seconds !== undefined ? x.seconds + (isDeload ? 0 : (p.secondsPerWeek ?? 0) * w) : undefined,
    };
  });
  return { week, session, title: isDeload ? `${tpl.title} (deload)` : tpl.title, focus: tpl.focus, exercises };
}

export const sessionKey = (week: number, session: number) => `${week}-${session}`;

export function nextProgramSession(program: Program, completed: string[]): { week: number; session: number } | null {
  for (let w = 1; w <= program.weeks; w++) {
    for (let s = 1; s <= program.sessionsPerWeek; s++) {
      if (!completed.includes(sessionKey(w, s))) return { week: w, session: s };
    }
  }
  return null;
}
