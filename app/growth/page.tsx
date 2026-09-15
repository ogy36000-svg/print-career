"use client";
import Link from "next/link";
import { useCareerCatalog } from "@/components/CareerProvider";
import { useUserData } from "@/lib/store";
import { careerAdvice } from "@/lib/career/engine";
import CareerAnalysis from "@/components/CareerAnalysis";
import ResearchPanel from "@/components/ResearchPanel";
export default function GrowthPage(){
  const {catalog,query}=useCareerCatalog();const {data,update}=useUserData();
  const advice=careerAdvice(query,catalog);
  return <div className="max-w-5xl mx-auto px-4 md:px-6 py-8 space-y-6"><div><p className="section-kicker">GROWTH · 可执行的成长路径</p><h1 className="mt-3 text-3xl font-black">{query.major} · 大{query.grade}行动计划</h1><p className="mt-3 text-sm text-slate-500">建议随首页专业、年级与技能变化，不再固定为印刷专业的一年倒计时。</p><Link className="mt-3 inline-block text-sm text-blue-700 font-bold" href="/">修改专业与阶段 →</Link></div><section className="glass-strong rounded-3xl p-6"><h2 className="font-black text-xl">下一步</h2><div className="mt-4 flex flex-wrap gap-2">{advice.missingSkills.map(s=><span key={s} className="capability-tag">待补强：{s}</span>)}</div><ul className="mt-5 space-y-3">{advice.plan.map(step=>{const key=`${query.major}:${query.grade}:${step}`;return <li key={step}><label className="flex gap-3 text-sm text-slate-600"><input type="checkbox" checked={data.taskDone.includes(key)} onChange={()=>update(d=>({...d,taskDone:d.taskDone.includes(key) ? d.taskDone.filter(x=>x!==key):[...d.taskDone,key]}))}/>{step}</label></li>;})}</ul></section><CareerAnalysis/><ResearchPanel key={query.major}/><Link className="career-secondary" href="/profile">维护技能与投递记录 →</Link></div>;
}
