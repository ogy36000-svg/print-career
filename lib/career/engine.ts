import type { CareerCatalog, CareerQuery, Employer, EmployerMatch, Vacancy } from "./types";
import { safeUrl } from "./validation";

const normalized = (value: string) => value.normalize("NFKC").toLowerCase().replace(/\s+/g, "");
export function resolveMajor(text: string, catalog: CareerCatalog) {
  const input = normalized(text.trim());
  if (!input) return null;
  const exact = catalog.majors.find(m => m.id === input || normalized(m.label) === input);
  if (exact) return exact;
  const hits = catalog.majors.flatMap(m => m.aliases.filter(alias => input.includes(normalized(alias))).map(alias => ({major: m, length: alias.length})));
  return hits.sort((a, b) => b.length - a.length)[0]?.major ?? null;
}

export function recommendCompanies(employers: Employer[], query: CareerQuery, catalog: CareerCatalog): EmployerMatch[] {
  const major = resolveMajor(query.major, catalog);
  if (!major) return [];
  return employers.flatMap(employer => {
    const hits = employer.tags.filter(tag => major.tags.includes(tag));
    if (!hits.length) return [];
    if (major.id === "digital-media" && !hits.some(tag => ["交互设计", "媒体制作"].includes(tag))) return [];
    const cityHit = Boolean(query.city?.trim() && employer.city.includes(query.city.trim()));
    const skills = employer.tags.filter(tag => query.skills?.some(skill => normalized(skill) === normalized(tag)));
    const reasons = [`能力方向交叉：${hits.join("、")}`];
    if (cityHit) reasons.push(`目标城市：${employer.city}`);
    if (skills.length) reasons.push(`已有能力：${skills.join("、")}`);
    return [{ employer, relevance: hits.length * 10 + (cityHit ? 5 : 0) + skills.length * 2, reasons }];
  }).sort((a, b) => b.relevance - a.relevance || (a.employer.rank ?? 10000) - (b.employer.rank ?? 10000));
}

export function recommendVacancies(vacancies: Vacancy[], query: CareerQuery, catalog: CareerCatalog, now = new Date()): Vacancy[] {
  const major = resolveMajor(query.major, catalog);
  if (!major) return [];
  return vacancies.filter(v => v.status === "verified" && safeUrl(v.sourceUrl)
    && Number.isFinite(Date.parse(v.checkedAt)) && Date.parse(v.checkedAt) <= now.getTime()
    && now.getTime() - Date.parse(v.checkedAt) <= 30 * 86400000
    && Date.parse(v.expiresAt) > now.getTime() && v.tags.some(tag => major.tags.includes(tag)))
    .sort((a, b) => Number(Boolean(query.city && b.city.includes(query.city))) - Number(Boolean(query.city && a.city.includes(query.city))) || Date.parse(b.checkedAt) - Date.parse(a.checkedAt));
}

export function careerAdvice(query: CareerQuery, catalog: CareerCatalog) {
  const major = resolveMajor(query.major, catalog);
  const roles = major ? catalog.roles.filter(role => major.roleIds.includes(role.id)) : [];
  const missingSkills = [...new Set(roles.flatMap(role => role.skills))].filter(tag => !query.skills?.some(skill => normalized(skill) === normalized(tag)));
  const plans: Record<string, string[]> = {
    "1": ["先了解目标职业的日常任务与工作环境", "选择两项专业基础能力完成课程项目", "收集真实岗位要求，记录来源而非急着堆证书"],
    "2": ["确定一条主方向，完成可展示的小项目", "补齐专业软件与实验/设备基础", "寻找短期见习，了解工作班制与指导机制"],
    "3": ["收集5条可核验的目标岗位公告，对比真实要求", "完成1个完整项目或实训案例", "联系学校实习资源，核实导师、岗位与劳动条件"],
    "4": ["按报名截止日安排投递，保留公告和简历版本", "用项目证据准备面试，确认工作地点和培养计划", "每周更新投递记录与跟进日期", "考研与就业并行比较：先查目标岗位学历要求与招生目录"],
  };
  const plan = [...(plans[query.grade] ?? plans["3"])];
  if (major?.id === "printing" && query.grade === "3") plan.push("印刷方向：按老师建议推进英语六级；投递门槛以具体公告为准");
  return {roles, missingSkills, certificates: major?.certificates ?? [], plan: major ? plan : ["当前目录尚未覆盖这个专业，请先联网检索官方岗位公告", "核实岗位职责后再确定技能与证书目标"]};
}

export function promotionScenario(input: {machines: number | null; shifts: number; leadersPerShift: number; occupied: number | null}) {
  for (const n of [input.machines, input.shifts, input.leadersPerShift, input.occupied]) {
    if (n !== null && (!Number.isInteger(n) || n < 0 || n > 10000)) throw new Error("情景参数必须为有效非负整数");
  }
  if (input.shifts < 1 || input.leadersPerShift < 1) throw new Error("班次与每班负责人不能为零");
  const slots = input.machines === null ? null : input.machines * input.shifts * input.leadersPerShift;
  return {slots, vacancies: slots === null || input.occupied === null ? null : Math.max(0, slots - input.occupied), hypothetical: true};
}
