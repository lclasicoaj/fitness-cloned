import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Bar, BarChart, CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { BarChart3 } from 'lucide-react';
import { Empty, PageHeader, Segmented, StatCard } from '../components/ui';
import { exerciseName, useCompletedSessions, useExercises, useSettings } from '../lib/hooks';
import { DAY_MS, dayStreak, exerciseHistory, personalRecords, sessionVolume, weeklyVolume } from '../lib/stats';
import { formatShortDate, toDisplayWeight } from '../lib/utils';

type Range = '30' | '90' | '180' | '365' | 'all';

function ChartCard({ title, subtitle, children }: { title: string; subtitle?: string; children: React.ReactNode }) {
  return (
    <div className="card">
      <p className="font-semibold">{title}</p>
      {subtitle && <p className="text-xs text-slate-500 dark:text-slate-400">{subtitle}</p>}
      <div className="mt-3 h-56">{children}</div>
    </div>
  );
}

export default function StatsPage() {
  const sessions = useCompletedSessions();
  const { map } = useExercises();
  const settings = useSettings();
  const [range, setRange] = useState<Range>('90');
  const unit = settings.units;

  const filtered = useMemo(() => {
    if (!sessions) return [];
    if (range === 'all') return sessions;
    const from = Date.now() - Number(range) * DAY_MS;
    return sessions.filter((s) => s.startedAt >= from);
  }, [sessions, range]);

  const trackable = useMemo(() => {
    const ids = new Set<string>();
    for (const s of sessions ?? []) for (const e of s.exercises) if (e.sets.some((x) => x.done && x.weightKg)) ids.add(e.exerciseId);
    return [...ids].sort((a, b) => exerciseName(map, a).localeCompare(exerciseName(map, b)));
  }, [sessions, map]);

  const [selected, setSelected] = useState<string>('');
  const exerciseId = selected && trackable.includes(selected) ? selected : trackable[0];

  const history = useMemo(
    () =>
      exerciseId
        ? exerciseHistory(filtered, exerciseId).map((p) => ({
            date: formatShortDate(p.date),
            weight: toDisplayWeight(p.maxWeight, unit),
            e1rm: toDisplayWeight(Math.round(p.e1rm * 10) / 10, unit),
          }))
        : [],
    [filtered, exerciseId, unit],
  );
  const weekly = useMemo(
    () => weeklyVolume(filtered, exerciseId).map((w) => ({ week: formatShortDate(w.week), volume: Math.round(toDisplayWeight(w.volume, unit) ?? 0) })),
    [filtered, exerciseId, unit],
  );
  const prs = useMemo(() => personalRecords(sessions ?? []).filter((p) => p.maxWeight > 0).sort((a, b) => b.e1rmDate - a.e1rmDate), [sessions]);

  if (!sessions) return null;

  if (sessions.length === 0) {
    return (
      <div>
        <PageHeader title="Statistics" />
        <Empty icon={<BarChart3 className="h-10 w-10" />} title="No data yet">
          Complete a workout with weighted sets to see progression, estimated 1RM and volume.
          <div className="mt-3">
            <Link to="/" className="btn-primary">
              Start a workout
            </Link>
          </div>
        </Empty>
      </div>
    );
  }

  const totalVolume = filtered.reduce((a, s) => a + sessionVolume(s), 0);
  const tooltipStyle = { borderRadius: 12, fontSize: 12 };

  return (
    <div className="space-y-4">
      <PageHeader title="Statistics" subtitle="Advanced analytics, all computed on your device." />
      <Segmented<Range>
        value={range}
        onChange={setRange}
        options={[
          { value: '30', label: '30d' },
          { value: '90', label: '3m' },
          { value: '180', label: '6m' },
          { value: '365', label: '1y' },
          { value: 'all', label: 'All' },
        ]}
      />
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
        <StatCard label="Workouts" value={filtered.length} />
        <StatCard label={`Volume (${unit})`} value={Math.round(toDisplayWeight(totalVolume, unit) ?? 0).toLocaleString()} />
        <StatCard label="Day streak" value={dayStreak(sessions)} />
        <StatCard label="PRs tracked" value={prs.length} />
      </div>

      {trackable.length > 0 ? (
        <>
          <label className="block">
            <span className="label">Exercise</span>
            <select className="input" value={exerciseId} onChange={(e) => setSelected(e.target.value)}>
              {trackable.map((id) => (
                <option key={id} value={id}>
                  {exerciseName(map, id)}
                </option>
              ))}
            </select>
          </label>
          <ChartCard title="Weight progression" subtitle={`Heaviest set per workout (${unit})`}>
            <ResponsiveContainer>
              <LineChart data={history}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                <XAxis dataKey="date" fontSize={11} />
                <YAxis fontSize={11} width={40} />
                <Tooltip contentStyle={tooltipStyle} />
                <Line type="monotone" dataKey="weight" stroke="#0f766e" strokeWidth={2} dot />
              </LineChart>
            </ResponsiveContainer>
          </ChartCard>
          <ChartCard title="Estimated 1 rep max" subtitle={`Epley formula: weight × (1 + reps / 30) (${unit})`}>
            <ResponsiveContainer>
              <LineChart data={history}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                <XAxis dataKey="date" fontSize={11} />
                <YAxis fontSize={11} width={40} />
                <Tooltip contentStyle={tooltipStyle} />
                <Line type="monotone" dataKey="e1rm" stroke="#d97706" strokeWidth={2} dot />
              </LineChart>
            </ResponsiveContainer>
          </ChartCard>
          <ChartCard title="Weekly volume" subtitle={`Weight × reps of completed sets (${unit})`}>
            <ResponsiveContainer>
              <BarChart data={weekly}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                <XAxis dataKey="week" fontSize={11} />
                <YAxis fontSize={11} width={48} />
                <Tooltip contentStyle={tooltipStyle} />
                <Bar dataKey="volume" fill="#14b8a6" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>
        </>
      ) : (
        <p className="card text-sm text-slate-500">Log weighted sets (weight × reps) to unlock exercise charts.</p>
      )}

      {prs.length > 0 && (
        <div className="card">
          <p className="mb-2 font-semibold">🏆 Personal records</p>
          <table className="w-full text-sm">
            <thead className="text-left text-xs text-slate-500">
              <tr>
                <th className="py-1">Exercise</th>
                <th>Max</th>
                <th>Est. 1RM</th>
                <th>Date</th>
              </tr>
            </thead>
            <tbody>
              {prs.map((p) => (
                <tr key={p.exerciseId} className="border-t border-slate-200 dark:border-slate-800">
                  <td className="py-1.5">
                    <Link to={`/exercises/${p.exerciseId}`} className="hover:underline">
                      {exerciseName(map, p.exerciseId)}
                    </Link>
                  </td>
                  <td>
                    {toDisplayWeight(p.maxWeight, unit)} {unit}
                  </td>
                  <td>
                    {toDisplayWeight(Math.round(p.e1rm * 10) / 10, unit)} {unit}
                  </td>
                  <td className="text-slate-500">{formatShortDate(p.e1rmDate)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
