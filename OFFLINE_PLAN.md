# RepForge: Fully Offline Plan

Turns the Workout.cool-style app from [../WORKOUT_COOL_CLONE_PLAN.md](../WORKOUT_COOL_CLONE_PLAN.md) into a **100% offline, local-first PWA**. After the first load, the app needs no server, account, or network connection.

## 1. Principles

| Principle | Decision |
|---|---|
| No backend | Static files only (HTML/JS/CSS/icons). Any static host or `npm run preview` works; the app can even be served from a USB stick. |
| Data lives on the device | IndexedDB via **Dexie**. Nothing leaves the device. |
| Everything precached | The service worker (Workbox via `vite-plugin-pwa`) precaches the full build, so a cold start offline works after the first visit. |
| No third-party runtime calls | No CDNs, Google Fonts, analytics, ads, or payment SDKs. System font stack. Icons bundled (lucide). |
| Premium unlocked | Stats, unlimited history, all programs, custom exercises, and no ads are available to everyone. There is nothing to sell offline. |
| User owns backups | JSON export/import + CSV export. Persistent storage is requested so the browser doesn't evict data. |

## 2. What changes from the online plan

| Online feature | Offline equivalent |
|---|---|
| Accounts / Better-Auth / Google login | **Removed.** A single local profile in settings. |
| Stripe / RevenueCat / premium gating | **Removed.** All features unlocked. |
| Ads, consent banner, analytics | **Removed** (nothing is tracked, so no consent is needed). |
| Server sync API | Replaced by **backup file export/import** (manual device-to-device transfer). Optional future: peer-to-peer or file-system sync. |
| 6-month history limit | Unlimited, bounded only by device storage. |
| Leaderboard | Replaced by **personal records and streaks** (a leaderboard needs other users). |
| Coach 1:1 chat | Removed. Coaching tips are embedded in program/exercise text. |
| Exercise videos (streamed) | Text instructions + generated illustrations bundled in the app. Optional "media pack" download cached by the SW (future). |
| Admin CMS | Content ships as typed data files in `src/data/`. Users can create **custom exercises** locally. |
| Push notifications from a server | Local notifications from the service worker (rest timer ends). |
| i18n via server | Static message bundles (English shipped; structure ready for more locales). |

## 3. Architecture

```
index.html ─ React 19 SPA (Vite) ─ react-router (client routes, SW navigateFallback → index.html)
  src/data/        exercises.ts, programs.ts, taxonomy.ts   ← static, versioned content
  src/db.ts        Dexie: sessions, customExercises, favorites, enrollments, kv(settings)
  src/lib/         calculators, stats (1RM/volume/PRs/streaks), backup, units, builder logic
  src/pages/       Builder, Session, History, Stats, Programs, Exercises, Tools, Settings, More/About
  src/components/  Heatmap, ExercisePicker, UpdatePrompt, OfflineBadge, Layout
Service worker (generateSW): precache **/*.{js,css,html,svg,png,ico,webmanifest}, navigateFallback
```

### Data model (IndexedDB)

- `sessions(id, status[active|completed], title, startedAt, endedAt, muscles[], exercises[{uid, exerciseId, mode, sets[{reps, weightKg, seconds, done}]}], rating, comment, program{programId, week, session}, updatedAt)`
- `customExercises(id, name, primary[], secondary[], equipment[], mode, mechanics, category, instructions[])`
- `favorites(exerciseId, addedAt)`
- `enrollments(programId, enrolledAt, completed["week-session"], active, completedAt)`
- `kv(key, value)`: settings (units, rest seconds, default sets, theme), builder state

Weights are stored in **kg** and converted for display.

## 4. Features (all offline)

1. **Workout builder**: equipment → muscles → generated exercises (shuffle, add, reorder, remove, favorite). The state survives reloads.
2. **Session tracker**: set logging (weight×reps / reps / time), add or remove sets and exercises, elapsed timer, rest timer with vibration, beep, and SW notification, Screen Wake Lock, finish with a rating and comment. An active session survives app restarts.
3. **History**: 52-week heatmap, session list and detail, repeat a workout, delete.
4. **Statistics** (formerly premium): totals, streaks, PR table, per-exercise max weight, estimated 1RM (Epley), weekly volume charts, timeframe filter.
5. **Programs** (formerly premium): 6 original programs, generated weekly progression, enroll, start a session from the program, progress tracking.
6. **Exercise library**: search and filter, favorites, detail with instructions and personal bests, **custom exercises**.
7. **Tools**: TDEE (Mifflin-St Jeor, Harris-Benedict, Katch-McArdle, Cunningham, Henry/Oxford + comparison), BMI, heart-rate zones (Karvonen), peptide reconstitution, macros, 1RM and percentage table.
8. **Settings**: units, rest timer, default sets, theme, backup export/import (merge or replace), CSV export, wipe data, storage usage, persistent storage, install app, version and update.

## 5. PWA details

- `manifest.webmanifest`:
  - `display: standalone`, `orientation: portrait`, `start_url: "/"`, `scope: "/"`, `id: "/"`
  - separate `any` and `maskable` icons (192/512) plus a 180px apple-touch icon
  - shortcuts (Start workout, History, Tools)
- SW: `registerType: "prompt"`. When a new version is ready, a toast offers "Reload". It never auto-reloads, so an active workout isn't interrupted.
- `navigateFallback: /index.html` so every deep link works offline.
- Install: a custom button using `beforeinstallprompt`, plus an iOS "Share → Add to Home Screen" hint.
- `navigator.storage.persist()` is requested on first completed workout and from Settings.
- An offline/online badge is informational only; behavior is identical either way.

## 6. Testing

- Vitest unit tests: calculators, stats (1RM/volume/streak/PRs), builder generation, program integrity (every exercise referenced exists), and backup validation.
- Manual/E2E: `npm run build && npm run preview`, open, then DevTools → Network → Offline → reload. Every route should load and logging should work.
- Lighthouse: installable PWA, offline start URL.

**Verified (MVP):** 28 unit tests pass. The production build precaches 20 assets (~910 KB). In a browser with the network disabled, the following flow ran with no errors: build workout → log set → rest timer → finish → history; program enroll → start session; stats; tools; and deep links to every route.

## 7. Roadmap

| Phase | Scope | Status |
|---|---|---|
| 1 | Scaffold, PWA, data layer, builder, session, history | ✅ in this repo |
| 2 | Stats, programs, exercise library + custom exercises, tools, settings/backup | ✅ in this repo |
| 3 | Original SVG body-map selector, illustrations per exercise | Planned |
| 4 | i18n bundles (fr/es/pt/ru/zh-CN), localized program text | Planned |
| 5 | Optional media pack (downloadable, SW-cached videos), File System Access auto-backup | Planned |
| 6 | Device-to-device sync without a server (QR / WebRTC / shared file) | Planned |
| 7 | Packaging: Capacitor/Tauri wrappers for app stores (same offline codebase) | Optional |

## 8. Run

```powershell
npm install
npm run icons      # regenerate PNG icons (already committed)
npm run dev        # development (SW disabled in dev)
npm run build      # type-check + production build with service worker
npm run preview    # serve dist on http://localhost:4173, then test offline
npm test           # unit tests
```
