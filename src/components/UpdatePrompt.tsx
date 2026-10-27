import { useRegisterSW } from 'virtual:pwa-register/react';
import { RefreshCw, X } from 'lucide-react';

export default function UpdatePrompt() {
  const {
    offlineReady: [offlineReady, setOfflineReady],
    needRefresh: [needRefresh, setNeedRefresh],
    updateServiceWorker,
  } = useRegisterSW({
    onRegisteredSW(_url, reg) {
      // Check for new versions hourly while the app is open (only does anything when online).
      if (reg) setInterval(() => navigator.onLine && reg.update(), 60 * 60 * 1000);
    },
  });

  if (!offlineReady && !needRefresh) return null;

  return (
    <div className="fixed inset-x-4 bottom-24 z-40 mx-auto max-w-md">
      <div className="card flex items-center gap-3 shadow-lg">
        <div className="flex-1 text-sm">
          {needRefresh ? (
            <>
              <p className="font-semibold">Update available</p>
              <p className="text-slate-500 dark:text-slate-400">Reload to use the latest version. Your data is kept.</p>
            </>
          ) : (
            <>
              <p className="font-semibold">Ready to work offline</p>
              <p className="text-slate-500 dark:text-slate-400">RepForge is fully cached on this device.</p>
            </>
          )}
        </div>
        {needRefresh && (
          <button className="btn-primary" onClick={() => updateServiceWorker(true)}>
            <RefreshCw className="h-4 w-4" /> Reload
          </button>
        )}
        <button
          className="icon-btn"
          aria-label="Dismiss"
          onClick={() => {
            setOfflineReady(false);
            setNeedRefresh(false);
          }}
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
