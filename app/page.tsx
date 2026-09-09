"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  majors,
  gradeOptions,
  certs as bundledCerts,
  roles as bundledRoles,
  companiesData,
  type CertsData,
  type RolesData,
} from "@/lib/data";
import type { CompaniesData } from "@/lib/types";
import { quickMatchByMajor } from "@/lib/match";
import { useRemoteData } from "@/lib/remote";
import { upcomingEvents, daysLabel, statusStyle } from "@/lib/certUtils";
import CompanyCard from "@/components/CompanyCard";
import ChinaMap from "@/components/ChinaMap";
import type { Company } from "@/lib/types";

const fadeUp = {
  initial: { opacity: 0, y: 30 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true },
} as const;

export default function Home() {
  const { data: cd } = useRemoteData<CompaniesData>("companies", companiesData);
  const { data: certData } = useRemoteData<CertsData>("certs", { updated: "", note: "", certs: bundledCerts, timeline: { note: "", phases: [] } });
  const { data: roleData } = useRemoteData<RolesData>("roles", { updated: "", note: "", roles: bundledRoles });

  const allCompanies = cd.companies;
  const [major, setMajor] = useState("printing");
  const [grade, setGrade] = useState("3");
  const [showMap, setShowMap] = useState(false);
  const [selectedCompany, setSelectedCompany] = useState<Company | null>(null);

  const matched = useMemo(() => quickMatchByMajor(allCompanies, major), [allCompanies, major]);
  const top6 = matched.slice(0, 6).map((m) => m.company);
  const mapCompanies = matched.slice(0, 24).map((m) => m.company);
  const upcoming = useMemo(() => upcomingEvents(certData.certs).slice(0, 3), [certData]);
  const majorName = majors.find((m) => m.id === major)?.name ?? "";

  const handleExplore = () => {
    setShowMap(true);
    setTimeout(() => document.getElementById("map-section")?.scrollIntoView({ behavior: "smooth" }), 120);
  };

  return (
    <div className="overflow-x-clip">
      {/* Hero */}
      <section className="relative px-6 pt-14 pb-10 md:pt-20 md:pb-14">
        {/* 印刷十字规线装饰 */}
        <div className="pointer-events-none absolute top-8 left-6 md:left-16 opacity-30">
          <svg width="40" height="40" viewBox="0 0 40 40"><circle cx="20" cy="20" r="10" fill="none" stroke="#94a3b8" strokeWidth="1"/><line x1="20" y1="0" x2="20" y2="40" stroke="#94a3b8"/><line x1="0" y1="20" x2="40" y2="20" stroke="#94a3b8"/></svg>
        </div>
        <div className="pointer-events-none absolute bottom-8 right-6 md:right-16 opacity-30 rotate-12">
          <svg width="40" height="40" viewBox="0 0 40 40"><circle cx="20" cy="20" r="10" fill="none" stroke="#94a3b8" strokeWidth="1"/><line x1="20" y1="0" x2="20" y2="40" stroke="#94a3b8"/><line x1="0" y1="20" x2="40" y2="20" stroke="#94a3b8"/></svg>
        </div>

        <div className="relative max-w-5xl mx-auto text-center">
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-block text-xs md:text-sm font-black px-4 py-1.5 rounded-full glass text-slate-600"
          >
            印刷/包装专业 · 实习求职导航 · 数据持续更新
          </motion.p>
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="hero-title mt-5 text-5xl md:text-7xl"
          >
            选专业，看企业<span className="gradient-text">在地图上冒出来</span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="mt-5 max-w-2xl mx-auto text-base md:text-lg text-slate-500"
          >
            {allCompanies.length} 家企业 · {roleData.roles.length} 个职业真相 · 考证倒计时自动算 · 招聘平台一键直达
          </motion.p>

          {/* 选择器 */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="mt-10 glass rounded-3xl p-6 max-w-2xl mx-auto"
          >
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <p className="text-xs font-black text-slate-400 mb-2 text-left">你的专业</p>
                <div className="flex flex-wrap gap-2">
                  {majors.map((m) => (
                    <button
                      key={m.id}
                      onClick={() => { setMajor(m.id); setShowMap(false); }}
                      className={`px-4 py-2.5 rounded-2xl text-sm font-bold transition-all ${
                        major === m.id ? "bg-slate-900 text-white shadow-lg" : "bg-white/80 text-slate-500 hover:bg-white"
                      }`}
                    >
                      {m.name}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <p className="text-xs font-black text-slate-400 mb-2 text-left">你的年级</p>
                <div className="flex flex-wrap gap-2">
                  {gradeOptions.map((g) => (
                    <button
                      key={g.id}
                      onClick={() => setGrade(g.id)}
                      className={`px-4 py-2.5 rounded-2xl text-sm font-bold transition-all ${
                        grade === g.id ? "bg-slate-900 text-white shadow-lg" : "bg-white/80 text-slate-500 hover:bg-white"
                      }`}
                    >
                      {g.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
            <button
              onClick={handleExplore}
              className="mt-6 w-full py-4 rounded-2xl bg-gradient-to-r from-orange-500 to-rose-500 text-white font-black text-base shadow-lg shadow-orange-200 hover:shadow-xl hover:scale-[1.02] transition-all"
            >
              生成我的企业地图
            </button>
          </motion.div>
        </div>
      </section>

      {/* 地图动画区 */}
      <AnimatePresence>
        {showMap && (
          <motion.section
            id="map-section"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="px-6 pb-10 overflow-hidden"
          >
            <div className="max-w-5xl mx-auto">
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }} className="text-center mb-4">
                <h2 className="hero-title text-2xl md:text-4xl">
                  「{majorName}」对口企业正在<span className="gradient-text">地图上涌现</span>
                </h2>
                <p className="mt-2 text-sm text-slate-500">光点按推荐度依次出现 · 悬停看详情 · 点击选一家</p>
              </motion.div>
              <div className="glass rounded-[2rem] p-4 md:p-8">
                <ChinaMap
                  key={major}
                  companies={mapCompanies}
                  onSelect={(c) => setSelectedCompany(c)}
                  selectedId={selectedCompany?.id}
                />
              </div>

              <AnimatePresence>
                {selectedCompany && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 20 }}
                    className="mt-4 max-w-md mx-auto"
                  >
                    <CompanyCard company={selectedCompany} compact />
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.section>
        )}
      </AnimatePresence>

      {/* 推荐企业 */}
      <section className="px-6 py-12 md:py-16">
        <div className="max-w-5xl mx-auto">
          <motion.h2 {...fadeUp} className="hero-title text-3xl md:text-5xl text-center">
            重点推荐<span className="text-orange-500">.</span>
          </motion.h2>
          <motion.p {...fadeUp} className="mt-3 text-center text-slate-500">
            按 {majorName} 方向为你精选 · 含出版社/国企/设备商/印钞防伪
          </motion.p>
          <div className="mt-8 grid md:grid-cols-2 gap-5">
            {top6.map((c, i) => (
              <CompanyCard key={c.id} company={c} index={i} />
            ))}
          </div>
          <div className="mt-8 text-center">
            <Link href="/companies" className="inline-block px-8 py-3.5 rounded-full bg-slate-900 text-white font-black text-sm hover:scale-105 transition-transform shadow-lg">
              进入企业库查看全部 {allCompanies.length} 家
            </Link>
          </div>
        </div>
      </section>

      {/* 职业百科 teaser */}
      <section className="px-6 py-12 md:py-16">
        <div className="max-w-5xl mx-auto">
          <motion.h2 {...fadeUp} className="hero-title text-3xl md:text-5xl text-center">
            职业百科<span className="text-blue-500">：好坏都告诉你</span>
          </motion.h2>
          <motion.p {...fadeUp} className="mt-3 text-center text-slate-500">
            每个岗位都写清楚：做什么、要什么设备技能、好处、坏处（含职业健康）
          </motion.p>
          <div className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-4">
            {roleData.roles.slice(0, 4).map((r, i) => (
              <motion.div key={r.id} {...fadeUp} transition={{ delay: i * 0.06 }}>
                <Link href={`/roles#${r.id}`} className="glass rounded-2xl p-4 block card-hover h-full">
                  <span className="inline-block w-3 h-3 rounded-full" style={{ background: r.color }} />
                  <p className="mt-2 font-black text-sm text-slate-800">{r.title}</p>
                  <p className="mt-1 text-[11px] text-slate-400 line-clamp-2">{r.intro}</p>
                  <p className="mt-2 text-[11px] font-black" style={{ color: r.color }}>{r.salary.split("→")[0]}</p>
                </Link>
              </motion.div>
            ))}
          </div>
          <div className="mt-6 text-center">
            <Link href="/roles" className="inline-block px-6 py-3 rounded-full bg-white/80 ring-1 ring-slate-200 text-sm font-black text-slate-700 hover:scale-105 transition-transform">
              查看全部 {roleData.roles.length} 个岗位真相
            </Link>
          </div>
        </div>
      </section>

      {/* 考证倒计时 teaser */}
      <section className="px-6 py-12 md:py-16">
        <div className="max-w-5xl mx-auto">
          <motion.h2 {...fadeUp} className="hero-title text-3xl md:text-5xl text-center">
            考证倒计时<span className="text-rose-500">，自动算好</span>
          </motion.h2>
          <motion.p {...fadeUp} className="mt-3 text-center text-slate-500">
            不用手工查官方公告——倒计时自动计算，未公布场次会标注「按往届推算」
          </motion.p>
          <div className="mt-8 grid md:grid-cols-3 gap-4">
            {upcoming.map((u, i) => {
              const st = statusStyle[u.event.status];
              return (
                <motion.div key={u.cert.id + u.event.label} {...fadeUp} transition={{ delay: i * 0.08 }} className="glass-strong rounded-3xl p-5 relative overflow-hidden">
                  <span className="absolute top-0 left-0 right-0 h-1" style={{ background: u.cert.color }} />
                  <div className="flex items-center justify-between">
                    <p className="font-black text-slate-800">{u.cert.shortName}</p>
                    <span className={`text-[10px] font-black px-2 py-0.5 rounded-full ${st.badge}`}>{st.label}</span>
                  </div>
                  <p className="mt-1 text-xs text-slate-500">{u.event.label}</p>
                  <p className="mt-3 text-3xl font-black" style={{ color: u.cert.color }}>{daysLabel(u.days)}</p>
                  <a href={u.cert.officialUrl} target="_blank" rel="noreferrer" className="mt-3 inline-block text-xs font-black text-blue-600 hover:underline">
                    {u.event.type === "报名" ? "去报名" : "官方入口"} →
                  </a>
                </motion.div>
              );
            })}
          </div>
          <div className="mt-6 text-center">
            <Link href="/certs" className="inline-block px-6 py-3 rounded-full bg-white/80 ring-1 ring-slate-200 text-sm font-black text-slate-700 hover:scale-105 transition-transform">
              进入考证中心
            </Link>
          </div>
        </div>
      </section>

      {/* 行业趋势 teaser */}
      <section className="px-6 py-12 md:py-16">
        <div className="max-w-5xl mx-auto">
          <motion.div {...fadeUp} className="glass-strong rounded-[2rem] p-8 md:p-10 relative overflow-hidden">
            <div className="absolute -top-16 -right-16 w-56 h-56 rounded-full bg-gradient-to-br from-cyan-200/40 to-blue-200/40 blur-3xl" />
            <div className="relative md:flex items-center justify-between gap-8">
              <div className="max-w-xl">
                <p className="text-xs font-black text-cyan-600 tracking-widest">INDUSTRY · 行业趋势</p>
                <h3 className="hero-title mt-2 text-2xl md:text-4xl">国内卷不动？<span className="gradient-text">印刷正在出海</span></h3>
                <p className="mt-3 text-sm text-slate-600 leading-relaxed">
                  越南、印尼、墨西哥、匈牙利……中国印企全球建厂。海外毛利率 28.8% 远高于国内 19.4%。
                  会外语的印刷人，正好站在风口上。
                </p>
              </div>
              <Link href="/industry" className="mt-6 md:mt-0 shrink-0 inline-block px-8 py-4 rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-500 text-white font-black text-sm shadow-lg shadow-cyan-200 hover:scale-105 transition-transform">
                看出海地图与印刷英语
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* 底部 */}
      <footer className="px-6 py-10 text-center">
        <p className="text-xs text-slate-400">
          数据更新于 {cd.updated}（联网自动同步最新版）· 招聘平台岗位数据实时 · 考证时间以官方公告为准
        </p>
      </footer>
    </div>
  );
}
