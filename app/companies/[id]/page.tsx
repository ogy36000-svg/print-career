import { notFound } from "next/navigation";
import Link from "next/link";
import { gradeStyle, jobSearchLinks, amapSearchLink } from "@/lib/data";
import FavButton from "@/components/FavButton";
import CompanyStatus from "@/components/CompanyStatus";
import CompanyCard from "@/components/CompanyCard";
import { loadCatalog } from "@/lib/server/catalog";
import { asLegacyCompany } from "@/lib/career/backup";
import ResearchPanel from "@/components/ResearchPanel";

export const dynamic = "force-dynamic";

export default async function CompanyDetail({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const {catalog,message}=await loadCatalog();
  const companies=catalog.employers.map(asLegacyCompany);
  const employer=catalog.employers.find(e=>e.id===id);
  const c=companies.find(e=>e.id===id);
  if (!c || !employer) notFound();
  const g = gradeStyle[c.recommend];
  const links = jobSearchLinks(c.name.replace(/（.*）/, "").replace(/\(.*\)/, ""));
  const similar = catalog.employers
    .filter((x) => x.id !== employer.id && (x.sector === employer.sector || x.tags.some(tag => employer.tags.includes(tag))))
    .slice(0, 4).map(asLegacyCompany);
  const health = "工作环境、轮班与劳动防护需要结合实际机型和现场培训核实，不能仅凭行业名称保证安全。";

  return (
    <div className="max-w-6xl mx-auto px-4 md:px-6 py-8 md:py-12">
      <Link href="/companies" className="text-sm font-bold text-slate-400 hover:text-orange-500 transition-colors">
        ← 返回企业库
      </Link>

      <p className="mt-3 text-xs text-amber-800">{message} 企业研究对象，不代表在招职位。</p>
      <p className="mt-2 text-xs text-slate-500">资料核验：{employer.evidence.checkedAt ?? "待核实"}。设备数量、机长编制与往届录用学校需要具体来源核验。</p>
      {employer.evidence.url && <a className="mt-2 inline-block text-sm text-blue-700 underline" href={employer.evidence.url} target="_blank" rel="noreferrer">打开企业资料来源 ↗</a>}
      {/* 头部横幅图 */}
      <div className="mt-4 relative rounded-[2rem] overflow-hidden ring-1 ring-white/60 shadow-lg">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-800 to-slate-700" />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900/90 via-slate-900/40 to-slate-900/10" />
        <div className="relative p-6 md:p-10 pt-20 md:pt-28">
          <div className="flex items-start justify-between gap-3">
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className={`text-xs font-black px-3 py-1 rounded-full ${g.badge} shadow-sm`}>企业研究对象</span>
                {c.rank2025 && <span className="text-xs font-black px-3 py-1 rounded-full bg-amber-400/90 text-amber-950">2025印刷百强 第{c.rank2025}名</span>}
                <span className="text-xs font-bold px-3 py-1 rounded-full bg-white/20 text-white backdrop-blur">{c.listed}</span>
              </div>
              <h1 className="hero-title mt-3 text-3xl md:text-5xl text-white drop-shadow-lg">{c.name}</h1>
              <p className="mt-1 text-sm text-white/70">{c.fullName}</p>
            </div>
            <FavButton companyId={c.id} />
          </div>
          <div className="mt-4 flex flex-wrap gap-2">
            <span className="text-xs font-bold px-3 py-1.5 rounded-xl bg-white/15 text-white backdrop-blur">{c.address}</span>
            <span className="text-xs font-bold px-3 py-1.5 rounded-xl bg-white/15 text-white backdrop-blur">{c.type}</span>
            <span className="text-xs font-bold px-3 py-1.5 rounded-xl bg-white/15 text-white backdrop-blur">{c.scale}</span>
          </div>
        </div>
      </div>

      {/* 双栏布局 */}
      <div className="mt-6 lg:grid lg:grid-cols-[1fr_340px] lg:gap-6 lg:items-start">
        {/* 左：主内容 */}
        <div className="min-w-0">
          <div className="glass-strong rounded-3xl p-6">
            <h2 className="font-black text-lg text-slate-800">企业简介</h2>
            <p className="mt-3 text-sm md:text-base leading-relaxed text-slate-600">{c.desc}</p>
            <div className="mt-4 p-4 rounded-2xl bg-gradient-to-r from-orange-50/80 to-rose-50/80 ring-1 ring-orange-100/50">
              <p className="text-sm font-black text-orange-600">资料依据与限制</p>
              <p className="mt-1 text-sm text-slate-600 leading-relaxed">{c.reason}</p>
            </div>
          </div>

          {/* 岗位与要求 */}
          <div className="mt-6 glass rounded-3xl p-6">
            <h2 className="font-black text-lg text-slate-800">关联能力方向 <span className="text-xs font-bold text-slate-400">平台搜索；不是岗位公告</span></h2>
            <div className="mt-3 flex flex-wrap gap-2">
              {employer.tags.map((j) => (
                <a
                  key={j}
                  href={`https://www.zhipin.com/web/geek/job?query=${encodeURIComponent(c.name+" "+j)}`}
                  target="_blank"
                  rel="noreferrer"
                  className="text-xs font-bold px-3 py-1.5 rounded-full bg-blue-50/80 text-blue-700 border border-blue-100/50 hover:bg-blue-100/80 transition-colors"
                >
                  {j}
                </a>
              ))}
            </div>
            <h2 className="mt-6 font-black text-lg text-slate-800">研究相关能力，不代表录用门槛</h2>
            <div className="mt-3 flex flex-wrap gap-2">
              {c.skills.map((s) => (
                <span key={s} className="text-xs font-bold px-3 py-1.5 rounded-full bg-emerald-50/80 text-emerald-700 border border-emerald-100/50">
                  {s}
                </span>
              ))}
            </div>
            <div className="mt-5 grid md:grid-cols-2 gap-4 text-sm">
              <p className="text-slate-600"><span className="font-black text-slate-800">语言要求：</span>具体要求以当期招聘公告为准（原版语言描述尚未重新核验）</p>
              <p className="text-slate-600"><span className="font-black text-slate-800">海外机会：</span>海外机会以当期官方公告为准</p>
            </div>
          </div>

          {/* 招聘入口 */}
          <div className="mt-6 glass-strong rounded-3xl p-6">
            <h2 className="font-black text-lg text-slate-800">招聘平台关键词搜索</h2>
            <div className="mt-4 grid grid-cols-2 md:grid-cols-3 gap-2.5">
              {links.map((l) => (
                <a key={l.platform} href={l.url} target="_blank" rel="noreferrer"
                  className={`${l.color} rounded-2xl px-3 py-3 text-center text-sm font-black text-white hover:scale-105 active:scale-95 transition-transform shadow-md`}>
                  {l.platform}
                </a>
              ))}
            </div>
          </div>

          {/* 投递状态（移动端显示在这里，桌面端在右栏） */}
          <div className="mt-6 lg:hidden">
            <CompanyStatus companyId={c.id} />
          </div>
        </div>

        {/* 右：信息栏 */}
        <aside className="mt-6 lg:mt-0 space-y-4 lg:sticky lg:top-24">
          {/* 官网直达 */}
          {c.website && (
            <a href={c.website} target="_blank" rel="noreferrer"
              className="block glass-strong rounded-3xl p-5 hover:scale-[1.02] transition-transform">
              <p className="text-xs font-black text-slate-400">官方网站</p>
              <p className="mt-1 font-black text-blue-600">进入官网 ↗</p>
              <p className="mt-1 text-[11px] text-slate-400 break-all">{c.website}</p>
            </a>
          )}
          <a href={amapSearchLink(c.fullName, c.city.split("/")[0])} target="_blank" rel="noreferrer"
            className="block glass rounded-3xl p-5 hover:scale-[1.02] transition-transform">
            <p className="text-xs font-black text-slate-400">公司位置</p>
            <p className="mt-1 font-black text-slate-700">高德地图查看 ↗</p>
          </a>

          {/* 桌面端投递状态 */}
          <div className="hidden lg:block">
            <CompanyStatus companyId={c.id} />
          </div>

          {/* 原版设备与实力 · 待核实 */}
          {(c.equipment?.length || c.capacity || c.marketValue || c.tech) && (
            <div className="glass rounded-3xl p-5">
              <p className="font-black text-slate-800">历史设备线索 · 未重新核验</p>
              <div className="mt-3 space-y-2.5 text-xs">
                {c.capacity && <p className="text-slate-600"><span className="font-black text-slate-700">产能规模</span><br />{c.capacity}</p>}
                {c.marketValue && <p className="text-slate-600"><span className="font-black text-slate-700">市值/资本</span><br />{c.marketValue}</p>}
                {c.tech && <p className="text-slate-600"><span className="font-black text-slate-700">核心技术</span><br />{c.tech}</p>}
              </div>
              {c.equipment && c.equipment.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-1.5">
                  {c.equipment.map((e) => (
                    <span key={e} className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-slate-100 text-slate-600">{e}</span>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* 职业健康提示（侧栏弱化呈现） */}
          {health && (
            <div className="rounded-3xl bg-slate-50/80 ring-1 ring-slate-200/60 p-5">
              <p className="text-xs font-black text-slate-500">职业健康提示</p>
              <p className="mt-1.5 text-xs text-slate-500 leading-relaxed">{health}</p>
            </div>
          )}
        </aside>
      </div>

      {/* 来源 */}
      <p className="mt-6 text-[11px] text-slate-400">资料来源：{c.source} · 目录版本 {catalog.updated}（不代表招聘发布时间）</p>
      <div className="mt-6"><ResearchPanel initialCompany={employer.name}/></div>

      {/* 相似企业 */}
      {similar.length > 0 && (
        <div className="mt-10">
          <h2 className="hero-title text-2xl text-slate-800">相似企业</h2>
          <div className="mt-4 grid md:grid-cols-2 gap-5">
            {similar.map((s, i) => (
              <CompanyCard key={s.id} company={s} index={i} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
