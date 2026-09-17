import type { CareerCatalog, ResearchInput, ResearchBundle, ResearchLead } from "./types";
import { safeUrl } from "./validation";
import { resolveMajor } from "./engine";

const text = (v: unknown, required: boolean) => {
  if (v === undefined && !required) return "";
  if (typeof v !== "string" || v.length > 80) throw new Error("专业与企业请填写80字以内文本");
  const clean = v.normalize("NFKC").replace(/[^\p{L}\p{N} /（）。()、-]/gu, " ").replace(/\s+/g, " ").trim();
  if (required && !clean) throw new Error("请先输入专业");
  return clean;
};
export function researchInput(value: unknown): ResearchInput {
  if (!value || typeof value !== "object") throw new Error("请求格式错误");
  const v = value as Record<string, unknown>;
  if (!["internship", "career", "competition"].includes(String(v.topic))) throw new Error("研究主题无效");
  return {major: text(v.major, true), company: text(v.company, false), topic: v.topic as ResearchInput["topic"]};
}
export function buildResearchQuery(input: ResearchInput, catalog: CareerCatalog) {
  const topics = {internship:"(实习生 OR 实习招聘 OR 校园招聘 OR 校招 OR 招聘岗位)",career:"(工艺 OR 培养 OR 晋升 OR 年报)",competition:"(校园招聘 OR 培养方案 OR 研究生招生目录)"};
  const major = resolveMajor(input.major, catalog);
  const company = catalog.employers.find(e => input.company && (e.name === input.company || e.name.includes(input.company)));
  const domains = ["gov.cn", "edu.cn", "gzrecruit.com"];
  if (company?.website) domains.push(new URL(company.website).hostname.replace(/^www\./, ""));
  const terms=input.topic==="internship" && major ? [...new Set([input.major,...major.aliases.slice(0,3),...major.tags.filter(t=>major.id!=="digital-media" || t!=="视觉设计").slice(0,4)])] : major?.tags.slice(0,2) ?? [input.major];
  const subject = input.company ? `${input.company} (${terms.join(" OR ")})` : input.topic==="internship" ? `(${terms.join(" OR ")})` : input.major;
  return `${subject} ${topics[input.topic]} (${domains.map(d => `site:${d}`).join(" OR ")})`.slice(0, 500);
}
function sourceType(url: string, catalog: CareerCatalog): string | null {
  const host = new URL(url).hostname;
  if (host.endsWith(".gov.cn") || host === "gov.cn") return "政府公开来源";
  if (host.endsWith(".edu.cn") || host === "edu.cn") return "学校公开来源";
  if (host === "gzrecruit.com" || host.endsWith(".gzrecruit.com")) return "公共人才平台";
  if (host === "osta.org.cn" || host.endsWith(".osta.org.cn")) return "技能评价官方来源";
  const official = catalog.employers.some(e => e.website && new URL(e.website).hostname.replace(/^www\./, "") === host.replace(/^www\./, ""));
  return official ? "企业官网来源" : null;
}
export function normalizeResearchResults(value: unknown, checkedAt: string, catalog: CareerCatalog): ResearchLead[] {
  if (!Array.isArray(value)) return [];
  const seen = new Set<string>();
  return value.slice(0, 20).flatMap(row => {
    if (!row || typeof row !== "object") return [];
    const v = row as Record<string, unknown>;
    const safe = safeUrl(v.url);
    if (!safe || typeof v.title !== "string" || !v.title.trim()) return [];
    const url = new URL(safe); url.hash = "";
    const source = sourceType(url.href, catalog);
    if (!source || seen.has(url.href)) return [];
    seen.add(url.href);
    return [{title: v.title.slice(0, 200), url: url.href, excerpt: typeof v.description === "string" ? v.description.slice(0, 800) : "请打开原始来源核实内容。", sourceType: source, checkedAt, status: "lead" as const}];
  });
}
export function takeLocalBudget(state: {day: string; used: number}, now: Date, max = 10) {
  const day = now.toISOString().slice(0, 10);
  if (state.day !== day) {state.day = day; state.used = 0;}
  if (state.used >= max) return false;
  state.used++;
  return true;
}
export function validateResearchBundle(value: unknown, catalog: CareerCatalog): ResearchBundle | null {
  if (!value || typeof value !== "object") return null;
  const v = value as ResearchBundle;
  if (typeof v.query !== "string" || v.query.length > 500 || !Number.isFinite(Date.parse(v.checkedAt)) || !Number.isFinite(Date.parse(v.expiresAt)) || Date.parse(v.expiresAt) <= Date.parse(v.checkedAt) || !Array.isArray(v.leads) || !Number.isFinite(v.creditsUsed)) return null;
  const valid = normalizeResearchResults(v.leads.map(l => ({...l, description: l.excerpt})), v.checkedAt, catalog);
  if (valid.length !== v.leads.length) return null;
  return {...v, leads: valid};
}
