import { useCallback, useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Check, Copy, Pause, Play, Plus, Star, Timer, Trash2, X } from 'lucide-react';
import { muscleLabel } from '../data/taxonomy';
import { defaultSet, toSessionExercise } from '../lib/builder';
import { exerciseName, useActiveSession, useCompletedSessions, useExercises, useNow, useSettings } from '../lib/hooks';
import { beep, notify, requestPersistence } from '../lib/pwa';
import { discardSession, finishSession, updateActive } from '../lib/sessions';
import { completedSets, newRecordsIn, sessionVolume } from '../lib/stats';
import { cn, formatDuration, fromDisplayWeight, toDisplayWeight } from '../lib/utils';
import type { SetMode, WorkoutSession, WorkoutSet } from '../types';
import ExercisePicker from '../components/ExercisePicker';
import { Empty, Modal, NumInput } from '../components/ui';

function useWakeLock(enabled: boolean) {
  useEffect(() => {
    if (!enabled || !('wakeLock' in navigator)) return;
    let lock: WakeLockSentinel | null = null;
    const acquire = async () => {
      try {
        lock = await navigator.wakeLock.request('screen');
      } catch {
        /* denied or unsupported */
      }
    };
    const onVis = () => document.visibilityState === 'visible' && acquire();
    acquire();
    document.addEventListener('visibilitychange', onVis);
    return () => {
      document.removeEventListener('visibilitychange', onVis);
      lock?.release().catch(() => undefined);
    };
  }, [enabled]);
}

export default function SessionPage() {
  const session = useActiveSession();
  const history = useCompletedSessions();
  const { map } = useExercises();
  const settings = useSettings();
  const navigate = useNavigate();
  const now = useNow(1000, Boolean(session));
  const [pickerOpen, setPickerOpen] = useState(false);
  const [finishOpen, setFinishOpen] = useState(false);
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [restEndsAt, setRestEndsAt] = useState<number | null>(() => Number(localStorage.getItem('rf-rest')) || null);
  const [restPaused, setRestPaused] = useState<number | null>(null);
  const restFired = useRef(false);

  useWakeLock(Boolean(session));

  useEffect(() => {
    if (restEndsAt) localStorage.setItem('rf-rest', String(restEndsAt));
    else localStorage.removeItem('rf-rest');
    restFired.current = false;
  }, [restEndsAt]);

  const restLeft = restPaused ?? (restEndsAt ? restEndsAt - now : 0);

  useEffect(() => {
    if (!restEndsAt || restPaused !== null || restFired.current || now < restEndsAt) return;
    restFired.current = true;
    if (settings.vibration) navigator.vibrate?.([200, 100, 200]);
    if (settings.sound) beep();
    if (document.visibilityState !== 'visible') notify('Rest is over', 'Time for your next set 💪');
    setRestEndsAt(null);
  }, [now, restEndsAt, restPaused, settings.sound, settings.vibration]);

  const startRest = useCallback((seconds = settings.restSeconds) => {
    setRestPaused(null);
    setRestEndsAt(Date.now() + seconds * 1000);
    if ('Notification' in window && Notification.permission === 'default') Notification.requestPermission().catch(() => undefined);
  }, [settings.restSeconds]);

  if (session === undefined) return null;
  if (!session) {
    return (
      <Empty icon={<Timer className="h-10 w-10" />} title="No workout in progress">
        <p className="mb-3">Build a workout or start a program session.</p>
        <div className="flex justify-center gap-2">
          <Link to="/" className="btn-primary">
            Build workout
          </Link>
          <Link to="/programs" className="btn-secondary">
            Programs
          </Link>
        </div>
      </Empty>
    );
  }

  const mutate = (fn: (s: WorkoutSession) => WorkoutSession) => updateActive(session.id, fn);

  const updateSet = (exUid: string, idx: number, patch: Partial<WorkoutSet>) =>
    mutate((s) => ({
      ...s,
      exercises: s.exercises.map((e) => (e.uid === exUid ? { ...e, sets: e.sets.map((x, i) => (i === idx ? { ...x, ...patch } : x)) } : e)),
    }));

  const toggleDone = (exUid: string, idx: number, done: boolean) => {
    updateSet(exUid, idx, { done });
    if (done) {
      if (settings.vibration) navigator.vibrate?.(40);
      startRest();
    }
  };

  const addSet = (exUid: string) =>
    mutate((s) => ({
      ...s,
      exercises: s.exercises.map((e) => {
        if (e.uid !== exUid) return e;
        const last = e.sets[e.sets.length - 1];
        return { ...e, sets: [...e.sets, last ? { ...last, done: false } : defaultSet(e.mode)] };
      }),
    }));

  const removeSet = (exUid: string, idx: number) =>
    mutate((s) => ({ ...s, exercises: s.exercises.map((e) => (e.uid === exUid ? { ...e, sets: e.sets.filter((_, i) => i !== idx) } : e)) }));

  const removeExercise = (exUid: string) => mutate((s) => ({ ...s, exercises: s.exercises.filter((e) => e.uid !== exUid) }));

  const changeMode = (exUid: string, mode: SetMode) =>
    mutate((s) => ({ ...s, exercises: s.exercises.map((e) => (e.uid === exUid ? { ...e, mode, sets: e.sets.map((x) => ({ ...defaultSet(mode), done: x.done })) } : e)) }));

  const done = completedSets(session);
  const total = session.exercises.reduce((a, e) => a + e.sets.length, 0);
  const prs = history ? newRecordsIn(session, history) : [];

  const finish = async () => {
    await finishSession(session.id, rating || undefined, comment.trim() || undefined);
    localStorage.removeItem('rf-rest');
    requestPersistence().catch(() => undefined);
    navigate(`/history/${session.id}?finished=1`);
  };

  const discard = async () => {
    if (!confirm('Discard this workout? Logged sets will be lost.')) return;
    await discardSession(session.id);
    localStorage.removeItem('rf-rest');
    navigate('/');
  };

  return (
    <div>
      <div className="mb-4 flex items-start justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold">{session.title}</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            {formatDuration(now - session.startedAt)} · {done}/{total} sets
          </p>
        </div>
        <div className="flex gap-2">
          <button className="btn-ghost text-red-600" onClick={discard}>
            Discard
          </button>
          <button className="btn-primary" onClick={() => setFinishOpen(true)}>
            Finish
          </button>
        </div>
      </div>

      <div className="mb-4 h-2 overflow-hidden rounded-full bg-slate-200 dark:bg-slate-800">
        <div className="h-full bg-brand-600 transition-all" style={{ width: `${total ? (done / total) * 100 : 0}%` }} />
      </div>

      <div className="space-y-4">
        {session.exercises.map((e) => {
          const ex = map[e.exerciseId];
          return (
            <section key={e.uid} className="card">
              <div className="mb-3 flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <Link to={`/exercises/${e.exerciseId}`} className="font-semibold hover:underline">
                    {exerciseName(map, e.exerciseId)}
                  </Link>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    {ex?.primary.map(muscleLabel).join(', ')}
                    {e.note && ` · ${e.note}`}
                  </p>
                </div>
                <div className="flex items-center gap-1">
                  <select className="input w-auto py-1 text-xs" value={e.mode} onChange={(ev) => changeMode(e.uid, ev.target.value as SetMode)} aria-label="Set type">
                    <option value="weight_reps">Weight × reps</option>
                    <option value="reps">Reps</option>
                    <option value="time">Time</option>
                  </select>
                  <button className="icon-btn" aria-label="Remove exercise" onClick={() => removeExercise(e.uid)}>
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>

              <div className="space-y-2">
                {e.sets.map((s, i) => (
                  <div key={i} className={cn('flex items-center gap-2 rounded-xl p-1.5', s.done && 'bg-brand-50 dark:bg-brand-800/20')}>
                    <span className="w-6 text-center text-sm font-semibold text-slate-500">{i + 1}</span>
                    {e.mode === 'weight_reps' && (
                      <label className="flex flex-1 items-center gap-1">
                        <NumInput
                          className="py-1.5 text-center"
                          placeholder="0"
                          aria-label={`Set ${i + 1} weight`}
                          value={toDisplayWeight(s.weightKg, settings.units)}
                          onValue={(v) => updateSet(e.uid, i, { weightKg: fromDisplayWeight(v, settings.units) })}
                        />
                        <span className="text-xs text-slate-500">{settings.units}</span>
                      </label>
                    )}
                    {(e.mode === 'weight_reps' || e.mode === 'reps') && (
                      <label className="flex flex-1 items-center gap-1">
                        <NumInput className="py-1.5 text-center" inputMode="numeric" placeholder="0" aria-label={`Set ${i + 1} reps`} value={s.reps} onValue={(v) => updateSet(e.uid, i, { reps: v })} />
                        <span className="text-xs text-slate-500">reps</span>
                      </label>
                    )}
                    {e.mode === 'time' && (
                      <label className="flex flex-1 items-center gap-1">
                        <NumInput className="py-1.5 text-center" inputMode="numeric" placeholder="0" aria-label={`Set ${i + 1} seconds`} value={s.seconds} onValue={(v) => updateSet(e.uid, i, { seconds: v })} />
                        <span className="text-xs text-slate-500">sec</span>
                      </label>
                    )}
                    <button
                      className={cn('inline-flex h-9 w-9 items-center justify-center rounded-lg border transition', s.done ? 'border-brand-700 bg-brand-700 text-white' : 'border-slate-300 dark:border-slate-700')}
                      aria-label={s.done ? 'Mark set not done' : 'Mark set done'}
                      aria-pressed={s.done}
                      onClick={() => toggleDone(e.uid, i, !s.done)}
                    >
                      <Check className="h-4 w-4" />
                    </button>
                    <button className="icon-btn h-8 w-8" aria-label="Remove set" onClick={() => removeSet(e.uid, i)}>
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
              <button className="btn-ghost mt-2 w-full text-xs" onClick={() => addSet(e.uid)}>
                <Copy className="h-4 w-4" /> Add set
              </button>
            </section>
          );
        })}
      </div>

      <button className="btn-secondary mt-4 w-full" onClick={() => setPickerOpen(true)}>
        <Plus className="h-4 w-4" /> Add exercise
      </button>

      <ExercisePicker
        open={pickerOpen}
        onClose={() => setPickerOpen(false)}
        exclude={session.exercises.map((e) => e.exerciseId)}
        onPick={(ex) => mutate((s) => ({ ...s, exercises: [...s.exercises, toSessionExercise(ex, settings.defaultSets)] }))}
      />

      {/* Rest timer */}
      <div className="fixed inset-x-0 bottom-16 z-20 px-4 safe-bottom">
        <div className="mx-auto flex max-w-3xl items-center gap-2 rounded-2xl border border-slate-200 bg-white p-2 shadow-lg dark:border-slate-800 dark:bg-slate-900">
          <Timer className="ml-1 h-5 w-5 text-brand-700" />
          {restEndsAt || restPaused !== null ? (
            <>
              <span className="flex-1 font-mono text-lg font-semibold" aria-live="polite">
                Rest {formatDuration(Math.max(0, restLeft))}
              </span>
              <button className="btn-ghost px-2 text-xs" onClick={() => setRestEndsAt((t) => (t ? t + 15_000 : t))}>
                +15s
              </button>
              {restPaused === null ? (
                <button className="icon-btn" aria-label="Pause rest" onClick={() => setRestPaused(Math.max(0, restLeft))}>
                  <Pause className="h-4 w-4" />
                </button>
              ) : (
                <button
                  className="icon-btn"
                  aria-label="Resume rest"
                  onClick={() => {
                    setRestEndsAt(Date.now() + restPaused);
                    setRestPaused(null);
                  }}
                >
                  <Play className="h-4 w-4" />
                </button>
              )}
              <button
                className="btn-ghost px-2 text-xs"
                onClick={() => {
                  setRestEndsAt(null);
                  setRestPaused(null);
                }}
              >
                Skip
              </button>
            </>
          ) : (
            <>
              <span className="flex-1 text-sm text-slate-500">Rest timer</span>
              {[60, 90, 120, 180].map((s) => (
                <button key={s} className="btn-ghost px-2 text-xs" onClick={() => startRest(s)}>
                  {s < 120 ? `${s}s` : `${s / 60}m`}
                </button>
              ))}
            </>
          )}
        </div>
      </div>

      <Modal open={finishOpen} onClose={() => setFinishOpen(false)} title="Finish workout">
        <div className="space-y-4">
          <div className="grid grid-cols-3 gap-2 text-center">
            <div className="rounded-xl bg-slate-100 p-2 dark:bg-slate-800">
              <p className="text-xs text-slate-500">Duration</p>
              <p className="font-bold">{formatDuration(now - session.startedAt)}</p>
            </div>
            <div className="rounded-xl bg-slate-100 p-2 dark:bg-slate-800">
              <p className="text-xs text-slate-500">Sets</p>
              <p className="font-bold">{done}</p>
            </div>
            <div className="rounded-xl bg-slate-100 p-2 dark:bg-slate-800">
              <p className="text-xs text-slate-500">Volume</p>
              <p className="font-bold">
                {Math.round(toDisplayWeight(sessionVolume(session), settings.units) ?? 0)} {settings.units}
              </p>
            </div>
          </div>
          {prs.length > 0 && (
            <div className="rounded-xl bg-amber-50 p-3 text-sm dark:bg-amber-900/20">
              <p className="font-semibold">🏆 New personal records</p>
              <ul className="mt-1 list-inside list-disc">
                {prs.map((p) => (
                  <li key={p.exerciseId}>
                    {exerciseName(map, p.exerciseId)}: {toDisplayWeight(p.maxWeight, settings.units)} {settings.units}
                  </li>
                ))}
              </ul>
            </div>
          )}
          {done === 0 && <p className="rounded-xl bg-amber-50 p-3 text-sm text-amber-800 dark:bg-amber-900/20 dark:text-amber-200">No sets are marked as done. Only completed sets are saved.</p>}
          <div>
            <p className="label">How did it feel?</p>
            <div className="flex gap-1">
              {[1, 2, 3, 4, 5].map((n) => (
                <button key={n} className="icon-btn" aria-label={`${n} stars`} onClick={() => setRating(n)}>
                  <Star className={cn('h-6 w-6', n <= rating && 'fill-amber-400 text-amber-400')} />
                </button>
              ))}
            </div>
          </div>
          <textarea className="input" rows={3} placeholder="Notes (optional)" value={comment} onChange={(e) => setComment(e.target.value)} />
          <button className="btn-primary w-full" onClick={finish}>
            Save workout
          </button>
        </div>
      </Modal>
    </div>
  );
}

