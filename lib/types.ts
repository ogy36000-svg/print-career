export type Grade = "S" | "A" | "B" | "C";

export interface CompaniesData {
  updated: string;
  sources: string[];
  grades: Record<Grade, string>;
  companies: Company[];
}

export interface JobsData {
  updated: string;
  note: string;
  jobs: Job[];
}

export interface Company {
  id: string;
  name: string;
  fullName: string;
  city: string;
  district: string;
  province: string;
  lng: number;
  lat: number;
  address: string;
  type: string;
  relation: "direct" | "indirect";
  scale: string;
  listed: string;
  rank2025: number | null;
  desc: string;
  jobs: string[];
  skills: string[];
  lang: string;
  overseas: string;
  website: string | null;
  recommend: Grade;
  reason: string;
  tags: string[];
  source: string;
  /** 主要印刷/生产设备 */
  equipment?: string[];
  /** 产能/营收规模 */
  capacity?: string;
  /** 市值或上市信息 */
  marketValue?: string;
  /** 核心技术 */
  tech?: string;
}

export interface Job {
  id: string;
  title: string;
  category: string;
  match: string;
  salary: string;
  requirements: string;
  skills: string[];
  growth: string;
  prospect: string;
  searchKeyword: string;
  relatedCompanies: string[];
}

export interface Major {
  id: string;
  name: string;
  keywords: string[];
  defaultSkills: string[];
  relatedCompanies: string[];
  relatedRoles?: string[];
  relatedCerts?: string[];
}

/** 考证事件：date 为 ISO 字符串；status 区分数据来源可靠性 */
export interface CertEvent {
  label: string;
  date: string;
  type: "报名" | "考试";
  status: "官方公布" | "按往届推算" | "常年开放" | "机构排期";
  note?: string;
}

export interface Cert {
  id: string;
  name: string;
  shortName: string;
  importance: string;
  category: string;
  color: string;
  events: CertEvent[];
  officialUrl: string;
  officialName: string;
  prep: string;
  cost: string;
  source: string;
}

export interface CertTimelinePhase {
  period: string;
  priority: string;
  actions: string[];
}

/** 职业百科 */
export interface Role {
  id: string;
  title: string;
  category: string;
  color: string;
  intro: string;
  daily: string;
  equipment: string[];
  software: string[];
  requirements: string;
  pros: string[];
  cons: string[];
  health: string;
  salary: string;
  growth: string;
  english: string;
  fit: string;
  searchKeyword: string;
}

/** 行业趋势 */
export interface IndustryData {
  updated: string;
  trends: {
    id: string;
    title: string;
    badge: string;
    summary: string;
    detail: string;
    source: string;
    date: string;
    links?: { title: string; url: string }[];
  }[];
  overseas: {
    note: string;
    china?: { lat: number; lng: number };
    destinations: { name: string; x: number; y: number; lat?: number; lng?: number; note: string; companies: string }[];
  };
  english: {
    why: string;
    terms: { en: string; zh: string }[];
  };
  sources: string[];
}

export interface UserData {
  profile: {
    name: string;
    phone: string;
    email: string;
    intro: string;
    major: string; // 专业id
    grade: string; // 年级
    skills: string[];
    certs: string[];
    english: string;
    japanese: string;
    directions: string[];
    resumeUrl: string;
    resumeAnalysis: string; // 简历本地解析摘要
  };
  favorites: string[];
  companyStatus: Record<string, "想投" | "已投递" | "面试中" | "拿到offer" | "已放弃">;
  skillDone: string[];
  /** 成长路径任务完成状态（任务文本作为key） */
  taskDone: string[];
  /** 用户自定义添加的技能 */
  customSkills: string[];
  updatedAt: string;
}

export const emptyUserData: UserData = {
  profile: {
    name: "",
    phone: "",
    email: "",
    intro: "",
    major: "printing",
    grade: "3",
    skills: [],
    certs: [],
    english: "无",
    japanese: "无",
    directions: [],
    resumeUrl: "",
    resumeAnalysis: "",
  },
  favorites: [],
  companyStatus: {},
  skillDone: [],
  taskDone: [],
  customSkills: [],
  updatedAt: "",
};
