import { describe, expect, it } from 'vitest';
import { bmi, bmiCategory, bmrHarrisBenedict, bmrKatchMcArdle, bmrMifflin, heartRateZones, macros, maxHeartRate, oneRepMax, peptideDose } from './calculators';

const body = { sex: 'male' as const, age: 30, weightKg: 80, heightCm: 180 };

describe('calculators', () => {
  it('computes Mifflin–St Jeor BMR', () => {
    expect(bmrMifflin(body)).toBeCloseTo(1780, 5);
    expect(bmrMifflin({ ...body, sex: 'female' })).toBeCloseTo(1614, 5);
  });

  it('computes revised Harris–Benedict BMR', () => {
    expect(bmrHarrisBenedict(body)).toBeCloseTo(1853.632, 2);
  });

  it('requires body fat for Katch–McArdle', () => {
    expect(bmrKatchMcArdle(body)).toBeUndefined();
    expect(bmrKatchMcArdle({ ...body, bodyFatPct: 20 })).toBeCloseTo(370 + 21.6 * 64, 5);
  });

  it('computes BMI and categories', () => {
    expect(bmi(80, 180)).toBeCloseTo(24.69, 2);
    expect(bmiCategory(17).label).toBe('Underweight');
    expect(bmiCategory(22).label).toBe('Healthy weight');
    expect(bmiCategory(27).label).toBe('Overweight');
    expect(bmiCategory(32).label).toBe('Obesity');
  });

  it('computes heart-rate zones (Karvonen and % max)', () => {
    expect(maxHeartRate(40, 'classic')).toBe(180);
    expect(maxHeartRate(40)).toBe(180);
    const pct = heartRateZones(200);
    expect(pct[0]).toMatchObject({ min: 100, max: 120 });
    const karvonen = heartRateZones(200, 60);
    expect(karvonen[0]).toMatchObject({ min: 130, max: 144 });
    expect(karvonen[4].max).toBe(200);
  });

  it('computes one-rep max estimates', () => {
    expect(oneRepMax(100, 1)).toBe(100);
    expect(oneRepMax(100, 5)).toBeCloseTo(116.67, 2);
    expect(oneRepMax(100, 5, 'brzycki')).toBeCloseTo(112.5, 2);
    expect(oneRepMax(0, 5)).toBe(0);
  });

  it('computes macros that add up to the calorie target', () => {
    const r = macros({ calories: 2500, weightKg: 80, proteinPerKg: 2, fatPct: 25 });
    expect(r.proteinG).toBe(160);
    expect(r.fatG).toBeCloseTo(69.44, 2);
    expect(r.proteinKcal + r.fatKcal + r.carbKcal).toBeCloseTo(2500, 5);
  });

  it('computes reconstitution arithmetic', () => {
    const r = peptideDose({ vialMg: 5, waterMl: 2, doseMcg: 250 });
    expect(r.concentrationMcgPerMl).toBe(2500);
    expect(r.volumeMl).toBeCloseTo(0.1, 6);
    expect(r.units).toBeCloseTo(10, 6);
    expect(r.dosesPerVial).toBe(20);
  });
});
