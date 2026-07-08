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

