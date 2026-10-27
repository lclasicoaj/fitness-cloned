import { useMemo } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Star, Trash2 } from 'lucide-react';
import { db } from '../db';
import { equipmentLabel, muscleLabel } from '../data/taxonomy';
import { Empty, StatCard } from '../components/ui';
import { useCompletedSessions, useExercises, useFavorites, useSettings } from '../lib/hooks';
import { exerciseHistory, personalRecords } from '../lib/stats';
import { cn, formatShortDate, toDisplayWeight } from '../lib/utils';

export default function ExerciseDetailPage() {
  const { id = '' } = useParams();
  const { map, loaded } = useExercises();
  const sessions = useCompletedSessions();
  const settings = useSettings();
  const fav = useFavorites();
  const navigate = useNavigate();
  const ex = map[id];
  const unit = settings.units;

  const pr = useMemo(() => personalRecords(sessions ?? []).find((p) => p.exerciseId === id), [sessions, id]);
  const recent = useMemo(() => exerciseHistory(sessions ?? [], id).slice(-5).reverse(), [sessions, id]);

  if (!loaded) return null;
  if (!ex) return <Empty title="Exercise not found" />;

  const remove = async () => {
    if (!confirm('Delete this custom exercise? Past workouts keep their logged sets.')) return;
    await db.customExercises.delete(ex.id);
    await db.favorites.delete(ex.id);
    navigate('/exercises');
  };

  return (
    <div>
      <button className="btn-ghost -ml-3 mb-2" onClick={() => navigate(-1)}>
        <ArrowLeft className="h-4 w-4" /> Back
      </button>
      <div className="flex items-start justify-between gap-3">
        <h1 className="text-2xl font-bold">{ex.name}</h1>
        <button className="icon-btn" aria-label="Toggle favorite" onClick={() => fav.toggle(ex.id)}>
          <Star className={cn('h-6 w-6', fav.ids.has(ex.id) ? 'fill-amber-400 text-amber-400' : 'text-slate-400')} />
        </button>
      </div>
      <div className="mt-2 flex flex-wrap gap-1.5">
        <span className="badge capitalize">{ex.category}</span>
        <span className="badge capitalize">{ex.mechanics}</span>
        {ex.custom && <span className="badge">Custom</span>}
      </div>

      <div className="card mt-4 space-y-2 text-sm">
        <p>
          <span className="font-semibold">Primary: </span>
          {ex.primary.map(muscleLabel).join(', ')}
        </p>
        {ex.secondary.length > 0 && (
          <p>
            <span className="font-semibold">Secondary: </span>
            {ex.secondary.map(muscleLabel).join(', ')}
          </p>
        )}
        <p>
          <span className="font-semibold">Equipment: </span>
          {ex.equipment.map(equipmentLabel).join(', ')}
        </p>
      </div>

      {ex.instructions.length > 0 && (
        <div className="card mt-4">
          <p className="mb-2 font-semibold">How to do it</p>
          <ol className="list-inside list-decimal space-y-1 text-sm text-slate-700 dark:text-slate-300">
            {ex.instructions.map((s, i) => (
              <li key={i}>{s}</li>
            ))}
          </ol>
        </div>
      )}

      {pr && (
        <div className="mt-4 grid grid-cols-3 gap-2">
          {pr.maxWeight > 0 && <StatCard label={`Max (${unit})`} value={toDisplayWeight(pr.maxWeight, unit)} />}
          {pr.e1rm > 0 && <StatCard label={`Est. 1RM`} value={toDisplayWeight(Math.round(pr.e1rm * 10) / 10, unit)} />}
          {pr.bestReps > 0 && <StatCard label="Best reps" value={pr.bestReps} />}
          {pr.bestSeconds > 0 && <StatCard label="Best time" value={`${pr.bestSeconds}s`} />}
        </div>
      )}

      {recent.length > 0 && (
        <div className="card mt-4">
          <p className="mb-2 font-semibold">Recent sessions</p>
          <ul className="space-y-1 text-sm">
            {recent.map((p) => (
              <li key={p.sessionId}>
                <Link to={`/history/${p.sessionId}`} className="flex justify-between hover:underline">
                  <span>{formatShortDate(p.date)}</span>
                  <span className="text-slate-500">
                    {p.maxWeight > 0 ? `${toDisplayWeight(p.maxWeight, unit)} ${unit} · ` : ''}
                    {p.bestReps > 0 ? `${p.bestReps} reps` : `${p.bestSeconds}s`}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}

      {ex.custom && (
        <button className="btn-secondary mt-6 text-red-600" onClick={remove}>
          <Trash2 className="h-4 w-4" /> Delete custom exercise
        </button>
      )}
    </div>
  );
}
