import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useLiveQuery } from 'dexie-react-hooks';
import { Clock, Repeat } from 'lucide-react';
import { db } from '../db';
import { PROGRAMS, type ProgramLevel } from '../data/programs';
import { CATEGORIES, equipmentLabel } from '../data/taxonomy';
import { PageHeader } from '../components/ui';
import { cn } from '../lib/utils';
import type { ExerciseCategory } from '../types';

export const LEVEL_STYLE: Record<ProgramLevel, string> = {
  beginner: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-200',
  intermediate: 'bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-200',
  advanced: 'bg-rose-100 text-rose-800 dark:bg-rose-900/40 dark:text-rose-200',
};

export default function ProgramsPage() {
  const enrollments = useLiveQuery(() => db.enrollments.toArray(), []);
  const [category, setCategory] = useState<ExerciseCategory | 'all'>('all');
  const [level, setLevel] = useState<ProgramLevel | 'all'>('all');

  const list = useMemo(
    () => PROGRAMS.filter((p) => (category === 'all' || p.category === category) && (level === 'all' || p.level === level)),
    [category, level],
  );
  const enrollmentOf = (id: string) => enrollments?.find((e) => e.programId === id);

  return (
    <div>
      <PageHeader title="Programs" subtitle="Structured multi-week plans. All programs are free and work offline." />
      <div className="mb-4 flex flex-wrap gap-2">
        <select className="input w-auto" value={category} onChange={(e) => setCategory(e.target.value as ExerciseCategory | 'all')}>
          <option value="all">All types</option>
          {CATEGORIES.map((c) => (
            <option key={c.id} value={c.id}>
              {c.label}
            </option>
          ))}
        </select>
        <select className="input w-auto" value={level} onChange={(e) => setLevel(e.target.value as ProgramLevel | 'all')}>
          <option value="all">All levels</option>
          <option value="beginner">Beginner</option>
          <option value="intermediate">Intermediate</option>
          <option value="advanced">Advanced</option>
        </select>
      </div>
      <ul className="grid gap-3 sm:grid-cols-2">
        {list.map((p) => {
          const en = enrollmentOf(p.id);
          const total = p.weeks * p.sessionsPerWeek;
          const pct = en ? Math.round((en.completed.length / total) * 100) : 0;
          return (
            <li key={p.id}>
              <Link to={`/programs/${p.id}`} className="card flex h-full flex-col gap-2 hover:border-brand-500">
                <div className="flex items-center gap-2">
                  <span className={cn('badge capitalize', LEVEL_STYLE[p.level])}>{p.level}</span>
                  <span className="badge">{CATEGORIES.find((c) => c.id === p.category)?.label}</span>
                  {en && <span className="badge bg-brand-100 text-brand-800 dark:bg-brand-800 dark:text-brand-50">Enrolled</span>}
                </div>
                <p className="text-lg font-bold">{p.title}</p>
                <p className="text-sm text-slate-600 dark:text-slate-300">{p.tagline}</p>
                <div className="mt-auto flex flex-wrap gap-3 text-xs text-slate-500 dark:text-slate-400">
                  <span>{p.weeks} weeks</span>
                  <span className="flex items-center gap-1">
                    <Repeat className="h-3 w-3" /> {p.sessionsPerWeek}×/week
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="h-3 w-3" /> {p.minutes} min
                  </span>
                </div>
                <p className="text-xs text-slate-500">{p.equipment.map(equipmentLabel).join(' · ')}</p>
                {en && (
                  <div className="h-1.5 overflow-hidden rounded-full bg-slate-200 dark:bg-slate-800">
                    <div className="h-full bg-brand-600" style={{ width: `${pct}%` }} />
                  </div>
                )}
              </Link>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
