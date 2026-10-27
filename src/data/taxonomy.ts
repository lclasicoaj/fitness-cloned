import type { Equipment, ExerciseCategory, Muscle } from '../types';

export const MUSCLES: { id: Muscle; label: string; region: 'Upper body' | 'Arms' | 'Core' | 'Lower body' }[] = [
  { id: 'chest', label: 'Chest', region: 'Upper body' },
  { id: 'shoulders', label: 'Shoulders', region: 'Upper body' },
  { id: 'back', label: 'Upper back', region: 'Upper body' },
  { id: 'lats', label: 'Lats', region: 'Upper body' },
  { id: 'traps', label: 'Traps', region: 'Upper body' },
  { id: 'biceps', label: 'Biceps', region: 'Arms' },
  { id: 'triceps', label: 'Triceps', region: 'Arms' },
  { id: 'forearms', label: 'Forearms', region: 'Arms' },
  { id: 'abs', label: 'Abs', region: 'Core' },
  { id: 'obliques', label: 'Obliques', region: 'Core' },
  { id: 'lower_back', label: 'Lower back', region: 'Core' },
  { id: 'glutes', label: 'Glutes', region: 'Lower body' },
  { id: 'quads', label: 'Quadriceps', region: 'Lower body' },
  { id: 'hamstrings', label: 'Hamstrings', region: 'Lower body' },
  { id: 'calves', label: 'Calves', region: 'Lower body' },
];

export const MUSCLE_REGIONS = ['Upper body', 'Arms', 'Core', 'Lower body'] as const;

export const EQUIPMENT: { id: Equipment; label: string; emoji: string }[] = [
  { id: 'bodyweight', label: 'Bodyweight', emoji: '🤸' },
  { id: 'dumbbell', label: 'Dumbbells', emoji: '🏋️' },
  { id: 'barbell', label: 'Barbell', emoji: '🏋️‍♂️' },
  { id: 'kettlebell', label: 'Kettlebell', emoji: '🔔' },
  { id: 'band', label: 'Resistance band', emoji: '➰' },
  { id: 'plate', label: 'Weight plate', emoji: '⚪' },
  { id: 'pullup_bar', label: 'Pull-up bar', emoji: '🪜' },
  { id: 'bench', label: 'Bench', emoji: '🛋️' },
  { id: 'machine', label: 'Machines', emoji: '⚙️' },
  { id: 'cable', label: 'Cable station', emoji: '🪢' },
];

export const CATEGORIES: { id: ExerciseCategory; label: string }[] = [
  { id: 'strength', label: 'Strength' },
  { id: 'core', label: 'Core' },
  { id: 'cardio', label: 'Cardio / HIIT' },
  { id: 'mobility', label: 'Mobility' },
];

export const muscleLabel = (m: Muscle) => MUSCLES.find((x) => x.id === m)?.label ?? m;
export const equipmentLabel = (e: Equipment) => EQUIPMENT.find((x) => x.id === e)?.label ?? e;
