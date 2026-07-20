# Ported tests: default-to-seed for getAppConfig / getSiteConfig

## Context

While reviewing the Phase 7 test-comparison branch, we noticed that a couple of the ported tests hardcode config values (like `TEST_INFO_EMAIL = 'support@example.com'`) that already live in `site.config.test.tsx`. This came from a pattern where a test file mocks `getAppConfig`/`getSiteConfig` unconditionally in `beforeEach` to enable per-test overrides — once mocked, the seed doesn't apply, so the mock has to re-supply every value the test reads.

Concrete example (`src/catalog/CatalogPage.test.tsx`):

```ts
const TEST_INFO_EMAIL = 'support@example.com';

beforeEach(() => {
  mockedGetAppConfig.mockReturnValue({
    INFO_EMAIL: TEST_INFO_EMAIL,
    ENABLE_COURSE_DISCOVERY: true,
  });
});
```

`'support@example.com'` and `true` are already in `site.config.test.tsx`. The mock is silently duplicating the seed for all the tests that don't actually need overrides — only 2 tests in that file need `ENABLE_COURSE_DISCOVERY: false`.

Goal: default to the seeded config; only mock the specific test cases that need to change a value.

## Approach

**Pattern: default-to-actual.** For each affected file, keep the `jest.mock('@openedx/frontend-base', ...)` (other mocks like `ErrorPage` / `getUrlByRouteRole` / `getAuthenticatedHttpClient` still need it), but change the `getAppConfig`/`getSiteConfig` mock so the default implementation delegates to the real function (which reads the seed via `getSiteConfig()`/`getAppConfig(appId)` from `setupTest.js`'s `mergeSiteConfig + addAppConfigs`).

```ts
jest.mock('@openedx/frontend-base', () => ({
  ...jest.requireActual('@openedx/frontend-base'),
  getAppConfig: jest.fn(),
  // other mocks unchanged
}));

// eslint-disable-next-line @typescript-eslint/no-require-imports
const { getAppConfig: actualGetAppConfig } = jest.requireActual('@openedx/frontend-base');
const mockedGetAppConfig = getAppConfig as jest.Mock;

beforeEach(() => {
  mockedGetAppConfig.mockImplementation(actualGetAppConfig);
});
```

- Assertions elsewhere read the seed directly: `getAppConfig(appId).INFO_EMAIL` (which now returns `'support@example.com'` from the seed).
- Tests that need overrides use spread-over-actual so unrelated keys aren't wiped:
  ```ts
  mockedGetAppConfig.mockReturnValue({
    ...actualGetAppConfig(appId),
    ENABLE_COURSE_DISCOVERY: false,
  });
  ```
- Where the override deliberately zeros a value (e.g. `HOMEPAGE_COURSE_MAX: undefined`, or `sidebar-social/utils`'s `handles missing config values`), the intent is preserved by passing that override key explicitly.

For `getSiteConfig` the shape is the same (it takes no args, so no `appId`).

**Constants to delete** (their value now comes from the seed):
- `TEST_YOUTUBE_ID` in `HomePage.test.tsx`
- `TEST_INFO_EMAIL` in `CatalogPage.test.tsx`
- `DEFAULT_TEST_INFO_EMAIL` in `CoursesList.test.tsx`
- `TEST_SITE_NAME`, `TEST_TWITTER_ACCOUNT` in `sidebar-social/__tests__/utils.test.ts` (assertions switch to `getSiteConfig().siteName` / `getAppConfig(appId).COURSE_ABOUT_TWITTER_ACCOUNT`)
- Default-only `ENABLE_PROGRAMS: true`, `ENABLE_COURSE_DISCOVERY: true` in `CatalogHeader/app.test.tsx`'s beforeEach (they match seed)

**Constants that stay** — they're not config values:
- `COURSES_URL` in HomeBanner / CoursesList — the mocked return of `getUrlByRouteRole`. Test-owned scaffolding, not seed.
- `TEST_COURSE_ID` in CourseAboutPage — `useParams` mock value.
- `HEADER_LINKS_SLOT` in widgets/CatalogHeader/app.test.tsx — a slot-id string, not config.

**Bug caught by the refactor:** `sidebar-social/__tests__/utils.test.ts` currently sets `TEST_SITE_NAME = 'localhost'` but the seed is `'Catalog Test Site'`. Legacy `SITE_NAME` was `'localhost'` from `env.test`. The ported assertion happens to pass because the mock returns `'localhost'`, but that value is now wrong vs the seed. Under the refactor, assertions naturally use the seeded value.

## Files to modify

Only the 5 files identified by the survey:

- `src/home/HomePage.test.tsx` — 1 legitimate override (`ENABLE_COURSE_DISCOVERY: false`); rest read seed.
- `src/catalog/CatalogPage.test.tsx` — 2 legitimate overrides across 3 `beforeEach` blocks; rest read seed.
- `src/home/components/courses-list/CoursesList.test.tsx` — 5+ overrides (`HOMEPAGE_COURSE_MAX` variants, `NON_BROWSABLE_COURSES: true`); rest read seed.
- `src/widgets/CatalogHeader/app.test.tsx` — most tests already override for the condition-callback branch; drop the default `beforeEach` mock (which just re-states the seed) and keep per-test overrides using spread-over-actual.
- `src/course-about/course-sidebar/sidebar-social/__tests__/utils.test.ts` — 1 legitimate override (`handles missing config values`). Also fixes the `'localhost'` vs seeded `'Catalog Test Site'` drift.

No production code touched. `site.config.test.tsx` stays as the single source of truth.

Cadence: one commit per file (matches Phase 7 pattern). Verify with `nvm use && npm test -- --no-coverage <file-pattern>` after each. Final check: full-suite `nvm use && npm test -- --no-coverage` + `nvm use && npm run lint`.

## Verification

- Per-file: `nvm use && npm test -- --no-coverage <path>` green.
- After the batch: full suite still 372/372, lint clean.
- Grep the 5 files for the deleted constant names — should return zero hits.
- Grep the 5 files for `mockReturnValue({\n\s*INFO_EMAIL:` etc — the "default that duplicates the seed" pattern shouldn't appear anymore.

## Worklog

Single Phase 7 followup entry after all 5 file commits summarising the refactor, why (avoid duplicating seed values), the `default-to-actual` pattern chosen, and the sidebar-social siteName drift caught along the way.
