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
