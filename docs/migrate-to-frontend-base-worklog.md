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

### Regenerated package-lock.json — [`115d171`](https://github.com/brian-smith-tcril/frontend-app-catalog/commit/115d171)

Wiped the lockfile inherited from frontend-template-application and ran a fresh `npm install` to pick up current versions matching `package.json` ranges.

Resolved versions (top-level peers/deps):
- `@openedx/frontend-base@1.0.0-alpha.49` (latest alpha; template's lockfile pinned an earlier alpha)
- `@openedx/paragon@23.22.0`
- `react@18.3.1`, `react-router@6.30.3`, `react-router-dom@6.30.3`
- `@tanstack/react-query@5.100.14`
- `jest@29.7.0`, `nodemon@3.1.14`, `turbo@2.9.14`, `tsc-alias@1.8.17`
- `openedx` CLI now at `1.0.0-alpha.49` (was `alpha.39` with the inherited lockfile)

Lockfile diff: 1276 insertions / 1169 deletions; 1548 packages total. Audit went 20 → 12 vulnerabilities.

Smoke tests re-run on `115d171`: `npm ci` ✓, `npm run lint` ✓, `npm test` ✓ (2/2), `npm run build` ✓, `npm run build:ci` ✓.

### Ported home page — [`af6c8aa`](https://github.com/brian-smith-tcril/frontend-app-catalog/commit/af6c8aa)

First feature port out of `legacy/`. 50 files / +1082 LoC. The home page now mounts at `/catalog/` (template scaffold's index child route swapped from `ExamplePage` to `HomePage`).

**Strategy for slots:** every `<PluginSlot id="..." slotOptions={...}>{children}</PluginSlot>` becomes `<>{children}</>`. The default content renders unconditionally; slot extensibility is deferred to a later focused effort. Saved as feedback memory [[feedback-slot-placeholder-strategy]] after the user corrected an initial under-interpretation (I had stubbed with TODO comments).

**Files ported (legacy/src/* → src/*):**

| Category | Files |
|---|---|
| Slot wrappers (8) | `slots/HomeBannerSlot`, `slots/HomeCoursesListSlot`, `slots/HomeOverlayHtmlSlot`, `slots/HomePromoVideoSlots/{,HomePromoVideoButtonSlot,HomePromoVideoModalSlot,HomePromoVideoModalContentSlot}`, `slots/HomeCourseCardSlot`, `slots/LoaderSlot` (folder rename `plugin-slots/` → `slots/`) |
| Home components (5) | `home/HomePage.tsx`, `home/components/home-banner/{HomeBanner,HomePageOverlay,HomePromoVideoBtn}.tsx` + scss, `home/components/courses-list/CoursesList.tsx`, supporting `messages.ts` / `types.ts` / `constants.ts` |
| Generic components (3) | `generic/course-card/`, `generic/alert-notification/`, `generic/video-modal/` (dropped `head/`, `loading-spinner/`, `sub-header/` — not needed for home) |
| Data layer | full `data/course-list-search/` (hooks, api, urls, constants, types, utils) |
| Mocks | `__mocks__/courseListSearch.ts` + slimmed `__mocks__/index.ts` |
| Assets | `assets/images/no-course-image.svg`, `assets/scss/_animations.scss` |
| New helpers | `data/appConfig.ts` (typed `CatalogAppConfig` + `getCatalogConfig()` wrapper around `getAppConfig(appId)`), `utils.ts` (`formatDate` + `IntlShape` alias), `global.d.ts` (svg module decl) |
| Modified scaffold | `app.ts` (added catalog-specific `config` block), `constants.ts` (added ROUTES, IFRAME_FEATURE_POLICY, video-modal constants, DATE_FORMAT_OPTIONS), `routes.tsx` (index child → HomePage), `style.scss` (`@use` animations + home-banner) |

**Mechanical pass via bulk `cp` + `sed`:**
1. `cp` the legacy files (excluding tests) into the new structure.
2. `sed` rewrites: `@edx/frontend-platform/*` → `@openedx/frontend-base`, `@src/plugin-slots/` → `@src/slots/`.
3. Manual rewrites per file for: PluginSlot wrappers → `<></>`, `getConfig()` → `getSiteConfig()` (for `LMS_BASE_URL`, `SITE_NAME`) or `getCatalogConfig()` (for app-scoped flags), `IntlShape` from `@edx/frontend-platform/i18n` → `ReturnType<typeof useIntl>` via `@src/utils`.

**Gotchas hit:**
- `tsconfig.build.json` doesn't include `app.d.ts`, so the `declare module '*.svg'` wildcard wasn't visible during `tsc` build. Fix: added `src/global.d.ts` with the wildcard (matches `src/**/*` include glob).
- `@openedx/frontend-base` does not export the `IntlShape` *type* (only the legacy `intlShape` PropTypes shape). Workaround: `export type IntlShape = ReturnType<typeof useIntl>` in `src/utils.ts`.
- `getAppConfig(appId)` returns `AppConfig = Record<string, unknown>`, so every property access is `unknown`. Workaround: `getCatalogConfig()` in `src/data/appConfig.ts` casts to a typed `CatalogAppConfig` interface (via `as unknown as`).
- `@openedx/frontend-base`'s `ErrorPage` types claim `message?: null | undefined` (its runtime accepts a string just fine). Worked around with an inline `as unknown as null` cast in CoursesList; should be fixed upstream.
- Lint was clobbering on `@stylistic/member-delimiter-style` (legacy `;` separators in interfaces); `npm run lint:fix` cleaned them up.

**Smoke tests on `af6c8aa`:**
- `npm run lint` ✓
- `npm test` ✓ (2 suites still — Main.test.tsx + ExamplePage.test.tsx; the home page test files stay in `legacy/` for now)
- `npm run build` ✓
- `npm run build:ci` ✓ (webpack with bundle-size warnings)

**Visual verification:** not run; would need `npm run dev` against a live LMS. Default `app.ts` config has `ENABLE_COURSE_DISCOVERY: false`, `HOMEPAGE_PROMO_VIDEO_YOUTUBE_ID: ''` → the page renders the overlay title/subtitle + the empty animation wrapper + the courses list (which will hit error state without a backend).

**Follow-ups created:**
- Port the home-page test files from `legacy/src/home/`, `legacy/src/generic/`, `legacy/src/data/course-list-search/` using the new `setupTest` pattern (`mergeSiteConfig` + `mergeAppConfig` + `jest.requireActual` spread).
- Real slot API migration: replace each `<>{children}</>` with `<Slot id="org.openedx.frontend.slot.catalog.*.v1">{children}</Slot>` once header/footer + other apps are in better shape.
- Tune `site.config.dev.tsx` to override catalog config for a better dev experience (`ENABLE_COURSE_DISCOVERY: true`, `ENABLE_PROGRAMS: true`, sample `HOMEPAGE_PROMO_VIDEO_YOUTUBE_ID`).
- Fix `ErrorPage` typings upstream in `@openedx/frontend-base`; remove the `@ts-expect-error` in `CoursesList.tsx`.

### Cleanup pass — align with reference repo patterns — [`dc47d55`](https://github.com/brian-smith-tcril/frontend-app-catalog/commit/dc47d55)

Audited two divergences from the authn / learner-dashboard frontend-base branches:

- **`getCatalogConfig` typed wrapper** (was at `src/data/appConfig.ts`): neither reference repo has anything like this. learner-dashboard's only `.tsx` use of `getAppConfig` (`widgets/LearnerDashboardHeader/app.tsx`) uses raw `getAppConfig(appId).X` with truthiness operators (`=== true`, `? true : false`) to coerce `unknown` → concrete types. Required an `as unknown as CatalogAppConfig` double-cast.
- **`as unknown as null`** in CoursesList (ErrorPage workaround): one-off, but no double-casts exist anywhere in the reference repos. Real underlying issue is a typing bug in `@openedx/frontend-base`'s `ErrorPage` (declares `message?: null | undefined` but renders the prop as text).

**Action:**
- Deleted `src/data/appConfig.ts` and `getCatalogConfig`. Replaced 7 call sites across `HomeBanner.tsx`, `CoursesList.tsx`, `HomePromoVideoSlots/HomePromoVideoButtonSlot/index.tsx` with raw `getAppConfig(appId).X`. Booleans use `=== true`; the 2 non-boolean sites (`HOMEPAGE_COURSE_MAX`, `HOMEPAGE_PROMO_VIDEO_YOUTUBE_ID`) get inline `as number | undefined` / `as string | undefined` casts. One more cast for `INFO_EMAIL as string` since `formatMessage` values don't accept `unknown`.
- Replaced the `as unknown as null` cast with `// @ts-expect-error` placed in JSX attribute position (i.e., as a `//` comment between attributes, not as a `{/* */}` JSX comment — only the former is recognized as a TS directive).

**`IntlShape = ReturnType<typeof useIntl>` in `src/utils.ts`** was kept after the audit. Neither reference repo passes `intl` as a function param so they don't have this type, but `formatDate(dateString, intl: IntlShape)` legitimately needs a type, and the `ReturnType` derivation is correct.

**Final type-escape count in production code:**
- 3 inline `as number|undefined` / `as string|undefined` / `as string` casts (all on `getAppConfig(appId).X` consumption)
- 1 `// @ts-expect-error` for the upstream ErrorPage bug
- Zero `as unknown as X` double casts

Smoke tests on `dc47d55`: lint ✓, build ✓, build:ci ✓, test ✓ (2/2).

### Audit: legacy `.env*` → SiteConfig / app.config — [`1de5f07`](https://github.com/brian-smith-tcril/frontend-app-catalog/commit/1de5f07)

Walked every variable in `legacy/.env`, `legacy/.env.development`, `legacy/.env.test` against (a) the `SiteConfig` type from `@openedx/frontend-base/dist/types.d.ts`, and (b) actual consumption in `legacy/src/*.ts(x)` (grep-checked, non-test files). Goal: only include what's consumed by ported code; defer the rest until its consumer feature is ported.

#### SiteConfig fields — already correct
| Legacy env var | SiteConfig field | Status |
|---|---|---|
| `BASE_URL` | `baseUrl` | ✓ dev/test/ci |
| `LMS_BASE_URL` | `lmsBaseUrl` | ✓ |
| `LOGIN_URL`, `LOGOUT_URL` | `loginUrl`, `logoutUrl` | ✓ |
| `SITE_NAME` | `siteName` | ✓ |
| `ACCESS_TOKEN_COOKIE_NAME` | `accessTokenCookieName` | ✓ dev only (matches template + learner-dashboard, which rely on defaults for the rest) |
| `NODE_ENV` | `environment` (`EnvironmentTypes.{DEVELOPMENT,TEST,PRODUCTION}`) | ✓ |
| `APP_ID` | `appId` in `src/constants.ts` | ✓ |

#### SiteConfig fields — skipped (frontend-base defaults work in reference repos; add only if a real auth/runtime problem surfaces)
| Legacy env var | Would map to |
|---|---|
| `LANGUAGE_PREFERENCE_COOKIE_NAME` | `siteConfig.languagePreferenceCookieName` |
| `USER_INFO_COOKIE_NAME` | `siteConfig.userInfoCookieName` |
| `CSRF_TOKEN_API_PATH` | `siteConfig.csrfTokenApiPath` |
| `REFRESH_ACCESS_TOKEN_ENDPOINT` | `siteConfig.refreshAccessTokenApiPath` (path-only — legacy was a full URL) |
| `SEGMENT_KEY` | `siteConfig.segmentKey` |
| `MFE_CONFIG_API_URL` | `siteConfig.runtimeConfigJsonUrl` |
| `STUDIO_BASE_URL` | `siteConfig.cmsBaseUrl` — add when porting course-about (links to Studio for staff) |

#### App config — kept in `src/app.ts` (consumed by ported home-page code)
| Var | Consumer |
|---|---|
| `ENABLE_COURSE_DISCOVERY` | `HomeBanner.tsx` — gates the search field |
| `HOMEPAGE_PROMO_VIDEO_YOUTUBE_ID` | `HomeBanner.tsx`, `HomePromoVideoButtonSlot/index.tsx` |
| `HOMEPAGE_COURSE_MAX` | `CoursesList.tsx` |
| `ENABLE_COURSE_SORTING_BY_START_DATE` | `CoursesList.tsx` |
| `NON_BROWSABLE_COURSES` | `CoursesList.tsx` |
| `INFO_EMAIL` | `CoursesList.tsx` — error message |

#### App config — **dropped** from `src/app.ts` (only consumed by features we haven't ported yet; re-add with their consumer)
| Var | Re-add when porting |
|---|---|
| `ENABLE_PROGRAMS` | header (`legacy/src/header/hooks/useMenuItems.ts`) |
| `SUPPORT_URL` | header (`legacy/src/header/hooks/useMenuItems.ts`) |
| `COURSE_ABOUT_TWITTER_ACCOUNT` | course-about sidebar social (`legacy/src/course-about/course-sidebar/sidebar-social/utils.ts`) |

#### Dropped entirely — never consumed, or shell-managed in frontend-base
| Var | Why |
|---|---|
| `LOGO_URL`, `LOGO_TRADEMARK_URL`, `LOGO_WHITE_URL` | Never referenced in legacy code; frontend-base shell manages logos via `siteConfig.headerLogoImageUrl` + theme |
| `FAVICON_URL` | Only consumed by `legacy/src/generic/head/index.tsx`; we're not porting `<Head />` because the frontend-base shell handles favicons |
| `PARAGON_THEME_URLS` | Was for frontend-build's Paragon CDN theme loading; replaced by `siteConfig.theme` |
| `ECOMMERCE_BASE_URL`, `CREDENTIALS_BASE_URL`, `MARKETING_SITE_BASE_URL`, `ORDER_HISTORY_URL` | Defined in `.env` but never grepped in legacy `src/`; dead-letter env vars |
| `LEARNING_BASE_URL` | Only consumed by `legacy/src/course-about/course-intro/utils.ts`; add as `app.config` when porting course-about |
| `PORT` | npm script (`"dev": "PORT=1998 PUBLIC_PATH=/catalog openedx dev"`) |

#### Dev/test overrides added
`site.config.dev.tsx` had no `catalogApp.config` overrides, so the dev home page rendered without the search field, video button, or support email. Spread + override added:
```tsx
{
  ...catalogApp,
  config: {
    ...catalogApp.config,
    ENABLE_COURSE_DISCOVERY: true,
    HOMEPAGE_PROMO_VIDEO_YOUTUBE_ID: 'test-youtube-id',
    INFO_EMAIL: 'support@example.com',
  },
},
```

`site.config.test.tsx` had `config: {}`; populated with the same flags plus `HOMEPAGE_COURSE_MAX: 9` so the test environment has a complete catalog config. Per-test overrides still use `mergeAppConfig`.

`site.config.ci.tsx` unchanged — CI verifies the webpack build only; runtime config values don't affect `npm run build:ci`.

Smoke tests on `1de5f07`: lint ✓, build ✓, build:ci ✓, test ✓ (2/2).

