import companiesJson from "@/data/companies.json";
import jobsJson from "@/data/jobs.json";
import type { CompaniesData, JobsData, Company, Job } from "./types";

export const companiesData = companiesJson as unknown as CompaniesData;
export const jobsData = jobsJson as unknown as JobsData;
export const companies: Company[] = companiesData.companies;
export const jobs: Job[] = jobsData.jobs;

export function getCompany(id: string): Company | undefined {
  return companies.find((c) => c.id === id);
}

/** 各大招聘平台实时搜索跳转链接（关键词直达，数据永远是平台实时结果） */
export function jobSearchLinks(keyword: string, city?: string) {
  const kw = encodeURIComponent(keyword);
  return [
    {
      platform: "BOSS直聘",
      color: "bg-teal-500",
      url: `https://www.zhipin.com/web/geek/job?query=${kw}`,
    },
    {
      platform: "前程无忧",
      color: "bg-orange-500",
      url: `https://we.51job.com/pc/search?keyword=${kw}&searchType=2&sortType=0`,
    },
    {
      platform: "智联招聘",
      color: "bg-blue-600",
      url: `https://sou.zhaopin.com/?kw=${kw}`,
    },
    {
      platform: "猎聘",
      color: "bg-amber-500",
      url: `https://www.liepin.com/zhaopin/?key=${kw}`,
    },
    {
      platform: "中国印刷人才网",
      color: "bg-rose-500",
      url: `https://www.pjob.net/jobs?keyword=${kw}`,
    },
  ];
}

/** 高德地图免费URI搜索（无需Key） */
export function amapSearchLink(name: string, city: string) {
  return `https://uri.amap.com/search?keyword=${encodeURIComponent(name)}&city=${encodeURIComponent(city)}&callnative=1`;
}

export const gradeStyle: Record<string, { badge: string; ring: string; label: string }> = {
  S: { badge: "bg-gradient-to-r from-orange-500 to-rose-500 text-white", ring: "ring-orange-300", label: "强烈推荐" },
  A: { badge: "bg-gradient-to-r from-blue-500 to-cyan-500 text-white", ring: "ring-blue-200", label: "推荐" },
  B: { badge: "bg-gradient-to-r from-violet-500 to-purple-400 text-white", ring: "ring-violet-200", label: "可投" },
  C: { badge: "bg-slate-400 text-white", ring: "ring-slate-200", label: "特殊/了解" },
};

/** 技能池：从岗位库聚合 + 常用补充 */
export const skillPool: string[] = Array.from(
  new Set([
    ...jobs.flatMap((j) => j.skills),
    "数码印刷机操作",
    "英语",
    "日语",
    "短视频拍摄剪辑",
    "文案写作",
    "Excel",
  ])
);

export const certPool = [
  "英语四级 CET-4",
  "英语六级 CET-6",
  "日语 JLPT N3",
  "日语 JLPT N2",
  "计算机二级",
  "Adobe认证（PS/AI）",
  "印前制作员（职业技能等级）",
  "平版印刷工（职业技能等级）",
  "G7色彩管理认证",
  "外贸单证员",
  "普通话二甲",
  "驾驶证",
];

export const directionPool = [
  "生产技术（机长/数码印刷）",
  "印前制作/制版",
  "包装结构设计",
  "包装/平面设计",
  "色彩管理",
  "品质工程",
  "外贸业务",
  "新媒体运营",
  "销售业务",
  "设备工程师",
];
