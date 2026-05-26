# Migration Plan: frontend-app-catalog → frontend-base

Tracking issue: [openedx/frontend-app-catalog#123](https://github.com/openedx/frontend-app-catalog/issues/123)

Upstream guide: [frontend-base/docs/how_tos/migrate-frontend-app.md](https://github.com/openedx/frontend-base/blob/main/docs/how_tos/migrate-frontend-app.md)

Reference migrations (already merged on the equivalent `frontend-base` branches):
- [openedx/frontend-app-authn @ `frontend-base`](https://github.com/openedx/frontend-app-authn/tree/frontend-base) — initial migration commit [`8f8531a`](https://github.com/openedx/frontend-app-authn/commit/8f8531a) (`refactor: migrate to frontend-base`)
- [openedx/frontend-app-learner-dashboard @ `frontend-base`](https://github.com/openedx/frontend-app-learner-dashboard/tree/frontend-base) — initial migration commit [`89559a4`](https://github.com/openedx/frontend-app-learner-dashboard/commit/89559a4) (251 files changed)

Where the upstream guide and reference repos disagree, the reference repos win — the guide hasn't caught up to several patterns. Notable specifics distilled from those two repos are inlined into the relevant phases below; cross-references like (ref: authn `provides.ts`) point at concrete files to copy from.

All work lands on a long-lived `frontend-base` branch off `master`. Each phase below should map to one (or a small number of) commits so the branch history reads as a migration log.

---

## Repo state at migration start

Baseline: `master` @ `57259f5` (2026-05-26).

- **139** `@edx/frontend-platform` import sites
- **16** plugin-slot folders under `src/plugin-slots/` exposing **21+** slot IDs (`org.openedx.frontend.catalog.*`)
- **19** distinct `process.env` config variables (used at runtime + in tests)
- **6** SCSS files (only `src/index.scss` imports anything external — header/footer dist styles)
- **43** test files; custom render wrapper in `src/setupTest.tsx`
- **4** SVG imports — all already plain string imports (no `ReactComponent as` to migrate)
- **0** uses of: `redux`, `pubsub-js`, `@edx/reactifex`, `husky` (`glob` is in `devDependencies` only)
- Header: `@edx/frontend-component-header` imported directly in `src/header/CatalogHeader.tsx`
- Footer: `@edx/frontend-component-footer`'s `FooterSlot` used directly in `src/App.tsx`
- `src/i18n/index.ts` is an intentional empty placeholder; `make pull_translations` populates `src/i18n/messages/` via atlas
- Existing `src/plugin-slots/FooterSlot/` is **documentation-only** (README + images, no code) — added 2026-05-26
- All existing `defineMessages` entries already include `description` fields (sampled `catalog/`, `home/`, `not-found-page/`)

## Open decisions

Resolve before / during the relevant phase:

1. **App `appId`** — likely `"catalog"` (matches `.env`'s `APP_ID=catalog`). Used in `<CurrentAppProvider appId={appId}>` and route IDs. Reference repos use namespaced IDs for routes/slots (e.g., `org.openedx.frontend.app.learnerDashboard.header`); pick `org.openedx.frontend.app.catalog` as the namespace.
2. **Dev port** — `.env.development` had `PORT=1998`. Reuse. (For comparison: authn=1999, learner-dashboard=1996.)
3. **Header strategy** — decided: follow the **learner-dashboard widget pattern** (ref: `src/widgets/LearnerDashboardHeader/app.tsx`). Build `src/widgets/CatalogHeader/` as a sub-app with its own `app.tsx` exporting `SlotOperation[]`. This is **not** a simple slot override — it's a separate `App` registration that injects widgets into shell header slots. See Phase 5 for the pattern.
4. **Footer strategy** — `FooterSlot` from `@edx/frontend-component-footer` is dropped. Use the shell's default footer. The recently-added `src/plugin-slots/FooterSlot/README.md` documents downstream extension; move the README into `docs/` so downstreams can still reference it.
5. **What is published to npm** — package name becomes `@openedx/frontend-app-catalog`. The `exports` map gates the public API; reference repos only export `<appId>App` and `<appId>Routes` from `src/index.ts` (everything else is internal). Version: `0.0.0-dev` until semantic-release publishes the first real version.
6. **Translations** — keep `pull_translations` and `extract_translations` Makefile targets as thin wrappers over `npm run translations:pull` / `npm run i18n_extract` (ref: learner-dashboard `Makefile`).
7. **`@src` path alias** — already configured. Preserve via `tsc-alias` in the build step.
8. **`provides` vs `providers`** — these are **two distinct optional `App` config keys**, not alternatives:
   - `provides` (ref: authn `src/provides.ts`) — object mapping `provides` IDs to values; used to register chromeless roles via `providesChromelessRolesId`. Catalog **does not need this** (no chromeless flows).
   - `providers` (ref: learner-dashboard `src/providers.ts`) — array of React context provider components wrapping the app. Catalog **probably does not need this** (no global contexts beyond the shell-provided ones; React Query client is shell-provided).
   - Default: omit both files unless a need surfaces.
9. **Plugin-slot API migration** — **do as part of this migration**. Both reference repos migrated to `Slot` from `@openedx/frontend-base`; neither carries `@openedx/frontend-plugin-framework`. ID convention is `org.openedx.frontend.slot.<appCamelCase>.<slotName>.v1`. See Phase 8.

---

## Phase 0 — Branch and baseline

**Goal:** clean working branch with no functional changes.

- `git checkout -b frontend-base` off `master`.
- Verify `npm ci && npm run lint && npm test && npm run build` all pass on master before starting. (Establishes the "known good" baseline; any breakage in later phases is on the migration, not pre-existing.)
- Commit: nothing yet — this phase is just setup.

---

## Phase 1 — Dependency overhaul

**Goal:** `package.json` swapped to frontend-base topology. App will not build yet.

Files: `package.json`, `package-lock.json` (regenerated), `node_modules/` (wiped).

Steps:

1. Uninstall:
   - `@edx/frontend-platform`
   - `@edx/frontend-component-header`
   - `@edx/frontend-component-footer`
   - `@openedx/frontend-plugin-framework` (replaced by `Slot` from `@openedx/frontend-base` in Phase 8)
   - `@openedx/frontend-build`
   - `@edx/typescript-config`
   - `@edx/stylelint-config-edx`
   - `glob` (unused in src)
   - `ts-node` (unused after webpack removal — verify)
2. **Keep** (verified against both reference repos' `package.json`):
   - `@edx/browserslist-config` in `devDependencies`; `browserslist` field stays in `package.json` (both reference repos still have it)
   - `@edx/openedx-atlas` in `dependencies` (still used by `openedx translations:pull`)
   - `@edx/brand` (alias for `@openedx/brand-openedx`) — keep for now; brand still consumed by shell
3. Move to `peerDependencies` (note `@types/react*` peers per learner-dashboard):
   ```json
   "peerDependencies": {
     "@openedx/frontend-base": "^1.0.0-alpha || 0.0.0-dev",
     "@openedx/paragon": "^23",
     "@tanstack/react-query": "^5",
     "@types/react": "^18",
     "@types/react-dom": "^18",
     "react": "^18",
     "react-dom": "^18",
     "react-router": "^6",
     "react-router-dom": "^6"
   }
   ```
   Note: `^1.0.0-alpha || 0.0.0-dev` — frontend-base is still in alpha; `^1.0.0` would not resolve.
4. Add dev deps: `tsc-alias`, `nodemon`, `turbo`, `@testing-library/jest-dom`, `@types/jest`, `jest-environment-jsdom` (learner-dashboard's set; trim to what catalog tests actually need).
5. Update top-level metadata:
   - `"name": "@openedx/frontend-app-catalog"`
   - `"version": "0.0.0-dev"` (semantic-release will publish from here; matches both reference repos)
   - `"author": "Open edX"`
   - `"sideEffects": ["*.css", "*.scss"]`
   - `"files": ["/dist"]`
   - `"exports": { ".": "./dist/index.js" }`
   - `"workspaces": ["packages/*"]`
6. Replace `scripts` block to match reference repos:
   ```json
   "scripts": {
     "build": "make build",
     "build:ci": "make build-ci",
     "build:packages": "make build-packages",
     "clean": "make clean",
     "clean:packages": "make clean-packages",
     "dev": "PORT=1998 PUBLIC_PATH=/catalog openedx dev",
     "dev:site": "make dev-site",
     "dev:packages": "make dev-packages",
     "i18n_extract": "openedx formatjs extract",
     "lint": "openedx lint .",
     "lint:fix": "openedx lint --fix .",
     "prepack": "npm run clean && npm run build",
     "test": "openedx test --coverage --passWithNoTests",
     "translations:pull": "openedx translations:pull",
     "watch:build": "nodemon --exec 'npm run build'"
   }
   ```
7. Add `atlasTranslations` block:
   ```json
   "atlasTranslations": {
     "path": "translations/frontend-app-catalog/src/i18n/messages",
     "dependencies": ["@openedx/frontend-base"]
   }
   ```
8. `rm -rf node_modules package-lock.json && npm install`.

**Verification:** `npm install` completes. Nothing else expected to work yet.

**Commit:** `chore: swap dependencies for frontend-base migration`

---

## Phase 2 — Build / TS / Lint / Jest / Babel config

**Goal:** new toolchain configs in place. Type-check will still fail until imports are migrated, but configs themselves should be valid.

Create / replace (snippets copied verbatim from learner-dashboard unless noted):

- `Makefile` — full content (ref: learner-dashboard `Makefile`):
  ```makefile
  TURBO = TURBO_TELEMETRY_DISABLED=1 turbo --dangerously-disable-package-manager-check
  NPM_TESTS=build i18n_extract lint test

  .PHONY: test
  test: $(addprefix test.npm.,$(NPM_TESTS))
  test.npm.%: validate-no-uncommitted-package-lock-changes
  	test -d node_modules || $(MAKE) requirements
  	npm run $(*)

  requirements:
  	npm ci

  turbo.json: turbo.site.json
  	cp $< $@

  bin-link:
  	[ -f packages/frontend-base/package.json ] && npm rebuild --ignore-scripts @openedx/frontend-base || true

  build-packages: turbo.json
  	$(TURBO) run build; rm -f turbo.json
  	$(MAKE) bin-link
  clean-packages: turbo.json
  	$(TURBO) run clean; rm -f turbo.json
  dev-packages: turbo.json
  	$(TURBO) run watch:build dev:site; rm -f turbo.json
  dev-site: bin-link
  	npm run dev

  clean:
  	rm -rf dist
  build:
  	tsc --project tsconfig.build.json
  	find src -type f \( -name '*.scss' -o \( \( -name '*.png' -o -name '*.svg' \) -path '*/assets/*' \) \) -exec sh -c '\
  	  for f in "$$@"; do \
  	    d="dist/$${f#src/}"; \
  	    mkdir -p "$$(dirname "$$d")"; \
  	    cp "$$f" "$$d"; \
  	  done' sh {} +
  	tsc-alias -p tsconfig.build.json
  build-ci:
  	SITE_CONFIG_PATH=site.config.ci.tsx openedx build

  i18n.extract:
  	npm run-script i18n_extract
  extract_translations: | requirements i18n.extract
  pull_translations: | requirements
  	npm run translations:pull -- --atlas-options="$(ATLAS_OPTIONS)"

  validate-no-uncommitted-package-lock-changes:
  	git diff --exit-code package-lock.json
  ```
  Order matters in the `build` target: `tsc` first, then asset copy, then `tsc-alias` (which rewrites the already-compiled `@src` paths). Drop legacy `i18n.concat` / `detect_changed_source_translations` — neither reference repo carries them forward.
- `turbo.site.json` and `nodemon.json` — copy from learner-dashboard verbatim. The naming `turbo.site.json` (renamed by the Makefile into `turbo.json`) avoids turbo v2 root-task validation when this repo is consumed as a workspace package by a site repo.
- `tsconfig.json` — extends `@openedx/frontend-base/tools/tsconfig.json`; keep the `@src/*` path alias.
- `tsconfig.build.json` — new file, excludes tests, sets `rootDir: src`.
- `app.d.ts` — copy from learner-dashboard exactly:
  ```ts
  /// <reference types="@openedx/frontend-base" />

  declare module 'site.config' {
    export default SiteConfig;
  }

  declare module '*.svg' {
    const content: string;
    export default content;
  }
  ```
  Then delete `src/custom.d.ts` and `src/global.d.ts` (both ~empty in this repo; verify before deleting).
- `jest.config.js` (rename from `jest.config.ts` — frontend-base ships a CJS factory):
  ```js
  const { createConfig } = require('@openedx/frontend-base/tools');
  module.exports = createConfig('test', {
    setupFilesAfterEnv: ['<rootDir>/src/setupTest.tsx'],
    coveragePathIgnorePatterns: ['src/setupTest.tsx', 'src/i18n', 'src/__mocks__'],
    moduleNameMapper: {
      '\\.svg$': '<rootDir>/src/__mocks__/svg.js',
      '\\.(jpg|jpeg|png|gif|eot|otf|webp|ttf|woff|woff2|mp4|webm|wav|mp3|m4a|aac|oga)$':
        '<rootDir>/src/__mocks__/file.js',
    },
  });
  ```
  Note: `@src` alias is *not* in `moduleNameMapper` — the frontend-base preset reads it from `tsconfig.json` automatically.
- `src/__mocks__/svg.js` → `module.exports = 'SvgURL';`
- `src/__mocks__/file.js` → `module.exports = 'FileMock';`
- `babel.config.js` — two lines:
  ```js
  const { createConfig } = require('@openedx/frontend-base/tools');
  module.exports = createConfig('babel');
  ```
- `eslint.config.js` — flat config, mirror learner-dashboard's ignores:
  ```js
  const { createLintConfig } = require('@openedx/frontend-base/tools');
  module.exports = createLintConfig(
    { files: ['src/**/*', 'site.config.*'] },
    { ignores: ['coverage/*', 'dist/*', 'docs/*', 'node_modules/*', '**/__mocks__/*', '**/__snapshots__/*'] },
  );
  ```
  Drop the existing `.eslintrc.js` rule relaxations on the first pass; if `npm run lint` floods with errors, re-introduce them as a follow-up override block. Most relaxations there target patterns that won't survive Phase 6 anyway.
- `.releaserc` — copy from learner-dashboard (semantic-release config; arrives in Phase 11 if not now).
- `public/index.html` — strip down to bare `<div id="root"></div>` shell; the dev server's shell provides the rest. Both reference repos have a minimal index.html.

Delete: `.eslintrc.js`, `.eslintignore`, `webpack.dev.config.js`, `.stylelintrc*`, `src/custom.d.ts`, `src/global.d.ts`.

**Verification:** `npm run lint` and `npm run build` will fail (imports not yet migrated). But: `node -e "require('./jest.config.js')"` and similar should not throw.

**Commit:** `chore: replace build toolchain configs with frontend-base equivalents`

---

## Phase 3 — site.config files and .env removal

**Goal:** runtime/test/CI configs declared. `.env*` files deleted.

Translate every variable in `.env`, `.env.development`, `.env.test` into the right home:

| Old env var | New home |
|---|---|
| `BASE_URL`, `LMS_BASE_URL`, `LOGIN_URL`, `LOGOUT_URL` | required `SiteConfig` fields |
| `ACCESS_TOKEN_COOKIE_NAME`, `LANGUAGE_PREFERENCE_COOKIE_NAME`, `USER_INFO_COOKIE_NAME`, `CSRF_TOKEN_API_PATH`, `REFRESH_ACCESS_TOKEN_ENDPOINT` | optional `SiteConfig` fields |
| `SITE_NAME` | `siteName` |
| `SEGMENT_KEY` | `segmentKey` |
| `STUDIO_BASE_URL`, `ECOMMERCE_BASE_URL`, `CREDENTIALS_BASE_URL`, `LEARNING_BASE_URL`, `MARKETING_SITE_BASE_URL`, `ORDER_HISTORY_URL` | route role config in `app.routes` (`getUrlForRouteRole`) OR `app.config` if not URL-shaped |
| `SUPPORT_URL`, `INFO_EMAIL`, `COURSE_ABOUT_TWITTER_ACCOUNT` | `app.config` (custom variables) |
| `HOMEPAGE_PROMO_VIDEO_YOUTUBE_ID`, `HOMEPAGE_COURSE_MAX`, `NON_BROWSABLE_COURSES`, `ENABLE_COURSE_SORTING_BY_START_DATE`, `ENABLE_PROGRAMS`, `ENABLE_COURSE_DISCOVERY` | `app.config` |
| `LOGO_URL`, `LOGO_TRADEMARK_URL`, `LOGO_WHITE_URL`, `FAVICON_URL` | shell-managed; remove |
| `APP_ID` | `app.appId` constant in `src/constants.ts` |
| `MFE_CONFIG_API_URL` | drop (shell handles runtime config) |
| `PARAGON_THEME_URLS` | shell-managed; remove |
| `NODE_ENV` | derived; remove |

Create:

- **`site.config.dev.tsx`** — pattern from learner-dashboard:
  ```tsx
  import { EnvironmentTypes, SiteConfig, footerApp, headerApp, shellApp } from '@openedx/frontend-base';
  import { catalogApp } from './src';
  import '@openedx/frontend-base/shell/style';

  const siteConfig: SiteConfig = {
    siteId: 'catalog-dev',
    siteName: 'Catalog Dev',
    baseUrl: 'http://apps.local.openedx.io:1998',
    lmsBaseUrl: 'http://local.openedx.io:8000',
    loginUrl: 'http://local.openedx.io:8000/login',
    logoutUrl: 'http://local.openedx.io:8000/logout',
    environment: EnvironmentTypes.DEVELOPMENT,
    apps: [shellApp, headerApp, footerApp, catalogApp],
    externalRoutes: [
      // Map old URL env vars to role-based routes:
      { role: 'org.openedx.frontend.role.profile', url: '…' },
      { role: 'org.openedx.frontend.role.account', url: '…' },
      // etc.
    ],
    accessTokenCookieName: 'edx-jwt-cookie-header-payload',
  };
  export default siteConfig;
  ```
  Critical points: `apps:` registers the shell, header, and footer apps **alongside** the catalog app — not just the catalog. External URLs (STUDIO_BASE_URL, ECOMMERCE_BASE_URL, etc. that point at other MFEs) become `externalRoutes` entries keyed by role ID, not free-form config.

- **`site.config.test.tsx`** — pattern from learner-dashboard:
  ```tsx
  import type { SiteConfig } from '@openedx/frontend-base';
  import { appId } from './src/constants';

  const siteConfig: SiteConfig = {
    siteId: 'catalog-test-site',
    siteName: 'Catalog Test Site',
    baseUrl: 'http://localhost:1998',
    lmsBaseUrl: 'http://localhost:8000',
    loginUrl: 'http://localhost:8000/login',
    logoutUrl: 'http://localhost:8000/logout',
    // Use literal 'test', not EnvironmentTypes.TEST — breaks a circular
    // dependency when tests mock @openedx/frontend-base itself.
    environment: 'test' as SiteConfig['environment'],
    apps: [{
      appId,
      config: {
        // Inline the test values from old .env.test:
        SITE_NAME: 'Catalog Test Site',
        ENABLE_PROGRAMS: true,
        ENABLE_COURSE_DISCOVERY: true,
        SUPPORT_URL: 'https://support.example.com',
        INFO_EMAIL: 'support@example.com',
        COURSE_ABOUT_TWITTER_ACCOUNT: '@example',
        HOMEPAGE_PROMO_VIDEO_YOUTUBE_ID: 'test-youtube-id',
        // ...
      },
    }],
    accessTokenCookieName: 'edx-jwt-cookie-header-payload',
    segmentKey: '',
  };
  export default siteConfig;
  ```
  Note: `apps: [{ appId, config: {…} }]` — the test config registers only the catalog app (shell/header/footer aren't needed for unit tests) and inlines its config. The literal `'test'` string for `environment` is a deliberate workaround for the circular-mock issue (ref: learner-dashboard comment line 13).

- **`site.config.ci.tsx`** — real apps import, environment `PRODUCTION`, minimal config:
  ```tsx
  import { EnvironmentTypes, SiteConfig, footerApp, headerApp, shellApp } from '@openedx/frontend-base';
  import { catalogApp } from './src';

  const siteConfig: SiteConfig = {
    siteId: 'catalog-ci', siteName: 'Catalog CI',
    baseUrl: 'http://localhost:8080', lmsBaseUrl: 'http://localhost:18000',
    loginUrl: 'http://localhost:18000/login', logoutUrl: 'http://localhost:18000/logout',
    environment: EnvironmentTypes.PRODUCTION,
    apps: [shellApp, headerApp, footerApp, catalogApp],
  };
  export default siteConfig;
  ```

Delete: `.env`, `.env.development`, `.env.test`.

**Verification:** Tests will be massively broken at this point (Phase 7 fixes them). Don't run `npm test` here.

**Commit:** `feat: add site.config files; remove .env`

---

## Phase 4 — `src/` skeleton restructure

**Goal:** the standard frontend-base file layout, with old files still importable through compatibility shims if needed.

Renames / splits:

- `src/index.tsx` (current bootstrap) → split into:
  - **`src/Main.tsx`** — MUST wrap in `<CurrentAppProvider appId={appId}>`. Pattern (ref: authn `src/Main.tsx`):
    ```tsx
    import { Outlet } from 'react-router-dom';
    import { CurrentAppProvider } from '@openedx/frontend-base';
    import { appId } from './constants';
    import './style.scss';

    const Main = () => (
      <CurrentAppProvider appId={appId}>
        <Outlet />
      </CurrentAppProvider>
    );
    export default Main;
    ```
    The shell provides `IntlProvider`, `QueryClientProvider`, router, etc. — `Main` does *not* re-supply them. No `initialize()` / `subscribe()` calls. If a page-level `<Helmet>` title is needed, add it here (ref: learner-dashboard `Main.jsx`).
  - **`src/index.ts`** — namespaced public API only (ref: authn/learner-dashboard `index.ts`):
    ```ts
    export { default as catalogApp } from './app';
    export { default as catalogRoutes } from './routes';
    ```
    `Main`, `providers`, `constants`, `slots` stay internal — they are not part of the public API. `site.config.dev.tsx` and `site.config.ci.tsx` import `catalogApp` from `./src`.
- `src/App.tsx` and `src/App.test.tsx` — delete. Responsibilities move to `Main.tsx` + `app.ts` + shell.
- `src/routes.ts` → **`src/routes.tsx`** — convert `ROUTES` into a frontend-base `Route[]` array using `lazy()` for code-splitting (ref: learner-dashboard `routes.jsx`):
  ```tsx
  const routes = [
    {
      id: 'org.openedx.frontend.route.catalog.main',
      path: '/catalog',
      handle: { roles: [/* catalogRole, homeRole, etc. */] },  // roles is an array
      async lazy() {
        const module = await import(/* webpackChunkName: "catalog-main" */ './Main');
        return { Component: module.default };
      },
      children: [
        // Child routes for /, /courses, /courses/:courseId/about, *
        // Each with `element: <PageComponent />` and (optional) handle.roles
      ],
    },
  ];
  export default routes;
  ```
  The webpack chunk name (`catalog-main`) matters for build output legibility — both reference repos do this. Keep `ROUTES` const exported alongside *if* anything else in `src/` still imports it (verify with grep first).
- `src/constants.ts` — add `export const appId = 'org.openedx.frontend.app.catalog';` plus any role IDs you'll reference (`export const catalogRole = 'org.openedx.frontend.role.catalog';` etc.). Keep existing constants (`IFRAME_FEATURE_POLICY`, `VIDEO_MODAL`, `DATE_FORMAT_OPTIONS`).
- **`src/app.ts`** — new file (ref: learner-dashboard `app.ts`):
  ```ts
  import { App } from '@openedx/frontend-base';
  import { appId } from './constants';
  import routes from './routes';

  const app: App = {
    appId,
    routes,
    config: {
      ENABLE_PROGRAMS: false,
      ENABLE_COURSE_DISCOVERY: false,
      HOMEPAGE_PROMO_VIDEO_YOUTUBE_ID: '',
      HOMEPAGE_COURSE_MAX: 0,
      NON_BROWSABLE_COURSES: '',
      ENABLE_COURSE_SORTING_BY_START_DATE: false,
      SUPPORT_URL: '',
      INFO_EMAIL: '',
      COURSE_ABOUT_TWITTER_ACCOUNT: '',
      // Note: LMS_BASE_URL / STUDIO_BASE_URL etc. that point at other MFEs
      // belong in site.config externalRoutes, NOT here.
    },
  };
  export default app;
  ```
  `providers`, `provides`, and `slots` keys are *optional* and added later. Phase 5 will add `slots` if catalog ends up with a header widget (likely yes).
- **`src/providers.ts`** — omit unless/until a global context is needed (see decision #8).
- **`src/slots.tsx`** — created in Phase 5 alongside the header widget. Skip in this phase.
- `src/plugin-slots/` → `src/slots/` — folder rename only in this phase. **`PluginSlot` → `Slot` rewrite happens in Phase 8** (kept as a separate commit so the diff stays readable).
- `src/index.scss` → `src/style.scss` — rename. Drop the `~@edx/frontend-component-{header,footer}/dist/*` imports (those dist styles no longer exist). The `style.scss` is imported by `Main.tsx`.
- `src/setupTest.tsx` — leave for Phase 7 (different commit).

**Verification:** `npm run build` and `npm test` still broken — by design.

**Commit:** `refactor: restructure src/ to frontend-base layout`

---

## Phase 5 — Header and Footer migration

**Goal:** custom header menu items injected into the shell's header slots via a widget sub-app. Footer falls back to the shell default.

The shell renders its own header and footer; apps customize them by registering `SlotOperation[]` that inject widgets into specific shell slots. This is **not** a slot override — the shell's header stays intact, and the catalog widgets append/insert into it.

### 5a. Create the header widget sub-app

New directory: `src/widgets/CatalogHeader/` (ref: learner-dashboard `src/widgets/LearnerDashboardHeader/`).

Files:

- `src/widgets/CatalogHeader/app.tsx` — registers slot operations. Pattern:
  ```tsx
  import { App, LinkMenuItem, WidgetOperationTypes, getAppConfig } from '@openedx/frontend-base';
  import { appId, catalogRole } from '../../constants';
  import CoursesLink from './CoursesLink';
  import ProgramsLinkMenuItem from './ProgramsLinkMenuItem';
  import DiscoverLinkMenuItem from './DiscoverLinkMenuItem';

  const app: App = {
    appId: 'org.openedx.frontend.app.catalog.header',
    slots: [
      {
        slotId: 'org.openedx.frontend.slot.header.primaryLinks.v1',
        id: 'org.openedx.frontend.widget.catalog.headerLinkCourses.v1',
        op: WidgetOperationTypes.APPEND,
        element: <LinkMenuItem label={<CoursesLink />} role={catalogRole} variant="navLink" />,
        condition: { active: [catalogRole] },
      },
      {
        slotId: 'org.openedx.frontend.slot.header.primaryLinks.v1',
        id: 'org.openedx.frontend.widget.catalog.headerLinkPrograms.v1',
        op: WidgetOperationTypes.APPEND,
        element: <ProgramsLinkMenuItem variant="navLink" />,
        condition: {
          active: [catalogRole],
          callback: () => getAppConfig(appId).ENABLE_PROGRAMS === true,
        },
      },
      // etc — each existing menu item from useMenuItems becomes one SlotOperation
    ],
  };
  export default app;
  ```
- `src/widgets/CatalogHeader/index.ts` → `export { default as catalogHeaderApp } from './app';`
- One JSX/TSX file per menu item being injected (CoursesLink, ProgramsLinkMenuItem, DiscoverLinkMenuItem, etc.). Port from the current `src/header/hooks/useMenuItems.ts` logic — each menu item becomes a small component.

Shell slot IDs (verified against learner-dashboard's working code):
- `org.openedx.frontend.slot.header.main.v1` — top-of-header (banners like ConfirmEmailBanner)
- `org.openedx.frontend.slot.header.primaryLinks.v1` — main nav items (Courses, Programs, Discover, …)
- `org.openedx.frontend.slot.header.authenticatedMenu.v1` — user-menu dropdown (Order History etc., gated with `WidgetOperationTypes.INSERT_BEFORE` + `relatedId: 'org.openedx.frontend.widget.header.desktopAuthenticatedMenuLogout.v1'`)

The `condition.active: [catalogRole]` guard ensures these widgets only show when the catalog route is active — without it, they leak into other apps' headers when this package is bundled into a multi-app site.

### 5b. Wire it into the catalog app

New file: `src/slots.tsx`:
```tsx
import { SlotOperation } from '@openedx/frontend-base';
import { catalogHeaderApp } from './widgets/CatalogHeader';

const slots: SlotOperation[] = [
  ...(catalogHeaderApp.slots as []),
];
export default slots;
```

Update `src/app.ts` to add `slots`:
```ts
import slots from './slots';
const app: App = { appId, routes, slots, config: { … } };
```

### 5c. Routes must declare the role

`src/routes.tsx` `handle.roles` must include `catalogRole` so the `condition.active` checks resolve true on catalog pages (ref: learner-dashboard commit `a1bc6483` "fix: fix the header" — same bug, same fix).

### 5d. Delete the old header

- Delete `src/header/CatalogHeader.tsx`, `src/header/CatalogHeader.test.tsx`, `src/header/hooks/useMenuItems.ts`, `src/header/hooks/useMenuItems.test.ts`, `src/header/types.ts` once the widget components carry the equivalent logic.
- Keep `src/header/messages.ts` if menu-item labels still live there; otherwise fold the messages into `src/widgets/CatalogHeader/messages.js` (learner-dashboard pattern is one `messages.js` per widget folder).

### 5e. Footer

- Delete `src/plugin-slots/FooterSlot/` (was always docs-only). Move its README to `docs/customize-footer.md` so downstreams can still find the swap instructions.
- No widget needed — the shell renders the default footer.

**Verification:** Manual — `npm run dev`, confirm the catalog routes show the shell header with Courses/Programs/Discover menu items, and that those items disappear on non-catalog routes.

**Reference commits worth reading:**
- learner-dashboard [`a1bc6483`](https://github.com/openedx/frontend-app-learner-dashboard/commit/a1bc6483) — `fix: fix the header` (caught the `handle.roles` array issue)
- learner-dashboard [`3c2ccdc8`](https://github.com/openedx/frontend-app-learner-dashboard/commit/3c2ccdc8) — `fix: scope header slot widgets to dashboard role` (added the `condition.active` guard)

**Commit:** `feat: port CatalogHeader to frontend-base shell slots; remove component-header/footer`

---

## Phase 6 — Migrate `@edx/frontend-platform` imports

**Goal:** zero `@edx/frontend-platform` imports remain.

Find/replace across the 139 import sites. Group by target:

| Old import | New |
|---|---|
| `import { useIntl, defineMessages, FormattedMessage, IntlShape, createIntl, IntlProvider } from '@edx/frontend-platform/i18n'` | `from '@openedx/frontend-base'` |
| `import { AppProvider, ErrorPage } from '@edx/frontend-platform/react'` | drop `AppProvider`; `ErrorPage` from `@openedx/frontend-base` |
| `import { getAuthenticatedHttpClient, getAuthenticatedUser } from '@edx/frontend-platform/auth'` | `from '@openedx/frontend-base'` |
| `import { getConfig } from '@edx/frontend-platform/config'` | replace each call with `getSiteConfig()` or `getAppConfig('catalog')` depending on which side the value lives on (Phase 3 table). |
| `import { logError } from '@edx/frontend-platform/logging'` | `from '@openedx/frontend-base'` |
| `import { camelCaseObject } from '@edx/frontend-platform'` | `from '@openedx/frontend-base'` |
| `import { APP_INIT_ERROR, APP_READY, subscribe, initialize } from '@edx/frontend-platform'` | delete (initialization moves to shell) |

Hot spots (file count and what they call):
- `src/App.tsx` — deleted Phase 4.
- `src/index.tsx` — deleted/recreated Phase 4 (becomes `src/index.ts`).
- `src/setupTest.tsx` — rewritten Phase 7.
- 9 files call `useIntl` / `defineMessages` — pure mechanical rewrite.
- 9 files call `getConfig()` — each needs a decision: site-level vs app-level. Refer to Phase 3 table.
- `src/data/course-list-search/api.ts` — `getAuthenticatedHttpClient`, `camelCaseObject` — mechanical.
- `src/data/course-list-search/urls.ts` — `getConfig().LMS_BASE_URL` → `getSiteConfig().lmsBaseUrl`.

**Verification:** `git grep '@edx/frontend-platform'` returns nothing. `npm run build:ci` should now at least make it past module resolution.

**Commit:** `refactor: replace @edx/frontend-platform imports with @openedx/frontend-base`

---

## Phase 7 — Tests

**Goal:** test suite green.

### 7a. Rewrite `src/setupTest.tsx`

Replace the existing custom-render wrapper with the reference-repo pattern (ref: learner-dashboard `src/setupTest.jsx` verbatim):

```tsx
import '@testing-library/jest-dom';
import siteConfig from 'site.config';
import {
  addAppConfigs,
  configureAnalytics, configureAuth, configureLogging,
  getSiteConfig, mergeSiteConfig,
  MockAnalyticsService, MockAuthService, MockLoggingService,
} from '@openedx/frontend-base';

mergeSiteConfig(siteConfig);
addAppConfigs();

export function initializeMockServices() {
  const loggingService = configureLogging(MockLoggingService, { config: getSiteConfig() });
  const authService = configureAuth(MockAuthService, { config: getSiteConfig(), loggingService });
  const analyticsService = configureAnalytics(MockAnalyticsService, {
    config: getSiteConfig(),
    httpClient: authService.getAuthenticatedHttpClient(),
    loggingService,
  });
  return { analyticsService, authService, loggingService };
}
```

- `mergeSiteConfig(siteConfig)` makes `getSiteConfig()` work in tests; `addAppConfigs()` populates per-app config from the `apps:` array in `site.config.test.tsx`.
- Tests that need authenticated HTTP / analytics / logging call `initializeMockServices()` in `beforeEach`.
- The existing custom render wrapper (IntlProvider + MemoryRouter + QueryClientProvider) does **not** need to be carried forward — frontend-base's test environment supplies these. If a specific test needs to override one (e.g., a fresh QueryClient per test to avoid cache leak), extract a small `renderWithProviders()` helper into `src/test-utils.tsx` and import it explicitly from the tests that need it.

### 7b. Rewrite jest mocks

Every `jest.mock('@edx/frontend-platform', …)` and `jest.mock('@edx/frontend-platform/auth', …)` becomes:

```ts
jest.mock('@openedx/frontend-base', () => ({
  ...jest.requireActual('@openedx/frontend-base'),
  getAuthenticatedHttpClient: jest.fn(),
  // ... other mocked fns
}));
```

The `...jest.requireActual(...)` spread is critical — without it, every export you didn't explicitly mock disappears, and tests fail in confusing ways. Expect ~30 of the 43 test files to need this rewrite.

### 7c. Migrate `process.env` reads in tests

Per the Phase 3 mapping table, replace each `process.env.X = …` with either:
- A field on `site.config.test.tsx`'s top-level `SiteConfig` (for site-scoped values like `LMS_BASE_URL`).
- A field on `site.config.test.tsx`'s `apps[0].config` (for app-scoped values like `ENABLE_PROGRAMS`, `INFO_EMAIL`).

For per-test overrides, use `mergeSiteConfig({ ... })` or `mergeAppConfig(appId, { ... })` in the test's `beforeEach`.

### 7d. Delete obsolete tests

- `src/App.test.tsx` — references deleted `App` component. Delete.
- `src/index.test.tsx` — references deleted `index.tsx` bootstrap. Delete.
- Replace with `src/Main.test.tsx` if a smoke test is desired (renders `<Main />` inside a `MemoryRouter`, asserts no throw).

### 7e. Mocks in `src/__mocks__/`

`course.ts`, `courseAbout.ts`, `courseListSearch.ts`, `index.ts` — data only, should not need touching. Verify with grep that none import from `@edx/frontend-platform`.

**Verification:** `npm test` passes (no `--passWithNoTests` fallback needed).

**Commit:** `test: update suite for frontend-base APIs`

---

## Phase 8 — Plugin slots → `Slot` API

**Goal:** every `<PluginSlot id="org.openedx.frontend.catalog.*">` becomes `<Slot id="org.openedx.frontend.slot.catalog.*.v1">`, with the API change and the ID rename in the same commit.

### API change

Old (`@openedx/frontend-plugin-framework`):
```tsx
<PluginSlot
  id="org.openedx.frontend.catalog.home_page.banner"
  slotOptions={{ mergeProps: true }}
  someProp={value}
>
  <DefaultBanner />
</PluginSlot>
```

New (`@openedx/frontend-base`, verified against learner-dashboard `src/slots/CourseBannerSlot/index.jsx` and authn `src/slots/LoginComponentSlot/index.jsx`):
```tsx
<Slot
  id="org.openedx.frontend.slot.catalog.homeBanner.v1"
  someProp={value}
>
  <DefaultBanner />
</Slot>
```

Differences:
- Import `Slot` from `@openedx/frontend-base` (drop `@openedx/frontend-plugin-framework` entirely — it's not in either reference repo's `package.json`).
- Drop `slotOptions={{ mergeProps: true }}` — props pass through as JSX attributes directly.
- Default children still render when nothing is plugged in: `<Slot id="…"><DefaultThing /></Slot>`. Pure extension points self-close: `<Slot id="…" />`.

### ID convention

Pattern: `org.openedx.frontend.slot.<appNameCamelCase>.<slotName>.v<n>`
- `<appNameCamelCase>`: `catalog`
- `<slotName>`: camelCase
- `v1` initially

Examples in the wild:
- learner-dashboard: `org.openedx.frontend.slot.learnerDashboard.courseCardBanner.v1`
- authn: `org.openedx.frontend.slot.authn.loginComponent.v1`

### Full ID mapping for catalog

```
# Home page
org.openedx.frontend.catalog.home_page.banner                      → org.openedx.frontend.slot.catalog.homeBanner.v1
org.openedx.frontend.catalog.home_page.promo_video_modal           → org.openedx.frontend.slot.catalog.homePromoVideoModal.v1
org.openedx.frontend.catalog.home_page.promo_video_button          → org.openedx.frontend.slot.catalog.homePromoVideoButton.v1
org.openedx.frontend.catalog.home_page.promo_video_modal_content   → org.openedx.frontend.slot.catalog.homePromoVideoModalContent.v1
org.openedx.frontend.catalog.home_page.course_card                 → org.openedx.frontend.slot.catalog.homeCourseCard.v1
org.openedx.frontend.catalog.home_page.courses_list                → org.openedx.frontend.slot.catalog.homeCoursesList.v1
org.openedx.frontend.catalog.home_page.overlay_html                → org.openedx.frontend.slot.catalog.homeOverlayHtml.v1

# Generic
org.openedx.frontend.catalog.generic.loader                        → org.openedx.frontend.slot.catalog.loader.v1

# Course catalog page
org.openedx.frontend.catalog.course_catalog_page.data_table                  → org.openedx.frontend.slot.catalog.courseCatalogDataTable.v1
org.openedx.frontend.catalog.course_catalog_page.data_table.control_bar      → org.openedx.frontend.slot.catalog.courseCatalogDataTableControlBar.v1
org.openedx.frontend.catalog.course_catalog_page.data_table.card_view        → org.openedx.frontend.slot.catalog.courseCatalogDataTableCardView.v1
org.openedx.frontend.catalog.course_catalog_page.data_table.course_card      → org.openedx.frontend.slot.catalog.courseCatalogDataTableCourseCard.v1
org.openedx.frontend.catalog.course_catalog_page.data_table.table_footer     → org.openedx.frontend.slot.catalog.courseCatalogDataTableTableFooter.v1
org.openedx.frontend.catalog.course_catalog_page.intro                       → org.openedx.frontend.slot.catalog.courseCatalogIntro.v1
org.openedx.frontend.catalog.course_catalog_page.search_field                → org.openedx.frontend.slot.catalog.courseCatalogSearchField.v1

# Course about page
org.openedx.frontend.catalog.course_about_page.intro                         → org.openedx.frontend.slot.catalog.courseAboutIntro.v1
org.openedx.frontend.catalog.course_about_page.enrollment_button             → org.openedx.frontend.slot.catalog.courseAboutEnrollmentButton.v1
org.openedx.frontend.catalog.course_about_page.course_image                  → org.openedx.frontend.slot.catalog.courseAboutCourseImage.v1
org.openedx.frontend.catalog.course_about_page.course_media                  → org.openedx.frontend.slot.catalog.courseAboutCourseMedia.v1
org.openedx.frontend.catalog.course_about_page.sidebar                       → org.openedx.frontend.slot.catalog.courseAboutSidebar.v1
org.openedx.frontend.catalog.course_about_page.sidebar.course_price          → org.openedx.frontend.slot.catalog.courseAboutSidebarCoursePrice.v1
org.openedx.frontend.catalog.course_about_page.sidebar.social                → org.openedx.frontend.slot.catalog.courseAboutSidebarSocial.v1
org.openedx.frontend.catalog.course_about_page.overview                      → org.openedx.frontend.slot.catalog.courseAboutOverview.v1
org.openedx.frontend.catalog.course_about_page.intro_video_modal             → org.openedx.frontend.slot.catalog.courseAboutIntroVideoModal.v1
org.openedx.frontend.catalog.course_about_page.intro_video_button            → org.openedx.frontend.slot.catalog.courseAboutIntroVideoButton.v1
org.openedx.frontend.catalog.course_about_page.intro_video_modal_content     → org.openedx.frontend.slot.catalog.courseAboutIntroVideoModalContent.v1
```

(Cross-check the final names against slot IDs already exposed by `@openedx/frontend-base/shell` to avoid collisions.)

### Mechanical steps

For each of the 16 folders under `src/slots/` (renamed in Phase 4):

1. Replace `import { PluginSlot } from '@openedx/frontend-plugin-framework'` with `import { Slot } from '@openedx/frontend-base'`.
2. Rewrite `<PluginSlot id="OLD" slotOptions={{ mergeProps: true }} {...props}>` to `<Slot id="NEW" {...props}>` per the table.
3. Compound folders (`HomePromoVideoSlots`, `CourseAboutIntroVideoSlots`, `CourseCatalogDataTableSlots`) export multiple slot components from one `index.tsx` — rewrite each.
4. Update tests that assert on slot IDs (search for `org.openedx.frontend.catalog` in test files).
5. Update any in-repo READMEs that show usage examples for plugin authors.

### Breaking change

This is a downstream-breaking change for any plugin currently targeting `org.openedx.frontend.catalog.*` slot IDs. Paste the full ID-mapping table into the commit message and PR description so downstream plugin authors can mechanically update.

**Verification:**
- `git grep '@openedx/frontend-plugin-framework'` → empty
- `git grep 'PluginSlot'` → empty
- Dev server renders homepage, catalog page, and a course-about page end-to-end

**Commit:** `refactor!: migrate plugin slots to frontend-base Slot API`

---

## Phase 9 — SCSS

**Goal:** styles work with the new shell.

- `src/style.scss` (renamed from `index.scss` in Phase 4):
  - Already had the header/footer dist `@import`s removed in Phase 4.
  - Verify no remaining `@import` of Paragon base styles (currently none — the file just pulls in animations + home + course-about).
  - Convert remaining `@import` statements to `@use` per modern Sass: `@use './assets/scss/animations'; @use './home'; @use './course-about/CourseAboutPage';`.
- For each component-level SCSS (`home/index.scss`, `home/components/home-banner/index.scss`, `course-about/CourseAboutPage.scss`, `course-about/course-intro/course-media/CourseMedia.scss`, `assets/scss/_animations.scss`):
  - If any file uses `@media (--pgn-size-breakpoint-*)`, add `@use "@openedx/paragon/styles/css/core/custom-media-breakpoints.css";` at the top. (Likely none currently — verify with grep before deciding.)

**Verification:** visual smoke test (run dev server, eyeball each page against current master).

**Commit:** `style: modernize SCSS for frontend-base`

---

## Phase 10 — i18n pipeline

**Goal:** translations flow through atlas/openedx CLI cleanly.

- `src/i18n/messages.d.ts` — new file with the `SiteMessages` type declaration.
- `src/i18n/index.ts` — keep as a re-export shim if currently used; otherwise delete.
- `src/i18n/messages.ts` — the file `make pull_translations` generates. Already in `.gitignore`; no change.
- All `defineMessages` files already have `description` fields per inventory — no work needed.
- Decide whether to keep the Makefile `pull_translations` target or rely solely on `npm run translations:pull`. Recommend keeping the make target as a wrapper so CI / external tooling keeps working.

**Verification:** `npm run i18n_extract` produces `src/i18n/transifex_input.json` without errors.

**Commit:** `i18n: align with frontend-base translation pipeline`

---

## Phase 11 — CI and workflows

**Goal:** GitHub Actions runs the new build.

- `.github/workflows/ci.yml`:
  - `npm run build` is now `make build` (via the package.json script). Should work as-is.
  - Add a new step: `- name: Build (CI)\n  run: npm run build:ci` after the build step. Catches webpack-graph issues that pure `tsc` won't find.
  - `npm run lint` — same command; new flat config means we don't need the separate `stylelint` step. Remove if it was there.
  - `npm run test` — same.
  - `npm run i18n_extract` — same (different underlying tool).
- Drop the `pinned commit SHAs` workflow guidance only if frontend-base provides its own action template; otherwise keep as-is.
- Browserslist update workflow (`update-browserslist-db.yml`) — delete; we removed browserslist config in Phase 1.

**Verification:** push the branch, watch CI.

**Commit:** `ci: update workflows for frontend-base build`

---

## Phase 12 — README and docs

**Goal:** docs reflect the new reality.

- `README.md`:
  - Replace "MFE" terminology with "frontend app".
  - Replace devstack instructions with Tutor instructions.
  - Update `dev`/`start` script names.
  - Replace `.env` setup with `site.config.dev.tsx` setup.
- `docs/decisions/` — add a new ADR (`0003-adopt-frontend-base.rst`) capturing the migration decision.
- `docs/how_tos/i18n.rst` — update the example commands and atlas flow if changed.
- This file (`docs/migrate-to-frontend-base.md`) — leave in place as historical record, or move under `docs/decisions/` once migration is complete.

**Commit:** `docs: update for frontend-base migration`

---

## Phase 13 — Final verification

Run the upstream checklist end-to-end:

- [ ] `git grep '@edx/frontend-platform'` → no results
- [ ] `git grep '@openedx/frontend-build'` → no results
- [ ] `git grep '@openedx/frontend-plugin-framework'` → no results
- [ ] `git grep '@edx/frontend-component-header'` → no results
- [ ] `git grep '@edx/frontend-component-footer'` → no results
- [ ] `git grep 'process.env'` → only matches in `site.config.*.tsx` (allowed), nowhere in `src/`
- [ ] `npm run build` produces `dist/index.js`
- [ ] `npm run build:ci` succeeds
- [ ] `npm test` passes
- [ ] `npm run lint` passes
- [ ] `npm run dev` runs standalone on port 1998; home/catalog/course-about/404 routes all render
- [ ] Integration: compose into a `frontend-template-site` checkout, build the site, hit the catalog routes.

---

## Out of scope for the migration branch

These are listed on issue #123 but happen *after* the branch lands:

- **Publish to NPM** — version bump + `npm publish` happens once the branch is merged and semantic-release is configured. Wait for the upstream maintainers to cut the first release.
- **Include in frontend-template-site** — a PR against [`frontend-template-site`](https://github.com/openedx/frontend-template-site) wiring `@openedx/frontend-app-catalog` into its `site.config.tsx`.
- **Include in tutor-mfe** — a PR against [`tutor-mfe`](https://github.com/overhangio/tutor-mfe) adding catalog to its build matrix.

---

## Estimated effort

These are rough; treat as planning hints, not commitments. Revised upward after reviewing the authn and learner-dashboard branches — their initial migration commits each touched 150–250 files, with long tails of follow-up `fix:` commits (header scope, style manifest, role wiring, i18n plumbing) that show up *after* the bulk migration lands.

| Phase | Estimate | Risk |
|---|---|---|
| 0. Branch & baseline | 10 min | low |
| 1. Dependencies | 30 min | low |
| 2. Configs | 1–2 h | low (verbatim copy from learner-dashboard for most files) |
| 3. site.config + .env | 1–2 h | med (mapping ~19 env vars to site/app/externalRoutes) |
| 4. src/ restructure | 2–3 h | med (touches every entry point + slot folder rename) |
| 5. Header/Footer widget | 4–6 h | **high** (porting `useMenuItems` to a SlotOperation[] sub-app; `condition.active` scoping bug is easy to hit) |
| 6. Migrate imports | 2–3 h | low (~139 mechanical replacements) |
| 7. Tests | 6–10 h | **high** (43 files; mock rewrites + env→config swaps + new setupTest pattern) |
| 8. Slot API | 3–4 h | med (24 IDs to rewrite; downstream-breaking — commit message matters) |
| 9. SCSS | 30 min | low |
| 10. i18n | 30 min | low |
| 11. CI | 30 min | low |
| 12. Docs | 1 h | low |
| 13. Verification | 2–4 h | discovers everything missed above + long tail of follow-up `fix:` commits |

**Total:** ~25–35 hours of focused work plus a tail of follow-ups, spread across multiple sessions. Reference repos' branches show 30–60 commits between the bulk `refactor: migrate to frontend-base` commit and the most recent state — the tail is real.

Phases 5 and 7 dominate the risk. Phases 1, 2, 6, 8 are mechanical once the patterns are settled.
