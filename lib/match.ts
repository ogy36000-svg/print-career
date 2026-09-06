import type { Company, UserData, Major } from "./types";
import { getMajor } from "./data";

export interface MatchResult {
  company: Company;
  score: number;
  tier: "强烈推荐" | "推荐" | "可冲刺";
  hits: string[];
}

const gradeBase: Record<string, number> = { S: 88, A: 74, B: 60, C: 45 };

export function matchCompanies(companies: Company[], ud: UserData): MatchResult[] {
  const skills = ud.profile.skills;
  const english = ud.profile.english;
  const japanese = ud.profile.japanese;
  const hasJapanese = japanese !== "无";
  const hasEnglish = english === "CET-4" || english === "CET-6";
  const major = getMajor(ud.profile.major);
  const majorCompanyIds = new Set(major?.relatedCompanies ?? []);

  const results = companies.map((c) => {
    let score = gradeBase[c.recommend] ?? 50;
    const hits: string[] = [];

    // 专业关联度（最高权重）
    if (majorCompanyIds.has(c.id)) {
      score += 12;
      hits.push(`与「${major?.name}」高度对口`);
    }

    // 语言杠杆
    const langText = c.lang + c.tags.join("");
    if (hasJapanese && /日语|日资/.test(langText)) {
      score += 10;
      hits.push(`你的${japanese}日语在日资企业是硬通货`);
    }
    if (hasEnglish && /英语|外企|出口|外贸/.test(langText)) {
      score += 6;
      hits.push(`${english}符合语言要求`);
    }

    // 技能匹配
    const skillHits = c.skills.filter((s) =>
      skills.some((us) => us.includes(s) || s.includes(us))
    );
    if (skillHits.length > 0) {
      score += Math.min(9, skillHits.length * 3);
      hits.push(`技能匹配：${skillHits.slice(0, 3).join("、")}`);
    }

    // 意向方向匹配
    const dirHits = ud.profile.directions.filter((d) =>
      c.jobs.some((j) => d.includes(j.slice(0, 2)) || j.includes(d.slice(0, 2)))
    );
    if (dirHits.length > 0) {
      score += 4;
      hits.push("与你的目标方向一致");
    }

    // 本地/近水楼台加分（广州白云区学生）
    if (c.city === "广州") {
      score += 3;
      if (c.district.includes("白云") || c.district.includes("番禺") || c.district.includes("黄埔")) {
        hits.push("广州本地，通勤/实习方便");
      }
    }

    score = Math.max(40, Math.min(99, score));
    const tier = score >= 85 ? "强烈推荐" : score >= 68 ? "推荐" : "可冲刺";
    return { company: c, score, tier, hits } as MatchResult;
  });

  return results.sort((a, b) => b.score - a.score);
}

/** 游客模式：仅按专业+年级快速推荐 */
export function quickMatchByMajor(companies: Company[], majorId: string): MatchResult[] {
  const major = getMajor(majorId);
  const ids = new Set(major?.relatedCompanies ?? []);
  const results = companies
    .filter((c) => ids.has(c.id))
    .map((c) => ({
      company: c,
      score: gradeBase[c.recommend] ?? 50,
      tier: (c.recommend === "S" ? "强烈推荐" : c.recommend === "A" ? "推荐" : "可冲刺") as MatchResult["tier"],
      hits: [`「${major?.name}」对口方向`],
    }))
    .sort((a, b) => b.score - a.score);
  // 专业库外的企业按等级补到10家
  const rest = companies
    .filter((c) => !ids.has(c.id))
    .map((c) => ({
      company: c,
      score: gradeBase[c.recommend] ?? 50,
      tier: (c.recommend === "S" ? "强烈推荐" : c.recommend === "A" ? "推荐" : "可冲刺") as MatchResult["tier"],
      hits: ["行业优质企业"],
    }))
    .sort((a, b) => b.score - a.score)
    .slice(0, Math.max(0, 10 - results.length));
  return [...results, ...rest];
}
