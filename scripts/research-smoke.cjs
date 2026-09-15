const base=process.env.CAREER_SMOKE_URL||"http://127.0.0.1:3000";
if(!/^http:\/\/(localhost|127\.0\.0\.1):\d+$/.test(base)) throw new Error("本检查工具只连接本机预览");
async function main(){
  const catalog=await fetch(base+"/api/catalog/").then(r=>r.json());
  console.log("目录模式:",catalog.mode,"企业数:",catalog.catalog.employers.length,"有效职位种子数:",catalog.catalog.vacancies.length);
  const invalid=await fetch(base+"/api/research/",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({major:"",topic:"career"})});
  if(invalid.status!==400) throw new Error("无效请求未被拒绝");
  const cron=await fetch(base+"/api/refresh/",{method:"POST"});
  if(cron.status!==401) throw new Error("无凭证更新未被拒绝");
  console.log("空专业和无凭证更新均已拒绝。");
  if(!process.argv.includes("--live")) {console.log("没有执行付费检索；--live 才调用。");return;}
  const body=JSON.stringify({major:"印刷工程",topic:"competition"});
  async function search(){
    const response=await fetch(base+"/api/research/",{method:"POST",headers:{"Content-Type":"application/json"},body,signal:AbortSignal.timeout(60000)});
    const json=await response.json();
    if(!response.ok) throw new Error(json.error||"联网检查失败");
    return json;
  }
  const live=await search(); const cached=await search();
  if(!cached.cached || live.checkedAt!==cached.checkedAt) throw new Error("缓存时间或命中异常");
  if(live.leads.some(l=>l.status!=="lead")) throw new Error("搜索线索被错误伪装为已核验职位");
  console.log("真实检索线索:",live.leads.length,"本次服务积分:",live.creditsUsed,"重复请求缓存命中:",cached.cached);
  console.log(live.leads.map(l=>({title:l.title,url:l.url})));
}
main().catch(error=>{console.error(error.message);process.exitCode=1;});
