"use client";
import {useCareerCatalog} from "@/components/CareerProvider";
import CareerAnalysis from "@/components/CareerAnalysis";
import ResearchPanel from "@/components/ResearchPanel";
export default function RolesPage(){
  const {query,setQuery}=useCareerCatalog();
  return <div className="max-w-5xl mx-auto px-4 md:px-6 py-8 md:py-12">
    <h1 className="hero-title text-3xl md:text-5xl text-center">职业百科<span className="text-blue-500">.</span></h1>
    <p className="mt-4 text-sm text-slate-500 text-center">专业联动的工作环境、能力和技术/管理路线。通用介绍不是具体工厂承诺；薪资、晋升年限及人员名额需要真实来源。</p>
    <label className="block mt-6 text-sm font-bold">关注的专业<input className="career-input mt-2" value={query.major} maxLength={80} onChange={e=>setQuery({...query,major:e.target.value})}/></label>
    <div className="mt-6"><CareerAnalysis/></div><div className="mt-6"><ResearchPanel key={query.major} initialTopic="career"/></div>
  </div>;
}
