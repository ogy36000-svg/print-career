# Dynamic Career Implementation Plan

> **For agentic workers:** Use superpowers:executing-plans to implement this plan task-by-task, inline in the user's existing project. The user requested execution, not delegation or a new workspace.

**Goal:** Ship free-text professional recommendations, refreshable catalog and evidence-first career research.

**Architecture:** Independent TypeScript career-domain functions, authenticated/budgeted server retrieval, a validated Supabase snapshot with transparent backup, and existing React pages. New features run on a Node.js server rather than GitHub Pages static export.

**Tech Stack:** Existing Next.js 16.3.4, React, TypeScript, Supabase; Node test runner through tsx; Firecrawl REST.

## Global Constraints

- No fabricated active jobs, hiring schools, retirement timing or promotion quotas.
- No client-side service key; online paid queries require verified account plus persistent atomic quotas.
- Preserve old project and old published site; no external deployment/push in this task.
- Test domain behavior before implementing it; describe offline/network failures honestly.

### Task 1: Professional recommendation and evidence domain

Files: `lib/career/types.ts`, `lib/career/engine.ts`, `lib/career/validation.ts`, `data/career-catalog.json`, `tests/career.test.ts`.
Interfaces: `resolveMajor(text, catalog)`, `recommendCompanies(companies, query, catalog)`, `recommendVacancies(vacancies, query, catalog, now)`, `careerAdvice(query, catalog)`, `validateCatalog(value)`, `promotionScenario(input)`.

- [x] Write tests asserting unknown majors do not inherit printing companies, computing matches software companies, printing includes evidence-tagged beer packaging opportunities, expired jobs are excluded, unsafe source URLs rejected, unknown machine count gives no quota.
- [x] Run the local TypeScript compiler + Node test harness; confirm feature-specific failures. (`tsx` installation was unavailable, so `npm test` is the repeatable equivalent.)
- [x] Implement domain types and deterministic matching (professional relevance before enterprise rank), explicit evidence status, career plans and hypothetical staffing arithmetic.
- [x] Run tests; confirm all pass before integration.

### Task 2: Runtime data and paid retrieval boundaries

Files: `next.config.ts`, `lib/server/catalog.ts`, `lib/server/research.ts`, `lib/career/research.ts`, `app/api/catalog/route.ts`, `app/api/research/route.ts`, `supabase/schema.sql`, `tests/research.test.ts`, `scripts/publish-catalog.ts`, `scripts/research-smoke.ts`.
Interfaces: `loadCatalog() => {catalog, mode, checkedAt, message}`, `searchResearch(input) => ResearchBundle`, `normalizeResearchResults(results, checkedAt)`.

- [x] Write tests for query normalization, allowed source filtering, cached research timestamp and cost cap; run to confirm failure.
- [x] Implement runtime routes, REST retrieval, validation and timeouts. Server-only URL endpoint and credentials are fixed or environment-controlled, never user-controlled.
- [x] Add Supabase snapshot/cache/budget RPC and auth-bound profile policies. Remove legacy anonymous policies and revoke legacy table access.
- [x] Verify domain tests and perform actual real route smoke test with a single limited search.

### Task 3: Working recommendation interface and safe profile sync

Files: `components/CareerExplorer.tsx`, `components/ResearchPanel.tsx`, `components/CareerAnalysis.tsx`, `components/AccountPanel.tsx`, `app/page.tsx`, `lib/remote.ts`, `lib/store.ts`, `app/companies/page.tsx`, `app/companies/[id]/page.tsx`, `app/growth/page.tsx`, `app/profile/page.tsx`, `app/globals.css`.

- [x] Integrate controlled professional input with recommendation domain; unknown input displays research opportunity, not unrelated employers.
- [x] Add source/time/backup indicators, manual refresh, skills gap and evidence-based development questions; research button sends no personal resume details.
- [x] Replace legacy code-based sync with authenticated account sync; local storage access cannot abort network requests. Keep original browser parsing explicitly optional.
- [x] Route company catalog/detail and growth to fresh shared catalog; label existing platform links as searches rather than active vacancies.
- [x] Run build, tests and focused lint; exercise every route and live APIs against the actual server.
- [ ] Inspect desktop and mobile visually. Native browser automation was unavailable in this environment, so this remains a named handoff check rather than a false completion claim.

### Task 4: Operations and handoff

Files: `.env.example`, `README.md`, `docs/DATA-OPERATIONS.md`, `app/api/refresh/route.ts`, `scripts/research-smoke.ts`.

- [x] Document catalog publish, protected scheduled update, required secrets, migration and launch checklist.
- [x] Re-run `npm test`, `npm run build`, focused lint, and API/browser checks. Record verified behavior and configuration gaps in handoff.
- [x] Leave changes on `codex/dynamic-career-data`; no publishing or data-loss actions.
