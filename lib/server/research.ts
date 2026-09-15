import "server-only";
import { createHash } from "node:crypto";
import { database, loadCatalog } from "./catalog";
import { buildResearchQuery, normalizeResearchResults, takeLocalBudget, validateResearchBundle } from "../career/research";
import type { ResearchBundle, ResearchInput } from "../career/types";

export class ResearchError extends Error { constructor(message: string, public status: number) {super(message);} }
const memory = new Map<string, ResearchBundle>();
const inFlight = new Map<string, Promise<ResearchBundle>>();
const budget = {day:"",used:0};
export async function searchResearch(input: ResearchInput, request: Request, scheduled = false): Promise<ResearchBundle> {
  const {catalog} = await loadCatalog();
  const query = buildResearchQuery(input,catalog);
  const key = createHash("sha256").update(query).digest("hex");
  const admin = database(true);
  const cached = memory.get(key);
  if (cached && Date.parse(cached.expiresAt) > Date.now()) return {...cached,cached:true};
  if (admin) {
    const {data} = await admin.from("career_research_cache").select("payload").eq("key",key).maybeSingle();
    const saved = validateResearchBundle(data?.payload,catalog);
    if (saved && Date.parse(saved.expiresAt) > Date.now()) return {...saved,cached:true};
  }
  if (!process.env.FIRECRAWL_API_KEY) throw new ResearchError("联网研究尚未配置检索服务密钥。基础推荐仍可使用。",503);
  const local = process.env.NODE_ENV !== "production" && process.env.ALLOW_LOCAL_RESEARCH === "true" && ["127.0.0.1","localhost"].includes(new URL(request.url).hostname);
  let userId: string | null = null;
  if (!local && !scheduled) {
    const token = request.headers.get("authorization")?.match(/^Bearer (.+)$/)?.[1];
    const auth = database();
    if (!token || !auth) throw new ResearchError("游客可浏览已有推荐；新的联网研究需要先登录，防止付费检索被滥用。",401);
    const {data,error} = await auth.auth.getUser(token);
    if (error || !data.user || data.user.is_anonymous) throw new ResearchError("请使用有效账号登录后再研究。",401);
    userId = data.user.id;
  }
  if (inFlight.has(key)) return inFlight.get(key)!;
  const work = (async () => {
    if (local) {
      if (!takeLocalBudget(budget,new Date(),10)) throw new ResearchError("本机今日检索预算已用完；已缓存的结果仍可查看。",429);
    } else {
      if (!admin) throw new ResearchError("线上检索需要先配置云端缓存与额度控制。",503);
      const {data,error} = await admin.rpc("claim_career_research_budget",{p_user_id:userId});
      if (error) throw new ResearchError("云端额度控制尚未准备好；为保护预算，未发起付费检索。",503);
      if (data !== true) throw new ResearchError("今天的联网研究额度已用完，请明天再试。",429);
    }
    let json: Record<string, unknown>;
    try {
      const response = await fetch("https://api.firecrawl.dev/v2/search",{method:"POST",headers:{"Content-Type":"application/json",Authorization:`Bearer ${process.env.FIRECRAWL_API_KEY}`},body:JSON.stringify({query,limit:5,sources:[{type:"web"}],timeout:20000}),signal:AbortSignal.timeout(25000),cache:"no-store"});
      if (!response.ok) throw new Error("provider error");
      json = await response.json();
      if (!json.success) throw new Error("provider failure");
    } catch { throw new ResearchError("检索服务暂不可用；未生成虚构结果。请稍后再试。",502); }
    const checkedAt = new Date().toISOString();
    const bundle: ResearchBundle = {query,checkedAt,expiresAt:new Date(Date.now()+86400000).toISOString(),leads:normalizeResearchResults((json.data as {web?:unknown})?.web,checkedAt,catalog),creditsUsed:typeof json.creditsUsed === "number" ? json.creditsUsed : 0,cached:false};
    if (memory.size >= 100) memory.delete(memory.keys().next().value!);
    memory.set(key,bundle);
    if (admin) {
      const {error} = await admin.from("career_research_cache").upsert({key,payload:bundle,expires_at:bundle.expiresAt});
      if (error) console.warn("research cache persistence unavailable");
    }
    return bundle;
  })();
  inFlight.set(key,work);
  try {return await work;} finally {inFlight.delete(key);}
}
