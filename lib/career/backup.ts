import seed from "../../data/career-catalog.json";
import legacy from "../../data/companies.json";
import type { Company, CompaniesData } from "../types";
import type { CareerCatalog, Employer } from "./types";
import { safeUrl, validateCatalog } from "./validation";

const mappings: Record<string, RegExp> = {
  "印刷": /印刷|印制|印务/, "凹版印刷": /凹印|凹版|烟包/, "印前": /印前|CTP|制版/,
  "数字印刷": /数码|数字印刷|喷墨/, "色彩管理": /色彩|ICC|色差/,
  "包装工艺": /包装|印铁|制罐|复合/, "包装设计": /包装设计|结构设计|包装平面/,
  "视觉设计": /平面设计|品牌视觉|图文设计/, "设备维护": /设备|维修|售后|调试/,
  "机械": /机械|装配/, "自动化": /自动化|智能制造/, "外贸": /外贸|海外跟单/,
  "英语": /英语|外贸/, "营销": /销售|投放/, "内容运营": /新媒体|短视频|企业宣传/,
  "材料": /材料|油墨|软包装/, "工艺": /工艺|复合/, "质量管理": /品质|质量/,
  "电商": /电商/, "财务": /成本核算|财务/,
};
export function buildBackupCatalog(): CareerCatalog {
  const seedIds = new Set(seed.employers.map(e => e.id));
  const old = (legacy as unknown as CompaniesData).companies.filter(c => !/（群体）|（方向）|岗位方向|技术工程师（方向）/.test(c.name) && !seedIds.has(c.id));
  const employers: Employer[] = old.map(c => {
    const text = [...c.jobs, ...c.skills, c.type].join(" ");
    return {id:c.id, name:c.name, city:c.city, sector:c.type, description:c.desc?.trim().slice(0,2000) || c.type, website:safeUrl(c.website), rank:c.rank2025, rankYear:2025,
      tags:Object.entries(mappings).filter(([,pattern]) => pattern.test(text)).map(([tag]) => tag),
      evidence:{kind:"historical",url:safeUrl(c.website),checkedAt:null,note:`原版企业资料：${c.source}。${safeUrl(c.website) ? "" : "原版缺少可追溯来源链接。"}常见岗位仅用于方向研究，当前招聘与门槛未经重新核验。`}};
  });
  return validateCatalog({...seed, employers:[...seed.employers, ...employers]});
}
export const backupCatalog = buildBackupCatalog();
export function asLegacyCompany(e: Employer): Company {
  return {fullName:e.name,district:"",province:"",lng:0,lat:0,address:`${e.city}（城市级，具体地址待核实）`,relation:"indirect",scale:"未核实",listed:"企业研究对象",rank2025:e.rankYear===2025 ? e.rank ?? null : null,jobs:[],skills:e.tags,lang:"具体语言要求以招聘公告为准",overseas:"未核实",recommend:"B",reason:e.evidence.note,tags:e.tags,
    id:e.id,name:e.name,city:e.city,type:e.sector,website:e.website,desc:e.description ?? e.sector, source:`${e.evidence.note} 来源：${e.evidence.url ?? "待补充"} 核验：${e.evidence.checkedAt ?? "待核实"}`,
  } as Company;
}
