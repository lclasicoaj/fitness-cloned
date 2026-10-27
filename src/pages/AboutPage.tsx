import { PageHeader } from '../components/ui';

export default function AboutPage() {
  return (
    <div className="space-y-4">
      <PageHeader title="About RepForge" subtitle={`Version ${__APP_VERSION__}`} />
      <div className="card space-y-2 text-sm text-slate-700 dark:text-slate-300">
        <p className="font-semibold text-slate-900 dark:text-slate-100">100% offline</p>
        <p>
          RepForge is a Progressive Web App. After the first visit, every page, exercise, program and calculator is cached on your device by a service
          worker. It does not need a network connection and never makes network requests on its own.
        </p>
      </div>
      <div className="card space-y-2 text-sm text-slate-700 dark:text-slate-300">
        <p className="font-semibold text-slate-900 dark:text-slate-100">Your data stays on your device</p>
        <p>
          Workouts, favorites, custom exercises, program progress and settings live in your browser&apos;s IndexedDB. There are no accounts, analytics,
          ads or trackers. Use <em>Settings → Export backup</em> to keep a copy or to move to another device.
        </p>
        <p>Clearing site data in your browser deletes everything. Export a backup regularly.</p>
      </div>
      <div className="card space-y-2 text-sm text-slate-700 dark:text-slate-300">
        <p className="font-semibold text-slate-900 dark:text-slate-100">Everything included</p>
        <p>Unlimited history, all programs, advanced statistics and every tool are available to everyone. There is no subscription.</p>
      </div>
      <p className="text-xs text-slate-500">
        Training information is general guidance, not medical advice. Consult a professional before starting a new program.
      </p>
    </div>
  );
}
