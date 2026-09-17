import { test } from "node:test";
import assert from "node:assert/strict";
import catalog from "../data/career-catalog.json";
import { resolveMajor, recommendCompanies, careerAdvice } from "../lib/career/engine";
import { createRequire } from "node:module";
import "../lib/career/workspace";
import "../lib/career/opportunities";
import "../lib/server/opportunities";
import { asLegacyCompany, backupCatalog } from "../lib/career/backup";
test("企业业务介绍与来源审计说明分离",()=>{
  const employer={...catalog.employers[0],description:"包装配套业务"};
  assert.equal(asLegacyCompany(employer).desc,"包装配套业务");
  assert.ok(asLegacyCompany(employer).source.includes(employer.evidence.note));
});
const load = createRequire(__filename);
const moduleOrNull = (path: string) => {try {return load(path);} catch {return null;}};

test("专业工作台随年级变化，未知专业不推断个人技能缺口", () => {
  const workspace = moduleOrNull("../lib/career/workspace.js");
  assert.ok(workspace, "workspace template must exist");
  const early = workspace.workspaceTemplate({major:"印尼语",grade:"1"},catalog);
  const late = workspace.workspaceTemplate({major:"印尼语",grade:"4"},catalog);
  assert.notDeepEqual(early.nextSteps,late.nextSteps);
  assert.ok(early.globalOutlook.join(" ").includes("东南亚"));
  assert.ok(!early.nextSteps.join(" ").includes("六级"));
  assert.equal(workspace.workspaceTemplate({major:"天文学",grade:"2"},catalog).majorId,null);
});
test("公开记录拒绝不安全来源，刷新历史公告不制造在招或新核验", () => {
  const opportunities = moduleOrNull("../lib/career/opportunities.js");
  assert.ok(opportunities,"public source normalization must exist");
  const records = opportunities.curatedOpportunities;
  assert.ok(records.length >= 6);
  assert.throws(()=>opportunities.validateOpportunityRecords([{...records[0],sourceUrl:"https://127.0.0.1/private"}]));
  assert.throws(()=>opportunities.validateOpportunityRecords([{...records[0],sourceUrl:"http://gxulif.gxu.edu.cn/test"}]));
  const history = records.find((r: {id:string})=>r.id==="yuto-2026");
  const fresh = opportunities.checkOpportunity(history,"裕同 2026年应届 印刷包装 排名前50%", "2026-09-16T00:00:00Z");
  assert.equal(fresh.kind,"history");
  assert.equal(fresh.availability,"fresh");
  const mismatch = opportunities.checkOpportunity(fresh,"网站维护 联系地址天津", "2026-09-17T00:00:00Z");
  assert.equal(mismatch.checkedAt,fresh.checkedAt);
  assert.equal(mismatch.availability,"stale");
  assert.deepEqual(opportunities.opportunitiesForMajor(records,"天文学",catalog),[]);
});
test("列表只抽取同源匹配公告为线索，排除学校页脚和泛招聘标题", () => {
  const opportunities = moduleOrNull("../lib/career/opportunities.js");
  assert.ok(opportunities,"listing parser must exist");
  const html='<ul><li><a href="/correcruit/content/id/1.html">印尼语翻译实习招聘</a>2026-09-16</li><li><a href="/correcruit/content/id/2.html">某集团2027招聘</a></li><li><a href="https://evil.example/job">印尼语翻译</a></li><li><a href="/correcruit/content/id/3.html">数字媒体交互设计实习</a></li></ul><footer>天津市办公室</footer>';
  const leads=opportunities.extractListingLeads(html,"https://job.tiangong.edu.cn/correcruit/index.html","印尼语",catalog,"2026-09-16T00:00:00Z");
  assert.equal(leads.length,1);
  assert.equal(leads[0].status,"lead");
  assert.ok(leads[0].url.endsWith("/1.html"));
  assert.equal(opportunities.extractListingLeads(html,"https://job.tiangong.edu.cn/correcruit/index.html","天文学",catalog,"2026-09-16T00:00:00Z").length,0);
});
test("公开刷新合并并发、冷却缓存，失败保留旧核验时间且拒绝跳转",async()=>{
  const server=moduleOrNull("../lib/server/opportunities.js");
  assert.ok(server,"bounded public reader must exist");
  let calls=0; let failed=false; let now=Date.parse("2026-09-16T00:00:00Z");
  const service=server.createOpportunityService(async()=>{calls++;return new Response(failed ? "bad" : "裕同 2026年应届 印刷包装 排名前50%",{status:failed ? 503 : 200,headers:{"content-type":"text/html; charset=utf-8"}});},()=>now);
  const [a,b]=await Promise.all([service({major:"印刷",grade:"3"},catalog,true),service({major:"印刷",grade:"3"},catalog,true)]);
  assert.equal(a.items[0].checkedAt,b.items[0].checkedAt);
  const count=calls;
  assert.equal((await service({major:"印刷",grade:"3"},catalog,true)).cached,true);
  assert.equal(calls,count);
  failed=true; now+=61000;
  const stale=await service({major:"印刷",grade:"3"},catalog,true);
  assert.ok(calls>count);
  assert.equal(stale.items[0].checkedAt,a.items[0].checkedAt);
  assert.equal(stale.items[0].availability,"stale");
  await assert.rejects(()=>server.readPublicPage("https://evil.example/job",async()=>new Response("x")));
  await assert.rejects(()=>server.readPublicPage("https://gxulif.gxu.edu.cn/info/1508/11850.htm",async()=>new Response(null,{status:302,headers:{location:"https://evil.example"}})));
  await assert.rejects(()=>server.readPublicPage("https://gxulif.gxu.edu.cn/info/1508/11850.htm",async()=>new Response("x",{headers:{"content-length":"9999999"}})));
});
test("泛企业公告可经有界正文检查匹配专业，页眉页脚不提供相关性",async()=>{
  const server=moduleOrNull("../lib/server/opportunities.js");
  const pure=moduleOrNull("../lib/career/opportunities.js");
  assert.equal(typeof pure.detailLead,"function");
  const candidate={title:"某集团2027校招",url:"https://job.tiangong.edu.cn/correcruit/content/id/12345.html",excerpt:"某集团2027校招",checkedAt:"2026-09-16T00:00:00Z",status:"lead",sourceType:"学校"};
  assert.equal(pure.detailLead(candidate,'<header>印尼语</header><div class="zpnr">机械工程师</div><footer>印尼语 天津地址</footer>',"印尼语",catalog,candidate.checkedAt),null);
  assert.ok(pure.detailLead(candidate,'<header>学校地址</header><div class="zpnr"><p>专业要求：印尼语 国际业务</p></div><footer>天津市办公室</footer>',"印尼语",catalog,candidate.checkedAt).excerpt.includes("印尼语"));
  let detailCount=0;
  const service=server.createOpportunityService(async(url:string|URL|Request)=>{
    const address=String(url);
    if(address.includes("/correcruit/index.html")) return new Response('<ul>'+Array.from({length:10},(_,i)=>'<li><a href="/correcruit/content/id/'+(12345+i)+'.html">某集团2027校招</a></li>').join("")+'</ul>',{headers:{"content-type":"text/html"}});
    if(address.includes("/correcruit/content/id/123")){detailCount++;return new Response('<div class="zpnr">专业要求：印尼语 国际运营</div>',{headers:{"content-type":"text/html"}});}
    return new Response("unmatched",{headers:{"content-type":"text/html"}});
  },()=>Date.parse(candidate.checkedAt));
  const response=await service({major:"印尼语",grade:"3"},catalog,true);
  assert.equal(detailCount,6);
  assert.equal(response.leads.length,6);
  assert.ok(response.leads.every((l:{status:string})=>l.status==="lead"));
});
test("链接包裹列表行时不能借用上一家企业的专业文字",()=>{
  const pure=moduleOrNull("../lib/career/opportunities.js");
  const html='<ul><a href="/info/1508/1.htm"><li>印刷包装招聘</li></a><a href="/info/1508/2.htm"><li>化学招聘</li></a></ul>';
  const leads=pure.extractListingLeads(html,"https://gxulif.gxu.edu.cn/CN/rcpy/jyxx.htm","印刷",catalog,"2026-09-16T00:00:00Z");
  assert.equal(leads.length,1);
  assert.equal(leads[0].title,"印刷包装招聘");
});
test("印尼语只得到裕同PMC历史记录且学校就业活动为参考",()=>{
  const pure=moduleOrNull("../lib/career/opportunities.js");
  const items=pure.opportunitiesForMajor(pure.curatedOpportunities,"印尼语",catalog);
  const yuto=items.find((r:{companyName:string})=>r.companyName==="裕同集团");
  assert.equal(yuto.id,"yuto-pmc-2026");
  assert.ok(!yuto.title.includes("品质"));
  assert.equal(yuto.city,"烟台、印尼");
  assert.ok(yuto.requirements.some((r:string)=>r.includes("印尼语")));
  assert.equal(items.find((r:{id:string})=>r.id==="gxmzu-employment").kind,"reference");
});

test("数字媒体有独立专业和作品方向，不因内容运营推荐裕同", () => {
  assert.equal(resolveMajor("数字媒体技术", catalog)?.id, "digital-media");
  assert.equal(resolveMajor("数字媒体艺术", catalog)?.id, "digital-media");
  const advice = careerAdvice({major:"数字媒体", grade:"3"}, catalog);
  assert.ok(advice.roles.some(r => /交互|媒体/.test(r.title)));
  assert.ok(!recommendCompanies(backupCatalog.employers,{major:"数字媒体",grade:"3"},backupCatalog).some(r=>r.employer.name.includes("裕同")));
});
test("印尼语有来源明确的裕同PMC与北汽国际研究对象",()=>{
  const matches=recommendCompanies(backupCatalog.employers,{major:"印尼语",grade:"3"},backupCatalog);
  assert.ok(matches.some(m=>m.employer.id==="yuto"));
  assert.ok(matches.some(m=>m.employer.id==="baic-international"));
  assert.ok(!matches.some(m=>m.employer.id==="zrp"));
});
test("数字媒体企业推荐需要直接媒体或交互证据，视觉/内容泛标签不够",()=>{
  for(const major of ["数字媒体技术","数字媒体","数字媒体艺术"]){
    assert.deepEqual(recommendCompanies(backupCatalog.employers,{major,grade:"3"},backupCatalog),[]);
    const base=backupCatalog.employers[0];
    const fixtures=[{...base,id:"visual-only",tags:["视觉设计","内容运营"]},{...base,id:"interactive",tags:["交互设计"]}];
    assert.deepEqual(recommendCompanies(fixtures,{major,grade:"3"},backupCatalog).map(m=>m.employer.id),["interactive"]);
  }
});
test("印尼语独立识别且专业准备不套用印刷六级目标", () => {
  assert.equal(resolveMajor("印度尼西亚语",catalog)?.id,"indonesian");
  assert.equal(resolveMajor("印尼语",catalog)?.id,"indonesian");
  assert.ok(!careerAdvice({major:"软件工程",grade:"3"},catalog).plan.join(" ").includes("六级"));
  assert.ok(!careerAdvice({major:"印度尼西亚语",grade:"3"},catalog).plan.join(" ").includes("印刷"));
  assert.ok(careerAdvice({major:"数字印刷",grade:"3"},catalog).plan.join(" ").includes("老师"));
});
test("未知专业不会收到既有目录企业", () => {
  assert.deepEqual(recommendCompanies(catalog.employers,{major:"天文学",grade:"3"},catalog),[]);
});
test("未知专业遇到全部来源失败也不宣称公开读取成功",async()=>{
  const server=moduleOrNull("../lib/server/opportunities.js");
  const service=server.createOpportunityService(async()=>new Response("",{status:503}),()=>Date.parse("2026-09-17T00:00:00Z"));
  const response=await service({major:"天文学",grade:"3"},catalog,true);
  assert.ok(response.message.includes("暂时无法"));
  assert.deepEqual(response.items,[]);
  assert.deepEqual(response.leads,[]);
});
