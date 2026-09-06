import { notFound } from "next/navigation";
import Link from "next/link";
import { companies, getCompany, gradeStyle, jobSearchLinks, amapSearchLink } from "@/lib/data";
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
      <Link href="/companies" className="text-sm font-bold text-slate-400 hover:text-orange-500">← 返回企业库</Link>

      {/* 头部 */}
      <div className="mt-4 bg-white rounded-[2rem] p-6 md:p-8 ring-1 ring-black/5 relative overflow-hidden">
        <div className="absolute -top-16 -right-16 w-48 h-48 rounded-full bg-gradient-to-br from-orange-200/60 to-rose-200/60 blur-2xl" />
        <div className="relative">
          <div className="flex items-start justify-between gap-3">
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className={`text-xs font-black px-3 py-1 rounded-full ${g.badge}`}>{c.recommend} · {g.label}</span>
                {c.rank2025 && <span className="text-xs font-black px-3 py-1 rounded-full bg-amber-100 text-amber-700">2025印刷百强 第{c.rank2025}名</span>}
                <span className="text-xs font-bold px-3 py-1 rounded-full bg-slate-100 text-slate-500">{c.listed}</span>
              </div>
              <h1 className="hero-title mt-3 text-3xl md:text-4xl">{c.name}</h1>
              <p className="mt-1 text-sm text-slate-500">{c.fullName}</p>
            </div>
            <FavButton companyId={c.id} />
          </div>

          <div className="mt-4 flex flex-wrap gap-2">
            <span className="text-xs font-bold px-3 py-1.5 rounded-xl bg-blue-50 text-blue-600">📍 {c.address}</span>
            <span className="text-xs font-bold px-3 py-1.5 rounded-xl bg-violet-50 text-violet-600">{c.type}</span>
            <span className="text-xs font-bold px-3 py-1.5 rounded-xl bg-emerald-50 text-emerald-600">{c.scale}</span>
          </div>

          <p className="mt-5 text-sm md:text-base leading-relaxed text-slate-700">{c.desc}</p>

          <div className="mt-4 p-4 rounded-2xl bg-gradient-to-r from-orange-50 to-rose-50 ring-1 ring-orange-100">
            <p className="text-sm font-black text-orange-600">💡 为什么推荐给你</p>
            <p className="mt-1 text-sm text-slate-700 leading-relaxed">{c.reason}</p>
          </div>
        </div>
      </div>

      {/* 投递状态（本地+云同步） */}
      <CompanyStatus companyId={c.id} />

      {/* 岗位与要求 */}
      <div className="mt-6 grid md:grid-cols-2 gap-4">
        <div className="bg-white rounded-3xl p-6 ring-1 ring-black/5">
          <h2 className="font-black text-lg">🎯 常见岗位</h2>
          <div className="mt-3 flex flex-wrap gap-2">
            {c.jobs.map((j) => (
              <span key={j} className="text-xs font-bold px-3 py-1.5 rounded-full bg-blue-50 text-blue-700">{j}</span>
            ))}
          </div>
          <h2 className="mt-6 font-black text-lg">🧰 需要具备</h2>
          <div className="mt-3 flex flex-wrap gap-2">
            {c.skills.map((s) => (
              <span key={s} className="text-xs font-bold px-3 py-1.5 rounded-full bg-emerald-50 text-emerald-700">{s}</span>
            ))}
          </div>
        </div>
        <div className="bg-white rounded-3xl p-6 ring-1 ring-black/5">
          <h2 className="font-black text-lg">🌏 语言与海外</h2>
          <p className="mt-3 text-sm text-slate-600"><span className="font-black text-slate-800">语言要求：</span>{c.lang}</p>
          <p className="mt-2 text-sm text-slate-600"><span className="font-black text-slate-800">海外机会：</span>{c.overseas}</p>
          {c.website && (
            <a href={c.website} target="_blank" rel="noreferrer" className="mt-4 inline-block px-4 py-2 rounded-full bg-[#14161a] text-white text-xs font-black hover:scale-105 transition-transform">
              访问官网 ↗
            </a>
          )}
          <a href={amapSearchLink(c.fullName, c.city.split("/")[0])} target="_blank" rel="noreferrer" className="mt-4 ml-2 inline-block px-4 py-2 rounded-full bg-white ring-1 ring-black/10 text-xs font-black hover:scale-105 transition-transform">
            高德地图看位置 ↗
          </a>
        </div>
      </div>

      {/* 招聘平台直达 */}
      <div className="mt-6 bg-[#14161a] rounded-3xl p-6 md:p-8 text-white">
        <h2 className="font-black text-lg md:text-xl">🔴 查它在招什么（实时）</h2>
        <p className="mt-1 text-xs text-slate-400">点击跳转到各平台对该企业的实时搜索结果，岗位数据永远是最新的</p>
        <div className="mt-4 grid grid-cols-2 md:grid-cols-5 gap-2.5">
          {links.map((l) => (
            <a key={l.platform} href={l.url} target="_blank" rel="noreferrer"
              className={`${l.color} rounded-2xl px-3 py-3 text-center text-sm font-black hover:scale-105 active:scale-95 transition-transform`}>
              {l.platform} ↗
            </a>
          ))}
        </div>
      </div>

      {/* 来源 */}
      <p className="mt-4 text-[11px] text-slate-400">资料来源：{c.source} · 数据库更新于 2026-09</p>

      {/* 相似企业 */}
      {similar.length > 0 && (
        <div className="mt-10">
          <h2 className="hero-title text-2xl">相似企业</h2>
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
