import "server-only";
import { createClient } from "@supabase/supabase-js";
import { backupCatalog } from "../career/backup";
import { validateCatalog } from "../career/validation";

export function database(admin = false) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = admin ? process.env.SUPABASE_SERVICE_ROLE_KEY : process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key || !/^https:\/\/[a-z0-9-]+\.supabase\.co\/?$/.test(url)) return null;
  return createClient(url, key, {auth:{persistSession:false,autoRefreshToken:false},global:{fetch:(input,init) => fetch(input,{...init,cache:"no-store",signal:AbortSignal.timeout(6000)})}});
}
type LoadedCatalog = {catalog: typeof backupCatalog; mode:"cloud"|"backup"; checkedAt:string; message:string};
let cached: {at:number; value:LoadedCatalog} | null = null;
let pending: Promise<LoadedCatalog> | null = null;
export async function loadCatalog(force = false): Promise<LoadedCatalog> {
  const age=cached ? Date.now()-cached.at : Infinity;
  if (cached && (age<5000 || (!force && age<30000))) return cached.value;
  if (pending) return pending;
  pending=(async()=>{
  const db = database();
  let message = "云端目录尚未配置；当前是带来源的基础企业库，并非实时职位。";
  if (db) {
    try {
      const {data,error} = await db.from("career_catalog").select("payload, published_at").eq("id","main").maybeSingle();
      if (error) throw error;
      if (data) return {catalog:validateCatalog(data.payload),mode:"cloud" as const,checkedAt:new Date().toISOString(),message:`已读取云端目录；发布于 ${data.published_at}。职位仍以各自核验时间为准。`};
      message = "云端目录尚无数据；当前使用基础企业库，请先导入目录。";
    } catch { message = "云端目录暂不可用；已回退基础企业库，不代表已更新招聘。"; }
  }
  return {catalog:backupCatalog,mode:"backup" as const,checkedAt:new Date().toISOString(),message};
  })();
  try {
    const value=await pending;
    cached={at:Date.now(),value};
    return value;
  } finally {pending=null;}
}
