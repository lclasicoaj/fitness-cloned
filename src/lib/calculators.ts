export type Sex = 'male' | 'female';

export interface BodyInput {
  sex: Sex;
  age: number;
  weightKg: number;
  heightCm: number;
  bodyFatPct?: number;
}

export const ACTIVITY_LEVELS = [
  { id: 'sedentary', label: 'Sedentary (desk job, little exercise)', factor: 1.2 },
  { id: 'light', label: 'Lightly active (1–3 sessions/week)', factor: 1.375 },
  { id: 'moderate', label: 'Moderately active (3–5 sessions/week)', factor: 1.55 },
  { id: 'very', label: 'Very active (6–7 sessions/week)', factor: 1.725 },
  { id: 'extra', label: 'Extremely active (physical job + training)', factor: 1.9 },
] as const;

export const leanMass = (weightKg: number, bodyFatPct: number) => weightKg * (1 - bodyFatPct / 100);

export function bmrMifflin({ sex, age, weightKg, heightCm }: BodyInput) {
  return 10 * weightKg + 6.25 * heightCm - 5 * age + (sex === 'male' ? 5 : -161);
}

/** Revised Harris–Benedict (Roza & Shizgal, 1984). */
export function bmrHarrisBenedict({ sex, age, weightKg, heightCm }: BodyInput) {
  return sex === 'male'
    ? 88.362 + 13.397 * weightKg + 4.799 * heightCm - 5.677 * age
    : 447.593 + 9.247 * weightKg + 3.098 * heightCm - 4.33 * age;
}

export function bmrKatchMcArdle({ weightKg, bodyFatPct }: BodyInput) {
  if (bodyFatPct === undefined) return undefined;
  return 370 + 21.6 * leanMass(weightKg, bodyFatPct);
}

export function bmrCunningham({ weightKg, bodyFatPct }: BodyInput) {
  if (bodyFatPct === undefined) return undefined;
  return 500 + 22 * leanMass(weightKg, bodyFatPct);
}

/** Oxford / Henry (2005) weight-only equations, kcal/day. */
export function bmrOxford({ sex, age, weightKg }: BodyInput) {
  if (sex === 'male') {
    if (age < 30) return 16.0 * weightKg + 545;
    if (age < 60) return 14.2 * weightKg + 593;
    return 13.5 * weightKg + 514;
  }
  if (age < 30) return 13.1 * weightKg + 558;
  if (age < 60) return 9.74 * weightKg + 694;
  return 10.1 * weightKg + 569;
}

export const BMR_FORMULAS = [
  { id: 'mifflin', label: 'Mifflin–St Jeor', fn: bmrMifflin, needsBodyFat: false },
  { id: 'harris', label: 'Harris–Benedict (revised)', fn: bmrHarrisBenedict, needsBodyFat: false },
  { id: 'katch', label: 'Katch–McArdle', fn: bmrKatchMcArdle, needsBodyFat: true },
  { id: 'cunningham', label: 'Cunningham', fn: bmrCunningham, needsBodyFat: true },
  { id: 'oxford', label: 'Oxford (Henry)', fn: bmrOxford, needsBodyFat: false },
] as const;

export const GOALS = [
  { id: 'lose', label: 'Lose fat', delta: -500 },
  { id: 'maintain', label: 'Maintain', delta: 0 },
  { id: 'gain', label: 'Build muscle', delta: 300 },
] as const;

export function bmi(weightKg: number, heightCm: number) {
  const m = heightCm / 100;
  return weightKg / (m * m);
}

export function bmiCategory(v: number): { label: string; tone: 'info' | 'ok' | 'warn' | 'bad' } {
  if (v < 18.5) return { label: 'Underweight', tone: 'info' };
  if (v < 25) return { label: 'Healthy weight', tone: 'ok' };
  if (v < 30) return { label: 'Overweight', tone: 'warn' };
  return { label: 'Obesity', tone: 'bad' };
}

export function maxHeartRate(age: number, method: 'classic' | 'tanaka' = 'tanaka') {
  return method === 'classic' ? 220 - age : 208 - 0.7 * age;
}

export const HR_ZONES = [
  { zone: 1, name: 'Recovery', lo: 0.5, hi: 0.6, desc: 'Very easy, warm-up and cool-down.' },
  { zone: 2, name: 'Endurance', lo: 0.6, hi: 0.7, desc: 'Conversational pace, builds aerobic base and burns fat.' },
  { zone: 3, name: 'Tempo', lo: 0.7, hi: 0.8, desc: 'Comfortably hard, improves aerobic capacity.' },
  { zone: 4, name: 'Threshold', lo: 0.8, hi: 0.9, desc: 'Hard, raises lactate threshold.' },
  { zone: 5, name: 'Max effort', lo: 0.9, hi: 1.0, desc: 'All-out intervals, short durations only.' },
] as const;

/** Karvonen method when resting HR is given, otherwise % of max HR. */
export function heartRateZones(maxHr: number, restingHr?: number) {
  return HR_ZONES.map((z) => {
    const calc = (p: number) => (restingHr ? restingHr + p * (maxHr - restingHr) : p * maxHr);
    return { ...z, min: Math.round(calc(z.lo)), max: Math.round(calc(z.hi)) };
  });
}

export function peptideDose(input: { vialMg: number; waterMl: number; doseMcg: number }) {
  const concentrationMcgPerMl = (input.vialMg * 1000) / input.waterMl;
  const volumeMl = input.doseMcg / concentrationMcgPerMl;
  const units = volumeMl * 100; // U-100 syringe: 100 units = 1 mL
  const dosesPerVial = (input.vialMg * 1000) / input.doseMcg;
  return { concentrationMcgPerMl, volumeMl, units, dosesPerVial };
}

export function macros(input: { calories: number; weightKg: number; proteinPerKg: number; fatPct: number }) {
  const proteinG = input.weightKg * input.proteinPerKg;
  const fatKcal = input.calories * (input.fatPct / 100);
  const fatG = fatKcal / 9;
  const carbKcal = Math.max(0, input.calories - proteinG * 4 - fatKcal);
  return { proteinG, fatG, carbsG: carbKcal / 4, proteinKcal: proteinG * 4, fatKcal, carbKcal };
}

export function oneRepMax(weight: number, reps: number, formula: 'epley' | 'brzycki' | 'lombardi' = 'epley') {
  if (reps <= 0 || weight <= 0) return 0;
  if (reps === 1) return weight;
  switch (formula) {
    case 'brzycki':
      return reps >= 37 ? 0 : (weight * 36) / (37 - reps);
    case 'lombardi':
      return weight * Math.pow(reps, 0.1);
    default:
      return weight * (1 + reps / 30);
  }
}

export const PERCENT_TABLE = [100, 95, 90, 85, 80, 75, 70, 65, 60, 55, 50].map((pct) => ({
  pct,
  reps: { 100: 1, 95: 2, 90: 4, 85: 6, 80: 8, 75: 10, 70: 12, 65: 15, 60: 18, 55: 20, 50: 25 }[pct] as number,
}));
