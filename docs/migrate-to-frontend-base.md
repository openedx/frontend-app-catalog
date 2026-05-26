# Migration Plan: frontend-app-catalog → frontend-base

Tracking issue: [openedx/frontend-app-catalog#123](https://github.com/openedx/frontend-app-catalog/issues/123)

Upstream guide: [frontend-base/docs/how_tos/migrate-frontend-app.md](https://github.com/openedx/frontend-base/blob/main/docs/how_tos/migrate-frontend-app.md)

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

1. **App `appId`** — likely `"catalog"` (matches `.env`'s `APP_ID=catalog`). Confirm before writing `src/constants.ts`.
2. **Dev port** — current `dev` script uses webpack-dev-server default (PUBLIC_PATH=/catalog/). Pick a fixed port for the new `openedx dev` script. `.env.development` had `PORT=1998` — reuse that.
3. **Header strategy** — `@edx/frontend-component-header` is being deprecated in the frontend-base world. Either (a) port the menu logic in `useMenuItems` into a `CustomHeader` component plugged into a shell header slot, or (b) drop the custom header entirely and rely on the shell's default. **Recommend (a)** so `ENABLE_PROGRAMS` / `ENABLE_COURSE_DISCOVERY` menu items survive.
4. **Footer strategy** — `FooterSlot` from `@edx/frontend-component-footer` is being dropped. The recently-added `src/plugin-slots/FooterSlot/README.md` already documents this — keep the README, remove the component-footer dep, let the shell provide the footer.
5. **What is published to npm** — issue mentions "Publish to NPM". Confirm package name: `@openedx/frontend-app-catalog` (currently `@edx/frontend-app-catalog`). The exports map will gate the public API.
6. **Translations** — keep the existing `make pull_translations` flow or switch to `openedx translations:pull` (atlas package). Per guide, the new flow uses `npm run translations:pull`. Decide whether to keep the Makefile target as a thin wrapper.
7. **`@src` path alias** — already configured in `tsconfig.json`, `webpack.dev.config.js`, and `jest.config.ts`. Preserve; frontend-base's tooling supports it via `tsc-alias`.

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
   - `@openedx/frontend-plugin-framework`
   - `@openedx/frontend-build`
   - `@edx/browserslist-config` (browserslist field also goes)
   - `@edx/typescript-config`
   - `@edx/stylelint-config-edx`
   - `@edx/openedx-atlas` (if `openedx translations:pull` replaces the Makefile flow)
   - `glob` (unused in src)
   - `ts-node` (unused after webpack removal — verify)
2. Rename: `@edx/brand` (currently aliased to `@openedx/brand-openedx`) — confirm whether frontend-base shell pulls brand itself; may be removable here.
3. Move to `peerDependencies` with relaxed ranges:
   - `@openedx/paragon`: `^23`
   - `@tanstack/react-query`: `^5`
   - `react`: `^18`
   - `react-dom`: `^18`
   - `react-router`: `^6`
   - `react-router-dom`: `^6`
4. Add as peer dep: `@openedx/frontend-base: "^1.0.0 || 0.0.0-dev"`.
5. Add dev dep: `tsc-alias`.
6. Update top-level metadata:
   - `"name": "@openedx/frontend-app-catalog"`
   - `"version": "1.0.0"` (semantic-release will manage from here)
   - `"author": "Open edX"`
   - `"sideEffects": ["*.css", "*.scss"]`
   - `"files": ["/dist"]`
   - `"exports": { ".": "./dist/index.js" }`
7. Replace `scripts` block per guide (substitute `PORT=1998`, `PUBLIC_PATH=/catalog`).
8. Add `atlasTranslations` block (path: `translations/frontend-app-catalog/src/i18n/messages`, dependencies: `["@openedx/frontend-base"]`).
9. Delete `browserslist` field.
10. `rm -rf node_modules package-lock.json && npm install`.

**Verification:** `npm install` completes without unmet peer warnings beyond expected ones. Nothing else expected to work yet.

**Commit:** `chore: swap dependencies for frontend-base migration`

---

## Phase 2 — Build / TS / Lint / Jest / Babel config

**Goal:** new toolchain configs in place. Type-check will still fail until imports are migrated, but configs themselves should be valid.

Create / replace:

- `Makefile` — replace `build`/`clean`/`build-ci` per guide; **preserve** existing i18n targets (`extract_translations`, `pull_translations`, `detect_changed_source_translations`, `i18n.extract`, `i18n.concat`) — adapt the npm script they call but keep the make interface so downstream tooling doesn't break.
- `tsconfig.json` — replace, extend `@openedx/frontend-base/tools/tsconfig.json`. Keep the `@src/*` path alias.
- `tsconfig.build.json` — new file per guide (excludes tests).
- `app.d.ts` — new file with site.config + svg module declarations. Merge content from existing `src/custom.d.ts` and `src/global.d.ts` if there's anything app-specific (likely there isn't — they're brief).
- `jest.config.js` (rename from `jest.config.ts` — frontend-base ships a JS factory) — use `createConfig('test', …)`. Preserve `moduleNameMapper` for `@src`, `\\.svg$`, `\\.png$`. Update `setupFilesAfterEnv` and `coveragePathIgnorePatterns`.
- `src/__mocks__/svg.js` and `src/__mocks__/file.js` — new mock files per guide.
- `babel.config.js` — new file, two-line factory call.
- `eslint.config.js` — new flat config replacing `.eslintrc.js`. Carry forward the rule relaxations currently in `.eslintrc.js` (jsx-a11y, react-hooks/exhaustive-deps, etc.) as overrides if still desired — *or* delete them and let the standard config apply; default to keeping the relaxations to avoid a churn of lint fixes blocking this migration.
- Delete: `.eslintrc.js`, `.eslintignore`, `webpack.dev.config.js`, `.stylelintrc*` (stylelint is gone in the new toolchain).

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

- `site.config.dev.tsx` — siteId `dev`, siteName `localhost`, dev URLs, imports `@openedx/frontend-base/shell/style`, imports `app` from `./src/app`. Sets `app.config.ENABLE_PROGRAMS = true`, etc. for parity with `.env.development`.
- `site.config.test.tsx` — minimal config with all the test env-var values inlined into `app.config`.
- `site.config.ci.tsx` — real app import, minimal config.

Delete: `.env`, `.env.development`, `.env.test`.

**Verification:** Tests will be massively broken at this point (Phase 7 fixes them). Don't run `npm test` here.

**Commit:** `feat: add site.config files; remove .env`

---

## Phase 4 — `src/` skeleton restructure

**Goal:** the standard frontend-base file layout, with old files still importable through compatibility shims if needed.

Renames / splits:

- `src/index.tsx` → split into:
  - `src/Main.tsx` — the React tree (currently inside `App.tsx`'s return). Renders `<Outlet />` from react-router. Drops `AppProvider`, drops `QueryClientProvider`, drops `initialize()`/`subscribe()` calls (shell handles them).
  - `src/index.ts` — public API exports only (`export { default as Main } from './Main'; export { default as app } from './app'; export * from './constants';`).
- `src/App.tsx` — delete (its responsibilities now live in `Main.tsx` + `app.ts` + shell).
- `src/routes.ts` → `src/routes.tsx` — convert the `ROUTES` constants into the frontend-base `Route[]` array with `Component`/`element`, `id`, `handle.roles`. Keep `ROUTES` const exported for backwards compatibility within the app if other modules import it (verify with grep).
- `src/constants.ts` — add `export const appId = 'catalog';` at the top. Keep existing constants (`IFRAME_FEATURE_POLICY`, `VIDEO_MODAL`, `DATE_FORMAT_OPTIONS`).
- `src/app.ts` — new file exporting the `App` config: `appId`, `routes`, `config: { ENABLE_PROGRAMS, ENABLE_COURSE_DISCOVERY, HOMEPAGE_PROMO_VIDEO_YOUTUBE_ID, HOMEPAGE_COURSE_MAX, NON_BROWSABLE_COURSES, ENABLE_COURSE_SORTING_BY_START_DATE, SUPPORT_URL, INFO_EMAIL, COURSE_ABOUT_TWITTER_ACCOUNT, LMS_BASE_URL, STUDIO_BASE_URL, … }`, `slots: { catalogHeader: …, catalogFooter: … }` (header/footer wiring lands in Phase 5).
- `src/providers.ts` — new file (likely empty `export default {};` unless we discover a context to register).
- `src/slots.tsx` — new file declaring slots this app *consumes* from the shell (header, footer).
- `src/plugin-slots/` → `src/slots/` — rename the folder. **All slot ID strings stay untouched in this phase**; the rewrite to `Slot` component happens in Phase 8.
- `src/index.scss` → `src/style.scss` — rename. Remove the two `~@edx/frontend-component-{header,footer}/dist/*` imports (header/footer dist styles no longer exist).
- `src/setupTest.tsx` → keep, but Phase 7 rewrites contents.

**Verification:** `npm run build` and `npm test` still broken — by design.

**Commit:** `refactor: restructure src/ to frontend-base layout`

---

## Phase 5 — Header and Footer migration

**Goal:** custom header logic preserved without `@edx/frontend-component-header`/`-footer`.

Files: `src/header/CatalogHeader.tsx`, `src/header/hooks/useMenuItems.ts`, `src/header/messages.ts`, `src/header/types.ts`, `src/header/CatalogHeader.test.tsx`, `src/App.tsx` (already deleted in Phase 4), `src/style.scss` (header/footer dist imports already removed).

- Rewrite `CatalogHeader.tsx`: replace `Header` from `@edx/frontend-component-header` with a Paragon-based header that consumes `useMenuItems()` output. Re-source whatever the old Header gave us (logo, user menu) from `@openedx/frontend-base` exports.
- `useMenuItems.ts`: replace `getConfig().ENABLE_PROGRAMS` etc. with `getAppConfig('catalog').ENABLE_PROGRAMS` etc.
- Plug into shell via `app.slots`:
  ```ts
  slots: {
    'frontend-base.shell.header': { component: CatalogHeader },
    // footer: no override — use shell default
  }
  ```
  (Confirm exact shell slot IDs against frontend-base shell source.)
- Delete the now-empty `src/plugin-slots/FooterSlot/` directory (keep its README content in `docs/` if useful — it documents how downstream sites swap the footer).

**Verification:** dev server renders something (manual once Phase 6 wires up imports).

**Commit:** `feat: port CatalogHeader to frontend-base; remove component-header/footer`

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

- `src/setupTest.tsx`:
  - Drop the existing custom render wrapper *or* keep it but rewire it on top of frontend-base primitives. **Recommend** trimming to:
    ```ts
    import siteConfig from 'site.config';
    import { mergeSiteConfig } from '@openedx/frontend-base';
    mergeSiteConfig(siteConfig);
    ```
    and pulling the custom render into a `src/test-utils.tsx` that any test which needs it can import explicitly. This makes the test-utils boundary visible and avoids hidden globals.
  - The current wrapper provides `IntlProvider`, `MemoryRouter`, `QueryClientProvider`. After migration:
    - `IntlProvider` — frontend-base shell provides; test-utils still needs one for component-only tests.
    - `MemoryRouter` — same, still needed for route-context tests.
    - `QueryClientProvider` — shell-provided in production; tests still need a fresh client to avoid cache leak between tests.
- Rewrite every `jest.mock('@edx/frontend-platform', …)` etc. as `jest.mock('@openedx/frontend-base', () => ({ ...jest.requireActual('@openedx/frontend-base'), <mocked fns> }))`. 43 test files; expect ~30 to need touch-ups (the ones that previously mocked `getConfig`, `getAuthenticatedHttpClient`, or the header/footer components).
- Mocks in `src/__mocks__/course.ts`, `courseAbout.ts`, `courseListSearch.ts`, `index.ts` — should not need code changes; verify no imports from `@edx/frontend-platform`.
- For each test that reads `process.env.X`, replace with a `mergeSiteConfig` call (or `mergeAppConfig`) that sets the same value on the test's site config. Per the Phase 3 mapping table, decide site vs app scope per variable.
- `App.test.tsx` and `index.test.tsx` — both reference deleted entry points. **Delete** these tests and rely on a smoke test through `Main.test.tsx` (new) that renders `<Main />` inside a `MemoryRouter` and asserts it renders without throwing.

**Verification:** `npm test` passes with `--passWithNoTests` not needed. Coverage threshold: whatever it was on master (none enforced currently — keep it that way unless we want to raise).

**Commit:** `test: update suite for frontend-base APIs`

---

## Phase 8 — Plugin slots → `Slot` API

**Goal:** every `PluginSlot` replaced with the frontend-base `Slot` component, slot IDs in the new naming convention.

For each of the 16 folders under `src/slots/` (renamed in Phase 4):

1. Replace `import { PluginSlot } from '@openedx/frontend-plugin-framework'` with `import { Slot } from '@openedx/frontend-base'`.
2. Update slot ID from `org.openedx.frontend.catalog.X` to the new convention (consult `frontend-base/shell` slot examples). Likely `catalog.X` or kebab-case `catalog-X`.
3. Replace `<PluginSlot id="…" slotOptions={{ mergeProps: true }} {…props}>` with `<Slot id="…" {…props}>` — confirm `mergeProps` behavior is the new default or has an equivalent.
4. The `CourseCatalogDataTableSlots` and `HomePromoVideoSlots` and `CourseAboutIntroVideoSlots` "compound" folders export multiple slot components — rewrite each.

Slot IDs (current → proposed; finalize against frontend-base conventions):

```
org.openedx.frontend.catalog.home_page.banner            → catalog.home.banner
org.openedx.frontend.catalog.home_page.promo_video_modal → catalog.home.promo-video.modal
…
org.openedx.frontend.catalog.course_catalog_page.data_table.control_bar → catalog.course-catalog.data-table.control-bar
```

(Publish the final ID map as part of the commit message — it's a breaking change for any downstream plugin author.)

**Verification:** dev server renders the homepage, catalog page, and a course-about page end-to-end. Manually open each and click through.

**Commit:** `refactor: migrate plugin-slots to frontend-base Slot API`

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

These are rough; treat as planning hints, not commitments.

| Phase | Estimate | Risk |
|---|---|---|
| 0. Branch & baseline | 10 min | low |
| 1. Dependencies | 30 min | low |
| 2. Configs | 1 h | low |
| 3. site.config + .env | 1 h | med (config-mapping decisions) |
| 4. src/ restructure | 2 h | med (split touches everything) |
| 5. Header/Footer | 2–4 h | **high** (we're rewriting custom header without an obvious upstream replacement) |
| 6. Migrate imports | 2 h | low (mechanical, lots of files) |
| 7. Tests | 4–6 h | **high** (43 files, mock rewrites, env→config swaps) |
| 8. Slot API | 2–3 h | med (depends on frontend-base slot naming finalization) |
| 9. SCSS | 30 min | low |
| 10. i18n | 30 min | low |
| 11. CI | 30 min | low |
| 12. Docs | 1 h | low |
| 13. Verification | 1–2 h | discovers everything missed above |

**Total:** ~18–24 hours of focused work, spread across multiple sessions. Phases 5 and 7 are the unknowns; the rest is mechanical.
