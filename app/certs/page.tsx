"use client";
import {useCareerCatalog} from "@/components/CareerProvider";
import {careerAdvice} from "@/lib/career/engine";
import ResearchPanel from "@/components/ResearchPanel";
export default function CertsPage(){
  const {query,setQuery,catalog}=useCareerCatalog();
  const advice=careerAdvice(query,catalog);
  return <div className="max-w-5xl mx-auto px-4 md:px-6 py-8 md:py-12">
    <h1 className="hero-title text-3xl md:text-5xl text-center">证书与学习目标<span className="text-rose-500">.</span></h1>
    <p className="mt-4 max-w-2xl mx-auto text-center text-sm text-slate-500">证书不是通用门票。只保留与专业方向有关的学习目标；报名时间、资格、费用和岗位是否认可都回到官方来源核实。</p>
    <label className="block mt-6 text-sm font-bold">关注的专业<input className="career-input mt-2" value={query.major} maxLength={80} onChange={e=>setQuery({...query,major:e.target.value})}/></label>
    <section className="mt-6 grid md:grid-cols-2 gap-5">
      {advice.certificates.map(cert=><article className="glass-strong rounded-3xl p-6" key={cert.name}>
        <span className="data-badge">{cert.kind==="goal" ? "个人提升目标" : "按岗位选考"}</span>
        <h2 className="mt-3 text-xl font-black">{cert.name}</h2><p className="mt-3 text-sm text-slate-600 leading-relaxed">{cert.reason}</p>
        <a className="mt-4 inline-block text-sm font-bold text-blue-700 underline" href={cert.sourceUrl} target="_blank" rel="noreferrer">打开官方入口核实 ↗</a>
      </article>)}
      {!advice.certificates.length && <article className="empty-state md:col-span-2"><h2 className="font-bold">当前没有足够依据推荐特定证书</h2><p className="mt-2 text-sm text-slate-500">先查看5条真实岗位公告，找重复出现的技能；不要因为目录未覆盖就随意买培训。</p></article>}
    </section>
    <div className="mt-6 glass rounded-3xl p-5"><h2 className="font-black">怎么判断值不值得考</h2><ul className="mt-3 space-y-2 text-sm text-slate-600"><li>• 官方报考资格是否适合你的学历和年级？</li><li>• 目标企业的当期公告是否明确要求或认可？</li><li>• 备考时间是否会挤掉项目、实习和英语等更重要能力？</li></ul></div>
    <div className="mt-6"><ResearchPanel key={query.major} initialTopic="competition"/></div>
  </div>;
}
