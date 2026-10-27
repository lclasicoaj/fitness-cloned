import { useState, type ReactNode } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import {
  ACTIVITY_LEVELS,
  BMR_FORMULAS,
  GOALS,
  PERCENT_TABLE,
  bmi,
  bmiCategory,
  heartRateZones,
  macros,
  maxHeartRate,
  oneRepMax,
  peptideDose,
  type Sex,
} from '../../lib/calculators';
import { Empty, Field, NumInput, Segmented } from '../../components/ui';
import { useSettings } from '../../lib/hooks';
import { cn, fromDisplayWeight } from '../../lib/utils';
import { TOOLS } from '../ToolsPage';

const round = (n: number, d = 0) => {
  const f = 10 ** d;
  return Math.round(n * f) / f;
};

function Result({ children }: { children: ReactNode }) {
  return <div className="card mt-4 border-brand-500/40 bg-brand-50/50 dark:bg-brand-800/10">{children}</div>;
}

function WeightField({ value, onValue }: { value: number | undefined; onValue: (v: number | undefined) => void }) {
  const { units } = useSettings();
  return (
    <Field label={`Body weight (${units})`}>
      <NumInput value={value} onValue={onValue} />
    </Field>
  );
}

function CaloriesTool() {
  const { units } = useSettings();
  const [sex, setSex] = useState<Sex>('male');
  const [age, setAge] = useState<number | undefined>(30);
  const [weight, setWeight] = useState<number | undefined>(units === 'kg' ? 75 : 165);
  const [height, setHeight] = useState<number | undefined>(178);
  const [bodyFat, setBodyFat] = useState<number | undefined>();
  const [activity, setActivity] = useState<string>('moderate');
  const [goal, setGoal] = useState<string>('maintain');

  const weightKg = fromDisplayWeight(weight, units);
  const factor = ACTIVITY_LEVELS.find((a) => a.id === activity)!.factor;
  const delta = GOALS.find((g) => g.id === goal)!.delta;
  const ready = age && weightKg && height;
  const results = ready
    ? BMR_FORMULAS.map((f) => {
        const bmr = f.fn({ sex, age, weightKg, heightCm: height, bodyFatPct: bodyFat });
        return { ...f, bmr, tdee: bmr === undefined ? undefined : bmr * factor };
      })
    : [];
  const primary = results[0];

  return (
    <div className="space-y-3">
      <Segmented<Sex>
        value={sex}
        onChange={setSex}
        options={[
          { value: 'male', label: 'Male' },
          { value: 'female', label: 'Female' },
        ]}
      />
      <div className="grid grid-cols-2 gap-2">
        <Field label="Age">
          <NumInput value={age} onValue={setAge} inputMode="numeric" />
        </Field>
        <Field label="Height (cm)">
          <NumInput value={height} onValue={setHeight} />
        </Field>
        <WeightField value={weight} onValue={setWeight} />
        <Field label="Body fat % (optional)">
          <NumInput value={bodyFat} onValue={setBodyFat} />
        </Field>
      </div>
      <Field label="Activity level">
        <select className="input" value={activity} onChange={(e) => setActivity(e.target.value)}>
          {ACTIVITY_LEVELS.map((a) => (
            <option key={a.id} value={a.id}>
              {a.label}
            </option>
          ))}
        </select>
      </Field>
      <Field label="Goal">
        <select className="input" value={goal} onChange={(e) => setGoal(e.target.value)}>
          {GOALS.map((g) => (
            <option key={g.id} value={g.id}>
              {g.label} ({g.delta > 0 ? '+' : ''}
              {g.delta} kcal)
            </option>
          ))}
        </select>
      </Field>
      {primary?.tdee && (
        <Result>
          <p className="text-sm text-slate-500">Daily target (Mifflin–St Jeor)</p>
          <p className="text-3xl font-bold">{round(primary.tdee + delta)} kcal</p>
          <p className="text-sm text-slate-500">
            Maintenance {round(primary.tdee)} kcal · BMR {round(primary.bmr!)} kcal
          </p>
          <table className="mt-4 w-full text-sm">
            <thead className="text-left text-xs text-slate-500">
              <tr>
                <th className="py-1">Formula</th>
                <th>BMR</th>
                <th>Maintenance</th>
              </tr>
            </thead>
            <tbody>
              {results.map((r) => (
                <tr key={r.id} className="border-t border-slate-200 dark:border-slate-800">
                  <td className="py-1.5">{r.label}</td>
                  <td>{r.bmr === undefined ? '—' : round(r.bmr)}</td>
                  <td>{r.tdee === undefined ? <span className="text-xs text-slate-400">needs body fat %</span> : round(r.tdee)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </Result>
      )}
    </div>
  );
}

function MacrosTool() {
  const { units } = useSettings();
  const [calories, setCalories] = useState<number | undefined>(2400);
  const [weight, setWeight] = useState<number | undefined>(units === 'kg' ? 75 : 165);
  const [protein, setProtein] = useState<number | undefined>(1.8);
  const [fatPct, setFatPct] = useState<number | undefined>(28);
  const weightKg = fromDisplayWeight(weight, units);
  const r = calories && weightKg && protein !== undefined && fatPct !== undefined ? macros({ calories, weightKg, proteinPerKg: protein, fatPct }) : null;
  const over = r && r.proteinKcal + r.fatKcal > (calories ?? 0);

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 gap-2">
        <Field label="Daily calories">
          <NumInput value={calories} onValue={setCalories} inputMode="numeric" />
        </Field>
        <WeightField value={weight} onValue={setWeight} />
        <Field label="Protein (g per kg)" hint="1.6–2.2 for muscle gain">
          <NumInput value={protein} onValue={setProtein} />
        </Field>
        <Field label="Fat (% of calories)" hint="20–35% is typical">
          <NumInput value={fatPct} onValue={setFatPct} />
        </Field>
      </div>
      {r && (
        <Result>
          <div className="grid grid-cols-3 gap-2 text-center">
            {[
              ['Protein', r.proteinG, r.proteinKcal, 'bg-sky-500'],
              ['Fat', r.fatG, r.fatKcal, 'bg-amber-500'],
              ['Carbs', r.carbsG, r.carbKcal, 'bg-emerald-500'],
            ].map(([label, g, kcal, color]) => (
              <div key={label as string}>
                <div className={cn('mx-auto mb-1 h-2 w-10 rounded-full', color as string)} />
                <p className="text-2xl font-bold">{round(g as number)} g</p>
                <p className="text-xs text-slate-500">
                  {label} · {round(kcal as number)} kcal
                </p>
              </div>
            ))}
          </div>
          {over && <p className="mt-3 text-sm text-red-600">Protein and fat already exceed your calories. Lower one of them.</p>}
        </Result>
      )}
    </div>
  );
}

function BmiTool() {
  const { units } = useSettings();
  const [weight, setWeight] = useState<number | undefined>(units === 'kg' ? 75 : 165);
  const [height, setHeight] = useState<number | undefined>(178);
  const weightKg = fromDisplayWeight(weight, units);
  const v = weightKg && height ? bmi(weightKg, height) : undefined;
  const cat = v ? bmiCategory(v) : null;
  const tone = { info: 'text-sky-600', ok: 'text-emerald-600', warn: 'text-amber-600', bad: 'text-red-600' };
  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 gap-2">
        <WeightField value={weight} onValue={setWeight} />
        <Field label="Height (cm)">
          <NumInput value={height} onValue={setHeight} />
        </Field>
      </div>
      {v && cat && (
        <Result>
          <p className="text-4xl font-bold">{round(v, 1)}</p>
          <p className={cn('font-semibold', tone[cat.tone])}>{cat.label}</p>
          <p className="mt-2 text-xs text-slate-500">BMI does not distinguish muscle from fat. Use it as a rough population-level guide only.</p>
        </Result>
      )}
    </div>
  );
}

function HeartRateTool() {
  const [age, setAge] = useState<number | undefined>(30);
  const [resting, setResting] = useState<number | undefined>();
  const [method, setMethod] = useState<'tanaka' | 'classic'>('tanaka');
  const max = age ? maxHeartRate(age, method) : undefined;
  const zones = max ? heartRateZones(max, resting) : [];
  const colors = ['bg-slate-400', 'bg-sky-500', 'bg-emerald-500', 'bg-amber-500', 'bg-red-500'];
  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 gap-2">
        <Field label="Age">
          <NumInput value={age} onValue={setAge} inputMode="numeric" />
        </Field>
        <Field label="Resting HR (optional)" hint="Enables the Karvonen method">
          <NumInput value={resting} onValue={setResting} inputMode="numeric" />
        </Field>
      </div>
      <Segmented
        value={method}
        onChange={setMethod}
        options={[
          { value: 'tanaka', label: 'Tanaka (208 − 0.7×age)' },
          { value: 'classic', label: '220 − age' },
        ]}
      />
      {max && (
        <Result>
          <p className="text-sm text-slate-500">Estimated max heart rate</p>
          <p className="mb-3 text-3xl font-bold">{round(max)} bpm</p>
          <ul className="space-y-2">
            {zones.map((z, i) => (
              <li key={z.zone} className="flex items-center gap-3">
                <span className={cn('h-8 w-1.5 rounded-full', colors[i])} />
                <div className="flex-1">
                  <p className="text-sm font-semibold">
                    Zone {z.zone}: {z.name}
                  </p>
                  <p className="text-xs text-slate-500">{z.desc}</p>
                </div>
                <span className="whitespace-nowrap text-sm font-semibold">
                  {z.min}–{z.max}
                </span>
              </li>
            ))}
          </ul>
        </Result>
      )}
    </div>
  );
}

function OneRepMaxTool() {
  const { units } = useSettings();
  const [weight, setWeight] = useState<number | undefined>(units === 'kg' ? 80 : 175);
  const [reps, setReps] = useState<number | undefined>(5);
  const [formula, setFormula] = useState<'epley' | 'brzycki' | 'lombardi'>('epley');
  const orm = weight && reps ? oneRepMax(weight, reps, formula) : 0;
  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 gap-2">
        <Field label={`Weight lifted (${units})`}>
          <NumInput value={weight} onValue={setWeight} />
        </Field>
        <Field label="Reps">
          <NumInput value={reps} onValue={setReps} inputMode="numeric" />
        </Field>
      </div>
      <Segmented
        value={formula}
        onChange={setFormula}
        options={[
          { value: 'epley', label: 'Epley' },
          { value: 'brzycki', label: 'Brzycki' },
          { value: 'lombardi', label: 'Lombardi' },
        ]}
      />
      {orm > 0 && (
        <Result>
          <p className="text-sm text-slate-500">Estimated 1 rep max</p>
          <p className="mb-3 text-3xl font-bold">
            {round(orm, 1)} {units}
          </p>
          {reps && reps > 10 && <p className="mb-2 text-xs text-amber-600">Estimates are less accurate above 10 reps.</p>}
          <table className="w-full text-sm">
            <thead className="text-left text-xs text-slate-500">
              <tr>
                <th className="py-1">% 1RM</th>
                <th>Weight</th>
                <th>≈ Reps</th>
              </tr>
            </thead>
            <tbody>
              {PERCENT_TABLE.map((r) => (
                <tr key={r.pct} className="border-t border-slate-200 dark:border-slate-800">
                  <td className="py-1">{r.pct}%</td>
                  <td>
                    {round((orm * r.pct) / 100, 1)} {units}
                  </td>
                  <td>{r.reps}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </Result>
      )}
    </div>
  );
}

function PeptideTool() {
  const [vialMg, setVialMg] = useState<number | undefined>(5);
  const [waterMl, setWaterMl] = useState<number | undefined>(2);
  const [doseMcg, setDoseMcg] = useState<number | undefined>(250);
  const r = vialMg && waterMl && doseMcg ? peptideDose({ vialMg, waterMl, doseMcg }) : null;
  return (
    <div className="space-y-3">
      <p className="rounded-xl bg-amber-50 p-3 text-xs text-amber-800 dark:bg-amber-900/30 dark:text-amber-200">
        Arithmetic helper only. It is not medical advice. Follow the instructions of a licensed healthcare professional.
      </p>
      <div className="grid grid-cols-3 gap-2">
        <Field label="Vial (mg)">
          <NumInput value={vialMg} onValue={setVialMg} />
        </Field>
        <Field label="Water (mL)">
          <NumInput value={waterMl} onValue={setWaterMl} />
        </Field>
        <Field label="Dose (mcg)">
          <NumInput value={doseMcg} onValue={setDoseMcg} />
        </Field>
      </div>
      {r && (
        <Result>
          <p className="text-sm text-slate-500">Draw on a U-100 insulin syringe</p>
          <p className="text-3xl font-bold">{round(r.units, 1)} units</p>
          <p className="text-sm text-slate-500">
            {round(r.volumeMl, 3)} mL · concentration {round(r.concentrationMcgPerMl)} mcg/mL · ≈ {Math.floor(r.dosesPerVial)} doses per vial
          </p>
          {r.units > 100 && <p className="mt-2 text-sm text-red-600">Volume exceeds a 1 mL syringe.</p>}
        </Result>
      )}
    </div>
  );
}

const COMPONENTS: Record<string, () => ReactNode> = {
  calories: CaloriesTool,
  macros: MacrosTool,
  bmi: BmiTool,
  'heart-rate-zones': HeartRateTool,
  'one-rep-max': OneRepMaxTool,
  peptide: PeptideTool,
};

export default function ToolPage() {
  const { tool = '' } = useParams();
  const meta = TOOLS.find((t) => t.id === tool);
  const Component = COMPONENTS[tool];
  if (!meta || !Component) return <Empty title="Tool not found" />;
  return (
    <div>
      <Link to="/tools" className="btn-ghost -ml-3 mb-2">
        <ArrowLeft className="h-4 w-4" /> Tools
      </Link>
      <h1 className="text-2xl font-bold">{meta.title}</h1>
      <p className="mb-4 text-sm text-slate-500 dark:text-slate-400">{meta.desc}</p>
      <Component />
    </div>
  );
}
