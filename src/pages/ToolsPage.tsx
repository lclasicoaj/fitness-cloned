import { Link } from 'react-router-dom';
import { Activity, Calculator, ChevronRight, Flame, HeartPulse, Scale, Syringe } from 'lucide-react';
import { PageHeader } from '../components/ui';

export const TOOLS = [
  { id: 'calories', title: 'Calorie calculator', desc: 'Daily energy needs with five BMR formulas side by side.', icon: Flame },
  { id: 'macros', title: 'Macro planner', desc: 'Split calories into protein, fat and carbs.', icon: Calculator },
  { id: 'bmi', title: 'BMI calculator', desc: 'Body mass index with category.', icon: Scale },
  { id: 'heart-rate-zones', title: 'Heart rate zones', desc: 'Five training zones (Karvonen or % of max).', icon: HeartPulse },
  { id: 'one-rep-max', title: 'One rep max', desc: 'Estimate your 1RM and a percentage table.', icon: Activity },
  { id: 'peptide', title: 'Reconstitution calculator', desc: 'Concentration and syringe units for a vial.', icon: Syringe },
] as const;

export default function ToolsPage() {
  return (
    <div>
      <PageHeader title="Tools" subtitle="Calculators that run entirely on your device." />
      <ul className="space-y-2">
        {TOOLS.map(({ id, title, desc, icon: Icon }) => (
          <li key={id}>
            <Link to={`/tools/${id}`} className="card flex items-center gap-3 p-4 hover:border-brand-500">
              <div className="rounded-xl bg-brand-50 p-2 text-brand-700 dark:bg-brand-800/40 dark:text-brand-500">
                <Icon className="h-5 w-5" />
              </div>
              <div className="flex-1">
                <p className="font-semibold">{title}</p>
                <p className="text-sm text-slate-500 dark:text-slate-400">{desc}</p>
              </div>
              <ChevronRight className="h-4 w-4 text-slate-400" />
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
