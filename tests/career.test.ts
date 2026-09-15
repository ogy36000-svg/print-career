import { test } from "node:test";
import assert from "node:assert/strict";
import catalog from "../data/career-catalog.json";
import { resolveMajor, recommendCompanies, recommendVacancies, careerAdvice, promotionScenario } from "../lib/career/engine";
import { validateCatalog, safeUrl } from "../lib/career/validation";

test("自由输入的专业别名可以识别", () => {
  assert.equal(resolveMajor("数字印刷工程", catalog)?.id, "printing");
  assert.equal(resolveMajor("计算机科学与技术", catalog)?.id, "computing");
  assert.equal(resolveMajor("轻化工程（制浆造纸）", catalog)?.id, "paper");
});
test("空专业和未知专业不伪装精准推荐", () => {
  assert.equal(resolveMajor("", catalog), null);
  assert.deepEqual(recommendCompanies(catalog.employers, { major: "天文学", grade: "3" }, catalog), []);
});
test("印刷专业发现有包装证据的跨行业珠江啤酒", () => {
  const matches = recommendCompanies(catalog.employers, { major: "印刷工程", grade: "3" }, catalog);
  const beer = matches.find(m => m.employer.id === "zhujiang-beer");
  assert.ok(beer);
  assert.ok(beer.reasons.some(r => r.includes("包装")));
  assert.equal(beer.employer.evidence.kind, "enterprise");
});
test("不同专业的推荐真的改变且没有硬补不对口企业", () => {
  const matches = recommendCompanies(catalog.employers, { major: "软件工程", grade: "3" }, catalog);
  assert.ok(matches.some(m => m.employer.id === "tencent"));
  assert.ok(!matches.some(m => m.employer.id === "zhujiang-beer"));
});
test("城市和已有技能会影响排序并解释加分", () => {
  const matches = recommendCompanies(catalog.employers, { major: "软件工程", grade: "3", city: "深圳", skills: ["编程"] }, catalog);
  assert.equal(matches[0].employer.id, "tencent");
  assert.ok(matches[0].reasons.some(r => r.includes("城市")));
});
test("搜索线索未核验及过期职位不算在招", () => {
  const base = { id: "v", employerId: "tencent", title: "软件实习", tags: ["编程"], city: "深圳", requirements: [], sourceUrl: "https://careers.tencent.com/", checkedAt: "2026-09-14", status: "verified", expiresAt: "2026-10-01" };
  const rows = [base, { ...base, id: "expired", expiresAt: "2026-09-01" }, { ...base, id: "lead", status: "lead" }];
  assert.deepEqual(recommendVacancies(rows, { major: "计算机", grade: "3" }, catalog, new Date("2026-09-15")).map(v => v.id), ["v"]);
});
test("年级会改变准备计划；技能差距随档案变化", () => {
  const early = careerAdvice({ major: "数字印刷", grade: "1", skills: [] }, catalog);
  const late = careerAdvice({ major: "数字印刷", grade: "4", skills: ["色彩管理"] }, catalog);
  assert.notDeepEqual(early.plan, late.plan);
  assert.ok(!late.missingSkills.includes("色彩管理"));
  assert.ok(early.certificates.some(c => c.name.includes("六级") && c.kind === "goal"));
});
test("没有机器和班次数据不编造机长编制和退休时间", () => {
  assert.equal(promotionScenario({ machines: null, shifts: 3, leadersPerShift: 1, occupied: null }).slots, null);
  assert.deepEqual(promotionScenario({ machines: 3, shifts: 2, leadersPerShift: 1, occupied: 5 }), { slots: 6, vacancies: 1, hypothetical: true });
  assert.throws(() => promotionScenario({ machines: -1, shifts: 2, leadersPerShift: 1, occupied: 5 }));
});
test("目录格式和不安全来源不能进入线上库", () => {
  assert.ok(validateCatalog(catalog));
  assert.throws(() => validateCatalog({ updated: "今天", employers: [] }));
  assert.equal(safeUrl("javascript:alert(1)"), null);
  assert.equal(safeUrl("https://127.0.0.1/private"), null);
  assert.equal(safeUrl("https://careers.tencent.com/"), "https://careers.tencent.com/");
});
