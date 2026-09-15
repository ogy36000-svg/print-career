"use client";
import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { getSupabase } from "@/lib/supabase";
import { validateResearchBundle } from "@/lib/career/research";
import type { ResearchBundle, ResearchTopic } from "@/lib/career/types";
import { useCareerCatalog } from "./CareerProvider";
const topics: {id:ResearchTopic;label:string}[] = [{id:"internship",label:"实习 / 交叉岗位"},{id:"career",label:"行业 / 晋升"},{id:"competition",label:"培养 / 招录 / 考研"}];
export default function ResearchPanel({initialCompany="",initialTopic="internship"}: {initialCompany?:string;initialTopic?:ResearchTopic}) {
  const {query,catalog} = useCareerCatalog();
  const [company,setCompany] = useState(initialCompany); const [topic,setTopic] = useState<ResearchTopic>(initialTopic);
  const [result,setResult] = useState<{signature:string;bundle:ResearchBundle} | null>(null);
  const [message,setMessage] = useState(""); const [busy,setBusy] = useState(false);
  const controller = useRef<AbortController | null>(null);
  useEffect(()=>{const requests=controller;return ()=>{requests.current?.abort();};},[]);
  const signature = JSON.stringify([query.major,company,topic]);
  const current = result?.signature === signature ? result.bundle : null;
  const research = async () => {
    controller.current?.abort();const abort = new AbortController();controller.current = abort;
    setBusy(true);setMessage("");const target = signature;
    try {
      const sb = getSupabase(); const session = sb ? (await sb.auth.getSession()).data.session : null;
      const response = await fetch("/api/research/",{method:"POST",headers:{"Content-Type":"application/json",...(session ? {Authorization:`Bearer ${session.access_token}`} : {})},body:JSON.stringify({major:query.major,company,topic}),signal:abort.signal});
      const json = await response.json();
      if (!response.ok) throw new Error(typeof json.error === "string" ? json.error : "研究暂不可用");
      const bundle = validateResearchBundle(json,catalog);if (!bundle) throw new Error("检索结果格式异常，未展示未验证内容");
      setResult({signature:target,bundle});
    } catch (error) {if (!abort.signal.aborted) setMessage(error instanceof Error ? error.message : "网络请求失败");}
    finally {if (!abort.signal.aborted) setBusy(false);}
  };
  return <section className="glass-strong rounded-3xl p-5 md:p-7" id="research">
    <div className="flex flex-wrap justify-between gap-3"><div><p className="section-kicker">LIVE RESEARCH · 联网研究</p><h2 className="mt-2 text-2xl font-black">查新机会，也查未来路径。</h2></div><span className="data-badge">带出处的研究线索</span></div>
    <p className="mt-3 text-sm text-slate-600">研究专业：<b>{query.major || "尚未填写"}</b>。食品、饮料、设备等企业，也可能有对口岗位。</p>
    <div className="mt-4 flex flex-wrap gap-2">{topics.map(t => <button key={t.id} onClick={() => {setTopic(t.id);setMessage("");}} className={`research-tab ${topic === t.id ? "selected" : ""}`}>{t.label}</button>)}</div>
    <div className="mt-4 flex flex-col sm:flex-row gap-3"><label className="flex-1 text-xs font-bold text-slate-500">指定企业（可留空）<input aria-label="指定研究企业" maxLength={80} value={company} onChange={e => {setCompany(e.target.value);setMessage("");}} placeholder="例如：珠江啤酒、玖龙纸业、中荣" className="career-input mt-2" /></label><button className="career-primary self-end w-full sm:w-auto" disabled={busy || !query.major.trim()} onClick={research}>{busy ? "正在检索公开来源…" : "联网研究"}</button></div>
    <p className="mt-3 text-xs text-slate-500 leading-relaxed">点击后仅发送专业、企业与主题，不发送简历或联系方式。同一查询缓存24小时；线上新查询需登录，每账号每天最多5次，全站最多50次，控制费用。</p>
    {message && <div role="alert" className="mt-4 rounded-xl bg-amber-50 p-4 text-sm text-amber-900">{message} <Link className="underline" href="/profile">账号与档案 →</Link></div>}
    {current && <div className="mt-5" aria-live="polite"><p className="text-xs text-slate-500">{current.cached ? "已缓存检索" : "本次联网获取"} · {new Date(current.checkedAt).toLocaleString("zh-CN")} · 获取时间不是公告发布时间</p>
      {!current.leads.length && <p className="mt-3 rounded-xl bg-slate-50 p-4 text-sm text-slate-600">这次没有找到符合来源范围的线索。可以去掉指定企业或换一个专业/岗位词；没有结果不等于没有机会。</p>}
      <div className="mt-3 grid md:grid-cols-2 gap-3">{current.leads.map(lead => <a key={lead.url} href={lead.url} target="_blank" rel="noreferrer" className="research-lead"><span className="text-xs font-bold text-blue-600">{lead.sourceType} · 待核验线索</span><h3 className="mt-2 font-bold">{lead.title} ↗</h3><p className="mt-2 text-sm text-slate-600 line-clamp-4">{lead.excerpt}</p><span className="mt-3 block text-xs text-slate-400 break-all">{new URL(lead.url).hostname}</span></a>)}</div>
      <details className="mt-3 text-xs text-slate-500"><summary className="cursor-pointer">查看检索范围</summary><p className="mt-2 break-words">{current.query}</p></details>
      <p className="mt-3 text-xs text-amber-800">搜索摘要可能是历史公告，不代表仍在招；请打开原文核实日期、截止时间与实际要求。学校培养方案不等于企业录用学校名单。</p>
    </div>}
  </section>;
}
