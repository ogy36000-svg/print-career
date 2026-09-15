import { emptyUserData, type UserData } from "./types";
export function normalizeUserData(value: unknown): UserData {
  const v = value && typeof value === "object" ? value as Record<string, unknown> : {};
  const p = v.profile && typeof v.profile === "object" ? v.profile as Record<string, unknown> : {};
  const text = (x: unknown, fallback="") => typeof x === "string" ? x.slice(0,4000) : fallback;
  const strings = (x: unknown) => Array.isArray(x) ? x.filter((s):s is string => typeof s === "string").slice(0,300).map(s=>s.slice(0,500)) : [];
  const statuses = v.companyStatus && typeof v.companyStatus === "object" ? Object.fromEntries(Object.entries(v.companyStatus).filter(([,s])=>["想投","已投递","面试中","拿到offer","已放弃"].includes(String(s)))) as UserData["companyStatus"] : {};
  return {...emptyUserData,profile:{name:text(p.name),phone:text(p.phone),email:text(p.email),intro:text(p.intro),major:text(p.major,"printing"),grade:text(p.grade,"3"),skills:strings(p.skills),certs:strings(p.certs),english:text(p.english,"无"),japanese:text(p.japanese,"无"),directions:strings(p.directions),resumeUrl:text(p.resumeUrl),resumeAnalysis:text(p.resumeAnalysis)},favorites:strings(v.favorites),skillDone:strings(v.skillDone),taskDone:strings(v.taskDone),customSkills:strings(v.customSkills),companyStatus:statuses,updatedAt:text(v.updatedAt)};
}
export function privateStorageKey(userId: string | null) {return userId ? `print-career:account:${userId}` : "print-career-data";}
export function canSyncToCloud(userId:string|null,consent:boolean,loadedOwner:string|null) {return Boolean(userId && consent && loadedOwner === userId);}
