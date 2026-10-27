import { useMemo, useState } from 'react';
import { Search, Star } from 'lucide-react';
import { MUSCLES, muscleLabel } from '../data/taxonomy';
import { isAvailable } from '../lib/builder';
import { useExercises, useFavorites } from '../lib/hooks';
import type { Equipment, Exercise, Muscle } from '../types';
import { Modal } from './ui';

interface Props {
  open: boolean;
  onClose: () => void;
  onPick: (ex: Exercise) => void;
  equipment?: Equipment[];
  initialMuscle?: Muscle;
  exclude?: string[];
}

export default function ExercisePicker({ open, onClose, onPick, equipment, initialMuscle, exclude = [] }: Props) {
  const { all } = useExercises();
  const { ids: favs } = useFavorites();
  const [q, setQ] = useState('');
  const [muscle, setMuscle] = useState<Muscle | 'all' | 'favorites'>(initialMuscle ?? 'all');
  const [onlyMine, setOnlyMine] = useState(Boolean(equipment?.length));

  const list = useMemo(() => {
    const needle = q.trim().toLowerCase();
    return all
      .filter((e) => !exclude.includes(e.id))
      .filter((e) => (muscle === 'all' ? true : muscle === 'favorites' ? favs.has(e.id) : e.primary.includes(muscle) || e.secondary.includes(muscle)))
      .filter((e) => (onlyMine && equipment ? isAvailable(e, equipment) : true))
      .filter((e) => !needle || e.name.toLowerCase().includes(needle))
      .sort((a, b) => Number(favs.has(b.id)) - Number(favs.has(a.id)) || a.name.localeCompare(b.name));
  }, [all, exclude, muscle, favs, onlyMine, equipment, q]);

  return (
    <Modal open={open} onClose={onClose} title="Add exercise" wide>
      <div className="space-y-3">
        <div className="relative">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
          <input className="input pl-9" placeholder="Search exercises" value={q} onChange={(e) => setQ(e.target.value)} autoFocus />
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <select className="input w-auto" value={muscle} onChange={(e) => setMuscle(e.target.value as Muscle | 'all' | 'favorites')}>
            <option value="all">All muscles</option>
            <option value="favorites">★ Favorites</option>
            {MUSCLES.map((m) => (
              <option key={m.id} value={m.id}>
                {m.label}
              </option>
            ))}
          </select>
          {equipment && (
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" checked={onlyMine} onChange={(e) => setOnlyMine(e.target.checked)} />
              Only my equipment
            </label>
          )}
        </div>
        <ul className="divide-y divide-slate-200 dark:divide-slate-800">
          {list.map((e) => (
            <li key={e.id}>
              <button
                className="flex w-full items-center justify-between gap-3 py-3 text-left hover:bg-slate-50 dark:hover:bg-slate-800/50"
                onClick={() => {
                  onPick(e);
                  onClose();
                }}
              >
                <div>
                  <p className="font-medium">
                    {favs.has(e.id) && <Star className="mr-1 inline h-3.5 w-3.5 fill-amber-400 text-amber-400" />}
                    {e.name}
                    {e.custom && <span className="badge ml-2">custom</span>}
                  </p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">{e.primary.map(muscleLabel).join(', ')}</p>
                </div>
                <span className="text-brand-700 dark:text-brand-500">Add</span>
              </button>
            </li>
          ))}
          {list.length === 0 && <li className="py-6 text-center text-sm text-slate-500">No exercises match.</li>}
        </ul>
      </div>
    </Modal>
  );
}
