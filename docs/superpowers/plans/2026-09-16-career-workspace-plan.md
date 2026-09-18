# Career workspace implementation

> Execute with superpowers:subagent-driven-development. User approved implementation on 2026-09-16; continue the existing codex/dynamic-career-data branch. Do not create another checkout or publish.

## Goal

Replace the printing-only presentation with a calm, personal career workspace. First use is a short major/year guide, not a permanent homepage settings form. Real public-source updates must reach the recommendations.

## Global Constraints

- No model API calls, AI extraction, payment UI, subscriptions, or newly activated paid services.
- Preserve existing user records and the other incomplete project.
- Free-text majors are accepted. Digital media is not marketing; Indonesian is its own major. Unknown majors never receive unrelated printing companies.
- Printing and Indonesian are the initial deeply curated directions. Historical graduate recruitment is not a current internship. Publication, retrieval and deadline dates are separate.
- Search results are source leads, never automatically verified vacancies. No invented pay, eligibility, company equipment, retirement times or hiring statistics.
- Keep production authentication and server-side budget controls for provider-backed discovery. Guest public-source refresh uses only a bounded fixed registry of public HTTPS pages. No arbitrary-URL fetch, login bypass, or CAPTCHA bypass.
- Cards link across their whole reading area; independent favorite buttons and official links are not nested inside links.
- Keep the brand fixed and change workspace content by major/year. Use legible, opaque surfaces, restrained warm colors, keyboard focus, mobile reflow and reduced-motion support.

## Task 1: Major templates and connected public-source updates

Brief/report: docs/superpowers/plans/2026-09-16-task-1-brief.md and task-1-report.md.

- [ ] Write failing tests in tests/workspace-data.test.ts for digital media alias isolation, Indonesian recognition, unknown-major emptiness, major-specific preparation (no printing CET6 advice for every major), unsafe source rejection, and retrieval not converting historical announcements into current vacancies.
- [ ] Fix lib/career/engine.ts and enrich data/career-catalog.json with distinct digital media and Indonesian profiles/roles. Keep existing regression tests working.
- [ ] Add lib/career/workspace.ts with a typed deterministic major/year workspace template for industry, directions, practical next steps and global outlook. No inferred personal skill deficiencies.
- [ ] Add typed OpportunityRecord/OpportunityResponse contracts in lib/career/types.ts and curated public records in data/opportunity-sources.json. Records have id, majorIds, companyName, title, summary, requirements, city, sourceUrl, publishedAt, cohort, kind (announcement/history/reference), checkedAt, availability (fresh/stale), and never invented deadlines.
- [ ] Add lib/career/opportunities.ts for pure source relevance/normalization and lib/server/opportunities.ts for bounded fixed-source fetch, coalesced caching, timeouts, content-size bounds and stale retention. A manual refresh actually reads pages again (with a cooldown), not merely changing a timestamp. Display newly found matching public listing links as leads; do not claim they are verified jobs.
- [ ] Add GET/POST app/api/opportunities/route.ts: GET accepts sanitized major/year and refresh, checks fixed public pages; POST reuses searchResearch authentication/budget/cache and returns leads to the same OpportunityResponse. Existing Firecrawl REST search remains retrieval-only.
- [ ] Separate company business descriptions from internal evidence in lib/career/backup.ts (optional validated description field), so enterprise details do not present implementation notes as business introductions.
- [ ] Document failure modes and configuration. Run focused RED/GREEN then full tests and lint. Commit only Task 1 files and report.

## Task 2: Guided entry and cohesive responsive workspace

Brief/report: docs/superpowers/plans/2026-09-16-task-2-brief.md and task-2-report.md.

- [ ] Write failing behavior/markup tests for profile validation/storage, no preselected printing recommendations on first visit, removal of homepage skill fields, whole-card navigation, readable letter surfaces, and no payment/provider jargon in normal copy.
- [ ] Centralize brand as “职景” with descriptor “实习与职业发展”. Remove old printing-specific branding and show concise task labels, not defensive slogans.
- [ ] Add native accessible two-step dialog onboarding: required free-text major with examples, then required year selection. Optional city is deferred. Explain purpose briefly, persist locally after submit, support keyboard, editing and focus restoration.
- [ ] CareerProvider owns profile hydration, shared major/year, public opportunities loading/refresh and optional protected source discovery. Race-safe changes must clear previous-major results immediately; errors keep only that major's prior results. Do not expose unrelated backup as updated data.
- [ ] Replace CareerExplorer with a useful workspace: compact context/change action, stage-aware introduction, opportunity list with separate current vacancies / public announcements / career references, curated related employer cards, modest next-action module and source refresh controls. No permanent giant major/year search form or two decorative hero blocks.
- [ ] Refine navigation, globals.css and company card/detail presentation. Opaque ivory/paper backgrounds, dark green main accent, quiet terracotta growth accents, readable typography; desktop useful max width around 1440px, mobile no horizontal overflow. Entire card reading area links, favorite/official actions independent.
- [ ] Keep enterprise search, favorites and application tracking usable. Professional filters use current shared major. Industry, careers, growth and certificates reflect shared major using workspace template; do not show printing content for Indonesian or unknown majors.
- [ ] Repair LetterWidget with opaque paper, restrained typography, deterministic stage-aware copy, dialog focus/escape/scroll behavior. Do not invent knowledge of the user's efforts.
- [ ] Map is secondary: fix existing tile failure/resize/dependency issues and retain a usable city list/world fallback; no claims of exact workplace coordinates from university footer addresses.
- [ ] No fake resume parser. Optional future import explanation belongs in profile, not homepage manual skills.
- [ ] Run focused RED/GREEN, full tests/lint/build; commit only Task 2 files and report.

## Task 3: Integrated verification and independent review

- [ ] Review each completed task against its brief and fix important findings before proceeding.
- [ ] Run fresh npm test, npm run lint, npm run build.
- [ ] Trigger the actual local app: first visit, printing → Indonesian → digital media → unknown major; GET source refresh and POST retrieval; verify different result IDs/source links, cache receipts and no model calls.
- [ ] Check keyboard/dialog and desktop/mobile visually if a browser is available; report any missing visual verification honestly.
- [ ] Review whole change against global constraints; fix important findings and re-run covering tests.
- [ ] Handoff verified local preview and concise limitations. Keep existing branch local; no publishing, push or merge.
