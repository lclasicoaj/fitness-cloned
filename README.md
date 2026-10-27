# RepForge (offline workout PWA)

A fully offline, installable workout builder and tracker. It has no server, no accounts and no analytics, and every feature is free. All data lives in your browser's IndexedDB. See [OFFLINE_PLAN.md](./OFFLINE_PLAN.md) for the design.

## Features

- **Workout builder**: pick equipment and muscles, then generate, shuffle, reorder and add exercises.
- **Session tracker**: weight × reps, reps or timed sets; a rest timer with sound, vibration and notifications; screen wake lock; ratings, notes and PR detection.
- **History**: unlimited history with a yearly heatmap, day and week streaks, repeat and delete.
- **Statistics**: weight progression, estimated 1RM, weekly volume and a personal-records table.
- **Programs**: six original multi-week programs with progression, enrollment and progress tracking.
- **Exercise library**: about 85 original exercises with instructions, favorites and custom exercises.
- **Tools**: calories (five BMR formulas), macros, BMI, heart-rate zones, 1RM and reconstitution.
- **Settings**: kg/lbs, rest time, theme; JSON backup and import (merge or replace), CSV export, persistent storage, install.

## Run

```powershell
npm install
npm run dev        # http://localhost:5173 (service worker disabled in dev)
npm run build      # type-check + production build with service worker
npm run preview    # http://localhost:4173
npm test           # unit tests (Vitest)
npm run icons      # regenerate PNG icons
```

### Test offline

1. Run `npm run build`, then `npm run preview`, and open http://localhost:4173.
2. Wait for the "Ready to work offline" toast.
3. In DevTools, open Network and switch to **Offline**, then reload. Every page and feature keeps working.
4. Install it with the browser's install button, or from Settings → Install app.

After you deploy a new build, the app shows an "Update available" prompt. The old version keeps working until you accept the update.

## Stack

Vite, React 19, TypeScript, Tailwind CSS v4, Dexie (IndexedDB), Recharts, vite-plugin-pwa (Workbox).

## Data safety

Clearing site data in the browser deletes everything. Export a backup regularly from **Settings → Export backup**.
