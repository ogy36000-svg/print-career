export type Grade = "S" | "A" | "B" | "C";

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

export interface UserData {
  profile: {
    name: string;
    phone: string;
    email: string;
    intro: string;
    skills: string[];
    certs: string[];
    english: string; // 无 / CET-4 / CET-6
    japanese: string; // 无 / N5-N4 / N3 / N2 / N1
    directions: string[];
    resumeUrl: string;
  };
  favorites: string[]; // company ids
  companyStatus: Record<string, "想投" | "已投递" | "面试中" | "拿到offer" | "已放弃">;
  skillDone: string[]; // checked skills in growth center
  updatedAt: string;
}

export const emptyUserData: UserData = {
  profile: {
    name: "",
    phone: "",
    email: "",
    intro: "",
    skills: [],
    certs: [],
    english: "无",
    japanese: "N5-N4",
    directions: [],
    resumeUrl: "",
  },
  favorites: [],
  companyStatus: {},
  skillDone: [],
  updatedAt: "",
};
