# Phase 12 — README and docs

## Context

The frontend-base migration is functionally complete through Phase 11. What remains is user-facing docs.

Current state in this repo:
- `README.rst` is a **58-line WIP stub** — badges + Purpose blurb + Slots pointer + Getting Help + License, plus a note pointing to the migration plan/worklog.
- `docs/decisions/` has two ADRs already: `0001-record-architecture-decisions.rst` (Nygard boilerplate) and `0002-feature-based-application-organization.rst` (Proposed, predates the migration).
- `docs/how_tos/i18n.rst` is a one-line redirect to `https://github.com/openedx/frontend-base/blob/main/docs/how_tos/i18n.rst`.
- `docs/migrate-to-frontend-base.md` (the plan) and `docs/migrate-to-frontend-base-worklog.md` (the running log) are the change history.
- `catalog-info.yaml` (Backstage) already exists at repo root.
- `legacy/README.md` still lives under `legacy/` (deleted in Phase 13).

Plan doc's Phase 12 (`docs/migrate-to-frontend-base.md:821–834`) prescribes:
- Rewrite `README.md` (actually `.rst`): "MFE" → "frontend app", devstack → Tutor, `start` → `dev`, `.env` → `site.config.dev.tsx`.
- ~~Add ADR `0003-adopt-frontend-base.rst`~~ — dropped. The plan doc + worklog already capture the migration decision; peer repos (authn, LD, frontend-template-application) didn't add ADRs for their own frontend-base migrations either. Adding one would be redundant boilerplate.
- Update `docs/how_tos/i18n.rst` "if changed".
- Decide fate of `docs/migrate-to-frontend-base.md` (leave in place OR move under `docs/decisions/`).

Canonical shape to align to: `frontend-template-application/README.rst` on the `frontend-base` branch — the only reference-repo README that's been genuinely rewritten around frontend-base (authn's and LD's READMEs are still stale from before their migrations).

## Approach

### 1. `README.rst` — rewrite to template-application shape

Grow the 58-line WIP stub into a full README modeled on `frontend-template-application/README.rst`. Section skeleton (in order):

- Badges — add `ci-badge` and `codecov-badge` alongside the existing `license-badge`; drop the `status-badge` (WIP) in favor of `Maintained` (matches template).
- H1 title + optional short framing paragraph identifying this as a frontend-base app that plugs into the Open edX shell (not a standalone MFE).
- **Purpose** — Home, Course About, and Course Catalog pages; the intended replacement for the corresponding views in `edx-platform`. (Reuse existing wording from the current stub.)
- **Getting Started**
  - **Prerequisites** — link to Tutor and tutor-mfe (per template pattern; do not inline Tutor plugin snippets salvaged from `legacy/README.md`, they're pre-frontend-base plumbing that no longer applies).
  - **Cloning and Startup** — `git clone`, use `.nvmrc`, `npm install`, `npm run dev`; note that the dev server defaults to `PORT=1998 PUBLIC_PATH=/catalog` (as set in `package.json`'s `dev` script) and is available at `http://apps.local.openedx.io:1998/catalog`.
  - **Local Development Against `frontend-base`** — verbatim bind-mount recipe from template (`mkdir -p packages/frontend-base && sudo mount --bind ...`, then `npm install && npm run dev:packages`); include the "why bind not symlink" sentence.
  - **Configuration** — table or bullet list of the ten `AppConfig` fields defined in `src/app.ts` (`ENABLE_COURSE_DISCOVERY`, `ENABLE_PROGRAMS`, `HOMEPAGE_PROMO_VIDEO_YOUTUBE_ID`, `HOMEPAGE_COURSE_MAX`, `ENABLE_COURSE_SORTING_BY_START_DATE`, `NON_BROWSABLE_COURSES`, `INFO_EMAIL`, `SUPPORT_URL`, `LEARNING_BASE_URL`, `COURSE_ABOUT_TWITTER_ACCOUNT`). Point to `site.config.dev.tsx` as the example of how to set them.
- **Developing**
  - **Project Structure** — bulleted layout matching template's list (`src/app.ts`, `src/constants.ts`, `src/index.ts`, `src/routes.tsx`, `src/Main.tsx`, `src/slots.tsx`, `src/slots/`, `src/style.scss`), with a link out to the frontend-base migration how-to.
  - **Build Process Notes** — library build (`npm run build` → tsc + tsc-alias → `dist/`) vs CI build (`npm run build:ci` → `openedx build` against `site.config.ci.tsx`), matching template's framing.
  - **Internationalization** — one paragraph delegating to `https://github.com/openedx/frontend-base/blob/main/docs/how_tos/i18n.rst` (matches template).
- **Slots** — catalog-specific section (template doesn't have this because it offers no slots). Keep the existing stub's wording pointing to `src/slots/`.
- **Getting Help** — reuse existing wording (discussion forums + `#wg-frontend` Slack).
- **License** — reuse existing wording.
- **Contributing** — link to `https://openedx.org/r/how-to-contribute` (do not add a separate `CONTRIBUTING.md`; no peer has one).
- **The Open edX Code of Conduct** — link to `https://openedx.org/code-of-conduct/`.
- **People** — link to Backstage (`catalog-info.yaml` exists at repo root, so the Backstage URL will resolve for this repo).
- **Reporting Security Issues** — standard boilerplate (`security@openedx.org`).

Drop these template-only sections:
- The `⚠️ Warning ⚠️` preamble ("this template produces a frontend-base app..."), which is meaningful for a template repo but not for a real app.
- `Making Your New Project's README File` (template-specific).

Do NOT retain the WIP note or worklog references from the current stub — the README is the front door for users, not for migration tracking.

### 2. `docs/how_tos/i18n.rst` — no change

The plan doc says "update the example commands and atlas flow if changed". Nothing has changed: the file is already a one-line redirect to `frontend-base/docs/how_tos/i18n.rst`, and the target's semantics haven't shifted. Skip.

### 3. Migration plan + worklog — keep in place

Recommendation: leave `docs/migrate-to-frontend-base.md` and `docs/migrate-to-frontend-base-worklog.md` in `docs/`, not moved under `docs/decisions/`.

Rationale: they're an *execution plan* and a *running log*, not architecture decisions. The migration *decision* is captured in the plan doc + worklog themselves; moving them into `docs/decisions/` would blur what an ADR is. Once the branch merges, a follow-up PR can archive or move them — that's a post-merge concern, not a Phase 12 concern.

### 4. Legacy README content — do not salvage

`legacy/README.md` contains extensive pre-frontend-base plumbing: `MFE_APPS` Tutor plugin snippets, `CATALOG_MICROFRONTEND_URL` / `ENABLE_CATALOG_MICROFRONTEND` env vars, an `edx-search==4.4.0` pip pin for an ulmo.1 workaround, and links to the frontend-platform i18n howto. All of it is being replaced by `frontend-template-site` composition + the frontend-base i18n flow. Do not inline any of it into the new `README.rst`.

The legacy README will be deleted along with the rest of `legacy/` in Phase 13.

### 5. ADR 0002 status — do not touch

`0002-feature-based-application-organization.rst` is `Proposed` and mentions React/Redux/ducks/.jsx idioms that no longer apply. However, its core recommendation (organize `src/` by feature — matches `src/course-about/`, `src/catalog/`, `src/home/`) still describes the current layout. Superseding or rewriting it is out of scope for the migration; leave it alone.

## Files to modify

- `README.rst` — rewrite (58 → ~250 lines). The only file changed.

Files NOT touched:
- `docs/how_tos/i18n.rst` (nothing to change).
- `docs/decisions/*.rst` — no new ADR, no touch on the existing two (out of scope).
- `docs/migrate-to-frontend-base.md`, `docs/migrate-to-frontend-base-worklog.md` (stay in place; post-merge move is a separate concern).
- `legacy/*` (deleted in Phase 13).
- `catalog-info.yaml` (already correct; `People` section in README will link to Backstage which resolves from it).

## Verification

- Proofread rendered `README.rst` (GitHub RST rendering) — every internal link resolves, badges load, code blocks render.
- Cross-reference: every file/directory named in `Project Structure` exists in `src/` (`app.ts`, `constants.ts`, `index.ts`, `routes.tsx`, `Main.tsx`, `slots.tsx`, `slots/`, `style.scss`).
- Cross-reference: every `AppConfig` field named in `Configuration` matches the ten defaults in `src/app.ts`.
- `npm run lint` — sanity check (docs shouldn't affect lint, but confirm the tree still builds).

## Commits

Cadence matches the Phase 9/10/11 rhythm — work commit, worklog append last as a separate commit:

1. `docs: rewrite README for frontend-base` — `README.rst`.
2. `docs: log Phase 12 README rewrite` — worklog append.
