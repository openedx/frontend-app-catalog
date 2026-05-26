# Migration Worklog: frontend-app-catalog → frontend-base

Tracking issue: [openedx/frontend-app-catalog#123](https://github.com/openedx/frontend-app-catalog/issues/123)

Plan: [migrate-to-frontend-base.md](./migrate-to-frontend-base.md)

Append-only chronological log of what was actually done, what was discovered, and any deviations from the plan. Phases in the plan are the target; this log is the truth.

---

## 2026-05-26

### Initial plan drafted — commit [`c39f535`](https://github.com/brian-smith-tcril/frontend-app-catalog/commit/c39f535)

- Created `frontend-base` branch off `master` (`57259f5`).
- Wrote the first cut of `docs/migrate-to-frontend-base.md` from a fresh inventory of the repo (139 frontend-platform import sites, 16 plugin-slot folders, 19 process.env vars, 43 test files, etc.).
- Pushed branch to fork (`brian-smith-tcril/frontend-app-catalog`).

### Plan refined against reference repos — commit [`1cb43cf`](https://github.com/brian-smith-tcril/frontend-app-catalog/commit/1cb43cf)

Cross-referenced two sibling migrations already on `frontend-base` branches:
- [openedx/frontend-app-authn @ `frontend-base`](https://github.com/openedx/frontend-app-authn/tree/frontend-base) (initial commit `8f8531a`)
- [openedx/frontend-app-learner-dashboard @ `frontend-base`](https://github.com/openedx/frontend-app-learner-dashboard/tree/frontend-base) (initial commit `89559a4`, 251 files changed)

Both local checkouts updated to clean latest `frontend-base` (learner-dashboard had a local elm-theme override in `site.config.dev.tsx`; stashed to preserve).

Substantive corrections folded into the plan:
- **Phase 1**: keep `@edx/openedx-atlas`, `@edx/browserslist-config`, and the `browserslist` field (was wrongly slated for removal).
- **Phase 1**: version is `0.0.0-dev` not `1.0.0`; peer range is `^1.0.0-alpha || 0.0.0-dev` (alpha-only).
- **Phase 2**: copy full `Makefile`, `turbo.site.json`, `nodemon.json`, `.releaserc`, `app.d.ts` (with SVG decl), `eslint.config.js`, `babel.config.js`, `jest.config.js` verbatim from learner-dashboard.
- **Phase 3**: `site.config.{dev,ci}.tsx` register `[shellApp, headerApp, footerApp, catalogApp]`, not just catalog; `site.config.test.tsx` uses `apps: [{ appId, config }]` and the literal `'test'` env string (breaks a circular mock dep).
- **Phase 4**: `Main.tsx` MUST wrap in `<CurrentAppProvider appId={appId}>`; `index.ts` namespaced exports only (`catalogApp`, `catalogRoutes`); routes use `lazy()` + webpack chunk names; `handle.roles` is an array.
- **Phase 4**: `provides.ts` (authn) and `providers.ts` (learner-dashboard) are **two distinct optional `App` config keys**, not a typo. Catalog likely needs neither initially.
- **Phase 5**: header is a **widget sub-app** at `src/widgets/CatalogHeader/app.tsx` exporting `SlotOperation[]` targeting shell slot IDs (`org.openedx.frontend.slot.header.primaryLinks.v1` etc.) with `condition.active: [catalogRole]` guards — not a single-component override.
- **Phase 7**: `setupTest` uses `mergeSiteConfig + addAppConfigs + initializeMockServices()` helper pattern; jest mocks must spread `jest.requireActual('@openedx/frontend-base')`.
- **Phase 8**: full `Slot` API migration **is** in scope; both reference repos completed it (initial Explore-agent report claimed otherwise — verified by direct grep against the repos). ID convention is `org.openedx.frontend.slot.<appCamelCase>.<slotName>.v1`. Plan now has the complete 24-ID mapping table.
- Effort estimate revised up to ~25–35h from the original 18–24h.

Lessons captured to memory (`feedback_verify_explore_claims.md`): direct-read load-bearing claims from Explore agents before propagating into plans/PRs.

### Phase 0 — branch & baseline ✓

- Branch created and pushed (done above).
- `nvm use` → node v24.13.0, npm 11.12.1 (from `.nvmrc` pin of 24).
- `npm ci` ✓ — 1708 packages installed in 12s.
- `npm run lint` ✓ — clean (only pre-existing stylelint deprecation warnings: `color-hex-case`, `no-missing-end-of-source-newline`, `number-leading-zero`, `string-quotes`).
- `npm test` ✓ — 394 tests / 43 suites / 77.85s.
- `npm run build` ✓ — webpack 5.104.1 compiled with 3 pre-existing warnings:
  - `paragon-theme-core` CSS exceeds 244 KiB (616 KiB)
  - JS chunk `850.*.js` exceeds 244 KiB (1.97 MiB)
  - `app` entrypoint exceeds 244 KiB (2.02 MiB) — recommends code-splitting via `import()`

Baseline is known-good. Any breakage from here on is on the migration.

No commit for this phase (per plan).

### Strategy pivot — overlay frontend-template-application

Switched from "transform catalog in place over N phases" to "start from a fresh frontend-base scaffold (frontend-template-application@frontend-base), keep legacy code in `legacy/` for reference, port features one by one."

Motivation: the in-place plan had a multi-day window where the app was broken (Phases 1–6 minimum). The overlay strategy gives a working `npm run dev` from the very first commit, and every feature port lands as a self-contained commit that keeps the app runnable.

Tradeoff accepted: the git history won't read as "catalog evolving into frontend-base"; it reads as "scaffold + ports." Acceptable for a long-lived migration branch — the reference repos' histories aren't linear either (60+ follow-up fix commits each).

### Commit A — move catalog code into `legacy/` — [`292af79`](https://github.com/brian-smith-tcril/frontend-app-catalog/commit/292af79)

`git mv` of all catalog-specific files (src/, public/, package*.json, jest.config.ts, tsconfig.json, Makefile, README.md, webpack.dev.config.js, .env*, .eslintrc.js, .eslintignore, .stylelintrc.json, .npmignore) into `legacy/`.

Kept at root: `.git/`, `.github/`, `.gitignore`, `.nvmrc`, `LICENSE`, `docs/`, `catalog-info.yaml`, `codecov.yml`, `renovate.json`.

Also deleted gitignored artifacts at root (`node_modules/`, `coverage/`, `dist/`).

### Commit B — overlay frontend-template-application@frontend-base — [`070edf9`](https://github.com/brian-smith-tcril/frontend-app-catalog/commit/070edf9)

Cloned [`openedx/frontend-template-application`](https://github.com/openedx/frontend-template-application) at branch `frontend-base` (HEAD `2ce8a2c`, 2026-04-29) as a peer checkout.

Used `rsync -a --exclude='.git' --exclude='node_modules' --exclude='catalog-info.yaml'` to overlay onto the catalog repo. `catalog-info.yaml` was excluded so the catalog component metadata survives.

Files that already existed and were identical (no diff): `LICENSE`, `.nvmrc`, `.dockerignore`, `codecov.yml`, `renovate.json`, `docs/decisions/0001-*`, `docs/decisions/0002-*`, `docs/images/template.jpg`, six of the seven `.github/workflows/*.yml`.

Files replaced (template-app version won): `.gitignore` (template's pattern set including i18n exclusions), `.npmignore` (minimal `node_modules`), `.github/workflows/ci.yml` (frontend-base build pipeline), `docs/how_tos/i18n.rst` (updated for atlas/openedx CLI).

Files added: `Makefile`, `README.rst`, `README-template-frontend-app.rst`, `app.d.ts`, `babel.config.js`, `eslint.config.js`, `jest.config.js`, `nodemon.json`, `package.json`, `package-lock.json`, `site.config.{dev,test,ci}.tsx`, `tsconfig.json`, `tsconfig.build.json`, `turbo.site.json`, `public/`, `src/` (template scaffold with `Main.tsx`, `app.ts`, `constants.ts`, `index.ts`, `messages.ts`, `routes.tsx`, `slots.tsx`, `setupTest.js`, `style.scss`, an `example/` page, an `ExampleSlot/`, and an `ExampleHeader/` widget), `.github/dependabot.yml`.

### Commit C — customize for catalog — [`aff20b8`](https://github.com/brian-smith-tcril/frontend-app-catalog/commit/aff20b8)

Bulk-renamed `template` → `catalog`, `Template` → `Catalog`, `frontend-template-application` → `frontend-app-catalog`, plus targeted renames for `templateApp/Routes/Role` → `catalogApp/Routes/Role`. Affected 14 files: `package.json`, three `site.config.*.tsx`, `src/Main.{tsx,test.tsx}`, `src/{constants,index,messages,routes}.ts(x)`, `src/slots/ExampleSlot/{ExampleSlot.tsx,README.md}`, `src/widgets/ExampleHeader/app.tsx`, `src/example/data/README.rst`.

Manual edits beyond the bulk rename:
- `package.json`: `description` → "Frontend catalog application"; `PORT=8080` → `PORT=1998` (matched the legacy dev port).
- `site.config.dev.tsx` / `site.config.test.tsx`: baseUrl port → `1998`.

Catalog-specific adjustments to keep `legacy/` from polluting tooling:
- `eslint.config.js` ignores: added `legacy/**`.
- `jest.config.js`: added `testPathIgnorePatterns: ['/node_modules/', '/legacy/']` and `coveragePathIgnorePatterns: ['/legacy/']`.

Smoke test on commit C:
- `npm ci` ✓
- `npm run lint` ✓ (clean — pre-existing stylelint warnings gone since stylelint is no longer wired in)
- `npm test` ✓ — 2 suites / 2 tests / 15s (template scaffold's `Main.test.tsx` + `ExamplePage.test.tsx`)
- `npm run build` ✓ — produces `dist/Main.js`, `dist/app.js`, etc. via `tsc + tsc-alias`
- `npm run build:ci` ✓ — webpack 5.106.2 compiles with bundle-size warnings only

The app now boots end-to-end as a frontend-base app called `@openedx/frontend-app-catalog` (currently a placeholder ExamplePage). Next: start porting features out of `legacy/`.

### What remains from the catalog implementation

Everything from the pre-frontend-base implementation lives in `legacy/`:
- `legacy/src/` — 14 feature directories (catalog, course-about, home, header, generic, etc.) + plugin-slots/, __mocks__/, data/, i18n/
- `legacy/package.json`, `legacy/package-lock.json` — old dependency set (no longer installed)
- `legacy/.env*` — runtime config values to fold into `site.config.*.tsx` `apps[0].config` and `externalRoutes`
- `legacy/Makefile`, `legacy/webpack.dev.config.js`, `legacy/jest.config.ts`, `legacy/tsconfig.json` — old toolchain
- `legacy/.eslintrc.js`, `legacy/.eslintignore`, `legacy/.stylelintrc.json` — old lint config

The plan doc's phase structure is now reframed as a port checklist: each "phase" describes a feature/concern that needs to move out of `legacy/` into the new structure. Order within porting is flexible and driven by dependency.

