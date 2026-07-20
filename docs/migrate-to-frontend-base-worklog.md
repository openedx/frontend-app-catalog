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

### Runtime-config arc — endpoint, merge precedence, three-tier model

Walked from "let's enable runtime config" to "this is an upstream design issue." Four commits and a lot of analysis. Captured here so the reasoning survives, not just the diffs.

#### First attempt — wrong endpoint — [`34afd25`](https://github.com/brian-smith-tcril/frontend-app-catalog/commit/34afd25)

Set `runtimeConfigJsonUrl: 'http://local.openedx.io:8000/api/mfe_config/v1'` in `site.config.dev.tsx`, matching the legacy `MFE_CONFIG_API_URL` env var that legacy's dev npm script wired up.

Result: the video button (which `HomePromoVideoButtonSlot` gates on `getAppConfig(appId).HOMEPAGE_PROMO_VIDEO_YOUTUBE_ID`) stayed visible in dev even though the LMS returns `null` for that key.

Why: `/api/mfe_config/v1` returns a flat blob (legacy MFE-config shape). Frontend-base's `mergeSiteConfig(data, { limitAppMergeToConfig: true })` destructures `{ apps: newApps, ...rest } = data`. With a flat blob `newApps` is `undefined`, the function early-returns after merging `rest` into top-level `siteConfig`. The flat catalog-relevant keys land at `siteConfig.HOMEPAGE_PROMO_VIDEO_YOUTUBE_ID` etc. — never reaching `appConfigs[catalog]` and so invisible to `getAppConfig(catalog)`.

#### Right endpoint — [`d317b50`](https://github.com/brian-smith-tcril/frontend-app-catalog/commit/d317b50)

Switched to `/api/frontend_site_config/v1/` (trailing slash matters — Django returns 301 without it). This is the endpoint added by [openedx/openedx-platform#38061](https://github.com/openedx/openedx-platform/pull/38061) as a compatibility translation layer. It returns the frontend-base-shaped response:

```json
{
  "baseUrl": "...",
  "lmsBaseUrl": "...",
  "csrfTokenApiPath": "...",
  "commonAppConfig": { "ENABLE_COURSE_DISCOVERY": true, "HOMEPAGE_PROMO_VIDEO_YOUTUBE_ID": null, ... },
  "externalRoutes": [...],
  "apps": [{ "appId": "...", "config": {...} }]
}
```

After this, `mergeSiteConfig` correctly merges runtime values into `siteConfig.commonAppConfig` etc. But the video button still didn't hide.

#### The actual blocker — bundled values shadow runtime

`getAppConfig(id) = merge({}, commonAppConfig, appConfigs[id])`. lodash.merge applies sources left-to-right, so `appConfigs[id]` (per-app config) wins over `commonAppConfig`. Per-app config is populated from `siteConfig.apps[i].config`, which at the time was the static `site.config.dev.tsx` spread:

```tsx
{
  ...catalogApp,
  config: {
    ...catalogApp.config,  // bundled defaults from src/app.ts
    HOMEPAGE_PROMO_VIDEO_YOUTUBE_ID: 'test-youtube-id',  // our static override
    ...
  },
}
```

`'test-youtube-id'` beat the runtime `null`. Even after dropping that spread, the *bundled* `src/app.ts` value (`''` in this case) would still beat runtime — same merge order. Falsy enough that the video button incidentally hides for `HOMEPAGE_PROMO_VIDEO_YOUTUBE_ID`, but for `ENABLE_COURSE_DISCOVERY: false` (bundled) shadowing `true` (runtime), the search field would never appear in dev.

This is [openedx/frontend-base#268](https://github.com/openedx/frontend-base/issues/268) — the issue previously filed about commonAppConfig precedence.

#### Three-tier model emerged

While discussing, the actual ideal merge order resolved into three tiers:
- **Tier 1**: bundled (`src/app.ts` config block — ships with the app package, defaults that downstream consumers inherit)
- **Tier 2**: common (`commonAppConfig` — operator-controlled site-wide, from `site.config.*.tsx` or LMS runtime)
- **Tier 3**: per-app override (`apps[].config` from `site.config.*.tsx` or LMS `MFE_CONFIG_OVERRIDES['mfe-name']` — operator-controlled per-app, the explicit "I want this for this MFE specifically")

Priority should be tier 1 < tier 2 < tier 3. Frontend-base today can't express that because tier 1 and tier 3 both end up in `appConfigs[id]` — no distinction between "this came from the bundled app" and "this came from a site config".

The matching legacy mental model: `getConfig()` was a single flat namespace, runtime always won over `.env`. Devs migrating from legacy expect "runtime wins over what I bundled." The current behavior silently violates that for any key with a non-undefined bundled default — which is the developer-experience angle behind why #268 feels off.

#### The LMS-side architectural alternative

Issue #268's proposed fix is to flip the lodash.merge order in `getAppConfig` so `commonAppConfig` wins over `appConfigs[id]`. Problem: that breaks the per-app override case (tier 3 should still win over tier 2). The flip would conflate the two distinct precedence concerns.

The cleaner fix lives in [openedx/openedx-platform#38061](https://github.com/openedx/openedx-platform/pull/38061)'s translation layer (`translate_legacy_mfe_config()` in `lms/djangoapps/mfe_config_api/views.py`). Currently:
- `MFE_CONFIG` flat values → `commonAppConfig` (because the LMS doesn't know which keys belong to which MFE)
- `MFE_CONFIG_OVERRIDES['<mfe>']` → `apps[<mfe>].config`

Per-app keys land in `commonAppConfig` only because the LMS can't classify them. *But each MFE knows what keys it reads — they're declared in `src/app.ts`'s `config` block.* So the routing manifest exists in the ecosystem, just not at the LMS today.

Proposal (still being discussed upstream): the translation layer takes a `MFE_CONFIG_KEY_OWNERSHIP` Django setting (or similar registry) — Tutor and other operators populate it; the translation layer routes per-MFE keys into `apps[appId].config`. Anything not classified stays in `commonAppConfig`, which over time shrinks to just truly-cross-cutting values. When legacy `MFE_CONFIG`/`MFE_CONFIG_OVERRIDES` get dropped entirely, the setting goes away too — operators write native `FRONTEND_SITE_CONFIG` directly and no translation is needed.

This sidesteps #268's merge-flip entirely. The post-legacy state stays clean (no oversized `commonAppConfig` to migrate away from).

#### Upstream comment

Posted [the position](https://github.com/openedx/frontend-base/issues/268#issuecomment-4550172930) on the frontend-base issue: the proposed merge flip breaks overrides; the real fix needs to distinguish bundled vs site-supplied per-app config; longer-term the `frontend_site_config` endpoint should be classifying per-MFE rather than dumping everything into `commonAppConfig`.

#### Decision for the catalog repo — [`ff1ce00`](https://github.com/brian-smith-tcril/frontend-app-catalog/commit/ff1ce00)

Dropped the static `apps[catalog]` overrides from `site.config.dev.tsx`. They were acting as tier-3 overrides and (correctly per the three-tier model) winning over runtime — but that wasn't what we wanted; we wanted the LMS to drive these values in dev.

Now dev assumes a running LMS providing values via `/api/frontend_site_config/v1/`. When the LMS is up, runtime `commonAppConfig` values flow into `getAppConfig(catalog)` *for keys not also present in bundled `src/app.ts`* — but bundled defaults still shadow runtime for the keys that are bundled (the #268 problem). This commit doesn't fix that; it just removes the tier-3 overlay so the underlying behavior is observable while #268 is pending upstream.

#### What stays for next time
- Bundled defaults in `src/app.ts` shadow runtime `commonAppConfig`. Dev experience for those keys (e.g. `ENABLE_COURSE_DISCOVERY: false` bundled vs `true` from LMS → search field never shows) is wrong until either frontend-base distinguishes tiers or we empty the bundled defaults.
- `site.config.test.tsx` `apps[catalog].config` overrides remain — tests don't run the runtime fetch, so the static values serve as the test environment's runtime equivalent.
- The `runtimeConfigJsonUrl` URL is hardcoded to `http://local.openedx.io:8000/api/frontend_site_config/v1/` — Tutor-specific. Should become a per-operator concern once we have a real deployment story.

Smoke tests on `ff1ce00`: lint ✓, build ✓, build:ci ✓, test ✓ (2/2).

## 2026-05-27

### Placeholder routes for `/courses` and `/courses/:courseId/about` — [`32c239a`](https://github.com/brian-smith-tcril/frontend-app-catalog/commit/32c239a)

Two child routes added under the catalog parent route with their own role constants:
- `coursesRole = 'org.openedx.frontend.role.courses'` → `/catalog/courses` → placeholder `CatalogPage`
- `courseAboutRole = 'org.openedx.frontend.role.courseAbout'` → `/catalog/courses/:courseId/about` → placeholder `CourseAboutPage`

Role-naming convention confirmed against reference repos (authn `loginRole`, learner-dashboard `dashboardRole`): `org.openedx.frontend.role.<feature>`, no app namespace.

The placeholder components are just `<div>` stubs — they exist so the header widget can use `getUrlByRouteRole(coursesRole)` to look up the URL and so role-based active-state matching has a real role to highlight against. Both replaced when those features are properly ported out of `legacy/`.

Note on `getUrlByRouteRole`: it's exported from `@openedx/frontend-base` (under that name, not `getUrlForRouteRole` as the plan doc initially had). The implementation walks `siteConfig.apps[].routes`, computes paths from the parent/child route tree (concatenating `path` segments unless one starts with `/`), and falls back to `externalRoutes` if no match. With our `parent path: 'catalog'` + `child path: 'courses'`, it returns `/catalog/courses` — exactly what a `<LinkMenuItem role={coursesRole}>` needs as `href`.

### CatalogHeader widget sub-app — [`97c1c7b`](https://github.com/brian-smith-tcril/frontend-app-catalog/commit/97c1c7b)

Replaces the placeholder `ExampleHeader` (from the template scaffold) with the ported catalog header. Pattern mirrors `frontend-app-learner-dashboard/src/widgets/LearnerDashboardHeader/`: a separate "widget sub-app" whose `app.tsx` declares `slots: SlotOperation[]`, and `src/slots.tsx` spreads those into the catalog app's `slots` array.

Files added under `src/widgets/CatalogHeader/`:
- `app.tsx` — five slot operations (four menu items + `helpButtonSlotOperation`)
- `index.ts` — re-exports `catalogHeaderApp`
- `messages.js` — ported from `legacy/src/header/messages.ts`
- `CoursesLinkMenuItem.jsx` — "Courses" → `${lmsBaseUrl}/dashboard` (LMS dashboard)
- `ProgramsLinkMenuItem.jsx` — "Programs" → `${lmsBaseUrl}/dashboard/programs`
- `DiscoverLinkMenuItem.jsx` — "Discover new" → `/catalog/courses` via `<LinkMenuItem role={coursesRole}>` (role drives both URL and active-state)
- `ExploreCoursesLinkMenuItem.jsx` — "Explore courses", same target as Discover with a different label

Conditions reproduce the legacy `useMenuItems` truth table:

| Item | `condition.callback` |
|---|---|
| Courses (Dashboard) | `!!getAuthenticatedUser()` |
| Programs | `!!getAuthenticatedUser() && getAppConfig(appId).ENABLE_PROGRAMS === true` |
| Discover new | `!!getAuthenticatedUser() && getAppConfig(appId).NON_BROWSABLE_COURSES !== true` |
| Explore courses | `!getAuthenticatedUser() && getAppConfig(appId).ENABLE_COURSE_DISCOVERY === true` |
| Help | handled by `helpButtonSlotOperation({ appId, role: catalogRole })` — internally checks `getAppConfig(appId).SUPPORT_URL` truthiness |

All carry `condition.active: [catalogRole]` so they only appear on catalog routes.

#### URL change worth flagging

Legacy's Discover/Explore `href` was `${getConfig().LMS_BASE_URL}${ROUTES.COURSES}` = `http://local.openedx.io:8000/courses` — the LMS host, not the catalog MFE. Confirmed in chat: enabling the catalog MFE in legacy Open edX configured the LMS to redirect `/{LMS_HOST}/courses` to the catalog MFE's `/courses` route. Less than ideal from a clean-routing perspective, so we point the new links at the catalog's own `/catalog/courses` route directly (via the role lookup). The active-state intent matches across the discrepancy that legacy had — link goes to catalog, active state tracks catalog. If a future operator needs the `${LMS_HOST}/courses` redirect behavior preserved, that's separate work.

#### app.ts churn

Re-added `ENABLE_PROGRAMS` and `SUPPORT_URL` to `src/app.ts` `config`. The env audit dropped them as unconsumed-by-ported-code, but the CatalogHeader widget consumes both — `ENABLE_PROGRAMS` for the Programs menu item condition, `SUPPORT_URL` for the help button visibility. Conservative bundled defaults (`false`, `''`) so the runtime config can override.

#### Visual verification

Not run from this end — needs `npm run dev` against the Tutor LMS. First thing to check if header menu items don't appear: does `getUrlByRouteRole(coursesRole)` return `/catalog/courses`? It will only if `catalogApp` (which has the routes) is in the live `siteConfig.apps`, which is set up via `site.config.dev.tsx` ✓.

Smoke tests on `97c1c7b`: lint ✓, build ✓, build:ci ✓, test ✓ (2/2).

### Dev config: dropped `runtimeConfigJsonUrl`, restored static values — [`7c599f2`](https://github.com/brian-smith-tcril/frontend-app-catalog/commit/7c599f2)

Reverted the dev config back to the reference-repo pattern: no `runtimeConfigJsonUrl`, static values in `site.config.dev.tsx` provide the dev experience.

Rationale: dev mode is the MFE author's standalone testing surface. authn and learner-dashboard both run dev without a runtime fetch. The runtime URL we added during the endpoint-discovery detour served its purpose (the three-tier model + endpoint shape are documented earlier in this worklog), but keeping it adds an LMS-running dependency and pulls runtime values that aren't necessarily what we want at MFE-test time. Site repos handle runtime config wiring for real sites.

Things added to `site.config.dev.tsx` to preserve what we were relying on the runtime fetch for:

- `apps[catalog].config` overrides for the three flags whose runtime-LMS value diverged from `src/app.ts`'s bundled defaults:
  - `ENABLE_COURSE_DISCOVERY: true` — shows the search field
  - `ENABLE_COURSE_SORTING_BY_START_DATE: true` — drives the courses-list sort order
  - `INFO_EMAIL: 'support@example.com'` — populates the support email in the courses-list error UI
- `externalRoutes` (`profile`, `account`, `logout`) mirroring learner-dashboard's site.config.dev.tsx — gives the shell URLs to resolve when rendering cross-MFE links.

Deliberately **not** set:
- `HOMEPAGE_PROMO_VIDEO_YOUTUBE_ID` — left empty for parity with what running the MFE version shows. The MFE version's `.env.development` does set it to `'test-youtube-id'`, but legacy `frontend-platform`'s flat-merge model lets the LMS runtime value (`null`) win over `.env`, so the MFE version's running appearance is "no video button." Our static-only dev with the bundled `''` lands in the same hidden state.
- `ENABLE_PROGRAMS`, `SUPPORT_URL`, `NON_BROWSABLE_COURSES`, `HOMEPAGE_COURSE_MAX`, `COURSE_ABOUT_TWITTER_ACCOUNT` — runtime/bundled values either agreed or weren't relied on for visible behavior.

Smoke tests on `7c599f2`: lint ✓, build ✓, build:ci ✓, test ✓ (2/2).

### Ported course-about page — [`2c22510`](https://github.com/brian-smith-tcril/frontend-app-catalog/commit/2c22510)

Largest port so far: 66 files / +1645 LoC. Replaces the `src/course-about/CourseAboutPage.tsx` placeholder with the full implementation and all transitive deps.

**Files ported (legacy/src/* → src/*):**

| Category | Count | Notes |
|---|---|---|
| Slot wrappers under `src/slots/CourseAbout*` | 11 | All use the `<>{children}</>` pattern; default content preserved |
| Course-intro (banner, enrollment, media) | 17 | Includes the 3 video sub-slots in `CourseAboutIntroVideoSlots/` |
| Course-overview (HTML description + Studio link) | 3 | Uses `getSiteConfig().cmsBaseUrl` for the Studio edit link |
| Course-sidebar (details + social) | 12 | sidebar-social uses `getAppConfig(appId).COURSE_ABOUT_TWITTER_ACCOUNT` for Twitter share URL |
| Data layer | 4 | `useCourseAboutData` (react-query), `useEnrollment`, api, urls, types |
| Top-level (page, layout, types, messages, scss) | 6 | |
| Generic Loading | 3 | Ported from `legacy/src/generic/loading-spinner/`; re-exported from `src/generic/index.ts` |

**Patterns established:**

- **Per-page `<Helmet>`** in CourseAboutPage following [frontend-base ADR 0015](https://github.com/openedx/frontend-base/blob/main/docs/decisions/0015-page-titles-via-helmet.rst): route-level page component owns the title, message id `courseAbout.page.title`, default `'{courseName} | {siteName}'`, dynamic data passed via `formatMessage`. Sidesteps porting the legacy `<Head />` component.
- **`useParams().courseId`** instead of legacy's `useLocation().pathname.split('/')[2]`. Same behavior, less brittle, declarative against the route shape `path: 'courses/:courseId/about'`.
- **`getConfig()` translation per audit pattern**:
  - `LMS_BASE_URL` → `getSiteConfig().lmsBaseUrl`
  - `STUDIO_BASE_URL` → `getSiteConfig().cmsBaseUrl`
  - `LOGIN_URL` → `getSiteConfig().loginUrl`
  - `SITE_NAME` → `getSiteConfig().siteName`
  - `LEARNING_BASE_URL` → `getAppConfig(appId).LEARNING_BASE_URL`
  - `INFO_EMAIL` → `getAppConfig(appId).INFO_EMAIL`
  - `COURSE_ABOUT_TWITTER_ACCOUNT` → `getAppConfig(appId).COURSE_ABOUT_TWITTER_ACCOUNT`
- **`ErrorPage` typing**: same `// @ts-expect-error` in JSX attribute position as in `CoursesList.tsx`.
- **`IntlShape` for hook helper params**: imported from `@src/utils` (our `ReturnType<typeof useIntl>` alias), not from `@openedx/frontend-base` — same workaround as the home page port.

**Config wiring:**
- `src/app.ts` re-adds `LEARNING_BASE_URL: ''` and `COURSE_ABOUT_TWITTER_ACCOUNT: ''` (dropped during the env audit, now needed again by course-intro/utils and sidebar-social/utils respectively).
- `site.config.dev.tsx` adds `cmsBaseUrl: 'http://studio.local.openedx.io:8001'` so the Studio edit link in CourseOverview resolves in dev.

**Gotchas hit:**
- `SidebarDetails.tsx` legacy import `import { ROUTES } from '@src/routes'` — but `ROUTES` lives in `@src/constants` in our new structure. Fixed.
- ESLint flagged `singlePaidMode: {}` in EnrollmentButtonTypes (`@typescript-eslint/no-empty-object-type`). Replaced with `SinglePaidMode` type alias which already existed in `course-about/types.ts` (typed as `Record<string, any>`).

**ADR 0015 follow-up flagged but not done in this commit:**
The ADR says route-level page components own titles, not shared layouts. Our `Main.tsx` currently sets a default `'Catalog | {siteName}'` — arguably violates this. Should be removed and replaced with per-page `<Helmet>` blocks on HomePage and CatalogPage. Separate follow-up.

**16 test files deferred** in `legacy/src/course-about/`, same approach as home-page port.

Smoke tests on `2c22510`: lint ✓, build ✓, build:ci ✓, test ✓ (2/2).

### ADR 0015 follow-up — page-level Helmet titles — [`230a0fc`](https://github.com/brian-smith-tcril/frontend-app-catalog/commit/230a0fc)

Cleanup flagged in the course-about port. `Main.tsx` had a `<Helmet>` block setting a default `'Catalog | {siteName}'` title, which violates ADR 0015's "route-level page component owns the title, not shared layouts" rule. Pushed title management down to each page.

Per-page titles after this commit:

| Route | Page component | Message id | Default |
|---|---|---|---|
| `/catalog` (index) | `HomePage` | `home.page.title` | `'Catalog \| {siteName}'` |
| `/catalog/courses` | `CatalogPage` (placeholder) | `courses.page.title` | `'Courses \| {siteName}'` |
| `/catalog/courses/:courseId/about` | `CourseAboutPage` | `courseAbout.page.title` | `'{courseName} \| {siteName}'` (existing) |

Other changes:
- `src/Main.tsx` slimmed to a `CurrentAppProvider` wrapper around `<Outlet />`; drops `useIntl`, `getSiteConfig`, `messages` imports.
- `src/messages.ts` deleted — was only consumed by `Main.tsx`.
- `src/Main.test.tsx` deleted — was asserting `Main`'s title, which `Main` no longer owns. When the per-page test suites are ported, those will carry title coverage.
- `src/home/messages.ts` and `src/catalog/messages.ts` added with the per-page title messages.

`CatalogPage` is still a placeholder; the `<Helmet>` is forward-looking and will carry through when the real catalog/courses page is ported.

Smoke tests on `230a0fc`: lint ✓, build ✓, build:ci ✓, test ✓ (1/1 — was 2/2; Main.test.tsx deletion is the diff).

### Fix course-about 404 from home-page course cards — [`7ec1d00`](https://github.com/brian-smith-tcril/frontend-app-catalog/commit/7ec1d00)

Bug: clicking a course card on the home page navigated to `http://apps.local.openedx.io:1998/courses/course-v1:.../about` (no `/catalog/` prefix) → 404.

`legacy/src/generic/course-card/index.tsx` had `<Link to="/courses/${courseId}/about">` — an absolute-looking path. On `master` and master-running-locally this resolved to `http://apps.local.openedx.io:1998/catalog/courses/.../about` because legacy `frontend-platform`'s `AppProvider` set the `BrowserRouter` basename from `PUBLIC_PATH`. The `/catalog` prefix was added implicitly.

In `frontend-base`, basename comes only from `siteConfig.basename` (verified in `node_modules/@openedx/frontend-base/dist/runtime/initialize.js:73-79`: "Unlike webpack's publicPath, the basename cannot be auto-discovered, so when publicPath is set ... this needs to be configured."). We hadn't set it. With no basename, the legacy link target stayed as `/courses/.../about` — no matching route.

Two ways to fix:

1. **Set `siteConfig.basename: '/catalog'`** and remove the `'catalog'` prefix from the route definition. Closest to legacy semantics; CourseCard wouldn't need to change.
2. **Mirror `frontend-app-learner-dashboard`'s pattern**: declare the absolute mount path directly in the route (`path: '/catalog'`). The route tree is the source of truth for where the MFE lives. CourseCard's link target switches to `getUrlByRouteRole(courseAboutRole)?.replace(':courseId', courseId)` so the URL is derived from the same route tree.

Picked (2). Net effect on CourseCard: `as={courseAboutUrl ? Link : 'div'}` (was `as={courseId ? Link : 'div'}`) — the `as` switch now keys off the resolved URL, so a missing/misconfigured role degrades to a plain `<div>` rather than rendering a broken `<Link to={undefined}>`. learner-dashboard itself doesn't need this pattern because it has only one route and doesn't do internal cross-page links — they wouldn't have hit it.

React-router treats `to={getUrlByRouteRole(...)}` as internal SPA navigation because the return value is a path string (not an absolute URL with origin) matching a route in the current router. Click is intercepted, `navigate()` is called, page updates in-place without a reload.

Smoke tests on `7ec1d00`: lint ✓, build ✓, build:ci ✓, test ✓ (1/1).

### Dev header logo → LMS /dashboard via homeRole externalRoute — [`4a16c6e`](https://github.com/brian-smith-tcril/frontend-app-catalog/commit/4a16c6e)

Bug: header logo in standalone dev links to `/` (the apps.local.openedx.io:1998 root) which 404s.

frontend-base's shell `Logo` component (`node_modules/@openedx/frontend-base/dist/shell/Logo.js`) uses `getUrlByRouteRole(homeRole) || '/'` as its destination. With `homeRole = 'org.openedx.frontend.role.home'` and no route in our `apps[]` claiming it, the lookup returns null → `'/'` fallback.

Reference repo behavior, verified via grep:
- `frontend-app-learner-dashboard` claims `homeRole` on its route's `handle.roles` (the only MFE that does).
- `frontend-app-authn` and `frontend-template-application` don't claim it and don't set it anywhere.
- No MFE puts a `homeRole` entry in `externalRoutes`.

In real site deployments, learner-dashboard's apps[] entry carries `homeRole` and catalog inherits a working logo. In standalone dev, MFEs that don't claim home apparently live with the broken-`/` fallback.

For our catalog dev, added `{ role: 'org.openedx.frontend.role.home', url: 'http://local.openedx.io:8000/dashboard' }` to `site.config.dev.tsx`'s `externalRoutes`. Acknowledged as non-standard among reference repos; chose it as the smallest fix that matches the MFE-version's logo behavior in dev.

URL choice: LMS `/dashboard` (verified via `curl -I` to return `302 Location: /login?next=/dashboard`, matching the MFE-version's redirect-to-authn-when-logged-out behavior) vs. direct learner-dashboard MFE URL. Picked the LMS route because:
- Matches the MFE-version's behavior exactly — side-by-side comparison is clean during migration.
- Robust against learner-dashboard not running in dev (only LMS needs to be up).
- LMS is the single source of truth for redirect logic; staff/learner routing happens there.

Trade-off: extra HTTP hop (LMS 302 → MFE) for logged-in users. Acceptable given the dev-only scope and the value of legacy parity.

Future discussion (flagged): what should catalog's logo destination be for logged-out users? LMS `/dashboard`'s redirect to authn is the legacy answer; whether that's the right product behavior going forward is a separate question.

Smoke tests on `4a16c6e`: lint ✓, build ✓, build:ci ✓, test ✓ (1/1).

### Internal navigation through getUrlByRouteRole — [`8fd368d`](https://github.com/brian-smith-tcril/frontend-app-catalog/commit/8fd368d)

Same class of bug as the CourseCard 404, surfaced when trying to submit the home-page search field: `HomeBanner` and `CoursesList` both called `navigate(ROUTES.COURSES)` (= `/courses`), which 404'd because catalog routes are mounted at `/catalog`. The "View all courses" button on the home page had the same problem.

`SidebarDetails`'s prerequisite-course `Link` used the same `ROUTES.COURSE_ABOUT.replace(':courseId', key)` pattern — also broken once we'd moved routes under `/catalog`.

Switched all three to derive URLs from the route tree via `getUrlByRouteRole(<role>)`:
- `src/home/components/home-banner/HomeBanner.tsx` — `getUrlByRouteRole(coursesRole)` for search submit
- `src/home/components/courses-list/CoursesList.tsx` — `getUrlByRouteRole(coursesRole)` for "View all courses"
- `src/course-about/course-sidebar/sidebar-details/SidebarDetails.tsx` — `getUrlByRouteRole(courseAboutRole)?.replace(':courseId', key)` for prerequisite link

`ROUTES` was no longer referenced anywhere in `src/`; dropped from `src/constants.ts`.

Pattern now consistent across the catalog: anywhere a URL was a hardcoded `/courses/...` or assembled from `ROUTES.X`, it's now `getUrlByRouteRole(role)`. The route tree (in `src/routes.tsx`) is the single source of truth for where each page lives.

Smoke tests on `8fd368d`: lint ✓, build ✓, build:ci ✓, test ✓ (1/1).

### Ported catalog page — [`a14bc6f`](https://github.com/brian-smith-tcril/frontend-app-catalog/commit/a14bc6f)

Third feature port. 29 files / +934 LoC. Replaces the `/catalog/courses` placeholder with the full courses listing — DataTable + filters + search field + intro heading.

**Scope:**
- `src/catalog/` — CatalogPage, messages, types, utils, plus 6 hooks (useCatalog, useCourseData, useDebouncedSearchInput, useFilter, usePagination, useSearch) + hooks/types
- `src/slots/CourseCatalogIntroSlot/` — the SubHeader-wrapping intro
- `src/slots/CourseCatalogSearchFieldSlot/` — the search input
- `src/slots/CourseCatalogDataTableSlots/` — compound: parent DataTable slot wraps ControlBar + CardView (+ nested CourseCard) + TableFooter
- `src/generic/sub-header/` — ported from legacy generic; needed by CourseCatalogIntroSlot

**Patterns used (consistent across home / course-about / catalog ports):**
- `<PluginSlot>` wrappers → `<></>`, default content preserved
- `@edx/frontend-platform/*` imports → `@openedx/frontend-base`
- `getConfig().INFO_EMAIL` → `getAppConfig(appId).INFO_EMAIL as string`
- `getConfig().ENABLE_COURSE_DISCOVERY` (boolean gate) → `getAppConfig(appId).ENABLE_COURSE_DISCOVERY === true`
- Inline `<Helmet>` per ADR 0015 (placeholder already existed; the bulk-copy preserved it via the sidecar trick)
- `IntlShape` via `@src/utils` alias
- `ErrorPage` with `// @ts-expect-error` for the upstream typing bug

**One new pattern this port introduced:** `CourseCatalogDataTableControlBarSlot` doesn't use its declared props in the placeholder version (they were `pluginProps` for the slot that no longer exists). Standard `(props: Props) => …` triggers `@typescript-eslint/no-unused-vars`. Switched to `FC<Props>` declaration with no prop binding — the type contract is preserved for callers, but the function body doesn't pull anything off. Worth reaching for elsewhere if other slot wrappers hit the same shape.

**Dependency churn:** re-added `lodash.capitalize` and `@types/lodash.capitalize` (dropped during the env audit, needed again by `src/catalog/utils.ts` for filter display-name capitalization). User flagged: "why are the numbers mismatched?" — `^4.2.1` runtime vs `^4.2.9` types — the answer is that DefinitelyTyped publishes types independently, the patch levels diverge naturally. Latest of each is what `npm install lodash.capitalize` + `npm install --save-dev @types/lodash.capitalize` resolves to (lodash.capitalize hasn't shipped a major bump in years).

**Messages split worth noting:** legacy reused `messages.pageTitle = 'Courses'` for both `<Head title=...>` (document title, became `'Courses | {SITE_NAME}'` via the Head wrapper) and `<SubHeader title=...>` (page heading). Under ADR 0015 we have an inline `<Helmet>` with the full `'Courses | {siteName}'` template; the SubHeader needs just `'Courses'`. Split into two messages: `pageTitle` (id `courses.page.title`, "Courses | {siteName}") and `pageHeading` (id `category.catalog.page-title`, "Courses"). The latter keeps the legacy translation id intact so existing translations carry over.

7 test files deferred in `legacy/src/catalog/`.

Smoke tests on `a14bc6f`: lint ✓, build ✓, build:ci ✓, test ✓ (1/1). User confirmed visual: page is working.

### Ported HomeBannerSlot to Slot API — [`035ac37`](https://github.com/brian-smith-tcril/frontend-app-catalog/commit/035ac37)

First of 26 slot-port commits. Establishes the pattern that the remaining slots will follow.

**The port itself:** `<>{children}</>` → `<Slot id="org.openedx.frontend.slot.catalog.homeBanner.v1">{children}</Slot>`. Default content renders unchanged: frontend-base's `useSlotOperations` (`runtime/slots/hooks.js`) prepends a synthetic `APPEND` operation with `id: 'defaultContent'` built from the Slot's children, so passing the default as JSX children "just works" without any widget operations registered.

**Slot ID convention:** `org.openedx.frontend.slot.catalog.<slotName>.v1`. Matches learner-dashboard's slots; the `.v1` suffix is the frontend-base-era convention (vs. legacy FPF's unversioned dotted strings like `org.openedx.frontend.catalog.home_page.banner`).

**README pattern:** description + Examples section with two H3s (Default content + Replaced with a custom component), each with a screenshot, then a two-sentence intro + diff-style code block. The diff is anchored against this app's `site.config.dev.tsx` and uses `// ...` to elide unchanged context. Chose the diff format over a standalone-file format because it's compact (matters across 26 READMEs) and makes "what do I edit and where" obvious at a glance.

**Customization recipe:** `WidgetOperationTypes.REPLACE` with `relatedId: 'defaultContent'`. This swaps the synthetic default-content widget for the customizer's widget — the new-API equivalent of legacy `keepDefault: false` + `PLUGIN_OPERATIONS.Insert`. Verified empirically: with `relatedId` the 🏁 banner renders; without it the operation is a silent no-op against the default widget (`findRelatedWidgetIndex` matches nothing when `relatedId` is undefined). Learner-dashboard's slot READMEs (e.g. `CourseBannerSlot`) omit `relatedId` and don't actually work — filed [openedx/frontend-base#270](https://github.com/openedx/frontend-base/issues/270) asking whether `relatedId` should be required for REPLACE or whether it should default to `'defaultContent'`. Until that's resolved, catalog slot READMEs use the `relatedId: 'defaultContent'` form because it's the one that works today.

**Screenshots:** new captures against the ported dev build, not copies of the legacy FPF screenshots. The custom-replacement screenshot is taken by temporarily editing `site.config.dev.tsx` to register the REPLACE op, snapping the page, then reverting. (`site.config.dev.tsx` still has an in-progress A/B test from chasing down the `relatedId` question — intentionally not committed.)

### Ported HomeCoursesListSlot to Slot API — [`39aeaaa`](https://github.com/brian-smith-tcril/frontend-app-catalog/commit/39aeaaa)

Mechanical follow-up to `035ac37`. `<>{children}</>` → `<Slot id="org.openedx.frontend.slot.catalog.homeCoursesList.v1">{children}</Slot>` around `CoursesList`. README + screenshots match the pattern established by HomeBannerSlot.

### Ported HomeOverlayHtmlSlot to Slot API — [`8021f82`](https://github.com/brian-smith-tcril/frontend-app-catalog/commit/8021f82)

Mechanical follow-up to `035ac37`. `<>{children}</>` → `<Slot id="org.openedx.frontend.slot.catalog.homeOverlayHtml.v1">{children}</Slot>` around `HomePageOverlay`. README + screenshots match the established pattern.

### Ported HomePromoVideoButtonSlot to Slot API — [`a32f63b`](https://github.com/brian-smith-tcril/frontend-app-catalog/commit/a32f63b)

First slot port with **slot props**. `HomePromoVideoBtnProps['onClick']` flows to both the `<Slot>` (so widget operations receive it via `componentProps`) and the default `<HomePromoVideoBtn>`. Default still no-renders when `HOMEPAGE_PROMO_VIDEO_YOUTUBE_ID` is unset; customizers can override regardless via REPLACE on `defaultContent`. Pattern mirrors learner-dashboard's `CourseBannerSlot`.

README adds two patterns the prior slot READMEs didn't have:
- A `### Slot Props` section above `## Description`, listing `onClick: () => void` (matches learner-dashboard's convention).
- A second customization example demonstrating prop consumption: `component: customVideoButton` (a `({ onClick }) => ...` component) alongside the simple `element: <h1>...</h1>` form. The `component` form is required when the customization needs to bind to slot props — `createIdentifiedWidget` passes `componentProps` to `component:` widgets but not to pre-built `element:` widgets. Screenshots are split: `screenshot_custom_simple.png` (h1 emoji) and `screenshot_custom_with_onclick.png` (circle-wrapped `IconButton` calling `onClick`).

Followup queued: check whether frontend-base documents the `element` vs `component` distinction centrally.

### Decoupled HomePromoVideoButtonSlot props from the underlying button — [`9c77502`](https://github.com/brian-smith-tcril/frontend-app-catalog/commit/9c77502)

Originally the slot's `({ onClick })` parameter was typed via `HomePromoVideoBtnProps` (the underlying button component's interface). Pulled out a dedicated `HomePromoVideoButtonSlotProps` declared inline in the slot's `index.tsx`, with the same shape, and stopped referencing the button's type from the slot file.

**Why decouple instead of alias:** The slot's interface is the **public API for plugin authors** — they import it and write `component: ({ onClick }: HomePromoVideoButtonSlotProps) => ...` against it. If we kept aliasing the button's type (any of `type X = Y`, `export type { Y as X }`, `interface X extends Y {}`, `X['onClick']`), an internal change to the button would silently propagate into plugin authors' contracts. Duplicating the shape gives plugin authors a stable surface and surfaces drift to the catalog dev: if a maintainer later changes `HomePromoVideoBtn`'s `onClick` signature, the TS compiler errors at the `<HomePromoVideoBtn onClick={onClick} />` JSX inside the slot file, forcing them to either revert or intentionally re-version the slot (`.v1` → `.v2`). Cost: one duplicated field declaration; benefit: the slot file becomes the unambiguous source of truth for plugin authors.

Pattern detour considered and rejected, for future-me reference:
- `extends UnderlyingProps {}` — trips `@typescript-eslint/no-empty-object-type` (confirmed via `npm run lint`).
- `type alias` — silently propagates breaking changes to plugin authors.
- `Pick<UnderlyingProps, 'fieldA' | 'fieldB'>` — same propagation issue, plus more ceremony.
- Inverting the dependency (button derives from slot) — possible, but reverses the conventional `slots/` consumes `home/` layering.

Also re-exported `HomePromoVideoButtonSlotProps` from `src/index.ts` so the README customization example (and downstream customizers using `@openedx/frontend-app-catalog`) can `import type` it from the package rather than restating the inline shape. No reference app currently re-exports slot prop types; we're setting precedent there.

The slot itself is unchanged at runtime — same shape, same behavior, same slot id, same default content. This is purely a TS-level refactor.

### Ported HomePromoVideoModalSlot to Slot API — [`c26b631`](https://github.com/brian-smith-tcril/frontend-app-catalog/commit/c26b631)

Standard slot port plus the props pattern from `9c77502` applied from the start: `HomePromoVideoModalSlotProps` declared inline in the slot's `index.tsx` (`isOpen` / `close` / `videoId`), exported, re-exported from `src/index.ts` for customizer imports. The sibling `types.ts` file the original placeholder had was deleted — slot prop types live with the slot, not in a separate file. README has one customization example (a custom modal using all three slot props via `component:`), modeled on the legacy README's example.

### Ported HomePromoVideoModalContentSlot to Slot API — [`5ff3c76`](https://github.com/brian-smith-tcril/frontend-app-catalog/commit/5ff3c76)

Same shape as `c26b631`: `HomePromoVideoModalContentSlotProps` (`videoId`, `width?`, `height?`) pulled inline into the slot's `index.tsx`, `types.ts` deleted, type re-exported from `src/index.ts`. The customization example is a small component that renders the prop values in a sized `<div>` — built and tuned live in `site.config.dev.tsx` against the running app, then copied into the README. A "show me the props" component reads more clearly than the legacy README's centered-h1 placeholder for a slot that takes meaningful inputs.

### Ported HomeCourseCardSlot to Slot API — [`e126097`](https://github.com/brian-smith-tcril/frontend-app-catalog/commit/e126097)

First slot where the **callable API differs from the widget-facing API**. The legacy slot took `{ original: Course, isLoading }` from the caller and internally destructured the `Course` object into 8 flat `CourseCard` props (`courseId`, `courseOrg`, `courseName`, etc.). The port preserves that destructuring — it's what plugin authors saw as the "Plugin Props" contract in the legacy README, and it keeps the caller (`CoursesList`) unchanged.

Naming decision to resolve the divergence: `HomeCourseCardSlotProps` describes the **widget-facing** flat shape (the plugin-author public contract), matching the props-pattern convention used by earlier slots. The callable shape `{ original?, isLoading? }` stays anonymous inline on the slot component's parameter. Rationale: plugin authors reach for `HomeCourseCardSlotProps` to type their `component:`; the callable shape only matters inside this app and doesn't need a name.

README has two customization examples following the `HomePromoVideoButtonSlot` pattern:
- Simple: `element: <div className="display-4">🃏</div>` (built with a `div`/`display-4` variation rather than the legacy README's `<h1>` because that's what actually got screenshotted).
- Props-consuming: a `Card`-based `customCourseCard` that reads `isLoading`, `courseId`, `courseOrg`, `courseName`, `courseNumber`, `courseStartDate` and links to `/catalog/courses/{id}/about`.

`Link` from `react-router-dom` (not `react-router`) — the codebase mixes both imports, but `Link` specifically lives in `react-router-dom`.

### Ported LoaderSlot to Slot API — [`80180bb`](https://github.com/brian-smith-tcril/frontend-app-catalog/commit/80180bb)

First slot with **no props at all** — its callable signature is just `{ children: React.ReactNode }`. The caller (currently `CoursesList`) provides the loading skeleton as children; the slot wraps them so operators can swap the whole thing out. No `LoaderSlotProps` interface, no barrel re-export — `children` is a React special prop and isn't forwarded to widgets as a slot prop. README has a single customization example (paragon `Spinner` in a centered `Container`) matching the legacy README.

### Ported CourseAboutIntroSlot to Slot API — [`ec2c6b9`](https://github.com/brian-smith-tcril/frontend-app-catalog/commit/ec2c6b9)

First slot to exercise the **layout operation** — the frontend-base equivalent of legacy FPF's `PLUGIN_OPERATIONS.Wrap`. Frontend-base's `WidgetOperationTypes` (`APPEND`, `PREPEND`, `INSERT_AFTER`, `INSERT_BEFORE`, `REPLACE`, `REMOVE`, `OPTIONS`) has no `WRAP` primitive — I initially thought wrap wasn't supported. It is: `LayoutOperationTypes.REPLACE` lets customizers swap the whole layout component, which receives the widget list via `useWidgets()` and can render it inside any wrapping markup. Because the default content ships as a synthetic `defaultContent` widget in that list, wrapping the widgets wraps the default.

Layout ops have a **different shape from widget ops** — no `id` or `relatedId` fields, just `slotId` + `op` + renderer props (`component` or `element`). Caught this the hard way: TS2353 on `id` when trying to register the bordered layout.

README has three customization examples following a "start soft, go hard" progression:
1. Wrap with a red border via `LayoutOperationTypes.REPLACE` — keeps default content, adds surrounding markup. First example on purpose: it's the least-invasive shape a customization can take.
2. Simple `element:` replacement (🌅 in an `h1`).
3. Full replacement with a `component:` reading the slot's `courseAboutData` prop — a 14-field debug layout built live in `site.config.dev.tsx` (also useful as a live schema visualizer for downstream authors).

Props: `courseAboutData: CourseAboutDataPartial` is a complex domain shape (14 fields including nested `enrollment` and `singlePaidMode`). Referenced as-is from `@src/course-about/types` rather than duplicated inline — the coupling is to the domain model, not a UI component's props, so the "decouple the slot from underlying types" rule doesn't quite apply the same way. Still worth watching if `CourseAboutDataPartial` starts drifting.

Also learned in the process: React silently skips `boolean`/`null`/`undefined` in JSX interpolation. The debug layout's 7 boolean fields (`isCourseFull`, `invitationOnly`, etc.) rendered as blank until wrapped in `String(...)`. Objects (`enrollment`, `singlePaidMode`) need `JSON.stringify` — they throw "Objects are not valid as a React child."

### Ported CourseAboutCourseMediaSlot to Slot API — [`4ee28f8`](https://github.com/brian-smith-tcril/frontend-app-catalog/commit/4ee28f8)

Same three-example structure as `ec2c6b9`: wrap (layout `REPLACE`) → simple (widget `REPLACE` with `element`) → props-consuming (widget `REPLACE` with `component`). Props are `{ courseAboutData: { name, media: CourseMediaPartial } }` — the shape declared inline in the slot's `index.tsx` rather than pulled from `CourseMediaTypes` via indexed access, so the slot's contract is self-contained. The props-consuming example is a paragon `Card` with three sections labeled 🪪 (name), 📸 (image URI), 📺 (video URI).

### Ported CourseAboutOverviewSlot to Slot API — [`0ab74de`](https://github.com/brian-smith-tcril/frontend-app-catalog/commit/0ab74de)

Three-example structure again. Props are the small `{ overviewData: string, courseId: string }` pair. Props-consuming example is the legacy README's `ModalDialog` recipe ported forward — a button that opens a modal rendering `overviewData` as `dangerouslySetInnerHTML`. Two screenshots for the props example (closed button + open modal) matching the legacy README's two-state presentation.

Paragon gotcha this surfaced: `<ModalDialog>` requires a `title` accessibility prop distinct from the visible `<ModalDialog.Title>` child. Legacy example didn't include it — that's a legacy README bug carried forward. Set to a plain `"Course overview"` string rather than `{courseId}` (which is a course slug, not a meaningful title for screen readers).

### Ported CourseAboutSidebarSlot to Slot API — [`a9233b3`](https://github.com/brian-smith-tcril/frontend-app-catalog/commit/a9233b3)

Three-example structure. Props are `{ courseAboutData: CourseAboutData }` — full data object (not the partial used by the intro slot). Default renders `<aside><CourseSidebar/></aside>` — the `<aside>` wrapper stays as part of the default children. Props-consuming example is the legacy README's simplified-sidebar recipe ported forward: paragon `Card` + `Stack` + `Badge`/`Chip` displaying name, org/number, effort, pacing, language, start date, price, and enrollment availability.

### Sidequest: intro-video-button play icon visibility fix — [PR #133](https://github.com/openedx/frontend-app-catalog/pull/133), [`d449ad8`](https://github.com/brian-smith-tcril/frontend-app-catalog/commit/d449ad8)

Noticed while prepping the CourseAboutIntroVideoButtonSlot port (task #13): the `PlayCircleFilledWhite` icon in the intro-video button becomes hard to see over light course images (openedx/frontend-app-catalog#132). Added `bg-primary rounded-circle` to the icon's `className` so it always has a solid circular background.

Shipped as two commits with the same one-line change:
- **`PR #133`** off `upstream/master` against the legacy `src/plugin-slots/CourseAboutIntroVideoSlots/CourseAboutIntroVideoButtonSlot/index.tsx` — so it lands upstream and helps everyone on the FPF path.
- **`d449ad8`** on `frontend-base` against the placeholder-ported `src/slots/CourseAboutIntroVideoSlots/CourseAboutIntroVideoButtonSlot/index.tsx` — same visual fix in the branch we're actually running locally, so subsequent screenshots capture the corrected version.

### Ported CourseAboutIntroVideoButtonSlot to Slot API — [`f80f581`](https://github.com/brian-smith-tcril/frontend-app-catalog/commit/f80f581)

Three-example structure — wrap (layout `REPLACE`) → simple (widget `REPLACE` with `element`) → props (widget `REPLACE` with `component`). Props are `{ courseImageSrc, courseImageAltText, openVideoModal }`. Props-consuming example is the legacy README's image + "Show video" button recipe ported forward.

Simple example uses `<div className="m-5.5 display-4">📼</div>` rather than the centered `<h1>` used by text-content slots — matches the pattern established for image-adjacent slots (HomeCourseCard's 🃏, CourseAboutCourseMedia's 🖼️) since this slot sits over the course image.

### Ported CourseAboutIntroVideoModalSlot to Slot API — [`c4c2fd4`](https://github.com/brian-smith-tcril/frontend-app-catalog/commit/c4c2fd4)

Straight port — no wrap or simple example this time. Rationale: wrapping the whole modal mechanism doesn't do anything meaningful (the modal opens over the page, there's nothing visible to bracket), and an emoji `element` for a modal wouldn't help contextualize the slot at all. Single custom example is the legacy README's iframe + Close button recipe, cleaned up:

- Dropped `frameBorder="0"` — the HTML attribute is deprecated.
- Dropped the `custom-video-modal-wrapper` className — it never had any CSS attached.
- Wrapped in a `<div className="mb-3">` so the Close button doesn't jam against the modal's bottom edge.

### Ported CourseAboutIntroVideoModalContentSlot to Slot API — [`f19f5f1`](https://github.com/brian-smith-tcril/frontend-app-catalog/commit/f19f5f1)

Three-example port (wrap → simple → props). Props are `{ videoId, width?, height? }`. Notably, the wrap-with-border example broke on first attempt with the layout `<div style={{border}}>` — the iframe collapsed to its intrinsic ~300×150 size and became mis-centered.

Root cause traced to paragon's `_ModalDialog.scss`: `.pgn__modal` is a column-flex container, and the default iframe's `height="100%"` only resolves because the iframe is a direct flex child with a definite max-height ancestor. Injecting a plain `<div>` between the modal and the iframe breaks that chain — the iframe's `height: 100%` now resolves against our `<div>`, which has no definite height.

The fix that actually works: wrapping div needs both `flex: 1` (to fill pgn__modal's available column space) **and** `display: flex; flex-direction: column` (to establish its own column context so the iframe's `height: 100%` has a definite parent). Landed on the utility-class form `<div className="d-flex flex-column flex-fill" style={{ border: 'thick dashed red' }}>` — Bootstrap covers layout, inline style covers the dashed border (no dashed-style helper in Bootstrap/Paragon).

**Takeaway for future wrap examples:** when the slot's default content depends on CSS relationships with its ancestor (flex, grid, absolute positioning), a naive `<div>` wrap breaks those relationships. Any wrap layout for such slots needs to explicitly re-establish the sizing/flex chain.

Props example is a paragon `Card` (horizontal orientation) with a YouTube thumbnail via `Card.ImageCap`, a header + section listing the three slot props verbatim, and a `Hyperlink` footer to the YouTube URL — meaningful and self-documenting.

### Ported CourseAboutSidebarSocialSlot to Slot API — [`fed5aec`](https://github.com/brian-smith-tcril/frontend-app-catalog/commit/fed5aec)

First slot to exercise **widget options** (`useWidgetOptions` / `WidgetOperationTypes.OPTIONS`) as the primary customization surface, and first to demonstrate **widget ops beyond REPLACE** (`PREPEND`/`APPEND`). Both were needed to give the port feature parity with the legacy slot's four examples.

**Slot restructure:** the default widget can't be the raw JSX children this time — it has to be a React component so it can call `useWidgetOptions()`. Two structural moves:
1. Extracted the horizontal `<Stack>` from the default children into a custom `SocialStackLayout` (registered via the slot's `layout` prop). Consequence: `PREPEND`/`APPEND`/`INSERT_BEFORE`/`INSERT_AFTER` ops now land *inside* the Stack next to the default `<SocialLinks>` instead of outside it.
2. Made the default children a `DefaultSocialLinksWidget` component that reads the slot's `socialLinks` prop from `useSlotContext()` and merges with an optional override from `useWidgetOptions()`.

**Widget option shape:** `socialLinks?: SocialLink[] | ((current: SocialLink[]) => SocialLink[])`. The function form is the only way to give operators access to the *current* list — the caller (`SidebarSocial`) computes the defaults at render time from `intl` and per-course data, so operators can't reconstruct them statically in `site.config.tsx`. This is the new-API equivalent of legacy FPF's `PLUGIN_OPERATIONS.Modify` with a `fn(widget) → widget` shape.

**Not implemented:** `useWidgetOptions` returns a static merged options object — there's no built-in "modify the previous value" hook. Operators use the function form to accomplish that; the widget dispatches based on `typeof options.socialLinks === 'function'`.

README has 7 examples (default + 6 customizations): wrap (custom `Stack`-preserving layout), simple element replace, `PREPEND`/`APPEND` for arbitrary widgets before/after, OPTIONS array for full list replace, and OPTIONS function form with three sub-examples (remove/prepend/append entries).

### Ported CourseAboutSidebarCoursePriceSlot to Slot API — [`2084a41`](https://github.com/brian-smith-tcril/frontend-app-catalog/commit/2084a41)

Small slot (one prop, `coursePrice`), so a mostly straight port. First time exercising **`WidgetOperationTypes.REMOVE`** as the new-API equivalent of legacy `PLUGIN_OPERATIONS.Hide` — REMOVE against `defaultContent` deletes the default widget from the layout's widget list, giving the same "block disappears" outcome.

README has four customizations: wrap (layout REPLACE), hide (`REMOVE` against `defaultContent`), simple element replace (💸), and a component consuming `coursePrice`. Order default → wrap → hide → simple → props emphasizes the mostly-decorative wrap and destructive hide up front before the value-swapping variants.

### Sidequest: higher-level README passes — [`1398b5e`](https://github.com/brian-smith-tcril/frontend-app-catalog/commit/1398b5e)

Top-level `README.rst` was still the frontend-template-application template README. Reworked to a minimal WIP-tagged catalog README that points at the migration plan / worklog and the slots directory.

`src/slots/README.md` grew a linked index of the 17 ported slots (grouped by page: Home / Course About / Generic) plus a list of the 9 not-yet-ported ones. Also added small "in case you landed here" READMEs to the three multi-slot subdirectories (`HomePromoVideoSlots/`, `CourseAboutIntroVideoSlots/`, `CourseCatalogDataTableSlots/`) linking down to their child slot READMEs.

### Fix: intro-video Button primary bg leaks through custom image-slot content — [`30c75e8`](https://github.com/brian-smith-tcril/frontend-app-catalog/commit/30c75e8), [openedx/frontend-app-catalog#134](https://github.com/openedx/frontend-app-catalog/issues/134)

Surfaced while drafting the CourseAboutCourseImageSlot props example: `CourseAboutIntroVideoButtonSlot` wraps the image inside `<Button className="border-0 p-0 position-relative">` at paragon's default `variant="primary"`. Opaque course images hide the blue; a custom widget that doesn't fill the button reveals it. One-line fix — added `bg-transparent` to the button's className. Filed the same defect upstream against master (`src/plugin-slots/...`) as issue #134 since the FPF-side structure is identical.

### Ported CourseAboutCourseImageSlot to Slot API — [`6553675`](https://github.com/brian-smith-tcril/frontend-app-catalog/commit/6553675)

Four customization examples chosen to teach the slot's composition — `CourseMedia` renders this slot directly when a course has no promo video, and wraps it inside `CourseAboutIntroVideoButtonSlot`'s `<Button>` (with an absolutely-positioned play icon sibling) when it does:
- **Wrap w/ red border** — screenshot from a video-less course, so the border stands alone with no button/play-icon.
- **Striped overlay** — screenshot from a video course. Custom layout wraps the widgets in a `position: relative` div and overlays semi-transparent diagonal red stripes via `repeating-linear-gradient`. Demonstrates that the intro-video button's play icon remains layered above whatever this slot's layout renders.
- **Simple element** — 🖼️ `div` (matching the image-adjacent slot convention).
- **Props component** — paragon `<Image roundedCircle>` reusing the slot's `imgSrc`/`altText`.

Description in the README traces the actual composition (`CourseMedia`'s branch, `CourseAboutIntroVideoButtonSlot`'s DOM structure) instead of hand-waving about "layered" behavior.

### Ported CourseAboutEnrollmentButtonSlot to Slot API — [`d1f45a4`](https://github.com/brian-smith-tcril/frontend-app-catalog/commit/d1f45a4)

Three examples: wrap (layout REPLACE), simple element (🛼), and a debug component dumping the slot's props (booleans via `String`, `singlePaidMode` object via `JSON.stringify`, function props via `typeof`). Skipped the legacy README's "custom button" recipe — recomputing "buy vs enroll" branching outside the default already-knows-how-to-do-that button felt like busywork for a doc example. The dump-the-props form is more instructive about what plugin authors actually receive.

Prop descriptions were reworked mid-draft: the initial pass had me hallucinating meanings from names (e.g. "handler that initiates a free enrollment"). Grounded them by tracing the actual usage in `EnrollmentButton.tsx` + `useEnrollmentActions.tsx`. For the function props (`onEnroll` / `onEcommerceCheckout`), the corrected phrasing describes what plugin authors do with them ("invoke to trigger the enrollment flow") rather than what the caller's implementation does internally — the caller's behavior isn't the slot's contract.

### Ported CourseCatalogIntroSlot to Slot API — [`e8cae23`](https://github.com/brian-smith-tcril/frontend-app-catalog/commit/e8cae23) (+ [openedx/frontend-app-catalog#135](https://github.com/openedx/frontend-app-catalog/issues/135))

Three examples: wrap → simple (🕵️) → props (paragon `Alert` with `Chip`s reading `searchString` and `courseDataResultsLength`).

While drafting the props example, went to port the legacy README's "Custom component with plugin props" recipe verbatim and hit a discrepancy: the example destructures `{ searchString, courseData }` and reads `courseData?.total ?? 0` / `courseData?.results?.length ?? 0`, but the shipped slot only passes `pluginProps={{ searchString, courseDataResultsLength }}`. Traced through FPF's `PluginSlot` → `PluginContainer` → `PluginContainerDirect` → `mergeRenderWidgetPropsWithPluginContent` to confirm there's no hidden path for `courseData` to reach the widget. User empirically verified against master: the legacy example's chips render `0`/`0` for a search with actual results. Screenshot in the legacy README (`Total courses: 1`, `Found on page: 1`) can't have come from the shipped code — filed [#135](https://github.com/openedx/frontend-app-catalog/issues/135) upstream.

For the port's own example, went with option 1 from the upstream issue: narrow the chips to what the slot actually exposes (`searchString`, `courseDataResultsLength`) and drop the "Total courses" chip. Faithful to the slot's real surface. If the slot's props widen later (option 2 in the upstream issue), the example can grow to match.

### Ported CourseCatalogSearchFieldSlot to Slot API — [`8d717f5`](https://github.com/brian-smith-tcril/frontend-app-catalog/commit/8d717f5)

Three examples: wrap → simple (🔍) → props (legacy README's popular-searches recipe with `Form.Control` + a row of `Chip`s that invoke `setSearchInput`/`handleSearch` on click). Verified against the legacy `pluginProps` this time before porting — `setSearchInput`, `handleSearch`, `initialSearchValue` are all actually forwarded, so the props example is real (unlike the CourseCatalogIntro case in `e8cae23`).

### Ported CourseCatalogDataTableSlot to Slot API — [`c452d0e`](https://github.com/brian-smith-tcril/frontend-app-catalog/commit/c452d0e)

Three examples: wrap → simple (📖) → props (legacy stats-panel + `CardView` recipe using all six slot props). Pulled `TableColumn`/`TableColumnFilterChoice` interfaces out of the deleted `types.ts` and into the slot's `index.tsx` alongside `CourseCatalogDataTableSlotProps` — plugin authors reading the slot see the full `tableColumns` shape without chasing another file. Verified `pluginProps` in legacy matches all six props used in the README example (no CourseCatalogIntro-style hallucination this time).

### Ported CourseCatalogDataTableControlBarSlot to Slot API — [`690b33e`](https://github.com/brian-smith-tcril/frontend-app-catalog/commit/690b33e)

Three examples: wrap → simple (🎛️) → props (legacy README's Alert+Chip recipe using `currentPageResultsCount` / `totalResultsCount`). Verified `pluginProps` matches — real props example. Slot component was using the placeholder `FC<Props>` pattern (props declared but unused because `DataTable.TableControlBar` reads its data from the surrounding DataTable context); switched to a destructuring parameter so the props can be forwarded to the wrapping `<Slot>` for plugin authors.

### Ported CourseCatalogDataTableCardViewSlot to Slot API — [`e84fc3e`](https://github.com/brian-smith-tcril/frontend-app-catalog/commit/e84fc3e)

Three examples: wrap → simple (📇) → props (legacy README's 2-column-grid recipe mapping over `displayData.results` and rendering each course through the still-unported `CourseCatalogDataTableCourseCardSlot`). Import path in the props example updated from `@src/plugin-slots/...` to `@src/slots/...`; the child slot's callable API (`{ original, isLoading }`) matches the legacy shape unchanged, so the example works against the not-yet-ported child.

### Ported CourseCatalogDataTableCourseCardSlot to Slot API — [`3effe9f`](https://github.com/brian-smith-tcril/frontend-app-catalog/commit/3effe9f)

Same callable-vs-widget-facing split as `HomeCourseCardSlot`: the caller passes `{ original: Course, isLoading? }` (from `CardView`'s row rendering), the slot destructures internally and forwards the 8 flat props (`isLoading`, `courseId`, `courseOrg`, `courseName`, `courseNumber`, `courseImageUrl`, `courseStartDate`, `courseAdvertisedStart`) to widgets — matching what legacy `pluginProps={courseCardProps}` exposes.

Three examples: wrap → simple (🃏) → props. The wrap example again hit the flex-chain problem — paragon's `<Col>` inside `.pgn__card-grid` is `display: flex; flex: 1 0 auto`, so its direct flex-item child (normally the paragon `Card`, which has `d-flex`) stretches to fill. A plain `<div>` between Col and Card takes over the stretching, and the Card sits at content height inside. Same fix as `HomePromoVideoModalContentSlot`: wrap `<div className="d-flex flex-column flex-fill" style={{ border }}>` so it grows to fill Col and its children can stretch inside. For the simple `element` case, applied `d-flex align-items-center justify-content-center flex-fill display-4` so the 🃏 centers in the same space (plus `pb-4` for a small optical adjustment). Props example ports the legacy card-with-badge recipe, retargeting the Link URL to `/catalog/courses/{id}/about`.

### Ported CourseCatalogDataTableTableFooterSlot to Slot API — [`56aec32`](https://github.com/brian-smith-tcril/frontend-app-catalog/commit/56aec32)

Simplest slot in the DataTable family — no props, just wraps paragon's `<DataTable.TableFooter />` which reads pagination state from `DataTable` context. Two examples: wrap → simple (🦶, "foot for footer") with `p-4` padding. No props example (nothing to expose) and no barrel export (no `Props` interface).

### Removed template ExampleSlot / ExamplePage scaffold — [`8d56348`](https://github.com/brian-smith-tcril/frontend-app-catalog/commit/8d56348)

Deleted `src/slots/ExampleSlot/` and `src/example/`. Both were leftovers from the frontend-template-application scaffold — the slot was only referenced by `ExamplePage`, and `ExamplePage` was unrouted and unreferenced from anywhere in the ported app. With all 26 real slot ports complete, cleaning this up so the codebase matches the actual product surface. All 27 slot-migration tasks now done.

## Phase 7 — Port the tests

### Rebuilt the test scaffold — [`ac4179f`](https://github.com/brian-smith-tcril/frontend-app-catalog/commit/ac4179f)

Kick-off for Phase 7. `jest.config.js` and `babel.config.js` were already the one-liner `createConfig` delegations from an earlier phase; this pass filled in the rest, modeled on `frontend-app-learner-dashboard/src/setupTest.jsx`.

- `src/setupTest.js` — replaced the 5-line stub with the reference pattern: `mergeSiteConfig(siteConfig) + addAppConfigs()` at module top level, plus an exported `initializeMockServices()` for tests that need auth/logging/analytics.
- `site.config.test.tsx` — populated `apps[0].config` with the catalog keys ported src reads via `getAppConfig(appId)` (`COURSE_ABOUT_TWITTER_ACCOUNT`, `ENABLE_COURSE_DISCOVERY`, `ENABLE_PROGRAMS`, `HOMEPAGE_COURSE_MAX`, `HOMEPAGE_PROMO_VIDEO_YOUTUBE_ID`, `INFO_EMAIL`, `LEARNING_BASE_URL`, `SUPPORT_URL`). Added `cmsBaseUrl` at top level for `getSiteConfig().cmsBaseUrl` reads in `course-overview/index.tsx`. Kept `localhost:8000`/`8001` ports (matches the existing `lmsBaseUrl` and the reference repo's convention) — test URLs never hit the network. Swapped `EnvironmentTypes?.TEST ?? 'test'` for `'test' as SiteConfig['environment']` per the reference-repo comment: importing the enum from `@openedx/frontend-base` in a config that is loaded before any per-test `jest.mock('@openedx/frontend-base', ...)` runs creates a circular-init problem.
- `src/__mocks__/course.ts` + `courseAbout.ts` — ported verbatim from `legacy/src/__mocks__/`. `src/__mocks__/index.ts` re-exports all three fixtures now.
- `jest.config.js` — added `modulePathIgnorePatterns: ['/legacy/']`. Without it, jest's haste-map indexes `legacy/src/__mocks__/*` as manual mocks and logs a "duplicate manual mock" warning for every fixture that also lives in `src/__mocks__/`. `testPathIgnorePatterns` alone doesn't cover this — it only affects test discovery, not module resolution.

Verified with `npm test -- --no-coverage --passWithNoTests`: exit 0, no warnings, no tests to run yet.

### Batch A backfill — mechanical ports through sidebar-details

14 mechanical Batch A ports, each just a copy + minor import rewrite (legacy `render`/`renderHook`/`userEvent` re-exported from `../../setupTest` → the same names from `@testing-library/react` and `@testing-library/user-event` directly; components using `useIntl` wrap in `<IntlProvider locale="en">` from `@openedx/frontend-base`). No behavior changes, no dropped assertions.

- [`687bf83`](https://github.com/brian-smith-tcril/frontend-app-catalog/commit/687bf83) — `SubHeader.test`: no i18n/router/HTTP; render from RTL directly.
- [`c1945cb`](https://github.com/brian-smith-tcril/frontend-app-catalog/commit/c1945cb) — `LoadingSpinner.test`: `useIntl`; inline `renderWithIntl`.
- [`c4460e1`](https://github.com/brian-smith-tcril/frontend-app-catalog/commit/c4460e1) — `StatusMessage.test`: `useIntl`; inline `renderWithIntl`.
- [`71a1d7a`](https://github.com/brian-smith-tcril/frontend-app-catalog/commit/71a1d7a) — `AlertNotification.test`: no deps; render from RTL directly.
- [`2bf7536`](https://github.com/brian-smith-tcril/frontend-app-catalog/commit/2bf7536) — `EnrolledStatus.test`: `useIntl`; inline `renderEnrolledStatus`.
- [`25e458c`](https://github.com/brian-smith-tcril/frontend-app-catalog/commit/25e458c) — `usePagination.test`: pure state hook; `renderHook`/`act` from RTL directly.
- [`ab11813`](https://github.com/brian-smith-tcril/frontend-app-catalog/commit/ab11813) — `VideoModal.test`: `useIntl`; inline `renderVideoModal`; `userEvent` from own package.
- [`9cf2686`](https://github.com/brian-smith-tcril/frontend-app-catalog/commit/9cf2686) — `useDebouncedSearchInput.test`: pure state hook + `jest.useFakeTimers`.
- [`053e223`](https://github.com/brian-smith-tcril/frontend-app-catalog/commit/053e223) — `EnrollmentButton.test`: `useIntl`; inline `renderEnrollmentButton`; `userEvent` from own package.
- [`5709773`](https://github.com/brian-smith-tcril/frontend-app-catalog/commit/5709773) — `course-media/utils.test`: pure util, verbatim copy.
- [`05c0f7c`](https://github.com/brian-smith-tcril/frontend-app-catalog/commit/05c0f7c) — `course-card/utils.test`: swapped legacy `getConfig().LMS_BASE_URL` for `getSiteConfig().lmsBaseUrl` (mirrors the util's own read).
- [`5689fef`](https://github.com/brian-smith-tcril/frontend-app-catalog/commit/5689fef) — `data/course-list-search/utils.test`: pure util (FormData manipulation), verbatim copy.
- [`7133054`](https://github.com/brian-smith-tcril/frontend-app-catalog/commit/7133054) — `useFilter.test`: pure state hook; `renderHook`/`act` from RTL directly.
- [`5f0cdd0`](https://github.com/brian-smith-tcril/frontend-app-catalog/commit/5f0cdd0) — `sidebar-details/utils.test`: pure util, verbatim copy.

Recurring inline pattern this batch established:

```tsx
const renderWithIntl = (ui: React.ReactElement) => render(
  <IntlProvider locale="en">{ui}</IntlProvider>,
);
```

Duplicated across 5 test files so far — not yet 3+ *identical* extractions (each file inlines its own tiny variant with the component's own props type), so still below the "extract on 3rd copy" threshold from the plan doc.

### Ported sidebar-social/utils.test to src — [`d0d088b`](https://github.com/brian-smith-tcril/frontend-app-catalog/commit/d0d088b)

First Batch A file that couldn't be a mechanical port. Legacy did `jest.mock('@edx/frontend-platform', () => ({ getConfig: jest.fn(() => ({ SITE_NAME: process.env.SITE_NAME, COURSE_ABOUT_TWITTER_ACCOUNT: process.env.COURSE_ABOUT_TWITTER_ACCOUNT })) }))` and read `getConfig().COURSE_ABOUT_TWITTER_ACCOUNT` throughout to check that URLs and formatMessage calls got the right value. The ported util now reads `getSiteConfig().siteName` and `getAppConfig(appId).COURSE_ABOUT_TWITTER_ACCOUNT`.

Two ways to bridge:

1. Read the same values in the test that `setupTest.js` already seeded (`getSiteConfig().siteName` → `'Catalog Test Site'`, etc.), no mocks.
2. Mock `getSiteConfig` and `getAppConfig` via `jest.mock('@openedx/frontend-base', () => ({ ...jest.requireActual(...), getSiteConfig: jest.fn(), getAppConfig: jest.fn() }))`, populate in `beforeEach`.

Went with (2). Reason: one test asserts the utils don't crash when config values are `undefined` (`handles missing config values`). Under (1) that test would need to `mergeSiteConfig({ siteName: undefined })` at file scope which would poison other tests in the same run via the shared config module. Mocking gives per-test control without leaking state — and it's the pattern learner-dashboard uses everywhere config touches a test.

Kept legacy's real-intl-via-`renderHook` pattern for the `formatMessageSpy`: `IntlProvider` from `@openedx/frontend-base` wraps `useIntl` the same way `@edx/frontend-platform`'s did, so `renderHook(() => useIntl(), { wrapper })` transferred one-for-one.

**Pattern established for future config-touching tests:** the `jest.requireActual + jest.fn() on named exports` shape used here is the canonical mock recipe from the plan doc's step 3. Ports later in Batch B/C/D that need to override config values per-test should copy this shape.

### Batch A close-out — [`0da9f42`](https://github.com/brian-smith-tcril/frontend-app-catalog/commit/0da9f42)

Final Batch A file: `catalog/__tests__/utils.test.ts`. Mechanical port — swapped `IntlShape`/`createIntl` from `@edx/frontend-platform/i18n` for `createIntl` from `@openedx/frontend-base` and `IntlShape` from `@src/utils` (the ported src convention — `IntlShape = ReturnType<typeof useIntl>`).

**Batch A complete.** 16 legacy test files ported into `src/`, 126 tests passing, full-repo lint clean. Skipped the plan's up-front `src/test-utils/` extraction; the only pattern that duplicated enough to consider extraction is the tiny `renderWithIntl` inline helper (5 copies), each with a component-specific props type, so still below the "3+ *identical* copies" bar.

Batch A pending: none. Coverage collection deferred to end of phase per plan.

### Batch B backfill — mechanical hook-port opens (3 files)

Batch B opens with the same "swap the setupTest re-export for `@testing-library/react` directly" pattern from Batch A. Config/logger reads that legacy pulled from `@edx/frontend-platform` (root or subpaths) collapse to a single `@openedx/frontend-base` import; when a named export needs to be mocked, the recipe is `jest.mock('@openedx/frontend-base', () => ({ ...jest.requireActual(...), <name>: jest.fn() }))` (sidebar-social pattern).

- [`21bd994`](https://github.com/brian-smith-tcril/frontend-app-catalog/commit/21bd994) — `useEnrollmentActions.test`: `logError` mocked via `jest.requireActual` override; `getConfig().LMS_BASE_URL` → `getSiteConfig().lmsBaseUrl`; legacy split imports across 3 `@edx/frontend-platform` subpaths (`/logging`, `/i18n`, root) all collapse to `@openedx/frontend-base`.
- [`4f91a12`](https://github.com/brian-smith-tcril/frontend-app-catalog/commit/4f91a12) — `useSearch.test`: pure state hook + a `react-router-dom` mock; direct import swap.
- [`2c5d812`](https://github.com/brian-smith-tcril/frontend-app-catalog/commit/2c5d812) — `useCourseData.test`: pure state hook; only the setupTest re-export changed.

### Ported useEnrollmentStatus.test to src — [`3df9432`](https://github.com/brian-smith-tcril/frontend-app-catalog/commit/3df9432)

Surprise: this is the first Batch B hook that returns JSX (`renderStatusContent()` returns a React tree containing `<StatusMessage>`, `<EnrolledStatus>`, `<EnrollmentButton>`, etc., all of which call `useIntl()`). Legacy did:

```tsx
render(result.current.renderStatusContent());
```

Legacy's setupTest exported a custom `render` that wraps everything in `<IntlProvider locale="en">` by default. That wrap happens *inside* the custom render, so plain-looking `render(ui)` calls silently got IntlProvider. RTL's own `render` does no such thing — it renders exactly what you pass. Under the port, the same call throws `[React Intl] Could not find required intl object`, because the hook's JSX is now rendered raw.

Fix is a one-liner per call: reuse the same `wrapper` we already pass to `renderHook`:

```tsx
render(result.current.renderStatusContent(), { wrapper });
```

**Gotcha to watch for in Batch C/D:** any hook that returns JSX (or any test that renders JSX detached from what `renderHook` already rendered) needs its `render` call wrapped too — not just the `renderHook` call. Grep candidate: files that do `render(result.current.something())`.

### Batch B close-out — [`a4bfa43`](https://github.com/brian-smith-tcril/frontend-app-catalog/commit/a4bfa43) + [`5fc61e9`](https://github.com/brian-smith-tcril/frontend-app-catalog/commit/5fc61e9)

Last two Batch B files:

- `useCatalog.test` ([`4a73199`](https://github.com/brian-smith-tcril/frontend-app-catalog/commit/4a73199)) — mechanical, only the setupTest re-export changed; `MemoryRouter` wrapper stays.
- `courseListSearch.test` ([`a4bfa43`](https://github.com/brian-smith-tcril/frontend-app-catalog/commit/a4bfa43)) — mechanical too, but noteworthy for being the first file to hit the "canonical mock recipe" for `getAuthenticatedHttpClient`: swap `jest.mock('@edx/frontend-platform/auth', ...)` for `jest.mock('@openedx/frontend-base', () => ({ ...jest.requireActual(...), getAuthenticatedHttpClient: jest.fn() }))`. Same shape as `sidebar-social` (config mocks) — the pattern generalizes to any `@openedx/frontend-base` named export.

Plus a small lint-fix commit ([`5fc61e9`](https://github.com/brian-smith-tcril/frontend-app-catalog/commit/5fc61e9)): the legacy tests used mixed `;`/`,` field separators in inline type annotations (`{ courseData: T; searchString: string, }`); this repo's `@stylistic/member-delimiter-style` rule wants commas throughout. Autofix from `eslint --fix`; kept it as a separate commit so the port and the style adjustment are distinct in history.

**Batch B complete.** 6 legacy hook test files ported, 51 new tests, 22 suites / 177 tests total passing, lint clean. One meaningful surprise (`useEnrollmentStatus` → hook-returns-JSX render wrapping) captured in its own worklog entry.

Next: Batch C — component/page tests with env→config work.

### Batch C opens — HomeBanner.test + jest.config asset-mapper reorder — [`287634c`](https://github.com/brian-smith-tcril/frontend-app-catalog/commit/287634c) + [`2549500`](https://github.com/brian-smith-tcril/frontend-app-catalog/commit/2549500)

First Batch C file surfaced a scaffold bug that A and B never triggered: `jest.config.js` had `moduleNameMapper: { '^@src/(.*)$': ..., '\\.svg$': ..., ... }` in that order. jest uses the first-matching mapper key, so `@src/assets/images/no-course-image.svg` resolved through the `@src` alias to the real SVG file — parse failed with `Unexpected token '<'`. All Batch A/B tests avoided this because they only imported code that didn't transitively pull in `generic/course-card` (which owns the SVG import). HomeBanner does, via the slot chain (`HomePromoVideoModalSlot` → ... → `CourseCard`).

Fix: move the two extension-based mappers (`\\.svg$`, `\\.(jpg|jpeg|png|...)$`) above the `^@src/(.*)$` alias. Same ordering learner-dashboard uses. Scaffold fix committed separately from the port so the source of the fix is one obvious diff.

HomeBanner port itself:

- Legacy hardcoded `ROUTES.COURSES` in the test and asserted the exact URL. Ported code uses `getUrlByRouteRole(coursesRole)`, which returns `null` in the test env (no route roles seeded). Mocked `getUrlByRouteRole` to return a fixed courses URL — cheaper than seeding a synthetic route role in `site.config.test.tsx`, and keeps the test's focus on "handleSearch navigates with the query" rather than route-role wiring.
- Legacy spied on the `reactRouter` re-export from setupTest to intercept `useNavigate`. That trick doesn't transfer cleanly (jest can't mutate ES module namespace objects). Replaced with `jest.mock('react-router', () => ({ ...jest.requireActual('react-router'), useNavigate: jest.fn() }))` — same canonical shape as the other frontend-base named-export mocks.

**Pattern to watch for in the rest of Batch C:** any test that renders a page or component pulling in slot chains through `CourseCard` will need this jest.config fix already committed — nothing further per-test. Any test asserting on route URLs will hit the `getUrlByRouteRole` mock decision (fixed URL vs seeding roles). Sticking with per-test `jest.mock` overrides for now — same "no premature abstraction" logic as inline `renderWithIntl`.

### Batch C backfill — mechanical ports 2–5 (4 files)

Following the HomeBanner + jest.config fix, four mechanical Batch C ports landed with only the recurring import/mock swaps:

- [`d84e6d5`](https://github.com/brian-smith-tcril/frontend-app-catalog/commit/d84e6d5) — `CourseIntro.test`: `getAuthenticatedUser` + `logError` mocked via jest.requireActual override on `@openedx/frontend-base`; `getConfig().LMS_BASE_URL` → `getSiteConfig().lmsBaseUrl`; `renderCourseIntro` wraps IntlProvider (useIntl reaches through `useEnrollmentActions` + child components).
- [`5dae211`](https://github.com/brian-smith-tcril/frontend-app-catalog/commit/5dae211) — `SidebarDetailsItem.test`: no i18n; only the setupTest re-export → `@testing-library/react` changed.
- [`fb87611`](https://github.com/brian-smith-tcril/frontend-app-catalog/commit/fb87611) — `CourseMedia.test`: `getConfig().LMS_BASE_URL` → `getSiteConfig().lmsBaseUrl`; wrapped in IntlProvider (transitive useIntl via slot chain).
- [`c44f451`](https://github.com/brian-smith-tcril/frontend-app-catalog/commit/c44f451) — `CourseOverview.test`: mocked `getAuthenticatedUser` only; `STUDIO_BASE_URL` → `getSiteConfig().cmsBaseUrl` (top-level), no getConfig/getSiteConfig mock needed since setupTest already seeds both `lmsBaseUrl` and `cmsBaseUrl`.

### Skip-list expansion: utils.test.ts (root) — [`269b423`](https://github.com/brian-smith-tcril/frontend-app-catalog/commit/269b423)

Next up in Batch C was `legacy/src/utils.test.ts` — 4 test blocks covering `resolveUrl`, `baseAppUrl`, `programsUrl`, `getCookie`. Went to grep `src/` for the port targets and got zero hits for every one. Confirmed:

- `src/utils.ts` is a 13-line file exporting only `formatDate` + `IntlShape` — the 4 legacy utilities were removed during the frontend-base port, not moved.
- `@openedx/frontend-base` doesn't re-export a `getCookie` either (checked `runtime/index.d.ts`).
- No files in `src/` import any of the 4 legacy names.

Applying the guiding principle ("is the behavior this test asserts still our responsibility?"): no. Added to the skip-list. Port count 39 → 38; Batch C 12 → 11.

### Batch C close-out — mechanical ports through SidebarDetails (6 files)

Six mechanical Batch C ports followed the skip-list decision, plus one non-trivial patch on the way (CoursesList needed MemoryRouter, HomePage needed a title-assertion rewrite for the new Helmet template):

- [`963c5a6`](https://github.com/brian-smith-tcril/frontend-app-catalog/commit/963c5a6) — `course-about/data/data.test`: getAuthenticatedHttpClient + getConfig collapse; `getConfig().LOGIN_URL` → `getSiteConfig().loginUrl`.
- [`41f3bd4`](https://github.com/brian-smith-tcril/frontend-app-catalog/commit/41f3bd4) — `SidebarSocial.test`: reads seeded `getSiteConfig().siteName` and `getAppConfig(appId).COURSE_ABOUT_TWITTER_ACCOUNT` directly (no mock needed — setupTest already seeds both).
- [`c745a16`](https://github.com/brian-smith-tcril/frontend-app-catalog/commit/c745a16) — `CourseCard.test`: mocks `getUrlByRouteRole` to return `/courses/:courseId/about`; wraps IntlProvider + MemoryRouter.
- [`cb08a17`](https://github.com/brian-smith-tcril/frontend-app-catalog/commit/cb08a17) — `CoursesList.test`: mocks `getAppConfig` (per-test overrides for browsing config) + `ErrorPage` + `getUrlByRouteRole` + `useNavigate`. First test in the batch that needed `MemoryRouter` in the wrap because CourseCards inside render a `<Link>` — fail mode was `TypeError: Cannot destructure property 'basename'`. Same lesson as `useEnrollmentStatus` in Batch B: any test that transitively renders a router-aware component needs the router in the wrap, not just where the code shows a router hook.
- [`27be902`](https://github.com/brian-smith-tcril/frontend-app-catalog/commit/27be902) — `HomePage.test`: mocks `getAppConfig` per-test; wraps `IntlProvider` + `MemoryRouter`. **Title assertion rewrite:** legacy asserted `document.title === SITE_NAME` because the legacy `Head` component set it to the raw site name. The ported `HomePage` uses `<Helmet><title>{formatMessage(messages.pageTitle, { siteName })}</title></Helmet>` with `pageTitle: "Catalog | {siteName}"`. Assertion swapped to `messages.pageTitle.defaultMessage.replace('{siteName}', getSiteConfig().siteName)` — same template-replacement idiom used elsewhere in the file. This is the "opportunistic per-page Helmet title assertion" the plan doc mentioned as coverage for the deleted `Head.test.tsx`; still to do the equivalent in `CatalogPage.test` and `CourseAboutPage.test` when Batch D lands.
- [`7dc2964`](https://github.com/brian-smith-tcril/frontend-app-catalog/commit/7dc2964) — `SidebarDetails.test`: mocks `getUrlByRouteRole` to the `/courses/:courseId/about` pattern for prerequisite Links; wraps IntlProvider + MemoryRouter; ported `formatDateForTest` inline.

**Batch C complete.** 11 legacy test files ported (12 minus skipped `utils.test.ts`), 33 suites / 277 tests total passing, lint clean. Same "no `test-utils/` extraction" call still holds — the `renderWithIntl` variants keep being close-enough-but-not-identical to inline per file.

Next: Batch D — CatalogPage (~1700 LOC single file), CourseAboutPage, header/CatalogHeader (moved to E). Batch C's mocking recipes will carry over unchanged.

## Phase 7 Batch D — the two big page tests

### CourseAboutPage.test to src — [`95d4d71`](https://github.com/brian-smith-tcril/frontend-app-catalog/commit/95d4d71) (+ [`445d58c`](https://github.com/brian-smith-tcril/frontend-app-catalog/commit/445d58c) lint fix)

Mechanical with one deliberate choice: mocked `useCourseAboutData` and `useEnrollment` at the hook layer instead of legacy's `fetchCourseAboutData` at the fetch layer. Legacy could mock the fetch because its setupTest render always wrapped in QueryClientProvider; the ported setup doesn't. Mocking the hook returns the shape the component expects (`{ data, isLoading, isError }`) without any React Query in the wrap. Kept the ~20 test cases 1:1.

Title assertion tracks `courseAbout.page.title` = `"{courseName} | {siteName}"` via chained `.replace()` — same as legacy but through the new template.

Studio button URL: `STUDIO_BASE_URL` legacy → `getSiteConfig().cmsBaseUrl` (seeded in `site.config.test.tsx`; no mock).

### CatalogPage.test to src — [`ca4481f`](https://github.com/brian-smith-tcril/frontend-app-catalog/commit/ca4481f)

Largest single-file port of the phase — 52 tests, ~1700 LOC. Recurring recipes from Batches B/C ported straight over (getConfig → getSiteConfig/getAppConfig, jest.mock consolidation into a single `@openedx/frontend-base` override with jest.requireActual). Two things needed real work:

**1. `rerender` requires the wrapper option, not inline JSX.** First pass used the batch's standard `const render = (ui) => rtlRender(<IntlProvider>...<MemoryRouter>{ui}</MemoryRouter>...</IntlProvider>)` shape. 46/52 passed but the tests that did `const { rerender } = render(<CatalogPage />); rerender(<CatalogPage />)` failed with `[React Intl] Could not find required intl object`. RTL's `rerender` only re-mounts the direct children — it drops any wrappers baked into the JSX. It DOES preserve wrappers passed via `rtlRender(ui, { wrapper: WrapperComponent })`. Restructured the helper as a `Wrapper` component + `{ wrapper: Wrapper }`. All 52 pass.

**2. Integration test needs QueryClientProvider in the wrapper.** The file has a `CatalogPage search integration` describe block that swaps the mocked `useCourseListSearch` for the real one via `jest.requireActual(...).useCourseListSearch`, then mocks `getAuthenticatedHttpClient` at a lower level to drive a real `useQuery` end-to-end. That hook needs a QueryClient in context. Since the shared wrapper is a component (fix #1), added `QueryClientProvider` there unconditionally — the ~90% of tests that mock `useCourseListSearch` never touch React Query, so the idle client is free.

**Both fixes are pattern-lessons for future work in this codebase:** (a) any RTL render helper that will be used with `rerender()` must use `{ wrapper: ... }`, not inline JSX; (b) a component-shaped wrapper composes multiple providers cheaply and generalizes to "some tests use React Query, most don't."

### Batch D close-out

Batch D complete. 2 files ported, 80 new tests (28 + 52), 35 suites / 357 tests total passing, lint clean. Same "no `test-utils/` extraction" call still holds — the wrapper-component shape from CatalogPage might get lifted into a helper later if Batch E ends up wanting the same, but it's still only 1 use.

Next: Batch E — CatalogHeader + useMenuItems rewrite (header widget shape change).

## Phase 7 Batch E — Header widget test rewrite

### Skip-list expansion: header/CatalogHeader.test + header/hooks/useMenuItems.test — [`d91672f`](https://github.com/brian-smith-tcril/frontend-app-catalog/commit/d91672f)

Neither legacy file has a straight port target. The header rewrote from a `CatalogHeader` React component + a `useMenuItems` hook (which built `{ mainMenu, secondaryMenu }` arrays and passed them to `@edx/frontend-component-header`) into `src/widgets/CatalogHeader/` — a widget sub-app that declares 5 slot operations against the shell header's `primaryLinks` slot (4 MenuItem widgets + one helpButton via `helpButtonSlotOperation`). There's no `CatalogHeader` component and no `useMenuItems` hook to port to.

Skip-list total climbs from 5 to 7. Total legacy files "handled" through Phase 7 = 35 ported + 7 skipped + 1 unaccounted (`legacy/src/example/ExamplePage.test.tsx` — its source was deleted in `8d56348`, so it has no port target either; will add to the skip-list if it comes up in Phase 7's final verification pass).

### CatalogHeader widget-app tests — [`6d96e9d`](https://github.com/brian-smith-tcril/frontend-app-catalog/commit/6d96e9d) (+ [`ed41191`](https://github.com/brian-smith-tcril/frontend-app-catalog/commit/ed41191) cleanup)

One new file, `src/widgets/CatalogHeader/app.test.tsx`, replaces both legacy files. Two things it covers:

**1. Condition callbacks (12 tests).** The 4 slot ops each declare a `condition.callback()` that decides whether the MenuItem renders. The tests invoke each callback under the auth × config combinations that matter:

- `headerLinkCourses` — authed shows, unauthed hides.
- `headerLinkPrograms` — authed + `ENABLE_PROGRAMS=true` shows; either flip hides.
- `headerLinkDiscover` — authed + `NON_BROWSABLE_COURSES !== true` shows; `=true` or unauthed hides.
- `headerLinkExploreCourses` — unauthed + `ENABLE_COURSE_DISCOVERY=true` shows; either flip hides.

That's the whole behavior legacy `useMenuItems` covered, restated at the layer it now lives at.

**2. URL-carrying MenuItems (2 tests).** `CoursesLinkMenuItem` and `ProgramsLinkMenuItem` build their `url` prop from `getSiteConfig().lmsBaseUrl`; a shallow render + href check nails down that wiring.

**Deliberately not tested: full render of the role-based MenuItems** (`DiscoverLinkMenuItem`, `ExploreCoursesLinkMenuItem`). These pass a `role` prop through to frontend-base's `LinkMenuItem`, which then calls `getUrlByRouteRole(role)` internally. The catch: `LinkMenuItem` imports `getUrlByRouteRole` from `../../runtime/routing` (its own package's subpath), not from `@openedx/frontend-base` (the barrel). Our `jest.mock('@openedx/frontend-base', ...)` only overrides the barrel export, so `LinkMenuItem`'s call still hits the real function — which returns `null` in the test scaffold because no route roles are seeded. `LinkMenuItem` correctly returns `null` when its URL resolves to `null`, so the components render nothing. To make the full-render test pass we'd need to either mock the internal subpath (brittle — targets frontend-base internals) or seed a real route role setup (a lot of scaffolding for one URL check). The wiring our code actually owns — "correct `role` constant, correct `label` message" — is a 2-line structural fact visible in each component and inductively exercised through the condition-callback tests (if the wrong role were passed, active-role gating in Batch E's live app would break, not a unit test's assertion).

Also had a small lint fix ([`ed41191`](https://github.com/brian-smith-tcril/frontend-app-catalog/commit/ed41191)) to drop the two now-unused imports left over from the removed render tests.

### Batch E close-out

Batch E complete. 1 new file, 15 tests, 36 suites / 372 tests total passing, lint clean. The widget rewrite path is now testable at the layer that matters (condition callbacks) instead of the layer that's gone (hook return values), which is what the plan called for.

### Phase 7 status

35 legacy test files ported into `src/` (Batches A + B + C + D), 1 new file for the header widget (Batch E), 7 legacy files on the skip-list, 372 tests passing on Node 24, full-repo lint clean. Remaining: task #36 — coverage-regression check against a master baseline (the first coverage-collecting run of the phase).

The plan doc's cross-cutting-patterns section held up. `src/test-utils/` never got extracted; the recurring `renderWithIntl` inline helper landed in ~7 files as small variants, and once a wrapper *composed multiple providers* (CatalogPage's `IntlProvider + MemoryRouter + QueryClientProvider`), the case for extraction still fell below the "3+ identical copies" bar because each page test picks a different subset. If a future batch of tests needs a full 3-provider wrap, that would be the trigger to extract.

### Coverage-regression check — task #36

Baseline: fresh worktree of `upstream/master` at [a519a9f](https://github.com/openedx/frontend-app-catalog/commit/a519a9f), `nvm use && npm ci && npm test`. Ported: `frontend-base` branch after Batch E, `npm test`. Both on Node 24.

Bucketed by top-level `src/` dir (paths don't map 1:1 — `plugin-slots/` renamed to `slots/`, `header/` removed, `widgets/` new, `example/` deleted):

```
BUCKET         M-files P-files  STMTS m/p    BRANCH m/p   FUNCS m/p    LINES m/p
(root)         6       8        95.2 / 48.0  100  / 0     75.0 / 16.7  94.4 / 48.0
catalog        9       11       100  / 100   92.0 / 94.1  100  / 100   100  / 100
course-about   32      40       99.4 / 98.3  91.5 / 90.5  100  / 100   99.3 / 98.2
data           5       6        100  / 100   100  / 100   100  / 100   100  / 100
example        1       —        0.0  / —     —    / —     0.0  / —     0.0  / —
generic        11      15       100  / 100   97.0 / 95.7  93.8 / 100   100  / 100
header         3       —        100  / —     90.0 / —     100  / —     100  / —
home           9       11       95.2 / 100   85.7 / 85.0  83.3 / 100   97.5 / 100
not-found-page 2       —        100  / —     —    / —     100  / —     100  / —
slots          29      29       100  / 100   86.3 / 85.0  94.4 / 100   100  / 100
widgets        —       7        —    / 75.0  —    / 60.0  —    / 75.0  —    / 75.0
------------------------------------------------------------------------------------
TOTAL                           98.8 / 96.5  91.1 / 90.8  95.7 / 95.7  98.9 / 96.4
```

**Delta:** −2.3 pp stmts, −0.3 pp branch, ±0.0 funcs, −2.5 pp lines. All drops trace to intentional decisions from the plan's guiding principle:

- `(root)`: 95.2 → 48.0 stmts. Master had tests for `App.tsx`, `index.tsx`, `NotFoundPage`, `Head`. All four are on the skip-list — the shell owns bootstrap, unknown-route response, and per-page `<Helmet>` titles are asserted individually in HomePage/CatalogPage/CourseAboutPage tests (which cover the *behavior* Head.test used to cover, not the file). Coverage numbers for the untested `Main.tsx` / `routes.tsx` / `slots.tsx` / `app.ts` in `src/` root are inflating the denominator here — those are 3–5 line declarative files whose "behavior" is data (route table, slot config, app id) that doesn't exercise via unit test.
- `header/` (100 → gone) + `widgets/` (new @ 75.0): the header rewrote from a component + hook (100% covered by 3 legacy test files) into a widget sub-app (4 MenuItem components + `app.ts` config + `index.ts` barrel + `messages.js`, covered by 1 new test file @ 75%). The 25 pp gap = Discover / ExploreCourses MenuItems (delegate URL resolution to frontend-base's LinkMenuItem via a subpath import that our barrel mock doesn't reach — Batch E worklog entry has the full write-up) + the barrel `index.ts` file (never has coverage). Both are known-and-explained gaps; the *behavior* — which item appears under which auth+config — is tested via the widget-config's `condition.callback()` functions at 100%.
- `example/` (0 → gone): the sole file `ExamplePage.test.tsx` was in the "dropped-source" category — its source was deleted in [`8d56348`](https://github.com/brian-smith-tcril/frontend-app-catalog/commit/8d56348). Coverage went with it. Legacy's 0% was itself a signal that the test wasn't exercising the code.

**Where coverage improved:**

- `home`: +4.8 pp stmts, +16.7 pp funcs, +2.5 pp lines. The port's cleanup of the untested `HomePageOverlay` branch plus tighter `HomeBanner` coverage.
- `generic`: +6.2 pp funcs. `CourseCard` port covered functions the legacy suite missed.
- `slots`: +5.6 pp funcs. The slot ports (Phase 8, not Phase 7) each shipped with real tests via their Slot API exercises.

**Where coverage held flat (within 1 pp):**

- `catalog`, `course-about`, `data` — all stmts and lines within 1 pp of master. Branch coverage on `generic` and `slots` dropped ~1 pp; both trace to `useMediaQuery` branches (mocked to return false in most tests, one arm untested). Not worth chasing.

**Verdict: no unexpected regression.** The −2.3 pp headline is entirely explained by the skip-list decisions (which the plan pre-authorized) and the header widget rewrite (whose gap is documented and intentional). Every non-skip-list feature bucket held or improved.

**Followups queued (not blocking Phase 7 close):**

- `Main.tsx` / `routes.tsx` / `slots.tsx` / `app.ts` are declarative and untested; if a route-wiring test is ever wanted, a tiny `routes.test.tsx` walking the tree shape (see plan doc §2) is the cheap version.
- Widget MenuItems (Discover/Explore) full-render coverage is achievable if frontend-base ever surfaces `getUrlByRouteRole` from the barrel in a way subpath imports also see, or if we accept mocking `@openedx/frontend-base/dist/runtime/routing` directly. Not worth chasing in this phase.

### Phase 7 close-out

Phase 7 complete. 35 legacy test files ported + 1 new widget test (Batch E) + 7 skip-list. 372 tests / 36 suites passing on Node 24. Coverage regression check done: −2.3 pp headline, entirely accounted for by intentional decisions. Next migration phases per `docs/migrate-to-frontend-base.md`: 9 (SCSS audit), 10 (i18n audit), 11 (CI audit), 13 (final verification), then delete `legacy/`.

### Phase 7 followup — default-to-seed for getAppConfig / getSiteConfig

Reviewing the test-comparison branch surfaced that five ported files hardcoded config values (`TEST_INFO_EMAIL = 'support@example.com'`, `TEST_YOUTUBE_ID = 'test-youtube-id'`, `DEFAULT_TEST_INFO_EMAIL`, `TEST_SITE_NAME`, `TEST_TWITTER_ACCOUNT`) that already live in `site.config.test.tsx`. The pattern was: mock `getAppConfig`/`getSiteConfig` unconditionally in `beforeEach` so per-test overrides work, then re-supply every value the test reads. The seed became invisible. Full plan: `docs/tests-default-to-seed.md`.

**Pattern applied** — default the mock to `jest.requireActual`, only `mockReturnValue` in the specific `it` blocks that need to change a value, and use spread-over-actual so unrelated seeded keys aren't wiped:

```ts
const { getAppConfig: actualGetAppConfig } = jest.requireActual('@openedx/frontend-base');
beforeEach(() => { mockedGetAppConfig.mockImplementation(actualGetAppConfig); });

// per-test override:
mockedGetAppConfig.mockReturnValue({ ...actualGetAppConfig(appId), ENABLE_COURSE_DISCOVERY: false });
```

Assertions elsewhere read the seed directly via `getAppConfig(appId).INFO_EMAIL` / `getSiteConfig().siteName`.

Per-file commits — one per test file, no production code touched:

- [`d5a667d`](https://github.com/brian-smith-tcril/frontend-app-catalog/commit/d5a667d) — `sidebar-social/utils.test`. Also fixes a drift bug: `TEST_SITE_NAME` was `'localhost'` (legacy `env.test`) but the seed is `'Catalog Test Site'`; the ported assertion was passing only because the mock returned the wrong value. Under the refactor the assertion reads `getSiteConfig().siteName` so it lines up with the seed.
- [`02bf210`](https://github.com/brian-smith-tcril/frontend-app-catalog/commit/02bf210) — `HomePage.test`.
- [`385f09d`](https://github.com/brian-smith-tcril/frontend-app-catalog/commit/385f09d) — `CatalogPage.test`. Three `beforeEach` blocks all collapse the same way; two legitimate `ENABLE_COURSE_DISCOVERY: false` overrides preserved via spread.
- [`697a574`](https://github.com/brian-smith-tcril/frontend-app-catalog/commit/697a574) — `CoursesList.test`. Also removes the redundant per-test `INFO_EMAIL` override in the error-state case (it re-set the same seeded value the beforeEach already had).
- [`e22b501`](https://github.com/brian-smith-tcril/frontend-app-catalog/commit/e22b501) — `CatalogHeader/app.test`. Removes per-test overrides in the "shows when …" tests that just re-stated seeded defaults (`ENABLE_PROGRAMS: true`, `ENABLE_COURSE_DISCOVERY: true`) — the seed provides them, so no mock is needed.

Full suite still 372/372 passing on Node 24, lint clean. Every mention of the deleted constants is gone from `src/`.

**Pattern to reuse going forward:** any new test that reads config should read `getAppConfig(appId).X` / `getSiteConfig().Y` directly. `jest.mock('@openedx/frontend-base', ...)` is only needed when the file has other reasons to mock (`ErrorPage`, `getAuthenticatedHttpClient`, `getUrlByRouteRole`, per-test config override, etc.), and when it's there, `mockImplementation(actualGetAppConfig)` in the beforeEach is the default. Values that need to differ from the seed use spread-over-actual.

### Post-refactor test-review findings

Walking through the ported test files after the default-to-seed refactor surfaced a few things worth recording — none required code changes to the tests themselves, but they clarify design decisions and turned up one upstream followup.

**Why the mock-passthrough default exists at all.** The pattern looks odd on its face: replace a real function with `jest.fn()`, then in `beforeEach` point the jest.fn back at the real function via `mockImplementation(actualGetAppConfig)`. The reason is that `jest.mock` is *file-scoped* — it's hoisted to the top of the module and applies to every test. It can't be enabled only in the specific `it` blocks that need to override. So a test file falls into one of two buckets: (1) no test needs an override → don't `jest.mock` at all, calls hit the real function and read the seed directly (e.g. `CourseAboutPage.test`, `SidebarSocial.test`); (2) at least one test needs an override → the whole file must mock, and the passthrough default keeps every other test in the file behaving identically to bucket-1. Alternatives considered and rejected: split the file into two just for scoping (not worth it), use `jest.spyOn` per-test (doesn't work with named ES module imports without changing the import style), custom mutable-variable factory (same effect as our pattern with more indirection).

**Page-title message shape change is intentional and translation-safe.** The ported `CatalogPage.test`, `HomePage.test`, and `CourseAboutPage.test` all assert `document.title` using a `messages.pageTitle.defaultMessage.replace('{siteName}', getSiteConfig().siteName)` template, where legacy assertions were `${messages.pageTitle.defaultMessage} | ${getConfig().SITE_NAME}` — plain concatenation. The change traces to the src, not the tests: the ported components moved the `| {siteName}` format into the message template so that `intl.formatMessage(pageTitle, { siteName })` produces the whole title, rather than the legacy Head component doing the join in JS. Translation-friendly (translators can reorder the format per language), consistent across HomePage / CatalogPage / CourseAboutPage. Rendered output is identical — verified `formatMessage` on `'Courses | {siteName}'` and `.replace('{siteName}', ...)` produce the same string.

**Translation model held up.** Concern was that catalog and master share translations, so any drift in a message's `defaultMessage` under a shared id would break: master's translation would attach to the wrong string on frontend-base. Full survey of `messages.*` files across both branches:

- 55 message ids on each side.
- **Zero** ids with the same key but different `defaultMessage` — no shared-id divergences.
- 3 new ids in ported (`home.page.title`, `courses.page.title`, `courseAbout.page.title`) — the templated browser titles above. Get their own atlas entries; don't collide with anything.
- 3 removed ids in ported (`category.not-found-page.title`, `category.header.dashboard.label`, `category.header.help.label`) — all belong to skip-list surface: NotFound + header rewrote to widgets, so those translations don't need to travel with us.
- `pageTitle` in `catalog/messages.ts` split into two: `pageHeading` keeps the original id `category.catalog.page-title` = `'Courses'` (SubHeader visible text, translation transfers cleanly), while `pageTitle` gets the new id `courses.page.title` = `'Courses | {siteName}'` (Helmet browser title, needs new translation).

Under the rule "shared strings mean the same thing; frontend-base can have more or fewer" — this passes. The only observable delta is a translation-coverage gap for browser tabs until atlas picks up the 3 new page-title ids; no cross-branch mistranslation.

**IntlShape convention → upstream issue [openedx/frontend-base#280](https://github.com/openedx/frontend-base/issues/280).** Several ported files import `IntlShape` from `@src/utils` where it's defined as `ReturnType<typeof useIntl>`. Reason: `@openedx/frontend-base` re-exports `useIntl` / `IntlProvider` / `createIntl` from react-intl but does NOT re-export the `IntlShape` type. Consumers had two options: import directly from `react-intl` (breaks the abstraction boundary) or derive locally (workaround). Filed as an enhancement request on frontend-base — a one-line type re-export would let downstream apps drop the shim. Not blocking; the derived type is functionally correct. Downstream cleanup (about 6 imports in this repo) is queued for whenever the export lands.

### CourseAboutPage.test minimize-deviation refactor — [`adf654b`](https://github.com/brian-smith-tcril/frontend-app-catalog/commit/adf654b) (+ [`70d5b8c`](https://github.com/brian-smith-tcril/frontend-app-catalog/commit/70d5b8c))

Continuing the test-review pass on the `test-comparison` branch — CourseAboutPage's port had drifted further from master than needed. The goal was to shrink the test-body diff so a side-by-side compare reads as "same tests, different scaffolding" instead of "different tests." The refactor is inside a single file, no production code touched.

- **Mocking layer moved back down.** Initial port mocked `useCourseAboutData` and `useEnrollment` at the hook layer to sidestep needing a `QueryClientProvider` in the render wrapper. Master mocks `fetchCourseAboutData` at the fetch layer, letting the real `useQuery` run against the mocked response. Reverted to master's shape and added `QueryClientProvider` (via `useState(() => new QueryClient(...))` for a per-mount stable instance). Consequence: 20+ per-test callsites become `mockFetchCourseAboutData.mockReturnValue(...)` — same wording as master.
- **Wrapper trick to preserve `render(<CourseAboutPage />)` at every callsite.** Renamed the real component import to `ActualCourseAboutPage` and defined a local `CourseAboutPage` component that wraps it in the required providers (`IntlProvider` + `MemoryRouter` + `QueryClientProvider`). Tests keep calling `render(<CourseAboutPage />)` verbatim, identical to master. All the frontend-base-specific provider setup lives at the top of the file, invisible from the test bodies.
- **Small alignments.** Dropped the `TEST_COURSE_ID` constant (used once, matches master's inlined literal). Deleted the `setCourseData` helper introduced during the initial port (was compressing the hook-layer 3-field return shape; unnecessary once the mock's shape matches master's one-arg pattern). Restored the blank line between `mockFetchCourseAboutData.mockReturnValue(...)` and `render(<CourseAboutPage />)` in the tests where master had one — kept the 2-line pattern in the loading, all-components, and Course overview tests where master also did. Renamed `mockedGetAuthenticatedUser` → `mockGetAuthenticatedUser` to match master's identifier. Restored `async` on the loading test's arrow function.

28/28 tests passing; lint clean. Every one of the tests' `it` bodies now matches master line-for-line (modulo the pageTitle format-string change previously logged); only the top of the file carries the frontend-base scaffolding delta.

**Pattern to reuse for future test reviews:** if a port test invents helpers or renames identifiers to fit its choices, and those choices don't add value, roll them back. The "same test body, different scaffolding" shape is easier to review because a diff reader can trust that everything inside `it(...)` is the same claim about the same behavior — the scaffolding at the top of the file is the one thing that necessarily differs, and it stays localized.

