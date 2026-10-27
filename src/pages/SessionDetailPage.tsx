import { useState } from 'react';
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { useLiveQuery } from 'dexie-react-hooks';
import { ArrowLeft, Repeat, Star, Trash2 } from 'lucide-react';
import { db } from '../db';
import { PROGRAM_MAP } from '../data/programs';
import { exerciseName, useExercises, useSettings } from '../lib/hooks';
import { ActiveSessionExistsError, repeatSession } from '../lib/sessions';
import { completedSets, sessionDuration, sessionVolume } from '../lib/stats';
import { formatDate, formatDuration, toDisplayWeight } from '../lib/utils';
import { Empty, StatCard } from '../components/ui';

export default function SessionDetailPage() {
  const { id = '' } = useParams();
  const [params] = useSearchParams();
  const session = useLiveQuery(() => db.sessions.get(id), [id]);
  const { map } = useExercises();
  const settings = useSettings();
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);

  if (session === undefined) return null;
  if (!session) return <Empty title="Workout not found" />;

  const remove = async () => {
    if (!confirm('Delete this workout from your history?')) return;
    await db.sessions.delete(session.id);
    navigate('/history');
  };

  const repeat = async () => {
    try {
      await repeatSession(session, map);
      navigate('/session');
    } catch (e) {
      setError(e instanceof ActiveSessionExistsError ? e.message : 'Could not start the workout.');
    }
  };

  const unit = settings.units;

  return (
    <div>
      <Link to="/history" className="btn-ghost -ml-3 mb-2">
        <ArrowLeft className="h-4 w-4" /> History
      </Link>
      {params.get('finished') && <div className="card mb-4 border-brand-500 bg-brand-50 text-center dark:bg-brand-800/30">🎉 Workout saved. Great job!</div>}
      <h1 className="text-2xl font-bold">{session.title}</h1>
      <p className="text-sm text-slate-500 dark:text-slate-400">{formatDate(session.startedAt)}</p>
      {session.program && PROGRAM_MAP[session.program.programId] && (
        <Link to={`/programs/${session.program.programId}`} className="badge mt-2">
          {PROGRAM_MAP[session.program.programId].title} · week {session.program.week}
        </Link>
      )}

      <div className="my-4 grid grid-cols-3 gap-2">
        <StatCard label="Duration" value={formatDuration(sessionDuration(session))} />
        <StatCard label="Sets" value={completedSets(session)} />
        <StatCard label={`Volume (${unit})`} value={Math.round(toDisplayWeight(sessionVolume(session), unit) ?? 0)} />
      </div>

      {(session.rating || session.comment) && (
        <div className="card mb-4">
          {session.rating && (
            <div className="flex gap-0.5">
              {[1, 2, 3, 4, 5].map((n) => (
                <Star key={n} className={n <= session.rating! ? 'h-4 w-4 fill-amber-400 text-amber-400' : 'h-4 w-4 text-slate-300'} />
              ))}
            </div>
          )}
          {session.comment && <p className="mt-2 text-sm">{session.comment}</p>}
        </div>
      )}

      <div className="space-y-3">
        {session.exercises.map((e) => (
          <div key={e.uid} className="card">
            <Link to={`/exercises/${e.exerciseId}`} className="font-semibold hover:underline">
              {exerciseName(map, e.exerciseId)}
            </Link>
            <ol className="mt-2 space-y-1 text-sm">
              {e.sets.map((s, i) => (
                <li key={i} className="flex gap-3">
                  <span className="w-6 text-slate-500">{i + 1}.</span>
                  <span>
                    {e.mode === 'time'
                      ? `${s.seconds ?? 0} s`
                      : e.mode === 'reps'
                        ? `${s.reps ?? 0} reps`
                        : `${toDisplayWeight(s.weightKg, unit) ?? 0} ${unit} × ${s.reps ?? 0}`}
                  </span>
                </li>
              ))}
            </ol>
          </div>
        ))}
      </div>

      {error && <p className="mt-4 rounded-xl bg-red-50 p-3 text-sm text-red-700 dark:bg-red-900/30 dark:text-red-300">{error}</p>}

      <div className="mt-6 flex gap-2">
        <button className="btn-primary flex-1" onClick={repeat}>
          <Repeat className="h-4 w-4" /> Repeat workout
        </button>
        <button className="btn-secondary text-red-600" onClick={remove}>
          <Trash2 className="h-4 w-4" /> Delete
        </button>
      </div>
    </div>
  );
}
