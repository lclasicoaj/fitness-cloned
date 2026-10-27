# Repository Guidelines

## Project Structure & Module Organization

This repository contains RepForge, an offline-first workout tracking PWA. Application code lives in `src/`: `pages/` holds routed screens, `components/` shared UI, `data/` exercise and program catalogs, and `lib/` business logic and utilities. Core app setup and IndexedDB schema are in `src/App.tsx`, `src/main.tsx`, and `src/db.ts`. Static assets belong in `public/`; icon generation is maintained in `scripts/gen-icons.mjs`. `dist/` is generated output and should not be edited by hand. See `OFFLINE_PLAN.md` for architecture and offline behavior.

## Build, Test, and Development Commands

- `npm install` installs the locked dependencies.
- `npm run dev` starts Vite locally at `http://localhost:5173` (service worker is disabled in development).
- `npm run build` runs the TypeScript project check and creates the production PWA in `dist/`.
- `npm test` runs the Vitest suite once.
- `npm run preview` serves the production build locally, useful for checking service worker/offline behavior.
- `npm run icons` regenerates the PNG app icons from the script inputs.

## Coding Style & Naming Conventions

Use TypeScript and React function components. Follow nearby code for formatting; use two spaces for indentation, semicolons, and single quotes where consistent with the file. Use `PascalCase` for components and page modules, `camelCase` for functions and variables, and descriptive lowercase names for utility modules. Keep reusable calculations and data transforms in `src/lib/`, not in page rendering code. Preserve the offline-first design: browser storage is local IndexedDB via Dexie, with no server dependency.

## Testing Guidelines

Tests use Vitest and are colocated with the module they cover, named `*.test.ts` (for example, `src/lib/backup.test.ts`). Add tests for business logic, calculations, backup handling, and data generation when changing those areas. Run `npm test`; run `npm run build` to catch type errors and production integration issues. No coverage threshold is configured.

## Commit & Pull Request Guidelines

The available checkout has no readable Git history to infer an established commit format. Use short imperative commit subjects (for example, `Fix backup import validation`). Pull requests should explain the user-visible change, note relevant offline or data-storage effects, link related issues, and include screenshots for UI changes. Include the commands used to verify the change.

## Security & Configuration Tips

Do not add credentials, analytics, or server calls without updating the product’s offline and privacy design. Changes to IndexedDB models or backup formats should account for existing user data and import/export compatibility.
