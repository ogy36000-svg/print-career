import type { CareerCatalog } from "./types";
export function safeUrl(value: unknown): string | null {
  if (typeof value !== "string" || value.length > 2048) return null;
  try {
    const url = new URL(value);
    if (!["https:", "http:"].includes(url.protocol) || url.username || url.password) return null;
    const host = url.hostname.toLowerCase();
    if (!host.includes(".") || /(^localhost$|\.(localhost|local|internal)$|^\[)/.test(host)) return null;
    if (/^\d+\.\d+\.\d+\.\d+$/.test(host)) return null;
    return url.href;
  } catch { return null; }
}
const object = (v: unknown): Record<string, unknown> => {
  if (!v || typeof v !== "object" || Array.isArray(v)) throw new Error("目录对象格式错误");
  return v as Record<string, unknown>;
};
const string = (v: unknown, max = 4000): string => {
  if (typeof v !== "string" || !v.trim() || v.length > max) throw new Error("目录文本格式错误");
  return v;
};
const list = (v: unknown, max = 10000): unknown[] => {
  if (!Array.isArray(v) || v.length > max) throw new Error("目录列表格式错误");
  return v;
};
const strings = (v: unknown) => list(v, 120).forEach(x => string(x, 400));
const date = (v: unknown) => {
  if (typeof v !== "string" || !/^\d{4}-\d{2}-\d{2}(T.*)?$/.test(v) || !Number.isFinite(Date.parse(v))) throw new Error("核验日期格式错误");
};
const url = (v: unknown) => { if (!safeUrl(v)) throw new Error("目录来源URL不安全"); };
const unique = (rows: unknown[]) => {
  const ids = rows.map(row => string(object(row).id, 100));
  if (new Set(ids).size !== ids.length) throw new Error("目录ID重复");
  return new Set(ids);
};
export function validateCatalog(value: unknown): CareerCatalog {
  const data = object(value);
  if (data.version !== 1) throw new Error("不支持此目录版本");
  date(data.updated);
  const employers = list(data.employers);
  const employerIds = unique(employers);
  for (const item of employers) {
    const e = object(item); string(e.name, 200); string(e.city, 100); string(e.sector, 200); strings(e.tags);
    if (e.website !== null) url(e.website);
    const evidence = object(e.evidence);
    if (!["enterprise", "historical", "lead"].includes(String(evidence.kind))) throw new Error("企业证据类型错误");
    if (evidence.url !== null || evidence.kind === "enterprise") url(evidence.url);
    string(evidence.note);
    if (evidence.checkedAt !== null) date(evidence.checkedAt);
  }
  const roles = list(data.roles, 200); const roleIds = unique(roles);
  for (const item of roles) {
    const r = object(item); string(r.title, 200); string(r.environment); string(r.study);
    for (const key of ["tags", "tasks", "skills", "technicalPath", "managementPath", "bottlenecks"]) strings(r[key]);
    list(r.sourceUrls, 20).forEach(url);
  }
  const majors = list(data.majors, 500); unique(majors);
  for (const item of majors) {
    const m = object(item); string(m.label, 200); strings(m.aliases); strings(m.tags); strings(m.roleIds);
    if ((m.roleIds as string[]).some(id => !roleIds.has(id))) throw new Error("专业引用未知职业");
    for (const item of list(m.certificates, 30)) {
      const c = object(item); string(c.name, 200); string(c.reason); url(c.sourceUrl);
      if (!["goal", "optional"].includes(String(c.kind))) throw new Error("学习证书不能伪装成统一岗位硬门槛");
    }
  }
  const vacancies = list(data.vacancies); unique(vacancies);
  for (const item of vacancies) {
    const v = object(item); string(v.title, 200); string(v.city, 100); strings(v.tags); strings(v.requirements);
    if (!employerIds.has(String(v.employerId))) throw new Error("职位引用未知企业");
    url(v.sourceUrl); date(v.checkedAt); date(v.expiresAt);
    if (!["verified", "lead", "closed"].includes(String(v.status))) throw new Error("职位状态错误");
  }
  return data as unknown as CareerCatalog;
}
