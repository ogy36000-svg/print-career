# Task 1 report — connected career data

Completed locally on `codex/dynamic-career-data`; no frontend edits, publishing, model requests, credential changes or new provider accounts. Implemented the brief and its subsequent parent review corrections. Task 2 integration and whole-app browser review remain with the parent.

## Contracts

- `workspaceTemplate(query: CareerQuery, catalog: CareerCatalog): CareerWorkspace` returns `majorId`, `label`, `stage`, `introduction`, `industry`, `directions`, `nextSteps`, `globalOutlook`, `certificates`.
- `OpportunityResponse`: `{major: string, items: OpportunityRecord[], leads: ResearchLead[], checkedAt: string | null, cached: boolean, message: string}`.
- `OpportunityRecord`: the brief fields; nullable `city`, `cohort`, `checkedAt`; `kind` is `announcement | history | reference`, `availability` is source freshness `fresh | stale`, never hiring status. No inferred deadlines.
- `GET /api/opportunities?major=…&grade=1..4&refresh=true` (also accepts `year` and `refresh=1`). Major goes through the existing text sanitization. Unknown majors get no curated employers/records; actual matching public links can still appear as leads.
- `POST /api/opportunities` accepts major, grade/year and optional existing research topic/company. It calls existing `searchResearch(input, request)` and merges only profession-relevant leads into the same response. Authentication, 24-hour provider cache and server budgets are untouched. Provider cache receipts are returned through `cached`/`checkedAt`; each item/lead keeps its own source receipt.

## Implementation

Digital media has an independent profile and visual/interactive/media project roles. Indonesian has translation/localization and international operations/planning/business directions, with regional knowledge. Teacher-specific CET6 preparation appears only for printing; other majors do not inherit it. Workspace text suggests projects without inferring personal deficiencies.

Seven curated records share six university source anchors. Printing engineering and Indonesian PMC are separate records for the same historical Yuto source; PMC has the specific majors, workplace field `烟台、印尼`, and 3 published places. Top50% remains explicitly this cohort's announcement condition. Historical 2026 recruitment remains historical after retrieval. The HeyGears master's role and university education/employment resources are references; BAIC 2027 recruitment is an announcement. The college's historical multilingual activity is not a job announcement, and college-wide outcomes are not reused as Indonesian hiring statistics.

Added source-backed Yuto, Zhongrong, HeyGears and BAIC employer research descriptions. Curated seed IDs supersede their legacy duplicates. This prevents legacy Yuto's broad visual/content tags from pulling it into digital-media recommendations. Employer business introductions use validated optional `description`; audit/evidence notes remain in source fields rather than business copy.

Public GET reads six fixed article anchors plus four fixed HTTPS university indexes. It never calls a provider. A cold refresh therefore makes 10 fixed reads, then at most 3 same-origin article reads per index (12 total). Discovered targets must match the exact university article directories, have no query, and originate in one of the fixed listing pages, never a request URL. Redirects are rejected; each read has a 10-second timeout, content-type validation and a 512 KiB header/stream limit. UTF-8 and declared GB-family text decoding are supported. Results coalesce across users/majors within a process; automatic expiry is 15 minutes and manual refresh has a 60-second cooldown.

New listing links can match their own title/row excerpt. Generic company notices additionally match their extracted announcement body (`zpnr`, university article content), excluding school navigation and office/footer addresses. A regression caught GXU's `<a><li>…</li></a>` format borrowing the previous row's professional keywords; extraction now checks whether the anchor is actually inside an unclosed list row and separates nested title from excerpt. Returned links remain `status: lead` without invented salary, city, eligibility or application state. A failed read retains prior source receipts; curated facts are marked stale and never stamped newly checked on mismatch or failure.

## RED / GREEN evidence

Commands run from `C:\Users\uav\Desktop\实习网站\实习网址trae\print-career`.

1. `npm test` before profile changes: **26 tests, 24 pass, 2 fail**. Digital media resolved to `marketing` instead of `digital-media`; Indonesian resolved to `undefined`. After profiles/advice fix: **26/26 pass**.
2. Added workspace/source tests: **29 tests, 26 pass, 3 fail** on missing workspace, source normalization and listing extraction. After implementation: **29/29 pass**.
3. Added bounded refresh/cache/failure test: **31 tests, 30 pass, 1 fail** on missing public reader. After service: **31/31 pass**.
4. Added generic body hydration test: **32 tests, 31 pass, 1 fail**, `typeof detailLead` was `undefined`. After bounded hydration/body extraction: **32/32 pass**.
5. Added row-contamination and PMC split regressions: **34 tests, 32 pass, 2 fail**. Contamination returned 2 links rather than 1; Indonesian record was `yuto-2026` rather than `yuto-pmc-2026`. After fixes: **34/34 pass**.
6. Strengthened digital-media test to use the real backup catalog and added Indonesian employer coverage: **35 tests, 33 pass, 2 fail**. Legacy Yuto leaked into digital media; Indonesian had no Yuto/BAIC employer. Curated source-backed employer entries fixed these: **35/35 pass**.
7. Added complete-source-failure messaging test for an unknown major: **36 tests, 35 pass, 1 fail** because an empty result still claimed successful reading. After receipt-aware message: **36/36 pass**.
8. Parent identified remaining digital-media weak employer hits via lone visual-design tags. Focused regression: **37 tests, 36 pass, 1 fail**, 雅昌/麦普 were returned for 数字媒体技术. Digital-media employer matches now require direct `交互设计` or `媒体制作` evidence tags; generic visual/content tags alone cannot qualify. Existing employer coverage is honestly empty for digital media; direct-evidence fixture qualifies. After fix: **37/37 pass**.

Final full verification: `npm test` — **37 tests, 37 pass, 0 fail**, exit 0; `npm run lint` — exit 0, no findings; `npx tsc --noEmit` — exit 0. Final production build: `$env:NEXT_TELEMETRY_DISABLED='1'; npm run build` — exit 0, compiled and generated all 10 static pages, including dynamic `/api/opportunities` in the route table. Initial default build encountered Windows Next telemetry `EXDEV` renaming the global telemetry config; disabling telemetry for the command resolved it without altering project files. An earlier lint run found parent-owned temporary QA script warnings, subsequently fixed by the parent; final lint is clean.

## Actual public retrieval evidence

Initial 2026-09-16 direct HTTP verification: all six curated anchors and both shared Tiangong/Hebut recruitment indexes returned 200 with readable UTF-8 public bodies. Corrected guessed GXU/GXMZU index paths using links from actual university pages; the final fixed paths returned 200.

Real service read on **2026-09-17T07:58:20.192Z**: all **10 fixed pages + 12 discovered detail pages returned 200**. One fetch round was shared across the following major changes:

| Major | Curated records | Matching leads | Cache |
|---|---:|---:|---|
| 数字印刷 | 3 (all fresh: 2 history, 1 reference) | 1 | false |
| 印度尼西亚语 | 4 (all fresh: 1 history, 1 announcement, 2 references) | 0 | true |
| 数字媒体 | 0 | 0 | true |
| 软件工程 | 0 | 2 | true |
| 天文学 | 0 | 0 | true |

Printing listing discovery found [中轻纸品春季招聘信息](https://gxulif.gxu.edu.cn/info/1508/12026.htm), with printing/product packaging in its own excerpt; this is a previously uncurated historical spring notice, not a current internship claim. Today's software list found [软件开发工程师](https://career.hebut.edu.cn/correcruit/content/id/80712.html). Generic/detail matching found [自动化工程师](https://job.tiangong.edu.cn/correcruit/content/id/56222.html) through actual SQL/database/VBA programming and control/software development body text, with no software keyword needed in the title.

The prior 2026-09-16 service run demonstrated digital-media generic-notice body matching for [广东碧桂园职业学院招聘](https://job.tiangong.edu.cn/correcruit/content/id/56194.html) and [齐鲁理工学院招聘](https://job.tiangong.edu.cn/correcruit/content/id/56193.html), whose actual bodies include 数字媒体技术. They require postgraduate education in the relevant sections; they were presented as research leads, not undergraduate internship facts. These links left today's top-three detail window and are not falsely repeated as newly found digital-media opportunities.

Observed transient failures: Zhongrong's known article was stale/null on one 2026-09-16 service round; GXMZU's education article was stale/null on one 2026-09-17 service round. Their underlying causes could be intermittent transport failure/timeout or content validation and were not asserted more specifically; the final instrumented round recorded both as 200 and confirmed fresh bodies. Neither transient failure replaced an old confirmation date with a new one. Direct known-page freshness and genuine new-page discovery both worked; Indonesian currently has no newly matching listing lead.

## Files

`data/career-catalog.json`, `data/opportunity-sources.json`, `lib/career/types.ts`, `lib/career/validation.ts`, `lib/career/engine.ts`, `lib/career/backup.ts`, `lib/career/workspace.ts`, `lib/career/opportunities.ts`, `lib/server/opportunities.ts`, `app/api/opportunities/route.ts`, `tests/workspace-data.test.ts`, this report.

## Configuration and limitations

No new public-refresh configuration or credentials are required. Sources and bounds are code-defined; adding a source requires a reviewed fixed registry update. Existing POST discovery still uses the already configured `FIRECRAWL_API_KEY`, production authentication and database budget controls; no new integration/provider account was activated. No provider or model requests were issued during this agent's verification; the parent handles actual POST integration separately.

Coverage is deliberately bounded, not all-market recruitment. Four university indexes and a top-three article window cannot find every new announcement or guarantee a matching lead for each major. Keyword matches are source discovery only, not semantic eligibility or verified vacancies. Article-body adapters may need updating if university markup changes; then generic results are omitted. In-memory cache/stale retention resets on process restart and is per server process; multi-instance deployments each perform their bounded refresh. Response `checkedAt` is the last registry attempt or provider receipt, while item and lead receipts are authoritative for individual source freshness. Publication/cohort values are retained regardless of retrieval date. Browser/UI/profile switching and authenticated POST integration have not been claimed verified by Task 1.
