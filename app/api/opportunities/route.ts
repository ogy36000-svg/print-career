import { researchInput } from "@/lib/career/research";
import { opportunityLead } from "@/lib/career/opportunities";
import { backupCatalog } from "@/lib/career/backup";
import { loadOpportunities } from "@/lib/server/opportunities";
import { ResearchError, searchResearch } from "@/lib/server/research";
import { readLimitedJson } from "@/lib/server/operations";
export const dynamic="force-dynamic";
const headers={"Cache-Control":"no-store"};
function queryInput(value:Record<string,unknown>) {
  const {major}=researchInput({...value,topic:"internship"});
  const grade=String(value.grade ?? value.year ?? "3");
  if (!["1","2","3","4"].includes(grade)) throw new Error("请选择有效年级");
  return {major,grade};
}
export async function GET(request:Request) {
  let query;
  const params=new URL(request.url).searchParams;
  try {query=queryInput(Object.fromEntries(params));} catch(error){return Response.json({error:error instanceof Error ? error.message : "请求格式错误"},{status:400,headers});}
  return Response.json(await loadOpportunities(query,backupCatalog,params.get("refresh")==="true" || params.get("refresh")==="1"),{headers});
}
export async function POST(request:Request) {
  let query;let input;
  try {const value=await readLimitedJson(request);input=researchInput({...value as object,topic:(value as Record<string,unknown>).topic ?? "internship"});query=queryInput(value as Record<string,unknown>);}
  catch(error){return Response.json({error:error instanceof Error ? error.message : "请求格式错误"},{status:error instanceof Error && error.message==="请求过大" ? 413 : 400,headers});}
  try {
    const bundle=await searchResearch(input,request);
    const response=await loadOpportunities(query,backupCatalog);
    const seen=new Set(response.leads.map(l=>l.url));
    const leads=[...response.leads,...bundle.leads.filter(l=>opportunityLead(l,query.major,backupCatalog,input.topic) && !seen.has(l.url))];
    return Response.json({...response,leads,checkedAt:bundle.checkedAt,cached:bundle.cached,message:"已加入公开来源检索线索，请打开公告核实职责、对象与投递状态。"},{headers});
  } catch(error){return Response.json({error:error instanceof ResearchError ? error.message : "来源检索暂不可用"},{status:error instanceof ResearchError ? error.status : 500,headers});}
}
