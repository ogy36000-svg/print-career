import companiesJson from "@/data/companies.json";
import jobsJson from "@/data/jobs.json";
import majorsJson from "@/data/majors.json";
import certsJson from "@/data/certs.json";
import rolesJson from "@/data/roles.json";
import industryJson from "@/data/industry.json";
import type {
  CompaniesData,
  JobsData,
  Company,
  Job,
  Major,
  Cert,
  CertTimelinePhase,
  Role,
  IndustryData,
} from "./types";

export const companiesData = companiesJson as unknown as CompaniesData;
export const jobsData = jobsJson as unknown as JobsData;
export const companies: Company[] = companiesData.companies;
export const jobs: Job[] = jobsData.jobs;

export const majorsData = majorsJson as unknown as { updated: string; majors: Major[]; grades: { id: string; label: string }[] };
export const majors: Major[] = majorsData.majors;
export const gradeOptions = majorsData.grades;

export interface CertsData {
  updated: string;
  note: string;
  certs: Cert[];
  timeline: { note: string; phases: CertTimelinePhase[] };
}
export const certsData = certsJson as unknown as CertsData;
export const certs: Cert[] = certsData.certs;
export const certTimeline = certsData.timeline;

export interface RolesData {
  updated: string;
  note: string;
  roles: Role[];
}
export const rolesData = rolesJson as unknown as RolesData;
export const roles: Role[] = rolesData.roles;

export const industryData = industryJson as unknown as IndustryData;

export function getCompany(id: string): Company | undefined {
  return companies.find((c) => c.id === id);
}

export function getMajor(id: string): Major | undefined {
  return majors.find((m) => m.id === id);
}

/** 各大招聘平台实时搜索跳转链接（关键词直达，数据永远是平台实时结果） */
export function jobSearchLinks(keyword: string, city?: string) {
  const kw = encodeURIComponent(keyword);
  return [
    { platform: "BOSS直聘", color: "bg-teal-500", url: `https://www.zhipin.com/web/geek/job?query=${kw}` },
    { platform: "前程无忧", color: "bg-orange-500", url: `https://we.51job.com/pc/search?keyword=${kw}&searchType=2&sortType=0` },
    { platform: "智联招聘", color: "bg-blue-600", url: `https://sou.zhaopin.com/?kw=${kw}` },
    { platform: "猎聘", color: "bg-amber-500", url: `https://www.liepin.com/zhaopin/?key=${kw}` },
    { platform: "实习僧", color: "bg-emerald-500", url: `https://www.shixiseng.com/interns?keyword=${kw}` },
    { platform: "中国印刷人才网", color: "bg-rose-500", url: `https://www.pjob.net/jobs?keyword=${kw}` },
  ];
}

/** 高德地图免费URI搜索（无需Key） */
export function amapSearchLink(name: string, city: string) {
  return `https://uri.amap.com/search?keyword=${encodeURIComponent(name)}&city=${encodeURIComponent(city)}&callnative=1`;
}

export const gradeStyle: Record<string, { badge: string; ring: string; label: string; color: string }> = {
  S: { badge: "bg-gradient-to-r from-orange-500 to-rose-500 text-white", ring: "ring-orange-300", label: "强烈推荐", color: "#ff5a3c" },
  A: { badge: "bg-gradient-to-r from-blue-500 to-cyan-500 text-white", ring: "ring-blue-200", label: "推荐", color: "#2563eb" },
  B: { badge: "bg-gradient-to-r from-violet-500 to-purple-400 text-white", ring: "ring-violet-200", label: "可投", color: "#8b5cf6" },
  C: { badge: "bg-slate-400 text-white", ring: "ring-slate-200", label: "特殊/了解", color: "#94a3b8" },
};

/** 按企业类型给职业健康提示（企业详情页展示） */
export function healthHint(c: Company): string | null {
  const t = c.type + c.tags.join() + (c.tech ?? "");
  if (/货币|印钞|防伪/.test(t)) return "防伪印制企业管理规范，防护标准高于普通印厂；部分岗位有保密要求，工作区域管控严格。";
  if (/烟包|凹印|软包装/.test(t)) return "凹印/烟包车间溶剂型油墨较多，VOCs 接触相对高；优先选有集气处理、通过绿色印刷认证的大厂，注意岗位防护。";
  if (/书刊|出版|教材/.test(t)) return "书刊印刷以轮转胶印+胶订/骑订联动线为主；印后车间有热熔胶气味和噪声，制版岗位接触 CTP 显影液（碱性），规范操作+戴手套即可。";
  if (/数码|数字/.test(t)) return "数码印刷车间无溶剂油墨气味，环境明显优于传统车间；碳粉机型注意粉尘，UV 机型注意避光和通风。";
  if (/包装|瓦楞|金属/.test(t)) return "包装印刷车间有油墨和印后（模切/糊盒）噪声；印后岗位注意机械操作安全。";
  if (/设备/.test(t)) return "设备商岗位以装配调试和客户现场服务为主，接触油墨少；售后工程师出差频繁。";
  if (/出版社/.test(t)) return "出版社印制管理为办公室岗位，主要负责外部印厂的质量与周期管控，健康风险低。";
  return null;
}

/** 按企业类别返回卡片背景图（印刷行业实拍风） */
export function companyImage(c: Company): string {
  const t = c.type + c.tags.join() + (c.tech ?? "");
  const img = (prompt: string) =>
    `https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=${encodeURIComponent(prompt)}&image_size=landscape_16_9`;
  if (/货币|印钞|防伪/.test(t)) return img("security printing guilloche intricate pattern close-up, banknote design, deep blue and gold, photorealistic macro");
  if (/出版社|出版/.test(t)) return img("publishing house library stacks of printed books warm light, photorealistic");
  if (/设备/.test(t)) return img("large offset printing press machine in bright modern factory, photorealistic");
  if (/数码|数字/.test(t)) return img("digital inkjet label printer working in clean modern workshop, photorealistic");
  if (/书刊|教材/.test(t)) return img("web offset press printing books at high speed, newspaper printing, photorealistic");
  if (/金属|制罐/.test(t)) return img("aluminum beverage cans on production line, shiny metal packaging factory, photorealistic");
  if (/标签/.test(t)) return img("colorful adhesive label rolls on flexo printing machine, photorealistic");
  if (/软包装|塑料/.test(t)) return img("flexible packaging film rolls in bright factory, photorealistic");
  if (/包装|瓦楞/.test(t)) return img("colorful printed packaging boxes on automated production line, photorealistic");
  if (/外贸|新媒体|方向|跨境/.test(t)) return img("young professional at desk with laptop and world map, global trade concept, photorealistic");
  if (/艺术|文化/.test(t)) return img("art book printing fine art reproduction workshop, gallery quality, photorealistic");
  return img("commercial printing factory with CMYK ink colors, wide shot, photorealistic");
}

/** 技能池：从岗位库聚合 + 常用补充 */
export const skillPool: string[] = Array.from(
  new Set([
    ...jobs.flatMap((j) => j.skills),
    "数码印刷机操作",
    "CTP制版",
    "防伪技术",
    "印刷英语",
    "英语",
    "日语",
    "短视频拍摄剪辑",
    "文案写作",
    "Excel",
  ])
);

export const certPool = certs.map((c) => c.name);

export const directionPool = [
  "生产技术（机长/数码印刷）",
  "印前制作/CTP制版",
  "包装结构设计",
  "包装/平面设计",
  "色彩管理",
  "防伪技术",
  "品质工程",
  "外贸业务",
  "出版社印制管理",
  "设备工程师",
  "新媒体运营",
  "销售业务",
];
