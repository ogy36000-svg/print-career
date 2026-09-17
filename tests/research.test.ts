import { test } from "node:test";
import assert from "node:assert/strict";
import catalog from "../data/career-catalog.json";
import { researchInput, buildResearchQuery, normalizeResearchResults, takeLocalBudget, validateResearchBundle } from "../lib/career/research";

test("专业允许自由输入，但空值/过长/无效主题不能消耗检索额度", () => {
  assert.equal(researchInput({major:" 天文学 ",topic:"career"}).major, "天文学");
  assert.throws(() => researchInput({major:" ",topic:"career"}));
  assert.throws(() => researchInput({major:"x".repeat(81),topic:"career"}));
  assert.throws(() => researchInput({major:"印刷",topic:"admin"}));
});
test("用户输入不能注入站点操作符；三个主题生成不同检索", () => {
  const input = researchInput({major:"数字印刷 site:evil.com",company:"珠江啤酒",topic:"career"});
  const q = buildResearchQuery(input, catalog);
  assert.ok(!q.includes("site:evil.com"));
  assert.ok(q.includes("珠江啤酒"));
  assert.notEqual(q, buildResearchQuery({...input,topic:"competition"}, catalog));
});
test("只保留允许的公开来源且搜索结果永远是待核验线索", () => {
  const rows = [{title:"官方招聘",url:"https://www.gzrecruit.com/test",description:"公告"},{title:"重复",url:"https://www.gzrecruit.com/test#x"},{title:"招聘平台",url:"https://www.zhipin.com/jobs"},{title:"恶意",url:"javascript:alert(1)"}];
  const leads = normalizeResearchResults(rows, "2026-09-14T00:00:00.000Z", catalog);
  assert.equal(leads.length, 1);
  assert.equal(leads[0].status, "lead");
});
test("开发预算达到上限必须拒绝，跨日才重置", () => {
  const state = {day:"",used:0};
  assert.equal(takeLocalBudget(state, new Date("2026-09-14"), 2), true);
  assert.equal(takeLocalBudget(state, new Date("2026-09-14"), 2), true);
  assert.equal(takeLocalBudget(state, new Date("2026-09-14"), 2), false);
  assert.equal(takeLocalBudget(state, new Date("2026-09-15"), 2), true);
});
test("损坏或过期缓存不能伪装成新的联网结果", () => {
  assert.equal(validateResearchBundle({checkedAt:"2026-09-14"}, catalog), null);
  const bundle = {query:"q",checkedAt:"2026-09-14T00:00:00Z",expiresAt:"2026-09-15T00:00:00Z",leads:[],creditsUsed:2,cached:false};
  assert.ok(validateResearchBundle(bundle, catalog));
});
test("机会检索扩展具体专业岗位并用实习生而非裸实习召回",()=>{
  const query=buildResearchQuery(researchInput({major:"数字印刷",topic:"internship"}),catalog);
  assert.ok(query.includes("实习生"));
  assert.ok(query.includes("印刷工程"));
  assert.ok(query.includes("色彩管理"));
  assert.ok(!query.includes("实习 OR"));
});
