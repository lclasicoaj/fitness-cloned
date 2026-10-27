import { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useLiveQuery } from 'dexie-react-hooks';
import { ArrowLeft, CheckCircle2, ChevronDown, Circle, Play } from 'lucide-react';
import { db } from '../db';
import { buildProgramSession, nextProgramSession, PROGRAM_MAP, sessionKey } from '../data/programs';
import { CATEGORIES, equipmentLabel } from '../data/taxonomy';
import { Empty, StatCard } from '../components/ui';
import { exerciseName, useActiveSession, useExercises } from '../lib/hooks';
import { ActiveSessionExistsError, startProgramSession } from '../lib/sessions';
import { cn } from '../lib/utils';
import { LEVEL_STYLE } from './ProgramsPage';

export default function ProgramDetailPage() {
  const { id = '' } = useParams();
  const program = PROGRAM_MAP[id];
  const enrollment = useLiveQuery(() => db.enrollments.get(id), [id]);
  const active = useActiveSession();
  const { map } = useExercises();
  const navigate = useNavigate();
  const [openWeek, setOpenWeek] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  if (!program) return <Empty title="Program not found" />;

  const completed = enrollment?.completed ?? [];
  const total = program.weeks * program.sessionsPerWeek;
  const next = nextProgramSession(program, completed);
  const currentWeek = openWeek ?? next?.week ?? 1;

  const enroll = () => db.enrollments.put({ programId: id, enrolledAt: Date.now(), completed: [], active: true });
  const leave = async () => {
    if (confirm('Leave this program? Your progress will be reset (completed workouts stay in history).')) await db.enrollments.delete(id);
  };

  const start = async (week: number, session: number) => {
    setError(null);
    try {
      await startProgramSession(id, week, session, map);
      navigate('/session');
    } catch (e) {
      setError(e instanceof ActiveSessionExistsError ? e.message : 'Could not start this session.');
    }
  };

  return (
    <div>
      <Link to="/programs" className="btn-ghost -ml-3 mb-2">
        <ArrowLeft className="h-4 w-4" /> Programs
      </Link>
      <div className="mb-2 flex gap-2">
        <span className={cn('badge capitalize', LEVEL_STYLE[program.level])}>{program.level}</span>
        <span className="badge">{CATEGORIES.find((c) => c.id === program.category)?.label}</span>
      </div>
      <h1 className="text-2xl font-bold">{program.title}</h1>
      <p className="mt-2 text-slate-600 dark:text-slate-300">{program.description}</p>

      <div className="my-4 grid grid-cols-3 gap-2">
        <StatCard label="Weeks" value={program.weeks} />
        <StatCard label="Per week" value={`${program.sessionsPerWeek}×`} />
        <StatCard label="Minutes" value={program.minutes} />
      </div>
      <p className="mb-4 text-sm text-slate-500">Equipment: {program.equipment.map(equipmentLabel).join(', ')}</p>

      {enrollment ? (
        <div className="card mb-4">
          <div className="mb-2 flex items-center justify-between text-sm">
            <span className="font-semibold">
              Progress: {completed.length}/{total} sessions
            </span>
            <button className="text-xs text-red-600 hover:underline" onClick={leave}>
              Leave program
            </button>
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-slate-200 dark:bg-slate-800">
            <div className="h-full bg-brand-600" style={{ width: `${(completed.length / total) * 100}%` }} />
          </div>
          {next ? (
            <button className="btn-primary mt-3 w-full" disabled={Boolean(active)} onClick={() => start(next.week, next.session)}>
              <Play className="h-4 w-4" /> Start week {next.week}, session {next.session}
            </button>
          ) : (
            <p className="mt-3 text-center font-semibold text-brand-700">🎉 Program complete!</p>
          )}
          {active && (
            <p className="mt-2 text-center text-xs text-slate-500">
              Finish your <Link to="/session" className="underline">current workout</Link> first.
            </p>
          )}
        </div>
      ) : (
        <button className="btn-primary mb-4 w-full" onClick={enroll}>
          Enroll in program
        </button>
      )}

      {error && <p className="mb-4 rounded-xl bg-red-50 p-3 text-sm text-red-700 dark:bg-red-900/30 dark:text-red-300">{error}</p>}

      <div className="card mb-4">
        <p className="mb-1 font-semibold">Coach notes</p>
        <ul className="list-inside list-disc text-sm text-slate-600 dark:text-slate-300">
          {program.notes.map((n) => (
            <li key={n}>{n}</li>
          ))}
        </ul>
      </div>

      <div className="space-y-2">
        {Array.from({ length: program.weeks }, (_, w) => w + 1).map((week) => {
          const open = currentWeek === week;
          const doneInWeek = Array.from({ length: program.sessionsPerWeek }, (_, s) => completed.includes(sessionKey(week, s + 1))).filter(Boolean).length;
          return (
            <div key={week} className="card p-0">
              <button className="flex w-full items-center justify-between p-4 text-left" onClick={() => setOpenWeek(open ? 0 : week)} aria-expanded={open}>
                <span className="font-semibold">Week {week}</span>
                <span className="flex items-center gap-2 text-xs text-slate-500">
                  {doneInWeek}/{program.sessionsPerWeek}
                  <ChevronDown className={cn('h-4 w-4 transition', open && 'rotate-180')} />
                </span>
              </button>
              {open && (
                <div className="space-y-3 border-t border-slate-200 p-4 dark:border-slate-800">
                  {Array.from({ length: program.sessionsPerWeek }, (_, s) => s + 1).map((session) => {
                    const built = buildProgramSession(program, week, session);
                    const isDone = completed.includes(sessionKey(week, session));
                    return (
                      <div key={session} className="rounded-xl border border-slate-200 p-3 dark:border-slate-800">
                        <div className="flex items-center justify-between gap-2">
                          <div className="flex items-center gap-2">
                            {isDone ? <CheckCircle2 className="h-5 w-5 text-brand-600" /> : <Circle className="h-5 w-5 text-slate-300" />}
                            <div>
                              <p className="font-medium">
                                Session {session}: {built.title}
                              </p>
                              <p className="text-xs text-slate-500">{built.focus}</p>
                            </div>
                          </div>
                          <button className="btn-secondary px-3 py-1.5 text-xs" disabled={Boolean(active)} onClick={() => start(week, session)}>
                            <Play className="h-3.5 w-3.5" /> {isDone ? 'Redo' : 'Start'}
                          </button>
                        </div>
                        <ul className="mt-2 space-y-0.5 text-sm text-slate-600 dark:text-slate-300">
                          {built.exercises.map((x) => (
                            <li key={x.exerciseId} className="flex justify-between gap-2">
                              <Link to={`/exercises/${x.exerciseId}`} className="hover:underline">
                                {exerciseName(map, x.exerciseId)}
                              </Link>
                              <span className="whitespace-nowrap text-slate-500">
                                {x.sets} × {x.reps !== undefined ? `${x.reps}` : `${x.seconds}s`}
                                {x.note ? ` ${x.note}` : ''}
                              </span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
