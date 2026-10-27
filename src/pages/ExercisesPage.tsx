import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Search, Star } from 'lucide-react';
import { db } from '../db';
import { CATEGORIES, EQUIPMENT, MUSCLES, muscleLabel } from '../data/taxonomy';
import { Field, Modal, PageHeader } from '../components/ui';
import { useExercises, useFavorites } from '../lib/hooks';
import { cn, uid } from '../lib/utils';
import type { Equipment, Exercise, ExerciseCategory, Muscle, SetMode } from '../types';

function CustomExerciseForm({ onDone }: { onDone: () => void }) {
  const [name, setName] = useState('');
  const [primary, setPrimary] = useState<Muscle[]>([]);
  const [equipment, setEquipment] = useState<Equipment[]>(['bodyweight']);
  const [mode, setMode] = useState<SetMode>('weight_reps');
  const [category, setCategory] = useState<ExerciseCategory>('strength');
  const [mechanics, setMechanics] = useState<'compound' | 'isolation'>('compound');
  const [instructions, setInstructions] = useState('');

  const toggle = <T,>(list: T[], v: T) => (list.includes(v) ? list.filter((x) => x !== v) : [...list, v]);
  const valid = name.trim().length > 1 && primary.length > 0 && equipment.length > 0;

  const save = async () => {
    if (!valid) return;
    const ex: Exercise = {
      id: `custom-${uid()}`,
      name: name.trim(),
      primary,
      secondary: [],
      equipment,
      mode,
      mechanics,
      category,
      instructions: instructions
        .split('\n')
        .map((l) => l.trim())
        .filter(Boolean),
      custom: true,
      createdAt: Date.now(),
    };
    await db.customExercises.put(ex);
    onDone();
  };

  return (
    <div className="space-y-4">
      <Field label="Name">
        <input className="input" value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Landmine press" />
      </Field>
      <div>
        <span className="label">Primary muscles</span>
        <div className="flex flex-wrap gap-1.5">
          {MUSCLES.map((m) => (
            <button key={m.id} type="button" className={primary.includes(m.id) ? 'chip-on' : 'chip-off'} onClick={() => setPrimary(toggle(primary, m.id))}>
              {m.label}
            </button>
          ))}
        </div>
      </div>
      <div>
        <span className="label">Equipment</span>
        <div className="flex flex-wrap gap-1.5">
          {EQUIPMENT.map((e) => (
            <button key={e.id} type="button" className={equipment.includes(e.id) ? 'chip-on' : 'chip-off'} onClick={() => setEquipment(toggle(equipment, e.id))}>
              {e.emoji} {e.label}
            </button>
          ))}
        </div>
      </div>
      <div className="grid grid-cols-3 gap-2">
        <Field label="Tracking">
          <select className="input" value={mode} onChange={(e) => setMode(e.target.value as SetMode)}>
            <option value="weight_reps">Weight × reps</option>
            <option value="reps">Reps</option>
            <option value="time">Time</option>
          </select>
        </Field>
        <Field label="Type">
          <select className="input" value={category} onChange={(e) => setCategory(e.target.value as ExerciseCategory)}>
            {CATEGORIES.map((c) => (
              <option key={c.id} value={c.id}>
                {c.label}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Mechanics">
          <select className="input" value={mechanics} onChange={(e) => setMechanics(e.target.value as 'compound' | 'isolation')}>
            <option value="compound">Compound</option>
            <option value="isolation">Isolation</option>
          </select>
        </Field>
      </div>
      <Field label="Instructions (one step per line)">
        <textarea className="input min-h-24" value={instructions} onChange={(e) => setInstructions(e.target.value)} />
      </Field>
      <button className="btn-primary w-full" disabled={!valid} onClick={save}>
        Save exercise
      </button>
    </div>
  );
}

export default function ExercisesPage() {
  const { all } = useExercises();
  const fav = useFavorites();
  const [q, setQ] = useState('');
  const [muscle, setMuscle] = useState<Muscle | ''>('');
  const [equipment, setEquipment] = useState<Equipment | ''>('');
  const [onlyFav, setOnlyFav] = useState(false);
  const [adding, setAdding] = useState(false);

  const list = useMemo(() => {
    const needle = q.trim().toLowerCase();
    return all
      .filter(
        (e) =>
          (!needle || e.name.toLowerCase().includes(needle)) &&
          (!muscle || e.primary.includes(muscle) || e.secondary.includes(muscle)) &&
          (!equipment || e.equipment.includes(equipment)) &&
          (!onlyFav || fav.ids.has(e.id)),
      )
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [all, q, muscle, equipment, onlyFav, fav.ids]);

  return (
    <div>
      <PageHeader
        title="Exercise library"
        subtitle={`${all.length} exercises, including your own.`}
        action={
          <button className="btn-primary" onClick={() => setAdding(true)}>
            <Plus className="h-4 w-4" /> New
          </button>
        }
      />
      <div className="relative mb-2">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
        <input className="input pl-9" placeholder="Search exercises" value={q} onChange={(e) => setQ(e.target.value)} />
      </div>
      <div className="mb-4 flex flex-wrap gap-2">
        <select className="input w-auto" value={muscle} onChange={(e) => setMuscle(e.target.value as Muscle | '')}>
          <option value="">All muscles</option>
          {MUSCLES.map((m) => (
            <option key={m.id} value={m.id}>
              {m.label}
            </option>
          ))}
        </select>
        <select className="input w-auto" value={equipment} onChange={(e) => setEquipment(e.target.value as Equipment | '')}>
          <option value="">All equipment</option>
          {EQUIPMENT.map((e) => (
            <option key={e.id} value={e.id}>
              {e.label}
            </option>
          ))}
        </select>
        <button className={onlyFav ? 'chip-on' : 'chip-off'} onClick={() => setOnlyFav(!onlyFav)}>
          <Star className="h-3.5 w-3.5" /> Favorites
        </button>
      </div>
      <ul className="space-y-2">
        {list.map((e) => (
          <li key={e.id} className="card flex items-center gap-3 p-3">
            <Link to={`/exercises/${e.id}`} className="min-w-0 flex-1">
              <p className="truncate font-medium">
                {e.name} {e.custom && <span className="badge ml-1">Custom</span>}
              </p>
              <p className="truncate text-xs text-slate-500">{e.primary.map(muscleLabel).join(', ')}</p>
            </Link>
            <button className="icon-btn" aria-label={fav.ids.has(e.id) ? 'Remove favorite' : 'Add favorite'} onClick={() => fav.toggle(e.id)}>
              <Star className={cn('h-5 w-5', fav.ids.has(e.id) ? 'fill-amber-400 text-amber-400' : 'text-slate-400')} />
            </button>
          </li>
        ))}
        {list.length === 0 && <li className="card text-center text-sm text-slate-500">No exercises match these filters.</li>}
      </ul>
      <Modal open={adding} onClose={() => setAdding(false)} title="New custom exercise" wide>
        <CustomExerciseForm onDone={() => setAdding(false)} />
      </Modal>
    </div>
  );
}
