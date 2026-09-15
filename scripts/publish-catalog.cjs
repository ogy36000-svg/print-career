/* eslint-disable @typescript-eslint/no-require-imports -- Node CommonJS tooling deliberately uses require. */
// Defaults to local validation. Remote writes require the explicit --publish flag.
const {spawnSync}=require("node:child_process");
const {readFileSync}=require("node:fs");
require("@next/env").loadEnvConfig(process.cwd());
const compile=spawnSync(process.execPath,["node_modules/typescript/bin/tsc","--outDir",".tool-build","--module","commonjs","--esModuleInterop","--resolveJsonModule","--target","ES2022","--skipLibCheck","lib/career/backup.ts"],{stdio:"inherit"});
if(compile.status!==0) process.exit(compile.status||1);
const {validateCatalog}=require("../.tool-build/lib/career/validation.js");
const {buildBackupCatalog}=require("../.tool-build/lib/career/backup.js");
async function main(){
  const args=process.argv.slice(2);
  const file=args.find(arg=>arg!=="--publish");
  const catalog=validateCatalog(file ? JSON.parse(readFileSync(file,"utf8")) : buildBackupCatalog());
  console.log("目录校验通过："+catalog.employers.length+" 个企业，"+catalog.vacancies.length+" 个职位。");
  if(!args.includes("--publish")) {console.log("仅校验；没有向云端写入。加 --publish 才会发布快照。");return;}
  const url=process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key=process.env.SUPABASE_SERVICE_ROLE_KEY;
  if(!url || !/^https:\/\/[a-z0-9-]+\.supabase\.co\/?$/i.test(url) || !key) throw new Error("云端地址或服务密钥未配置");
  const {createClient}=require("@supabase/supabase-js");
  const admin=createClient(url,key,{auth:{persistSession:false,autoRefreshToken:false},global:{fetch:(url,options)=>fetch(url,{...options,signal:AbortSignal.timeout(15000)})}});
  const {error}=await admin.from("career_catalog").upsert({id:"main",payload:catalog,published_at:new Date().toISOString()});
  if(error) throw new Error("快照发布失败；检查新版数据库结构和服务权限");
  console.log("云端快照已发布；页面刷新目录即可读取，不需要重新构建网站。");
}
main().catch(error=>{console.error(error.message);process.exitCode=1;});
