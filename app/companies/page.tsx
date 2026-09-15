"use client";
import {useState} from "react";
import CompanyCard from "@/components/CompanyCard";
import {useCareerCatalog} from "@/components/CareerProvider";
import {asLegacyCompany} from "@/lib/career/backup";
import {recommendCompanies} from "@/lib/career/engine";
export default function CompaniesPage(){
  const {catalog,query,setQuery,refresh,loading,message}=useCareerCatalog();
  const [search,setSearch]=useState("");const [city,setCity]=useState("");
  const [sector,setSector]=useState("");const [matchedOnly,setMatchedOnly]=useState(true);
  const matches=recommendCompanies(catalog.employers,query,catalog);
  const candidates=matchedOnly ? matches.map(m=>m.employer) : catalog.employers;
  const shown=candidates.filter(e=>(!city || e.city===city) && (!sector || e.sector===sector) && (!search.trim() || [e.name,e.city,e.sector,...e.tags].join(" ").toLowerCase().includes(search.trim().toLowerCase())));
  return <div className="max-w-5xl mx-auto px-4 md:px-6 py-8 md:py-12">
    <h1 className="hero-title text-3xl md:text-5xl text-center">企业库<span className="text-orange-500">.</span></h1>
    <p className="mt-3 text-center text-sm text-slate-500">发现对口和跨行业研究对象。能力标签不是招聘要求，企业收录不代表当前在招。</p>
    <div className="mt-6 glass-strong rounded-3xl p-5">
      <label className="block text-sm font-bold">专业自由输入<input className="career-input mt-2" value={query.major} maxLength={80} onChange={e=>setQuery({...query,major:e.target.value})}/></label>
      <div className="mt-4 grid sm:grid-cols-3 gap-3">
        <input aria-label="搜索企业" className="career-input" value={search} onChange={e=>setSearch(e.target.value)} placeholder="公司、城市或能力…" maxLength={100}/>
        <select aria-label="企业城市" className="career-input" value={city} onChange={e=>setCity(e.target.value)}><option value="">全部城市 / 地区</option>{[...new Set(catalog.employers.map(e=>e.city))].sort().map(s=><option key={s} value={s}>{s}</option>)}</select>
        <select aria-label="企业行业" className="career-input" value={sector} onChange={e=>setSector(e.target.value)}><option value="">全部行业</option>{[...new Set(catalog.employers.map(e=>e.sector))].sort().map(s=><option key={s} value={s}>{s}</option>)}</select>
      </div>
      <label className="mt-4 flex gap-2 text-sm font-bold"><input type="checkbox" checked={matchedOnly} onChange={e=>setMatchedOnly(e.target.checked)}/>只看当前专业关联企业（{matches.length}个）</label>
    </div>
    <div className="catalog-status mt-4"><p className="flex-1 text-xs text-slate-600">{message} · 目录 {catalog.updated}</p><button disabled={loading} onClick={()=>void refresh(true)} className="career-secondary text-xs">刷新目录 ↻</button></div>
    <p className="mt-5 text-sm text-slate-500">展示 {shown.length} / 收录 {catalog.employers.length} 个研究对象</p>
    <div className="mt-4 grid md:grid-cols-2 gap-5">{shown.map((e,i)=><CompanyCard key={e.id} company={asLegacyCompany(e)} index={i}/>)}</div>
    {!shown.length && <p className="empty-state mt-5 text-sm text-slate-500">没有符合筛选的研究对象。清除筛选、浏览全部，或回首页联网研究，不用不相关公司凑结果。</p>}
  </div>;
}
