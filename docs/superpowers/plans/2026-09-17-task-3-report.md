# Integrated verification

## Backend verification (root)

2026-09-17 local preview, branch baseline 2888984; data implementation reviewed through 4361424.

- Actual GET for 数字印刷: HTTP 200, three curated source records and a current source-discovery lead, with per-record availability and read receipts. School and company historical cohort information remains distinct from active vacancies.
- Actual POST before recruitment gate exposed five unrelated curricula/activity results; captured titles and URLs were supplied to implementer as regression fixtures (no retrieved excerpts invented).
- Actual POST after 4361424: HTTP 200, three curated records and four public retrieval leads. The five curricula/activity false positives were absent. Leads include school recruitment notices and a campus directory: these are public research leads, not verified undergraduate internship vacancies.
- No model API requested. Existing web retrieval credential only; no additional credential, paid service activation or deployment.

## Browser baseline

User explicitly approved automated local browser checks. Isolated Playwright 1.63.0 uses installed Chrome; no application dependency changes.

`node artifacts/check-workspace.cjs` failed before the frontend implementation as expected: first-use dialog heading 你正在读什么专业 did not exist. This establishes a real-browser RED, not a mocked component result.

## Frontend and integrated checks

2026-09-18 resumed incomplete frontend work after implementer interruption. No uncommitted task changes were discarded.

- Fresh root `npm test`: 45/45 pass, zero failures.
- Fresh root `npm run lint`: one React ref-during-render error in CareerProvider, supplied to finishing implementer; not yet a clean final verification.
- Early real-browser checks now pass first-guide focus containment and year-step focus. Printing workspace renders with actual retrieved data.
- Automated major switching stopped at the context edit accessible name (`修改 ↗` versus specified `修改`), supplied for correction.
- Viewed desktop guide/workspace screenshots. Warm opaque surfaces and wider desktop layout are present; main body and date fonts remain too small, supplied for correction.
- Source reference separation, per-lead read dates, retained manual discoveries and profile form cohesion/privacy are being completed before final verification.

## Independent verification of 1daf01c

- Root fresh `npm test`: 53/53, zero failures; `npm run lint` and `npx tsc --noEmit`: exit0.
- Implementer production build exited0. Root started built production server on port3001 with local-research dev flag still set to test production behavior; no deployment.
- Full browser workspace harness passed 1440px desktop/390px phone and widths320/768/1024: onboarding, keyboard trap and step focus, printing→Indonesian→media→unknown, saved selection reload, whole reading-card navigation, first direct Industry entry/dismissal, opaque paper note/Escape. No first-use printing request or automatic provider POST. Zero pageerrors.
- Actual API records: printing3, Indonesian4, digital media0, astronomy0. Media/unknown did not get unrelated printing records. Empty coverage is not hidden with invented companies.
- Interaction harness passed favorite independence and reload persistence, reading-area company navigation, application stage reload, growth checked task reload, real delayed-source race, unchanged-profile edit during GET refresh, Indonesian-language context/major's roles, properly labeled persisted profile input and browser-denied localStorage usability.
- World map controls enforce supported min/max zoom and show attribution. BUT actual screenshot revealed no loaded online basemap (gray geometry area); this visual finding is not masked by successful controls checks. Local geographic base and bounded online loading fallback are being added; repeat map visual QA remains required.
- Actual anonymous production POST:401 even with ALLOW_LOCAL_RESEARCH=true. UI manual search translates this into login action, does not expose payment/credit machinery or discard three existing source records. GET refresh returns original kinds/cohorts and per-source dates.
- Independent Task2 review found research-topic cancellation deadlock A→B→A and limited profile reduced-motion gap. Batched fixes + covering RED/GREEN are underway, then re-review and final fresh verification.

Browser selectors were adjusted for legitimate public UI labels (小笺) and a generic reading card rather than assuming a particular employer must occupy the first six recommendations; no assertions about relevance or state were removed.

## Post-fix verification of d3d40e7

- Task2 independent re-review approved both specification and quality; no Critical/Important findings remain in that task. Source-string checks are explicitly supplementary, not browser-behavior evidence.
- Root fresh complete suite:56/56 pass, lint exit0, TypeScript exit0, production build exit0. Both prior local servers were stopped before the build. No publication occurred.
- Rebuilt production port3001 repeated the complete workspace, interaction and source-action harnesses successfully: four majors, desktop/mobile/320/768/1024/1440, saved user controls, actual delayed GET races, denied local storage, native focus/Escape, and production anonymous search401 despite the development flag being present. Zero browser pageerrors.
- `check-recovery.cjs` passed actual anonymous production research requests with delayed real401 responses: topic A→B→A and company A→B→A recover the button, a newer request completes correctly, and no provider retrieval is charged by these rejected requests.
- Blocked every OSM tile request in the browser. Bundled land paths remain present and projected, map stays visible, Natural Earth attribution is present, and clicking the country reference changes marker positions by panning/zooming. Viewed the actual map screenshot: visible continents and source-region markers instead of gray/white tiles.
- Viewed normal viewport mobile390/320 screenshots and the opaque paper note. Text remains legible and document has no horizontal overflow. Fullpage screenshots alone were not used to judge phone-size typography.
- Recovery harness originally assumed the first polygon must be visible (it is outside the viewport) and map-pane transform must change (Leaflet resets that pane after zoom). Corrected these test observations to validate attached geometry plus nonzero projected paths and changed marker positions; no application behavior or assertions about failure recovery were removed.

Remaining source coverage is intentionally limited: printing3 curated records plus1 discovered lead, Indonesian4 curated records, digital media/astronomy0 curated records in this actual check. Historical announcements retain their cohort and type after refresh. This is not a full-web real-time vacancy service or a public-launch security certification.

## Final owner/lifecycle review fixes (2026-09-18)

Resolved the three Important findings in one scoped batch:

- Profile upload/editor subtree is keyed by the store session generation and unmounted while loading. Completed previews, messages, applied state and unsaved skill drafts clear on owner changes. A mounted-lifetime guard rejects late extraction results/errors and stale apply actions; the existing local TXT/PDF extraction and rule-based parser remain intact.
- The note dialog subtree exists only while a career profile is available and is keyed by session generation. Losing the profile or changing accounts unmounts the dialog, runs its native close/scroll/focus cleanup, and resets open state so the restored account can reopen it.
- Store load clears old private data before awaiting cloud restoration. Update callbacks capture the current generation and loaded owner and check them both before scheduling and inside the updater; callbacks saved from A cannot edit B or a later A session. Persistence and queued explicit cloud authorization also check session generation; account-specific local keys, consent and serial cloud writes are preserved. Favorites/application controls disable and mask markers while loading; the existing growth checkbox also disables until loaded.

Behavior regression runner: `node tests/owner-lifecycle.cjs`, using actual React/React DOM and production component sources in installed Chrome with the existing isolated Playwright runtime (`artifacts/browser-runtime/node_modules/playwright`). Only controlled auth/cloud reads, unrelated context UI and animation wrappers are substituted. Actual local resume extraction and analysis, native dialogs, store effects and component state execute; no app dependency changes or real account credentials are required. This separate browser runner is not part of the 56-case unit command.

- RED: command-local `OWNER_REGRESSION_BASELINE=0d475ec` with `node tests/owner-lifecycle.cjs` reads original source from that git revision without reverting the worktree. Exit1, 0/6 passed. Failures were exactly old completed preview in B, old pending extraction preview in B, hidden body after note removal, A favorite during B hydration, saved A callback changing loaded B, and an accepted hydration updater.
- GREEN: `node tests/owner-lifecycle.cjs`, exit0, 6/6 passed. Covers completed preview and private draft reset; pending extraction owner switch plus current-owner import preserving an existing skill; note scroll/focus cleanup and reopen/Escape; delayed B restore masking/disabling controls; saved callback rejection across A→B→A; and hydration updates neither executing nor persisting.
- Fresh full checks: `npm test` exit0, 56/56; `npm run lint` exit0; `npx tsc --noEmit` exit0.
- Production servers were stopped by root before build. First `npm run build` failed before compilation with an environmental telemetry EXDEV rename in AppData. Rerun with command-local `NEXT_TELEMETRY_DISABLED=1`: `npm run build` exit0, optimized compilation, TypeScript and all 10 static pages completed. No project configuration or secret file changed for the retry.

Root independently repeated the six lifecycle cases and 56 unit checks plus lint successfully before this report. Root will repeat the five complete production browser harnesses and final incremental review on the committed batch. No deployment, push, merge, migration, model API call or paid service activation occurred.
