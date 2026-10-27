import { useEffect, useRef, useState } from 'react';
import { Download, HardDrive, Smartphone, Trash2, Upload } from 'lucide-react';
import { db } from '../db';
import { Field, Modal, NumInput, PageHeader, Segmented } from '../components/ui';
import { exerciseName, saveSettings, useExercises, useSettings } from '../lib/hooks';
import { createBackup, downloadFile, restoreBackup, sessionsToCsv, validateBackup, type Backup } from '../lib/backup';
import { isIos, isStandalone, requestPersistence, useInstallPrompt } from '../lib/pwa';
import type { Theme, Units } from '../types';

function Toggle({ label, checked, onChange }: { label: string; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <label className="flex items-center justify-between py-2">
      <span className="text-sm font-medium">{label}</span>
      <input type="checkbox" className="h-5 w-5 accent-brand-700" checked={checked} onChange={(e) => onChange(e.target.checked)} />
    </label>
  );
}

const fmtBytes = (b: number) => (b > 1e9 ? `${(b / 1e9).toFixed(1)} GB` : b > 1e6 ? `${(b / 1e6).toFixed(1)} MB` : `${Math.round(b / 1e3)} KB`);

export default function SettingsPage() {
  const settings = useSettings();
  const { map } = useExercises();
  const { canInstall, install } = useInstallPrompt();
  const fileRef = useRef<HTMLInputElement>(null);
  const [pending, setPending] = useState<Backup | null>(null);
  const [message, setMessage] = useState<{ ok: boolean; text: string } | null>(null);
  const [storage, setStorage] = useState<{ usage?: number; quota?: number; persisted?: boolean }>({});

  const refreshStorage = async () => {
    const est = await navigator.storage?.estimate?.();
    const persisted = await navigator.storage?.persisted?.();
    setStorage({ usage: est?.usage, quota: est?.quota, persisted });
  };
  useEffect(() => {
    void refreshStorage();
  }, []);

  const exportJson = async () => {
    const backup = await createBackup(db);
    downloadFile(`repforge-backup-${new Date().toISOString().slice(0, 10)}.json`, JSON.stringify(backup, null, 2), 'application/json');
    setMessage({ ok: true, text: `Exported ${backup.sessions.length} workouts.` });
  };

  const exportCsv = async () => {
    const sessions = await db.sessions.where('status').equals('completed').toArray();
    downloadFile(`repforge-sets-${new Date().toISOString().slice(0, 10)}.csv`, sessionsToCsv(sessions, (id) => exerciseName(map, id)), 'text/csv');
  };

  const onFile = async (file: File) => {
    try {
      setPending(validateBackup(JSON.parse(await file.text())));
    } catch (e) {
      setMessage({ ok: false, text: e instanceof SyntaxError ? 'File is not valid JSON.' : (e as Error).message });
    }
  };

  const doRestore = async (mode: 'merge' | 'replace') => {
    if (!pending) return;
    await restoreBackup(db, pending, mode);
    const theme = (pending.kv.find((k) => k.key === 'settings')?.value as { theme?: Theme } | undefined)?.theme;
    if (theme) localStorage.setItem('rf-theme', theme);
    setMessage({ ok: true, text: `Imported ${pending.sessions.length} workouts (${mode}).` });
    setPending(null);
  };

  const wipe = async () => {
    if (!confirm('Delete ALL workouts, custom exercises, favorites, program progress and settings on this device?')) return;
    if (!confirm('This cannot be undone. Are you sure?')) return;
    await Promise.all([db.sessions.clear(), db.customExercises.clear(), db.favorites.clear(), db.enrollments.clear(), db.kv.clear()]);
    ['rf-theme', 'rf-builder', 'rf-rest'].forEach((k) => localStorage.removeItem(k));
    setMessage({ ok: true, text: 'All data deleted.' });
  };

  return (
    <div className="space-y-4">
      <PageHeader title="Settings" />

      <section className="card space-y-4">
        <h2 className="font-semibold">Workout</h2>
        <div>
          <span className="label">Units</span>
          <Segmented<Units>
            value={settings.units}
            onChange={(units) => saveSettings({ units })}
            options={[
              { value: 'kg', label: 'Kilograms' },
              { value: 'lbs', label: 'Pounds' },
            ]}
          />
        </div>
        <div className="grid grid-cols-3 gap-2">
          <Field label="Rest (seconds)">
            <NumInput value={settings.restSeconds} onValue={(v) => v && v > 0 && saveSettings({ restSeconds: Math.round(v) })} inputMode="numeric" />
          </Field>
          <Field label="Default sets">
            <NumInput value={settings.defaultSets} onValue={(v) => v && v > 0 && v <= 20 && saveSettings({ defaultSets: Math.round(v) })} inputMode="numeric" />
          </Field>
          <Field label="Exercises / muscle">
            <NumInput
              value={settings.exercisesPerMuscle}
              onValue={(v) => v && v > 0 && v <= 6 && saveSettings({ exercisesPerMuscle: Math.round(v) })}
              inputMode="numeric"
            />
          </Field>
        </div>
        <div className="divide-y divide-slate-200 dark:divide-slate-800">
          <Toggle label="Sound when rest ends" checked={settings.sound} onChange={(sound) => saveSettings({ sound })} />
          <Toggle label="Vibrate when rest ends" checked={settings.vibration} onChange={(vibration) => saveSettings({ vibration })} />
        </div>
        {'Notification' in window && Notification.permission === 'default' && (
          <button className="btn-secondary" onClick={() => Notification.requestPermission()}>
            Allow rest-timer notifications
          </button>
        )}
      </section>

      <section className="card space-y-2">
        <h2 className="font-semibold">Appearance</h2>
        <Segmented<Theme>
          value={settings.theme}
          onChange={(theme) => saveSettings({ theme })}
          options={[
            { value: 'system', label: 'System' },
            { value: 'light', label: 'Light' },
            { value: 'dark', label: 'Dark' },
          ]}
        />
      </section>

      <section className="card space-y-3">
        <h2 className="font-semibold">Backup &amp; restore</h2>
        <p className="text-sm text-slate-500 dark:text-slate-400">Your data only exists on this device. Export a backup to keep it safe or move it.</p>
        <div className="flex flex-wrap gap-2">
          <button className="btn-primary" onClick={exportJson}>
            <Download className="h-4 w-4" /> Export backup (JSON)
          </button>
          <button className="btn-secondary" onClick={exportCsv}>
            <Download className="h-4 w-4" /> Export sets (CSV)
          </button>
          <button className="btn-secondary" onClick={() => fileRef.current?.click()}>
            <Upload className="h-4 w-4" /> Import backup
          </button>
          <input
            ref={fileRef}
            type="file"
            accept="application/json,.json"
            className="hidden"
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) void onFile(f);
              e.target.value = '';
            }}
          />
        </div>
        {message && <p className={message.ok ? 'text-sm text-emerald-600' : 'text-sm text-red-600'}>{message.text}</p>}
      </section>

      <section className="card space-y-3">
        <h2 className="flex items-center gap-2 font-semibold">
          <HardDrive className="h-4 w-4" /> Storage
        </h2>
        {storage.usage !== undefined && storage.quota !== undefined && (
          <p className="text-sm text-slate-500">
            Using {fmtBytes(storage.usage)} of {fmtBytes(storage.quota)} available.
          </p>
        )}
        <p className="text-sm">
          Persistent storage:{' '}
          <span className={storage.persisted ? 'font-semibold text-emerald-600' : 'font-semibold text-amber-600'}>
            {storage.persisted ? 'granted' : 'not granted'}
          </span>
        </p>
        {!storage.persisted && (
          <button
            className="btn-secondary"
            onClick={async () => {
              await requestPersistence();
              await refreshStorage();
            }}
          >
            Request persistent storage
          </button>
        )}
      </section>

      <section className="card space-y-3">
        <h2 className="flex items-center gap-2 font-semibold">
          <Smartphone className="h-4 w-4" /> Install app
        </h2>
        {isStandalone() ? (
          <p className="text-sm text-emerald-600">RepForge is installed and running as an app.</p>
        ) : canInstall ? (
          <button className="btn-primary" onClick={install}>
            Install RepForge
          </button>
        ) : isIos() ? (
          <p className="text-sm text-slate-500">In Safari, tap Share → “Add to Home Screen”.</p>
        ) : (
          <p className="text-sm text-slate-500">Use your browser menu → “Install app” / “Add to Home screen”.</p>
        )}
      </section>

      <section className="card space-y-2 border-red-200 dark:border-red-900">
        <h2 className="font-semibold text-red-700 dark:text-red-400">Danger zone</h2>
        <button className="btn-danger" onClick={wipe}>
          <Trash2 className="h-4 w-4" /> Delete all data
        </button>
      </section>

      <Modal open={Boolean(pending)} onClose={() => setPending(null)} title="Import backup">
        {pending && (
          <div className="space-y-3 text-sm">
            <p>
              Backup from {pending.exportedAt ? new Date(pending.exportedAt).toLocaleString() : 'unknown date'} with {pending.sessions.length} workouts,{' '}
              {pending.customExercises.length} custom exercises and {pending.enrollments.length} program enrollments.
            </p>
            <p className="text-slate-500">
              <b>Merge</b> keeps your current data and adds or updates items from the backup. <b>Replace</b> deletes current data first.
            </p>
            <div className="flex gap-2">
              <button className="btn-primary flex-1" onClick={() => doRestore('merge')}>
                Merge
              </button>
              <button className="btn-danger flex-1" onClick={() => confirm('Replace all current data with this backup?') && doRestore('replace')}>
                Replace
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
