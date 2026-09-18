# Task 2 implementation report

Completed the existing approved guided-workspace implementation on `codex/dynamic-career-data`, preserving the interrupted implementer's uncommitted frontend work. Backend/data changes from Task 1 and parent-owned documentation were not edited or staged by this task.

## Result

- Central brand is 职景 / 实习与职业发展. The synthetic PageLoader splash is removed.
- Native two-step onboarding requires a validated free-text major and undergraduate year, persists an account-isolated local selection, supports dismissal, edit, keyboard focus trapping, scroll locking and focus restoration. First entry remains neutral without default printing recommendations.
- Shared workspace fetches public GET results on profile selection, visible-page 15-minute checks and visibility return. Manual refresh uses `refresh=1`; explicit authenticated discovery remains a separate POST. Normalized owner/major/year signatures isolate results and asynchronous status. Re-saving the same selection no longer aborts a request without restarting it.
- Same-profile refresh preserves manually discovered source URLs and updates duplicate receipts; different-major results cannot be merged. HTTP errors use neutral Chinese actions. Successful HTTP responses that report unavailable public sources retain and expose their failure message rather than implying success.
- Public recruiting/history records, career/learning references and valid vacancies are visibly separate. Requirements, graduate cohort and publication dates remain visible. Every search source has its own 最近读取 date; excerpts are original previews limited to three displayed lines, with full-card original-source links.
- Enterprise reading cards have independent accessible favorite/official actions. Detail content, roles, industry, stage checklists and certificates follow the selected professional context. Existing checklist keys retain `${query.major}:${query.grade}:${step}` with the original plan step strings.
- Profile retains local PDF/TXT extraction and existing records. Suggested certificates/directions derive from the selected workspace plus saved selections. Inputs have labels, chips expose pressed state, upload is keyboard accessible, and privacy copy distinguishes browser file parsing from explicitly enabled account synchronization.
- The small note uses opaque ivory paper and accessible dialog behavior. Public paragraph sizes are generally 14px, supporting labels 12px.
- Industry visibly mounts the interactive world map. Markers derive only from explicit source-record location names and label geographic city/province/country centers, never employer addresses or the adapter's zero coordinates. Source titles/links and textual locations remain usable when map tiles fail. RealMap uses attributed configurable HTTPS OSM tiles, supported zoom limits, tile-load recovery, resize observation, DOM text tooltip content, dependency updates and cleanup.

## Files

Modified: `app/layout.tsx`, `app/globals.css`, `app/companies/page.tsx`, `app/companies/[id]/page.tsx`, `app/roles/page.tsx`, `app/certs/page.tsx`, `app/industry/page.tsx`, `app/growth/page.tsx`, `app/profile/page.tsx`; `components/CareerProvider.tsx`, `CareerExplorer.tsx`, `Nav.tsx`, `CompanyCard.tsx`, `FavButton.tsx`, `LetterWidget.tsx`, `ResearchPanel.tsx`, `CareerAnalysis.tsx`, `RealMap.tsx`.

Added: `components/OnboardingGuide.tsx`, `OpportunityList.tsx`, `WorkspaceContext.tsx`; `lib/brand.ts`, `lib/career/onboarding.ts`, `lib/career/workspace-results.ts`, `lib/career/regions.ts`; `tests/workspace-ui.test.ts`; this report. OpportunityList keeps grouping/source display focused; workspace-results and regions provide small pure helpers with behavior tests.

## Verification and evidence

Used the coding, systematic-debugging, TDD and verification instructions, and read installed Next.js client-directive and layouts/pages documentation. Continued the approved design rather than restarting design exploration.

The interrupted implementer reportedly ran two initial RED cycles before creating the original validation/storage and UI tests. Those reports were inherited; this finisher did not independently observe those historical command outputs. Parent also reported an actual-browser RED against the previous app (missing guide), then confirmed guide focus and initial printing desktop rendering before this final integration pass. Final browser verification is owned by the parent and is not claimed here.

Actual RED/GREEN evidence observed in this finishing pass:

1. Added invalid-major and guide/edit/request/grouping contracts; `npm test` exited 1 on the missing validation, accessible edit action, unchanged-selection abort guard and reference grouping. Applied targeted fixes.
2. Added pure discovery merge behavior and profile suggestion/accessibility contracts. `npm test` exited 1: previous-major leads leaked into a different-major merge and profile still used fixed certPool. Added the major guard and completed profile integration. GREEN: 50/50.
3. Added individual research-source receipts and HTTP200 source-failure visibility contracts. `npm test` exited 1 on both missing behaviors. Added receipts and failure status display. GREEN: 51/51.
4. Added regional context behavior and actual Industry map mounting contract. `npm test` exited 1 with 51 passing, 2 failing: empty region helper and absent mounted map. Implemented source-location centers/deduplication and the secondary map. GREEN: 53/53.

Final fresh commands after map completion:

- `npm test`: exit 0, 53 tests passed, 0 failures.
- `npm run lint`: exit 0, no errors/warnings.
- `npx tsc --noEmit`: exit 0.
- PowerShell `$env:NEXT_TELEMETRY_DISABLED='1'; npm run build`: exit 0, Next.js 16.3.4 compiled and generated all 10 static pages; dynamic enterprise/API routes recognized. Parent stopped preview before builds.
- `git diff --check`: exit 0; Git reports normal Windows LF/CRLF conversion notices only.

Self-review checked account isolation, unchanged-selection request lifecycle, abort/signature guards, preservation of discovery URLs, source-failure receipts, unmodified task keys, cohort/qualification visibility, truthful parsing/privacy copy, keyboard actions and source-derived map locations. Owned TypeScript files were formatted for readability.

## Limits / handoff

The UI source-contract tests supplement pure behavior tests; they are not a claim of completed browser interaction coverage. Parent must finish actual desktop/mobile, profile, major switching, request races, dialogs and map zoom checks. This task made no authenticated provider call, model call, service activation, publish, push or merge. OSM tile availability depends on the browser network; the text location/source list remains available. Region mapping intentionally skips unspecified/unrecognized locations. Remote source results depend on Task 1's bounded retrieval/cache behavior.
