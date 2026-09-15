import {authorizedRefresh,refreshMajors} from "@/lib/server/operations";
import {ResearchError,searchResearch} from "@/lib/server/research";
export const dynamic="force-dynamic";
export const maxDuration=120;
export async function POST(request:Request) {
  if (!authorizedRefresh(request.headers.get("authorization"),process.env.CRON_SECRET))
    return Response.json({error:"更新入口未授权"},{status:401});
  let majors:string[];
  try {majors=refreshMajors(process.env.CAREER_REFRESH_MAJORS);}
  catch {return Response.json({error:"更新专业配置无效"},{status:503});}
  const results=[];
  for (const major of majors) {
    try {
      const result=await searchResearch({major,topic:"internship"},request,true);
      results.push({major,ok:true,leads:result.leads.length,cached:result.cached,checkedAt:result.checkedAt});
    } catch (error) {
      results.push({major,ok:false,error:error instanceof ResearchError ? error.message : "更新暂不可用"});
    }
  }
  return Response.json({ok:results.length>0 && results.every(r=>r.ok),results},{status:results.length>0 && results.every(r=>r.ok) ? 200 : 503,headers:{"Cache-Control":"no-store"}});
}
