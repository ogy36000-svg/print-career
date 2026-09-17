import seed from "../../data/opportunity-sources.json";
import type { CareerCatalog, OpportunityRecord, ResearchLead, ResearchTopic } from "./types";
import { safeUrl } from "./validation";
import { resolveMajor } from "./engine";

export const publicListingUrls = ["https://gxulif.gxu.edu.cn/CN/rcpy/jyxx.htm","https://job.tiangong.edu.cn/correcruit/index.html","https://career.hebut.edu.cn/correcruit/index.html","https://dny.gxmzu.edu.cn/erji.jsp?urltype=tree.TreeTempUrl&wbtreeid=3633"] as const;
export function publicSourceUrl(value: unknown): string | null {
  const safe = safeUrl(value);
  if (!safe) return null;
  const u = new URL(safe);
  return u.protocol === "https:" && u.hostname.endsWith(".edu.cn") ? safe : null;
}
export function validateOpportunityRecords(value: unknown): OpportunityRecord[] {
  if (!Array.isArray(value) || value.length > 100) throw new Error("公开记录格式错误");
  const ids = new Set<string>();
  for (const row of value) {
    if (!row || typeof row !== "object") throw new Error("公开记录格式错误");
    for (const key of ["id","companyName","title","summary"]) if (typeof row[key] !== "string" || !row[key].trim() || row[key].length > 2000) throw new Error("公开记录文本错误");
    if (ids.has(row.id)) throw new Error("公开记录ID重复"); ids.add(row.id);
    for (const key of ["majorIds","requirements"]) if (!Array.isArray(row[key]) || row[key].length > 30 || row[key].some((v:unknown)=>typeof v !== "string" || !v || v.length > 400)) throw new Error("公开记录列表错误");
    if (!publicSourceUrl(row.sourceUrl)) throw new Error("公开来源URL不安全");
    if (!/^\d{4}-\d{2}-\d{2}$/.test(row.publishedAt) || !Number.isFinite(Date.parse(row.publishedAt))) throw new Error("发布日期错误");
    if (row.checkedAt !== null && (typeof row.checkedAt !== "string" || !Number.isFinite(Date.parse(row.checkedAt)))) throw new Error("核验日期错误");
    if (!["announcement","history","reference"].includes(row.kind) || !["fresh","stale"].includes(row.availability)) throw new Error("公告状态错误");
    for (const key of ["city","cohort"]) if (row[key] !== null && (typeof row[key] !== "string" || row[key].length > 200)) throw new Error("公开记录字段错误");
    if ("deadline" in row || "expiresAt" in row) throw new Error("不可推测招聘截止日");
  }
  return value as OpportunityRecord[];
}
export const curatedOpportunities = validateOpportunityRecords(seed);
const anchors: Record<string,string[]> = {
  "yuto-2026":["裕同","2026","印刷包装","排名前50%"],
  "yuto-pmc-2026":["裕同","2026","PMC","印尼语","烟台","印尼"],
  "zhongrong-2026":["中荣","2025-10-23","彩盒","纸浆模塑"],
  "heygears-color":["色彩管理工程师","硕士","UV","打印"],
  "baic-2027":["北京汽车国际","2027","印尼语","海外派驻"],
  "gxmzu-indonesian":["印度尼西亚语","2026","语言+区域","2+0.5+1.5"],
  "gxmzu-employment":["2025","就业"],
};
export function htmlText(html: string): string {
  return html.replace(/<(script|style|footer|nav)\b[^>]*>[\s\S]*?<\/\1>/gi," ").replace(/<[^>]*>/g," ")
    .replace(/&#(?:x([\da-f]+)|(\d+));/gi,(_,hex,dec)=>{const n=parseInt(hex ?? dec,hex ? 16 : 10);return n<=0x10ffff ? String.fromCodePoint(n) : " ";})
    .replace(/&nbsp;|&amp;|&quot;|&lt;|&gt;/g,m=>({"&nbsp;":" ","&amp;":"&","&quot;":'"',"&lt;":"<","&gt;":">"})[m]!).replace(/\s+/g," ").trim();
}
export function checkOpportunity(record: OpportunityRecord, body: string | null, checkedAt: string): OpportunityRecord {
  const text = body ? htmlText(body).replace(/\s+/g,"") : "";
  const matched = Boolean(text && anchors[record.id]?.every(anchor=>text.includes(anchor.replace(/\s+/g,""))));
  return {...record,checkedAt:matched ? checkedAt : record.checkedAt,availability:matched ? "fresh" : "stale"};
}
export function opportunitiesForMajor(records: OpportunityRecord[], major: string, catalog: CareerCatalog) {
  const profile = resolveMajor(major,catalog);
  return profile ? records.filter(r=>r.majorIds.includes(profile.id)) : [];
}
export function relevantLead(lead: Pick<ResearchLead,"title"|"excerpt">, major: string, catalog: CareerCatalog): boolean {
  const profile = resolveMajor(major,catalog);
  const terms = profile ? [...profile.aliases,...profile.tags.filter(tag=>profile.id!=="digital-media" || tag!=="视觉设计")] : [major.trim()];
  const text = `${lead.title} ${lead.excerpt}`.normalize("NFKC").toLowerCase();
  return terms.some(t=>t.length>=2 && text.includes(t.normalize("NFKC").toLowerCase()));
}
export function hasRecruitmentIntent(lead: Pick<ResearchLead,"title"|"excerpt">): boolean {
  const title=lead.title.normalize("NFKC");
  if (/实践教学|教学(?:体系|标准|研究)|人才培养方案|专业(?:目录|介绍|简介)|课程(?:目录|标准|设置)|访企拓岗|参观学习|实习.*(?:总结|考评|汇报|动员)|(?:召开|开展|举办).*(?:座谈|交流|推进会)/.test(title)) return false;
  const excerpt=lead.excerpt.normalize("NFKC");
  const hiringTitle=/招聘|校招|实习生/.test(title);
  if (!hiringTitle && (/^\[PDF\]\s*\d+\s*印刷类/.test(title) || /专业(?:简介|介绍|代码)|培养(?:方案|目标)|课程设置|实践教学|教学标准/.test(excerpt))) return false;
  return hiringTitle || /招聘(?:岗位|对象|要求|人数|信息|简章|职位)|(?:招聘|招募).{0,30}(?:实习生|应届|工程师|设计师)|任职要求|岗位职责|投递简历|简历投递/.test(excerpt)
    || /(?:工程师|设计师|专员|助理|翻译员|设计实习)(?:[（(].*[）)])?$/.test(title.trim());
}
export function opportunityLead(lead: Pick<ResearchLead,"title"|"excerpt">, major: string, catalog: CareerCatalog, topic: ResearchTopic="internship"): boolean {
  return relevantLead(lead,major,catalog) && (topic!=="internship" || hasRecruitmentIntent(lead));
}
export function extractListingCandidates(html: string, sourceUrl: string, checkedAt: string): ResearchLead[] {
  const clean = html.replace(/<(script|style|footer|nav)\b[^>]*>[\s\S]*?<\/\1>/gi,"");
  const seen = new Set<string>(); const leads: ResearchLead[] = [];
  for (const match of clean.matchAll(/<a\b[^>]*href\s*=\s*["']([^"']+)["'][^>]*>([\s\S]*?)<\/a>/gi)) {
    let url: URL; try {url=new URL(match[1].replace(/&amp;/g,"&"),sourceUrl);} catch {continue;}
    if (!publicSourceUrl(url.href) || url.origin !== new URL(sourceUrl).origin || url.search || !/^(?:\/info\/\d+\/\d+\.htm|\/correcruit\/content\/id\/\d+\.html)$/.test(url.pathname)) continue;
    url.hash="";
    const nestedTitle=/<(?:p|h[1-6])\b[^>]*>([\s\S]*?)<\/(?:p|h[1-6])>/i.exec(match[2]);
    const title=htmlText(nestedTitle?.[1] ?? match[2]).slice(0,200);
    if (!title || seen.has(url.href)) continue;
    // Keep excerpts within the containing row; adjacent listings cannot supply relevance.
    const offset=match.index!; const prior=clean.slice(0,offset); const start=prior.lastIndexOf("<li"); const end=clean.indexOf("</li>",offset);
    const insideRow=start>=0 && start>prior.lastIndexOf("</li>") && end>=offset && offset-start<4000;
    const excerpt=htmlText(insideRow ? clean.slice(start,end) : match[2]).slice(0,800);
    const lead:ResearchLead={title,url:url.href,excerpt,sourceType:"学校公开列表 · 待核验公告",checkedAt,status:"lead"};
    seen.add(url.href); leads.push(lead); if (leads.length>=60) break;
  }
  return leads;
}
export function extractListingLeads(html: string, sourceUrl: string, major: string, catalog: CareerCatalog, checkedAt: string): ResearchLead[] {
  return extractListingCandidates(html,sourceUrl,checkedAt).filter(lead=>opportunityLead(lead,major,catalog)).slice(0,20);
}
export function detailLead(candidate: ResearchLead, html: string, major: string, catalog: CareerCatalog, checkedAt: string): ResearchLead | null {
  // Only the announcement body can establish relevance, never navigation or office addresses.
  const opening=/<div\b[^>]*(?:class=["'][^"']*(?:zpnr|boda-article-content)[^"']*["']|id=["']vsb_content[^"']*["'])[^>]*>/i.exec(html);
  if (!opening) return null;
  const start=opening.index+opening[0].length;let depth=1;let end=-1;
  const tags=/<\/?div\b[^>]*>/gi;tags.lastIndex=start;
  let tag;while((tag=tags.exec(html))){depth+=tag[0].startsWith("</") ? -1 : 1;if(depth===0){end=tag.index;break;}}
  if (end<0) return null;
  const text=htmlText(html.slice(start,end));
  if (!relevantLead({title:"",excerpt:text},major,catalog) || !hasRecruitmentIntent({title:candidate.title,excerpt:text})) return null;
  const profile=resolveMajor(major,catalog);const terms=profile ? [...profile.aliases,...profile.tags] : [major];
  const positions=terms.map(t=>text.toLowerCase().indexOf(t.toLowerCase())).filter(p=>p>=0);
  const offset=Math.max(0,Math.min(...positions)-100);
  return {...candidate,excerpt:text.slice(offset,offset+800),checkedAt,sourceType:"学校公开公告正文 · 待核验"};
}
