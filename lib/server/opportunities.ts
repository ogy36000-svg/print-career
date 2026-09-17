// Public transport only: no credentials, arbitrary URLs or provider requests.
import type { CareerCatalog, CareerQuery, OpportunityRecord, OpportunityResponse, ResearchLead } from "../career/types";
import { checkOpportunity, curatedOpportunities, detailLead, extractListingCandidates, extractListingLeads, opportunitiesForMajor, publicListingUrls } from "../career/opportunities";

type Page = {body:string|null;checkedAt:string|null};
const fixedUrls = [...new Set([...curatedOpportunities.map(r=>r.sourceUrl),...publicListingUrls])];
const MAX_BYTES=512*1024;
export async function readPublicPage(url: string, transport: typeof fetch = fetch): Promise<string> {
  if (!fixedUrls.includes(url)) throw new Error("来源不在公开注册表");
  return readBoundedPage(url,transport);
}
async function readBoundedPage(url:string,transport:typeof fetch):Promise<string> {
  const response=await transport(url,{redirect:"manual",cache:"no-store",signal:AbortSignal.timeout(10000),headers:{Accept:"text/html"}});
  if (!response.ok || response.status>=300 || (response.url && response.url!==url)) throw new Error("公开来源暂不可读");
  if (!/text\/html|text\/plain|application\/xhtml/i.test(response.headers.get("content-type") ?? "")) throw new Error("来源格式错误");
  if (Number(response.headers.get("content-length"))>MAX_BYTES) {await response.body?.cancel();throw new Error("来源超过读取上限");}
  if (!response.body) throw new Error("来源为空");
  const reader=response.body.getReader();const chunks:Uint8Array[]=[];let size=0;
  try {while(true){const part=await reader.read();if(part.done)break;size+=part.value.byteLength;if(size>MAX_BYTES) {await reader.cancel();throw new Error("来源超过读取上限");}chunks.push(part.value);}} finally {reader.releaseLock();}
  const bytes=new Uint8Array(size);let offset=0;for(const chunk of chunks){bytes.set(chunk,offset);offset+=chunk.length;}
  const prefix=new TextDecoder().decode(bytes.slice(0,2048));
  const charset=(response.headers.get("content-type")?.match(/charset=([\w-]+)/i)?.[1] ?? prefix.match(/charset\s*=\s*["']?([\w-]+)/i)?.[1] ?? "utf-8").toLowerCase();
  return new TextDecoder(["gbk","gb2312","gb18030"].includes(charset) ? "gb18030" : "utf-8").decode(bytes);
}
export function createOpportunityService(transport: typeof fetch = fetch, clock:()=>number = Date.now) {
  let lastAttempt:number|null=null;let checkedAt:string|null=null;let inFlight:Promise<void>|null=null;
  let failures=0;
  let records:OpportunityRecord[]=curatedOpportunities.map(r=>({...r}));
  const pages=new Map<string,Page>();
  let details:{candidate:ResearchLead;page:Page}[]=[];
  return async (query:CareerQuery,catalog:CareerCatalog,refresh=false):Promise<OpportunityResponse> => {
    const now=clock();let cached=true;
    const due=lastAttempt===null || now-lastAttempt >= (refresh ? 60000 : 15*60000);
    if (inFlight) {cached=false;await inFlight;}
    else if (due) {
      cached=false;lastAttempt=now;
      inFlight=(async()=>{
        const attemptedAt=new Date(now).toISOString();
        const results=await Promise.allSettled(fixedUrls.map(url=>readPublicPage(url,transport)));
        failures=results.filter(r=>r.status==="rejected").length;
        checkedAt=attemptedAt;
        results.forEach((result,i)=>{
          const url=fixedUrls[i];
          // Failed listing refresh retains its prior receipt; it never becomes newly checked.
          if (result.status==="fulfilled") pages.set(url,{body:result.value,checkedAt:attemptedAt});
          records=records.map(r=>r.sourceUrl===url ? checkOpportunity(r,result.status==="fulfilled" ? result.value : null,attemptedAt) : r);
        });
        // Top three distinct article links per listing, selected from this refresh only.
        // These targets originate in the fixed registry and are never supplied by a request.
        const candidates=publicListingUrls.flatMap(url=>{
          const index=fixedUrls.indexOf(url);const result=results[index];
          return result.status==="fulfilled" ? extractListingCandidates(result.value,url,attemptedAt).filter(l=>!curatedOpportunities.some(r=>r.sourceUrl===l.url)).slice(0,3) : [];
        });
        const detailResults=await Promise.allSettled(candidates.map(l=>readBoundedPage(l.url,transport)));
        const priorDetails=details;
        details=candidates.flatMap((candidate,i)=>{
          const result=detailResults[i];
          if(result.status==="fulfilled") return [{candidate,page:{body:result.value,checkedAt:attemptedAt}}];
          return priorDetails.filter(d=>d.candidate.url===candidate.url);
        });
        const failedOrigins=new Set(publicListingUrls.filter(url=>results[fixedUrls.indexOf(url)].status==="rejected").map(url=>new URL(url).origin));
        details.push(...priorDetails.filter(d=>failedOrigins.has(new URL(d.candidate.url).origin) && !details.some(current=>current.candidate.url===d.candidate.url)));
      })();
      try {await inFlight;} finally {inFlight=null;}
    }
    const items=opportunitiesForMajor(records,query.major,catalog);
    const seen=new Set(items.map(r=>r.sourceUrl));
    const leads=[...publicListingUrls.flatMap(url=>{const page=pages.get(url);return page?.body && page.checkedAt ? extractListingLeads(page.body,url,query.major,catalog,page.checkedAt) : [];}),
      ...details.flatMap(d=>{const lead=d.page.body && d.page.checkedAt ? detailLead(d.candidate,d.page.body,query.major,catalog,d.page.checkedAt) : null;return lead ? [lead] : [];})]
      .filter(l=>{if(seen.has(l.url))return false;seen.add(l.url);return true;}).slice(0,30);
    const stale=items.some(r=>r.availability==="stale");
    const message=failures===fixedUrls.length ? "暂时无法读取公开来源，已保留已有记录。" : stale || failures ? "部分来源暂不可读，已保留已有记录。" : !items.length && !leads.length ? "暂未找到匹配的公开公告，可继续按专业检索。" : "公开来源已更新，查看公告与职业参考。";
    return {major:query.major,items,leads,checkedAt,cached,message};
  };
}
export const loadOpportunities=createOpportunityService();
