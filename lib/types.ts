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
}

export interface Cert {
  id: string;
  name: string;
  importance: string;
  category: string;
  examTimes: string[];
  regTimes: string[];
  regNotice: string;
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
    resumeAnalysis: string; // AI分析结果（预留）
  };
  favorites: string[];
  companyStatus: Record<string, "想投" | "已投递" | "面试中" | "拿到offer" | "已放弃">;
  skillDone: string[];
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
  updatedAt: "",
};
