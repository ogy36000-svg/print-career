export interface Evidence { kind: string; url: string | null; checkedAt: string | null; note: string }
export interface Employer {
  id: string; name: string; city: string; sector: string; website: string | null;
  tags: string[]; evidence: Evidence; rank?: number | null; rankYear?: number;
}
export interface CertificateGoal { name: string; kind: string; reason: string; sourceUrl: string }
export interface MajorProfile {
  id: string; label: string; aliases: string[]; tags: string[]; roleIds: string[];
  certificates: CertificateGoal[];
}
export interface CareerRole {
  id: string; title: string; tags: string[]; environment: string; tasks: string[];
  skills: string[]; technicalPath: string[]; managementPath: string[];
  bottlenecks: string[]; study: string; sourceUrls: string[];
}
export interface Vacancy {
  id: string; employerId: string; title: string; tags: string[]; city: string;
  requirements: string[]; sourceUrl: string; checkedAt: string; expiresAt: string;
  status: string;
}
export interface CareerCatalog {
  version: number; updated: string; employers: Employer[]; vacancies: Vacancy[];
  majors: MajorProfile[]; roles: CareerRole[];
}
export interface CareerQuery { major: string; grade: string; city?: string; skills?: string[] }
export interface EmployerMatch { employer: Employer; relevance: number; reasons: string[] }
export type ResearchTopic = "internship" | "career" | "competition";
export interface ResearchInput { major: string; company?: string; topic: ResearchTopic }
export interface ResearchLead {
  title: string; url: string; excerpt: string; sourceType: string; checkedAt: string;
  status: "lead";
}
export interface ResearchBundle {
  query: string; checkedAt: string; expiresAt: string; leads: ResearchLead[];
  creditsUsed: number; cached: boolean;
}
