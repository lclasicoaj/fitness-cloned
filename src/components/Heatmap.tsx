import { useMemo } from 'react';
import { DAY_MS, startOfDay, startOfWeek } from '../lib/stats';

/** GitHub-style activity heatmap: one column per week, one row per weekday (Mon–Sun). */
export default function Heatmap({ counts, weeks = 26, now = Date.now() }: { counts: Map<number, number>; weeks?: number; now?: number }) {
  const columns = useMemo(() => {
    const today = startOfDay(now);
    const firstWeek = startOfWeek(today) - (weeks - 1) * 7 * DAY_MS;
    return Array.from({ length: weeks }, (_, w) =>
      Array.from({ length: 7 }, (_, d) => {
        const date = new Date(firstWeek);
        date.setDate(date.getDate() + w * 7 + d);
        const t = date.getTime();
        return { t, count: counts.get(t) ?? 0, future: t > today };
      }),
    );
  }, [counts, weeks, now]);

  const tone = (n: number) =>
    n === 0 ? 'bg-slate-200 dark:bg-slate-800' : n === 1 ? 'bg-brand-500/60' : n === 2 ? 'bg-brand-600' : 'bg-brand-800';

  return (
    <div className="overflow-x-auto">
      <div className="flex gap-[3px]" role="img" aria-label="Workout activity heatmap">
        {columns.map((col, i) => (
          <div key={i} className="flex flex-col gap-[3px]">
            {col.map((cell) => (
              <div
                key={cell.t}
                title={`${new Date(cell.t).toLocaleDateString()} – ${cell.count} workout${cell.count === 1 ? '' : 's'}`}
                className={`h-3 w-3 rounded-[3px] ${cell.future ? 'opacity-0' : tone(cell.count)}`}
              />
            ))}
          </div>
        ))}
      </div>
      <div className="mt-2 flex items-center justify-end gap-1 text-xs text-slate-500">
        Less
        {[0, 1, 2, 3].map((n) => (
          <span key={n} className={`h-3 w-3 rounded-[3px] ${tone(n)}`} />
        ))}
        More
      </div>
    </div>
  );
}
