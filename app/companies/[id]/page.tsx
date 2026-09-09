import { notFound } from "next/navigation";
import Link from "next/link";
import { companies, getCompany, gradeStyle, jobSearchLinks, amapSearchLink, healthHint } from "@/lib/data";
import FavButton from "@/components/FavButton";
import CompanyStatus from "@/components/CompanyStatus";
import CompanyCard from "@/components/CompanyCard";

export function generateStaticParams() {
  return companies.map((c) => ({ id: c.id }));
}

export default async function CompanyDetail({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const c = getCompany(id);
  if (!c) notFound();
  const g = gradeStyle[c.recommend];
  const links = jobSearchLinks(c.name.replace(/（.*）/, "").replace(/\(.*\)/, ""));
  const similar = companies
    .filter((x) => x.id !== c.id && (x.type.split("/")[0] === c.type.split("/")[0] || x.recommend === c.recommend))
    .slice(0, 4);

  return (
    <div className="max-w-4xl mx-auto px-6 py-8 md:py-12">
      <Link href="/companies" className="text-sm font-bold text-slate-400 hover:text-orange-500 transition-colors">
        ← 返回企业库
      </Link>

      {/* 头部 */}
      <div className="mt-4 glass-strong rounded-[2rem] p-6 md:p-8 relative overflow-hidden">
        <div className="absolute -top-16 -right-16 w-48 h-48 rounded-full bg-gradient-to-br from-orange-200/40 to-rose-200/40 blur-3xl" />
        <div className="relative">
          <div className="flex items-start justify-between gap-3">
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className={`text-xs font-black px-3 py-1 rounded-full ${g.badge} shadow-sm`}>
                  {c.recommend} · {g.label}
                </span>
                {c.rank2025 && <span className="text-xs font-black px-3 py-1 rounded-full bg-amber-100/80 text-amber-700">2025印刷百强 第{c.rank2025}名</span>}
                <span className="text-xs font-bold px-3 py-1 rounded-full bg-slate-100/80 text-slate-500">{c.listed}</span>
              </div>
              <h1 className="hero-title mt-3 text-3xl md:text-4xl text-slate-800">{c.name}</h1>
              <p className="mt-1 text-sm text-slate-400">{c.fullName}</p>
            </div>
            <FavButton companyId={c.id} />
          </div>

          <div className="mt-4 flex flex-wrap gap-2">
            <span className="text-xs font-bold px-3 py-1.5 rounded-xl bg-blue-50/80 text-blue-600 border border-blue-100/50">{c.address}</span>
            <span className="text-xs font-bold px-3 py-1.5 rounded-xl bg-violet-50/80 text-violet-600 border border-violet-100/50">{c.type}</span>
            <span className="text-xs font-bold px-3 py-1.5 rounded-xl bg-emerald-50/80 text-emerald-600 border border-emerald-100/50">{c.scale}</span>
          </div>

          <p className="mt-5 text-sm md:text-base leading-relaxed text-slate-600">{c.desc}</p>

          <div className="mt-4 p-4 rounded-2xl bg-gradient-to-r from-orange-50/80 to-rose-50/80 ring-1 ring-orange-100/50">
            <p className="text-sm font-black text-orange-600">为什么推荐给你</p>
            <p className="mt-1 text-sm text-slate-600 leading-relaxed">{c.reason}</p>
          </div>
        </div>
      </div>

      {/* 投递状态 */}
      <CompanyStatus companyId={c.id} />

      {/* 设备 / 产能 / 市值 */}
      {(c.equipment?.length || c.capacity || c.marketValue || c.tech) && (
        <div className="mt-6 glass rounded-3xl p-6">
          <h2 className="font-black text-lg text-slate-800">设备与实力</h2>
          <div className="mt-4 grid md:grid-cols-2 gap-4">
            <div className="space-y-2.5 text-sm">
              {c.capacity && <p><span className="font-black text-slate-700">产能/规模：</span><span className="text-slate-600">{c.capacity}</span></p>}
              {c.marketValue && <p><span className="font-black text-slate-700">市值/资本：</span><span className="text-slate-600">{c.marketValue}</span></p>}
              {c.tech && <p><span className="font-black text-slate-700">核心技术：</span><span className="text-slate-600">{c.tech}</span></p>}
            </div>
            {c.equipment && c.equipment.length > 0 && (
              <div>
                <p className="text-xs font-black text-slate-400">主要设备</p>
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {c.equipment.map((e) => (
                    <span key={e} className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-slate-100 text-slate-600">{e}</span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* 职业健康提示 */}
      {healthHint(c) && (
        <div className="mt-6 rounded-3xl bg-amber-50/80 ring-1 ring-amber-100 p-5">
          <p className="text-sm font-black text-amber-600">职业健康提示</p>
          <p className="mt-1.5 text-sm text-slate-600 leading-relaxed">{healthHint(c)}</p>
        </div>
      )}

      {/* 岗位与要求 */}
      <div className="mt-6 grid md:grid-cols-2 gap-4">
        <div className="glass rounded-3xl p-6">
          <h2 className="font-black text-lg text-slate-800">常见岗位</h2>
          <div className="mt-3 flex flex-wrap gap-2">
            {c.jobs.map((j) => (
              <a
                key={j}
                href={`https://www.zhipin.com/web/geek/job?query=${encodeURIComponent(j)}`}
                target="_blank"
                rel="noreferrer"
                className="text-xs font-bold px-3 py-1.5 rounded-full bg-blue-50/80 text-blue-700 border border-blue-100/50 hover:bg-blue-100/80 transition-colors"
              >
                {j}
              </a>
            ))}
          </div>
          <h2 className="mt-6 font-black text-lg text-slate-800">需要具备</h2>
          <div className="mt-3 flex flex-wrap gap-2">
            {c.skills.map((s) => (
              <span key={s} className="text-xs font-bold px-3 py-1.5 rounded-full bg-emerald-50/80 text-emerald-700 border border-emerald-100/50">
                {s}
              </span>
            ))}
          </div>
        </div>
        <div className="glass rounded-3xl p-6">
          <h2 className="font-black text-lg text-slate-800">语言与海外</h2>
          <p className="mt-3 text-sm text-slate-600"><span className="font-black text-slate-800">语言要求：</span>{c.lang}</p>
          <p className="mt-2 text-sm text-slate-600"><span className="font-black text-slate-800">海外机会：</span>{c.overseas}</p>
          {c.website && (
            <a href={c.website} target="_blank" rel="noreferrer" className="mt-4 inline-block px-4 py-2 rounded-full bg-slate-900 text-white text-xs font-black hover:scale-105 transition-transform">
              访问官网
            </a>
          )}
          <a href={amapSearchLink(c.fullName, c.city.split("/")[0])} target="_blank" rel="noreferrer" className="mt-4 ml-2 inline-block px-4 py-2 rounded-full bg-white/80 ring-1 ring-slate-200 text-xs font-black hover:scale-105 transition-transform">
            高德看位置
          </a>
        </div>
      </div>

      {/* 招聘平台直达 */}
      <div className="mt-6 glass-strong rounded-3xl p-6 md:p-8">
        <h2 className="font-black text-lg md:text-xl text-slate-800">查它在招什么（实时）</h2>
        <p className="mt-1 text-xs text-slate-400">点击跳转到各平台对该企业的实时搜索结果，岗位数据永远是最新的</p>
        <div className="mt-4 grid grid-cols-2 md:grid-cols-6 gap-2.5">
          {links.map((l) => (
            <a key={l.platform} href={l.url} target="_blank" rel="noreferrer"
              className={`${l.color} rounded-2xl px-3 py-3 text-center text-sm font-black text-white hover:scale-105 active:scale-95 transition-transform shadow-md`}>
              {l.platform}
            </a>
          ))}
        </div>
      </div>

      {/* 来源 */}
      <p className="mt-4 text-[11px] text-slate-400">资料来源：{c.source} · 数据库更新于 2026-09</p>

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
