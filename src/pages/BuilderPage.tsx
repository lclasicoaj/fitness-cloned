import { useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowDown, ArrowUp, Info, Plus, RotateCcw, Shuffle, Star, Trash2, Wand2 } from 'lucide-react';
import { EQUIPMENT, MUSCLE_REGIONS, MUSCLES, muscleLabel } from '../data/taxonomy';
import { generateWorkout, shuffleOne, toSessionExercise, type BuilderPick } from '../lib/builder';
import { useActiveSession, useExercises, useFavorites, useSettings, useStoredState } from '../lib/hooks';
import { ActiveSessionExistsError, startSession } from '../lib/sessions';
import { cn, uid } from '../lib/utils';
import type { Equipment, Muscle } from '../types';
import ExercisePicker from '../components/ExercisePicker';

interface BuilderState {
  step: number;
  equipment: Equipment[];
  muscles: Muscle[];
  picks: BuilderPick[];
}

const INITIAL: BuilderState = { step: 0, equipment: ['bodyweight'], muscles: [], picks: [] };
const STEPS = ['Equipment', 'Muscles', 'Exercises'];

export default function BuilderPage() {
  const [state, setState] = useStoredState<BuilderState>('rf-builder', INITIAL);
  const { all, map } = useExercises();
  const favorites = useFavorites();
  const settings = useSettings();
  const active = useActiveSession();
  const navigate = useNavigate();
  const [pickerOpen, setPickerOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const toggle = <T,>(list: T[], v: T) => (list.includes(v) ? list.filter((x) => x !== v) : [...list, v]);
  const set = (patch: Partial<BuilderState>) => setState((s) => ({ ...s, ...patch }));

  const regenerate = () => set({ picks: generateWorkout(all, state.muscles, state.equipment, settings.exercisesPerMuscle) });

  const next = () => {
    if (state.step === 1) regenerate();
    set({ step: Math.min(2, state.step + 1) });
  };

  const move = (i: number, dir: -1 | 1) => {
    const picks = [...state.picks];
    const j = i + dir;
    if (j < 0 || j >= picks.length) return;
    [picks[i], picks[j]] = [picks[j], picks[i]];
    set({ picks });
  };

  const start = async () => {
    setError(null);
    try {
      const exercises = state.picks.filter((p) => map[p.exerciseId]).map((p) => toSessionExercise(map[p.exerciseId], settings.defaultSets));
      const title = state.muscles.length ? state.muscles.map(muscleLabel).slice(0, 3).join(' · ') : 'Custom workout';
      await startSession({ title, exercises, map });
      navigate('/session');
    } catch (e) {
      setError(e instanceof ActiveSessionExistsError ? e.message : 'Could not start the workout.');
    }
  };

  const grouped = useMemo(() => MUSCLE_REGIONS.map((r) => ({ region: r, muscles: MUSCLES.filter((m) => m.region === r) })), []);

  return (
    <div>
      {active && (
        <div className="card mb-4 flex items-center justify-between gap-3 border-brand-500 bg-brand-50 dark:bg-brand-800/30">
          <div>
            <p className="font-semibold">Workout in progress</p>
            <p className="text-sm text-slate-600 dark:text-slate-300">{active.title}</p>
          </div>
          <Link to="/session" className="btn-primary">
            Resume
          </Link>
        </div>
      )}

      <h1 className="text-2xl font-bold tracking-tight">Build your workout</h1>
      <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Pick your equipment and target muscles, and RepForge generates a session. Works fully offline.</p>

      <ol className="my-5 grid grid-cols-3 gap-2">
        {STEPS.map((s, i) => (
          <li key={s}>
            <button
              className={cn(
                'w-full rounded-xl border px-2 py-2 text-left text-sm transition',
                i === state.step ? 'border-brand-700 bg-brand-700 text-white' : i < state.step ? 'border-brand-500 text-brand-700 dark:text-brand-500' : 'border-slate-300 text-slate-500 dark:border-slate-700',
              )}
              onClick={() => (i < state.step || (i === 1 && state.equipment.length) || (i === 2 && state.picks.length) ? set({ step: i }) : undefined)}
            >
              <span className="block text-xs opacity-80">Step {i + 1}</span>
              <span className="font-semibold">{s}</span>
            </button>
          </li>
        ))}
      </ol>

      {state.step === 0 && (
        <section>
          <h2 className="mb-3 font-semibold">What equipment do you have?</h2>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
            {EQUIPMENT.map((e) => {
              const on = state.equipment.includes(e.id);
              return (
                <button
                  key={e.id}
                  aria-pressed={on}
                  onClick={() => set({ equipment: toggle(state.equipment, e.id) })}
                  className={cn(
                    'flex items-center gap-3 rounded-2xl border p-3 text-left transition',
                    on ? 'border-brand-700 bg-brand-50 ring-2 ring-brand-500/30 dark:bg-brand-800/30' : 'border-slate-200 bg-white hover:border-brand-500 dark:border-slate-800 dark:bg-slate-900',
                  )}
                >
                  <span className="text-2xl" aria-hidden>
                    {e.emoji}
                  </span>
                  <span className="font-medium">{e.label}</span>
                </button>
              );
            })}
          </div>
          <p className="mt-2 text-xs text-slate-500">Bodyweight exercises are always included.</p>
        </section>
      )}

      {state.step === 1 && (
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold">Which muscles do you want to train?</h2>
            <button className="btn-ghost text-xs" onClick={() => set({ muscles: state.muscles.length === MUSCLES.length ? [] : MUSCLES.map((m) => m.id) })}>
              {state.muscles.length === MUSCLES.length ? 'Clear' : 'Full body'}
            </button>
          </div>
          {grouped.map(({ region, muscles }) => (
            <div key={region}>
              <p className="label">{region}</p>
              <div className="flex flex-wrap gap-2">
                {muscles.map((m) => (
                  <button key={m.id} aria-pressed={state.muscles.includes(m.id)} className={state.muscles.includes(m.id) ? 'chip-on' : 'chip-off'} onClick={() => set({ muscles: toggle(state.muscles, m.id) })}>
                    {m.label}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </section>
      )}

      {state.step === 2 && (
        <section>
          <div className="mb-3 flex items-center justify-between">
            <h2 className="font-semibold">Your exercises ({state.picks.length})</h2>
            <button className="btn-ghost text-xs" onClick={regenerate}>
              <Wand2 className="h-4 w-4" /> Regenerate
            </button>
          </div>
          {state.picks.length === 0 && <p className="card text-sm text-slate-500">No exercises match this equipment and muscle combination. Add more equipment or add exercises manually.</p>}
          <ul className="space-y-2">
            {state.picks.map((p, i) => {
              const ex = map[p.exerciseId];
              if (!ex) return null;
              return (
                <li key={p.uid} className="card flex items-center gap-2 p-3">
                  <div className="flex flex-col">
                    <button className="icon-btn h-7 w-7" aria-label="Move up" disabled={i === 0} onClick={() => move(i, -1)}>
                      <ArrowUp className="h-4 w-4" />
                    </button>
                    <button className="icon-btn h-7 w-7" aria-label="Move down" disabled={i === state.picks.length - 1} onClick={() => move(i, 1)}>
                      <ArrowDown className="h-4 w-4" />
                    </button>
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-medium">{ex.name}</p>
                    <p className="truncate text-xs text-slate-500 dark:text-slate-400">{ex.primary.map(muscleLabel).join(', ')}</p>
                  </div>
                  <button className="icon-btn" aria-label="Favorite" onClick={() => favorites.toggle(ex.id)}>
                    <Star className={cn('h-4 w-4', favorites.ids.has(ex.id) && 'fill-amber-400 text-amber-400')} />
                  </button>
                  <Link className="icon-btn" aria-label="Exercise details" to={`/exercises/${ex.id}`}>
                    <Info className="h-4 w-4" />
                  </Link>
                  <button className="icon-btn" aria-label="Shuffle" onClick={() => set({ picks: shuffleOne(all, state.picks, p, state.muscles, state.equipment) })}>
                    <Shuffle className="h-4 w-4" />
                  </button>
                  <button className="icon-btn" aria-label="Remove" onClick={() => set({ picks: state.picks.filter((x) => x.uid !== p.uid) })}>
                    <Trash2 className="h-4 w-4" />
                  </button>
                </li>
              );
            })}
          </ul>
          <button className="btn-secondary mt-3 w-full" onClick={() => setPickerOpen(true)}>
            <Plus className="h-4 w-4" /> Add exercise
          </button>
          <ExercisePicker
            open={pickerOpen}
            onClose={() => setPickerOpen(false)}
            equipment={state.equipment}
            exclude={state.picks.map((p) => p.exerciseId)}
            onPick={(ex) => set({ picks: [...state.picks, { uid: uid(), exerciseId: ex.id }] })}
          />
        </section>
      )}

      {error && <p className="mt-4 rounded-xl bg-red-50 p-3 text-sm text-red-700 dark:bg-red-900/30 dark:text-red-300">{error}</p>}

      <div className="mt-6 flex items-center justify-between gap-2">
        <button className="btn-ghost" disabled={state.step === 0} onClick={() => set({ step: state.step - 1 })}>
          Previous
        </button>
        <button className="btn-ghost text-xs" onClick={() => setState(INITIAL)}>
          <RotateCcw className="h-4 w-4" /> Reset
        </button>
        {state.step < 2 ? (
          <button className="btn-primary" disabled={(state.step === 0 && state.equipment.length === 0) || (state.step === 1 && state.muscles.length === 0)} onClick={next}>
            Continue
          </button>
        ) : (
          <button className="btn-primary" disabled={state.picks.length === 0 || Boolean(active)} onClick={start}>
            Start workout
          </button>
        )}
      </div>
    </div>
  );
}
