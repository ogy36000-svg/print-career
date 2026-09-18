import { test } from "node:test";
import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { mergeOpportunityResults } from "../lib/career/workspace-results";
import type { OpportunityResponse, ResearchLead } from "../lib/career/types";
import { opportunityRegions } from "../lib/career/regions";
import { curatedOpportunities } from "../lib/career/opportunities";
import {
  validateSelection,
  selectionKey,
  readSelection,
  saveSelection,
} from "../lib/career/onboarding";
test("selection requires a real major and undergraduate year", () => {
  assert.deepEqual(validateSelection({ major: " 印尼语 ", grade: "3" }), {
    major: "印尼语",
    grade: "3",
  });
  for (const value of [
    null,
    {},
    { major: " ", grade: "3" },
    { major: "x".repeat(81), grade: "2" },
    { major: "印尼语", grade: "5" },
    { major: "<script>", grade: "3" },
    { major: "!!!", grade: "3" },
  ])
    assert.equal(validateSelection(value), null);
});
test("guide uses shared major validation and exposes a precise edit action", () => {
  const guide = readFileSync("components/OnboardingGuide.tsx", "utf8");
  assert.ok(guide.includes("validateSelection"));
  const context = readFileSync("components/WorkspaceContext.tsx", "utf8");
  assert.ok(context.includes('aria-hidden="true"'));
});
test("same-profile edits keep active requests and source refreshes retain discovery links", () => {
  const provider = readFileSync("components/CareerProvider.tsx", "utf8");
  assert.ok(provider.includes("nextSignature !== signature"));
  assert.ok(provider.includes("mergeOpportunityResults"));
});
test("public reference groups and each source reading receipt are visible", () => {
  const source = readFileSync("components/OpportunityList.tsx", "utf8");
  assert.ok(source.includes("职业与学习参考"));
  assert.ok(source.includes("lead.checkedAt"));
  assert.ok(
    readFileSync("components/ResearchPanel.tsx", "utf8").includes(
      "lead.checkedAt",
    ),
  );
});
test("source failure messages from successful HTTP receipts remain visible", () => {
  assert.ok(
    readFileSync("components/CareerProvider.tsx", "utf8").includes(
      "opportunities?.message",
    ),
  );
});
test("discovery receipts survive refresh without crossing majors", () => {
  const lead = (url: string, checkedAt: string): ResearchLead => ({
    url,
    checkedAt,
    title: "来源",
    excerpt: "原文",
    sourceType: "学校",
    status: "lead",
  });
  const result = (
    major: string,
    leads: ResearchLead[],
  ): OpportunityResponse => ({
    major,
    leads,
    items: [],
    checkedAt: null,
    cached: false,
    message: "",
  });
  const previous = result("印尼语", [
    lead("https://a.edu.cn/1", "2026-09-16"),
    lead("https://a.edu.cn/2", "2026-09-16"),
  ]);
  const merged = mergeOpportunityResults(
    previous,
    result("印尼语", [lead("https://a.edu.cn/1", "2026-09-18")]),
  );
  assert.equal(merged.leads.length, 2);
  assert.equal(merged.leads[0].checkedAt, "2026-09-18");
  assert.equal(
    mergeOpportunityResults(previous, result("数字媒体", [])).leads.length,
    0,
  );
});
test("profile suggestions follow workspace and all input fields have labels", () => {
  const source = readFileSync("app/profile/page.tsx", "utf8");
  assert.ok(!source.includes("certPool"));
  assert.ok(source.includes("workspace.certificates"));
  assert.ok(source.includes('aria-label="添加技能"'));
  assert.ok(source.includes("aria-pressed={selected.includes(it)}"));
});
test("selection storage isolates owners and handles corruption or blocked storage", () => {
  const records = new Map<string, string>();
  const storage = {
    getItem: (key: string) => records.get(key) ?? null,
    setItem: (key: string, value: string) => {
      records.set(key, value);
    },
  };
  assert.equal(
    saveSelection(storage, null, { major: "数字媒体", grade: "2" }),
    true,
  );
  assert.deepEqual(readSelection(storage, null), {
    major: "数字媒体",
    grade: "2",
  });
  assert.equal(readSelection(storage, "account-a"), null);
  assert.notEqual(selectionKey("account-a"), selectionKey("account-b"));
  records.set(selectionKey(null), "broken");
  assert.equal(readSelection(storage, null), null);
  assert.equal(
    readSelection(
      {
        getItem: () => {
          throw Error("blocked");
        },
      },
      null,
    ),
    null,
  );
  assert.equal(
    saveSelection(
      {
        setItem: () => {
          throw Error("blocked");
        },
      },
      null,
      { major: "印尼语", grade: "3" },
    ),
    false,
  );
});
test("workspace requires explicit onboarding instead of a printing default", () => {
  assert.ok(existsSync("lib/career/onboarding.ts"));
  assert.ok(
    !readFileSync("components/CareerProvider.tsx", "utf8").includes(
      'major:"数字印刷工程"',
    ),
  );
});
test("guided workspace and accessible reading cards replace promotional splash", () => {
  assert.ok(existsSync("components/OnboardingGuide.tsx"));
  assert.ok(!readFileSync("app/layout.tsx", "utf8").includes("PageLoader"));
  assert.ok(
    readFileSync("components/FavButton.tsx", "utf8").includes("aria-pressed"),
  );
});
test("map uses attributed standard tiles and recovers tile loads", () => {
  const source = readFileSync("components/RealMap.tsx", "utf8");
  assert.ok(source.includes("tile.openstreetmap.org"));
  assert.ok(source.includes("tileload"));
  assert.ok(source.includes("textContent"));
  assert.ok(source.includes("ResizeObserver"));
});
test("regional map context uses only sourced locations with city and country labels", () => {
  const records = curatedOpportunities.filter((record) =>
    record.majorIds.includes("indonesian"),
  );
  const regions = opportunityRegions(records);
  assert.deepEqual(
    regions.map((region) => region.name),
    ["烟台 · 城市参考", "印度尼西亚 · 国家参考", "北京 · 城市参考"],
  );
  assert.ok(
    regions.every(
      (region) =>
        region.sources.length > 0 && region.lat !== 0 && region.lng !== 0,
    ),
  );
  assert.equal(
    opportunityRegions([{ ...records[0], city: "未明确工作地点" }]).length,
    0,
  );
  assert.equal(
    opportunityRegions([records[0], records[0]])[0].sources.length,
    1,
  );
});
test("industry retains the interactive world map as secondary source context", () => {
  const source = readFileSync("app/industry/page.tsx", "utf8");
  assert.ok(source.includes("<RealMap"));
  assert.ok(source.includes('view="world"'));
  assert.ok(source.includes("opportunityRegions"));
});
