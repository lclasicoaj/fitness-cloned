import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { CalendarDays, ChevronRight, Star } from 'lucide-react';
import Heatmap from '../components/Heatmap';
import { Empty, PageHeader, StatCard } from '../components/ui';
import { useCompletedSessions, useSettings } from '../lib/hooks';
import { completedSets, dailyCounts, dayStreak, sessionDuration, sessionVolume, weekStreak } from '../lib/stats';
import { formatDate, formatDuration, toDisplayWeight } from '../lib/utils';

export default function HistoryPage() {
  const sessions = useCompletedSessions();
  const settings = useSettings();
  const counts = useMemo(() => dailyCounts(sessions ?? []), [sessions]);
  const sorted = useMemo(() => [...(sessions ?? [])].sort((a, b) => b.startedAt - a.startedAt), [sessions]);

  if (!sessions) return null;

  return (
    <div>
      <PageHeader title="History" subtitle="Unlimited history, stored only on this device." />
      <div className="mb-4 grid grid-cols-3 gap-2">
        <StatCard label="Workouts" value={sessions.length} />
        <StatCard label="Day streak" value={dayStreak(sessions)} />
        <StatCard label="Week streak" value={weekStreak(sessions)} />
      </div>
      <div className="card mb-4">
        <p className="mb-3 text-sm font-semibold">Last 12 months</p>
        <Heatmap counts={counts} weeks={52} />
      </div>
      {sorted.length === 0 ? (
        <Empty icon={<CalendarDays className="h-10 w-10" />} title="No workouts yet">
          <Link to="/" className="btn-primary mt-2">
            Build your first workout
          </Link>
        </Empty>
      ) : (
        <ul className="space-y-2">
          {sorted.map((s) => (
            <li key={s.id}>
              <Link to={`/history/${s.id}`} className="card flex items-center gap-3 p-3 hover:border-brand-500">
                <div className="min-w-0 flex-1">
                  <p className="truncate font-semibold">{s.title}</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    {formatDate(s.startedAt)} · {formatDuration(sessionDuration(s))} · {completedSets(s)} sets
                    {sessionVolume(s) > 0 && ` · ${Math.round(toDisplayWeight(sessionVolume(s), settings.units) ?? 0)} ${settings.units}`}
                  </p>
                </div>
                {s.rating && (
                  <span className="flex items-center gap-0.5 text-xs text-amber-500">
                    <Star className="h-3.5 w-3.5 fill-amber-400" /> {s.rating}
                  </span>
                )}
                <ChevronRight className="h-4 w-4 text-slate-400" />
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
