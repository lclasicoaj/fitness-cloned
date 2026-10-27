# Project Context

RepForge is an installable, offline-first workout builder and tracker. It is a static client-side app: workout data stays in the browser, with no server, account, analytics, or runtime third-party service calls. `OFFLINE_PLAN.md` describes product intent and planned features; current implementation is defined by `src/` and configuration files.

## Architecture and data flow

`index.html` mounts the React app through `src/main.tsx`, which installs `BrowserRouter`, global CSS, and PWA registration (`src/lib/pwa.ts`). `src/App.tsx` owns route declarations, shared header/navigation, online and active-session indicators, theme application, and the update prompt. Route pages compose shared controls and call shared hooks or domain helpers.

Persistent user data uses Dexie/IndexedDB (`src/db.ts`, database name `repforge`): `sessions`, `customExercises`, `favorites`, `enrollments`, and key/value `kv`. Typed domain records and defaults are in `src/types.ts`; `src/lib/hooks.ts` exposes Dexie live queries, settings, exercise/favorite access, and lightweight browser state. Builder preferences and the rest-timer deadline use localStorage; settings and workout records use IndexedDB. Static exercise and program content is versioned in `src/data/`. Domain operations live in `src/lib/` (builder, session helpers, calculations/statistics, backup, utilities, PWA/browser APIs). Settings pages connect JSON backup/import, CSV export, storage persistence, theme/units, and install controls to these layers.

Production caching is configured in `vite.config.ts` with `vite-plugin-pwa`/Workbox: generated service worker precaches build assets, serves SPA deep links through `index.html`, and prompts for updates rather than forcing reloads. PWA development service-worker support is disabled.

## Stack and folders

- React 19 + TypeScript 7; Vite 8 and `@vitejs/plugin-react` build the SPA.
- React Router 7 handles client routes; Tailwind CSS 4 via its Vite plugin styles the UI.
- Dexie 4 and `dexie-react-hooks` provide IndexedDB and reactive queries; Recharts renders charts; Lucide React supplies icons.
- `src/pages/`: routed screens; `src/components/`: shared UI; `src/data/`: exercise taxonomy/catalog and programs; `src/lib/`: domain logic and browser integrations; `public/`: bundled icons; `scripts/gen-icons.mjs`: icon generation.
- `src/index.css` contains global styles. `dist/` is generated production output; do not edit it directly.

## Workflows and configuration

`npm run dev` runs Vite (port 5173); `npm run build` runs `tsc -b` then creates the production bundle and service worker; `npm run preview` serves that build (default Vite preview port 4173); `npm test` runs Vitest once; `npm run icons` regenerates PNG icons. Tests are colocated as `src/**/*.test.ts`; Vitest uses the Node environment, and `fake-indexeddb` is available for database tests.

`tsconfig.json` enables strict, no-emit TypeScript, bundler module resolution, and unused-local/parameter checks. `vite.config.ts` defines `__APP_VERSION__` from the package version, PWA manifest and Workbox behavior, and test selection. `package-lock.json` pins dependency resolution.

## Conventions and key decisions

Keep reusable business logic in `src/lib/`, content in typed `src/data/`, and route UI in `src/pages/`. Tests follow the module name with `.test.ts`. Follow neighboring TypeScript/React style and preserve strict type checking. Weight values are stored as kilograms and converted for display. IndexedDB is the source of truth for workout/history settings; localStorage is reserved for small client-only state. Backup files provide manual portability, with no automatic sync. Update this document when architecture, persistence, build/PWA behavior, or major dependencies change.
