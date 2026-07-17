# Phase 7 — Port the tests

## Context

Phase 7 of the frontend-base migration was deferred while the code migration progressed. All prior phases are done: 0 remaining `@edx/frontend-platform` imports in `src/`, 0 remaining `PluginSlot` usages, all 27 slots ported, template scaffold cleaned up. Tests are now the biggest outstanding item — the plan doc's original Phase 7 estimated 6–10 h of work and is one of the two "high risk" phases.

Current state:
- `src/` has **0** test files (existing `src/setupTest.js` is a 5-line stub calling `mergeSiteConfig(siteConfig)`).
- `legacy/src/` has **43** test files totaling ~7,576 LOC, all still targeting `@edx/frontend-platform` APIs and reading `process.env.*` directly.
- The reference repo (learner-dashboard @ `frontend-base`) has a clean pattern to follow — a 28-line `setupTest.jsx`, one-liner `jest.config.js` + `babel.config.js` delegating to `@openedx/frontend-base/tools`, per-file `jest.requireActual` mocks, fresh `QueryClient` per test, no MSW.

Goal: `npm test` green in `src/` with meaningful coverage of the ported features, and `legacy/src/` no longer the sole source of test truth.

## Guiding principle for what to port

For each legacy test file (or individual assertion), the question isn't "does the file exist in `src/`?" — it's "is the behavior this test asserts still our responsibility, or has it moved to frontend-base / the shell?"

- If it's still ours → port (or write an equivalent assertion where it belongs).
- If frontend-base / the shell owns the behavior now → drop the assertion (or the whole file). Frontend-base has its own tests for its own code; we don't re-cover that surface.

Apply this at both file granularity (whole tests to delete) and assertion granularity (individual `it(...)` blocks inside otherwise-ported files that only asserted "IntlProvider works", "auth is provided", etc.).

## Approach

### 1. Rebuild the test scaffold (one commit)

Modeled verbatim on learner-dashboard where it applies. Files to add/rewrite:

- **`src/setupTest.js`** — replace the 5-line stub with the reference pattern: `mergeSiteConfig(siteConfig) + addAppConfigs()` at module top level, plus an exported `initializeMockServices()` for tests that need auth/logging/analytics. Reference: `frontend-app-learner-dashboard/src/setupTest.jsx`.
- **`site.config.test.tsx`** — verify/populate `apps: [{ appId, config: {...} }]` with the catalog config keys legacy tests currently read from `process.env` (`INFO_EMAIL`, `SITE_NAME`, `ENABLE_COURSE_DISCOVERY`, `HOMEPAGE_PROMO_VIDEO_YOUTUBE_ID`, `STUDIO_BASE_URL`, `LMS_BASE_URL`, `LEARNING_BASE_URL`, `SUPPORT_URL`, etc.). Use `environment: 'test' as SiteConfig['environment']` to avoid the circular-import trap.
- **`jest.config.js`** — one-liner delegation: `module.exports = require('@openedx/frontend-base/tools').createConfig('test', { setupFilesAfterEnv: [..., '<rootDir>/src/setupTest.js'], moduleNameMapper: { '^@src/(.*)$': ..., '\\.svg$': ..., '\\.png$': ... }, ... })`. Reference: learner-dashboard `jest.config.js`.
- **`babel.config.js`** — one-liner: `module.exports = require('@openedx/frontend-base/tools').createConfig('babel')`.
- **`src/__mocks__/`** — add `svg.js` and `file.js` static mocks (`module.exports = 'SvgURL' / 'FileMock'`); bring over `course.ts` and `courseAbout.ts` data fixtures from `legacy/src/__mocks__/` (`courseListSearch.ts` and `index.ts` are already present).

Verification: `npm test -- --passWithNoTests` (no tests exist yet, but the scaffold loads cleanly).

### 2. Skip-list: legacy tests that won't be ported

Per the guiding-principle analysis, these 4 legacy test files won't get a `src/` counterpart. They stay in `legacy/` until the final cleanup step of the migration (deleting `legacy/` wholesale after all remaining phases) — this section just records the decision so no batch below accidentally ports them.

- **`legacy/src/App.test.tsx`** (4 tests, 136 LOC) — asserted route→component wiring for `/`, `/courses`, `/courses/:id/about`, unknown route. Now: each page has its own test in Batch C/D; unknown-route fallback is the shell's `createRouter.js` → `NotFoundPage`. **Skip.** (If we want automated route-wiring coverage, a tiny `routes.test.tsx` walking the tree shape is much cheaper — deferred as a followup if the manual verification proves flaky.)
- **`legacy/src/index.test.tsx`** (1 test, 37 LOC) — asserted the `react-dom/client` + `initialize()` bootstrap. Frontend-base handles bootstrap. **Skip.**
- **`legacy/src/generic/head/Head.test.tsx`** (2 tests, 42 LOC) — asserted the Head component set the document title correctly. Head component doesn't exist; per ADR 0015, per-page `<Helmet>` is used. **Skip.** (Title assertions can be added opportunistically to `HomePage.test.tsx` / `CatalogPage.test.tsx` / `CourseAboutPage.test.tsx` during Batch C/D — see note in Batch C.)
- **`legacy/src/not-found-page/NotFoundPage.test.tsx`** (1 test, 12 LOC) — the shell owns the unknown-route response now (verified in `node_modules/@openedx/frontend-base/dist/shell/router/createRouter.js`). **Skip.**

### 3. Port tests file-by-file, one commit per test (chunked into batches)

**Cadence: one commit per test file** — matching the slot-port cadence. ~39 test-port commits. Batches below are organizational (mental model + rough ordering) but each file in a batch still ships as its own commit.

Within each batch, the port work for a single file is:
1. Copy `legacy/src/**/foo.test.*` → `src/**/foo.test.*`.
2. Rewrite `jest.mock('@edx/frontend-platform', ...)` → `jest.mock('@openedx/frontend-base', () => ({ ...jest.requireActual(...), <named export>: jest.fn() }))`.
3. Replace `process.env.*` reads with `getSiteConfig()` / `getAppConfig(appId)` (or `mergeSiteConfig`/`mergeAppConfig` overrides in `beforeEach`).
4. Review each `it(...)` — drop assertions that only verify shell/base responsibilities. Log the drops in the commit body.
5. Run just this file's tests, iterate until green.

Batches:

- **Batch A — Pure utils / small drop-ins (~13 files, ~1,200 LOC).** Files: all the `__tests__/utils.test.ts` files (catalog, course-media, sidebar-details, sidebar-social, course-list-search, course-card), `useDebouncedSearchInput`, `useFilter`, `usePagination`, `SubHeader`, `LoadingSpinner`, `AlertNotification`, `VideoModal`, `StatusMessage`, `EnrolledStatus`, `EnrollmentButton`. Mostly need only the new `render` helper + `mergeSiteConfig` seeding via the new scaffold; no auth/HTTP mocks.
- **Batch B — Hooks needing `renderHook` + QueryClient/router wrappers (~7 files, ~1,300 LOC).** Files: `useCatalog`, `useCourseData`, `useSearch`, `useEnrollmentActions`, `useEnrollmentStatus`, `courseListSearch` hook, plus `useMenuItems` (from the header — check whether it survives in the widget shape). Pattern: paste-in `createWrapper` with a fresh `QueryClient` per test; mock `getAuthenticatedHttpClient` from `@openedx/frontend-base` with `{ get, post, delete }` = `jest.fn()`.
- **Batch C — Component/page tests with env→config work (~10 files, ~1,700 LOC).** Files: `HomePage`, `HomeBanner`, `CoursesList`, `CourseIntro`, `CourseOverview`, `SidebarDetails`, `SidebarDetailsItem`, `SidebarSocial`, `CourseMedia`, `CourseCard`, `utils.test.ts` (root), `course-about/data/data.test.tsx`. Rewrite `jest.mock('@edx/frontend-platform', ...)` to the `jest.requireActual('@openedx/frontend-base')` + partial-override pattern; swap `process.env.*` reads for `getSiteConfig()` / `getAppConfig(appId)`. **Opportunistically add per-page `<Helmet>` title assertions** here to cover what Head.test used to cover.
- **Batch D — Heavy rewrites (3 files, ~2,400 LOC).** Files: `catalog/CatalogPage.test.tsx` (1695 LOC — largest single file), `course-about/CourseAboutPage.test.tsx` (558), `header/CatalogHeader.test.tsx` (184). These get their own batch because the CatalogPage suite alone is ~35% of the total LOC and will drive its own set of small mock-shape decisions.
- **Batch E — Header widget test rewrite (~2 files, ~340 LOC).** `header/CatalogHeader.test.tsx` and `header/hooks/useMenuItems.test.tsx` need more than a port — the header's shape changed (it's a widget sub-app at `src/widgets/CatalogHeader/`, injecting into shell slots, not a component). Batch this separately so it can absorb its own scope creep.

### 4. `legacy/` stays until the whole migration is done

Not part of this phase. Legacy directory deletion is deferred to the final cleanup after all remaining plan phases (7 tests, 9 SCSS audit, 10 i18n audit, 11 CI audit, 13 final verification). Reference-repo patterns remain available throughout the port for tricky rewrites; the 43 legacy tests keep serving as the source of truth for expected behavior while their ports are in flight.

### 5. Cross-cutting patterns — inline first, extract only if duplication demands it

Learner-dashboard has no `test-utils/` directory. Their pattern is per-file:

- HTTP client mocks: local `const mockHttpClient = { get: jest.fn(), post: jest.fn(), delete: jest.fn() }` inside each `*.test.tsx`.
- `formatMessage` mocks: inline `jest.fn((message) => message.defaultMessage)` inside each `jest.mock('@openedx/frontend-base', ...)` block.
- `createWrapper()` for React Query: redefined in every hook test file with a fresh `QueryClient({ defaultOptions: { queries: { retry: false, retryDelay: 0, gcTime: 0 }, mutations: { retry: false } } })`.
- Config seeding: `mergeSiteConfig` / `mergeAppConfig` called directly in `beforeEach` where needed (most files rely on the top-level `setupTest.js` seed and don't need per-file overrides at all).

Follow the same pattern here. Do not build `src/test-utils/config.ts`, `http.ts`, or `intl.ts` up front. If 3+ ported files end up duplicating the exact same helper, extract it at that point — not before. Same principle for a shared `src/__mocks__/@openedx/frontend-base.ts`: learner-dashboard deliberately uses per-file `jest.mock` + `jest.requireActual` to keep mocks explicit and locally readable, and the survey shows that scales here too.

## Files to modify / create

- `src/setupTest.js` (rewrite)
- `site.config.test.tsx` (populate `apps[0].config`)
- `jest.config.js`, `babel.config.js` (one-liner rewrites)
- `src/__mocks__/svg.js`, `src/__mocks__/file.js` (new)
- `src/__mocks__/course.ts`, `src/__mocks__/courseAbout.ts` (port from legacy)
- 39 test files ported from `legacy/src/**/*.test.*` → `src/**/*.test.*` (43 minus the 4 skip-list entries), one commit each. Extract shared helpers into `src/test-utils/` only if a duplicated pattern shows up 3+ times mid-port.

Not touched in this phase: `legacy/` stays until the final cleanup after phases 9/10/11/13.

## Running tests during the port

CI runs `npm run test` = `openedx test --coverage --passWithNoTests` (a thin `jest` wrapper). `openedx` passes trailing args through to jest, and jest treats a positional string as `--testPathPattern`.

**Skip coverage collection for the entire porting process.** Coverage is slow, hides tight-loop iteration, and — more importantly — its output only becomes useful once the ported suite is complete and we compare it against a baseline. Collecting it per-file only wastes time.

- **Per-file iteration during a port**: `npm test -- --no-coverage <path-or-pattern>`. Example: `npm test -- --no-coverage HomePage`. Same code path as CI; only the coverage collector is skipped.
- **Pre-commit checkpoint** (verify the file passes with CI-shaped flags but still no coverage): `npm test -- --no-coverage <pattern>`.
- **Batch-end checkpoint**: `npm test -- --no-coverage` — full suite green, still no coverage.

The single coverage run happens once, at the end of the phase (see the coverage-regression check below). At that point we also run plain `npm test` (with coverage, matching CI byte-for-byte) as the final gate.

## Verification

- After each per-test-file commit: `npm test -- --no-coverage <pattern>` runs the ported file green.
- After the last ported test in each batch: `npm test -- --no-coverage` green across all files ported so far.
- After Batch E: `npm test -- --no-coverage` green across all 39 ported test files, plus `npm run lint`, `npm run build`, `npm run build:ci`.
- End-to-end: dev server still boots (`npm run dev`) and pages render (home, course-about, catalog).
- **Final gate** (after the coverage-regression check below): plain `npm test` — coverage on, no pattern, matches CI exactly.

## Coverage-regression check (final step, after Batch E)

Establish a baseline from master (which still has the legacy tests wired up) and compare against the ported suite so we catch any coverage regressions the port introduced:

1. Baseline: `git worktree add ../catalog-master master && cd ../catalog-master && npm ci && npm test`, then save the resulting `coverage/coverage-summary.json` (or `lcov.info`) into a scratchpad location.
2. Ported: on `frontend-base` branch after Batch E, `npm test` (first coverage-collecting run of the phase) and grab the equivalent report.
3. Compare per-file and totals. Any src file below its master counterpart's coverage is a candidate for a followup port task (either a missed test file or a dropped assertion that shouldn't have been dropped). File paths won't map 1:1 (some files moved / merged / were dropped intentionally) — bucket the comparison by feature area (home / course-about / catalog / generic / data / widgets) rather than requiring exact-path parity.
4. Record the coverage delta (and any followup tasks) in the worklog so the story is auditable.

The plan doc's "guiding principle for what to port" means some regressions are expected and correct (assertions that only tested shell/base responsibilities). Flag those in the writeup so the delta is understood rather than papered over.

## Effort estimate

Sticking with the plan doc's original 6–10 h. Scaffold + deletes are ~1 h; Batch A is ~1 h (mechanical); Batch B is ~1.5 h; Batch C is ~2 h; Batch D is ~2 h (CatalogPage alone is ~1 h); Batch E is ~1.5 h. Total ~9 h. Per-file commits add wall-clock overhead but improve reviewability.
