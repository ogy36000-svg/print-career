"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { useUserData } from "@/lib/store";
import { companies, skillPool, gradeStyle, certs, certTimeline } from "@/lib/data";
import { matchCompanies } from "@/lib/match";

const GRAD_DATE = new Date("2027-06-30T00:00:00+08:00");

export default function GrowthPage() {
  const { data, update, loaded } = useUserData();
  const [daysLeft, setDaysLeft] = useState(0);
  const [activePhase, setActivePhase] = useState(0);

  useEffect(() => {
    const calc = () => setDaysLeft(Math.max(0, Math.ceil((GRAD_DATE.getTime() - Date.now()) / 86400000)));
    calc();
    const t = setInterval(calc, 60000);
    return () => clearInterval(t);
  }, []);

  const matched = useMemo(() => (loaded ? matchCompanies(companies, data).slice(0, 5) : []), [data, loaded]);
  const favCompanies = companies.filter((c) => data.favorites.includes(c.id));
  const progress = Math.round((data.skillDone.length / Math.max(1, skillPool.length)) * 100);

  if (!loaded) return <div className="p-10 text-center text-slate-400 font-bold">加载中…</div>;

  return (
    <div className="max-w-4xl mx-auto px-6 py-8 md:py-12">
      <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="hero-title text-3xl md:text-5xl text-center">
        成长中心<span className="text-emerald-500">.</span>
      </motion.h1>

      {/* 倒计时轮播 */}
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="mt-6 glass-strong rounded-3xl p-6 md:p-8 relative overflow-hidden">
        <div className="absolute -top-10 -right-10 w-40 h-40 rounded-full bg-orange-200/30 blur-3xl" />
        <div className="absolute -bottom-10 -left-10 w-40 h-40 rounded-full bg-blue-200/30 blur-3xl" />
        <div className="relative text-center">
          <p className="text-xs font-black text-slate-400 tracking-widest">距离 2027 年 6 月毕业大约还有</p>
          <div className="mt-2 h-20 md:h-28 overflow-hidden">
            <div className="animate-ticker text-6xl md:text-8xl font-black gradient-text inline-block">
              {daysLeft}
            </div>
          </div>
          <p className="mt-1 text-lg font-black text-slate-600">天</p>
          <div className="mt-4 flex justify-center gap-6 text-xs font-bold text-slate-500">
            <span>技能 {data.skillDone.length}/{skillPool.length}</span>
            <span>收藏 {data.favorites.length} 家</span>
            <span>投递 {Object.keys(data.companyStatus).length} 条</span>
          </div>
          <div className="mt-3 h-2 max-w-md mx-auto rounded-full bg-slate-100 overflow-hidden">
            <motion.div initial={{ width: 0 }} animate={{ width: `${progress}%` }} transition={{ duration: 0.8 }} className="h-full bg-gradient-to-r from-emerald-400 to-cyan-400 rounded-full" />
          </div>
        </div>
      </motion.div>

      {/* 考证日历（纵向时间线） */}
      <section className="mt-10">
        <h2 className="hero-title text-2xl md:text-3xl text-center">考证与实习规划</h2>
        <p className="mt-2 text-center text-xs text-slate-400">{certs[0]?.source && "考试时间按往届规律整理，以官方公告为准"}</p>
        <div className="mt-6 relative">
          <div className="absolute left-4 top-2 bottom-2 w-0.5 bg-gradient-to-b from-orange-300 via-blue-300 to-emerald-300" />
          {certTimeline.phases.map((phase, i) => (
            <motion.div
              key={phase.period}
              initial={{ opacity: 0, x: -16 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.06 }}
              className="relative pl-12 pb-6"
            >
              <div
                className="absolute left-0 top-1 w-8 h-8 rounded-full grid place-items-center text-[10px] font-black text-white shadow-lg"
                style={{ backgroundColor: ["#ff5a3c", "#2563eb", "#8b5cf6", "#10b981", "#f59e0b"][i] }}
              >
                {i + 1}
              </div>
              <div className="glass rounded-2xl p-5">
                <div className="flex items-center justify-between">
                  <p className="font-black text-sm text-slate-800">{phase.period}</p>
                  <span className={`text-[10px] font-black px-2 py-0.5 rounded-full ${phase.priority === "最高" ? "bg-rose-100 text-rose-600" : "bg-blue-100 text-blue-600"}`}>
                    {phase.priority}优先级
                  </span>
                </div>
                <ul className="mt-3 space-y-2">
                  {phase.actions.map((action) => (
                    <li key={action} className="text-sm text-slate-600 flex gap-2">
                      <span className="text-emerald-500 font-black">·</span>
                      <span>{action}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* 证书库 */}
      <section className="mt-10">
        <h2 className="hero-title text-2xl md:text-3xl text-center">证书库（含报名链接）</h2>
        <div className="mt-6 grid md:grid-cols-2 gap-4">
          {certs.map((cert) => (
            <div key={cert.id} className="glass rounded-2xl p-5">
              <div className="flex items-start justify-between">
                <div>
                  <p className="font-black text-slate-800">{cert.name}</p>
                  <p className="mt-1 text-xs text-orange-500 font-bold">{cert.importance}</p>
                </div>
                <span className="text-[10px] font-black px-2 py-1 rounded-full bg-slate-100 text-slate-500">{cert.category}</span>
              </div>
              <p className="mt-3 text-xs text-slate-600"><span className="font-black text-slate-700">考试时间：</span>{cert.examTimes.join(" / ")}</p>
              <p className="mt-1 text-xs text-slate-600"><span className="font-black text-slate-700">报名时间：</span>{cert.regTimes.join(" / ")}</p>
              <p className="mt-2 text-xs text-amber-600 bg-amber-50/80 rounded-lg p-2">{cert.regNotice}</p>
              <a href={cert.officialUrl} target="_blank" rel="noreferrer" className="mt-3 inline-block text-xs font-black text-blue-600 hover:underline">
                {cert.officialName} →
              </a>
            </div>
          ))}
        </div>
      </section>

      {/* 个性化推荐 */}
      <section className="mt-10">
        <div className="flex items-end justify-between">
          <h2 className="hero-title text-2xl md:text-3xl">为你匹配的企业</h2>
          <Link href="/profile" className="text-xs font-black text-violet-500 hover:underline">完善档案更准</Link>
        </div>
        {data.profile.skills.length === 0 && data.profile.directions.length === 0 ? (
          <div className="mt-4 glass rounded-3xl p-6 text-center">
            <p className="font-black text-violet-600">还没有档案数据</p>
            <p className="mt-1 text-sm text-slate-500">去「档案」勾选技能和意向方向，这里会按匹配分重新排序企业。</p>
            <Link href="/profile" className="mt-3 inline-block px-5 py-2.5 rounded-full bg-violet-500 text-white text-sm font-black">
              去填档案
            </Link>
          </div>
        ) : (
          <div className="mt-4 space-y-3">
            {matched.map((m, i) => {
              const g = gradeStyle[m.company.recommend];
              return (
                <motion.div key={m.company.id} initial={{ opacity: 0, x: -16 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.05 }}>
                  <Link href={`/companies/${m.company.id}`} className="block glass rounded-2xl p-4 hover:shadow-xl transition-shadow">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl font-black text-slate-200 w-8">{i + 1}</span>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-black">{m.company.name}</span>
                          <span className={`text-[10px] font-black px-2 py-0.5 rounded-full ${g.badge}`}>{m.company.recommend}</span>
                          <span className={`text-[10px] font-black px-2 py-0.5 rounded-full ${m.tier === "强烈推荐" ? "bg-orange-100 text-orange-600" : m.tier === "推荐" ? "bg-blue-100 text-blue-600" : "bg-slate-100 text-slate-500"}`}>{m.tier}</span>
                        </div>
                        {m.hits.length > 0 && <p className="mt-1 text-xs text-slate-500">{m.hits.join("；")}</p>}
                      </div>
                      <div className="text-right shrink-0">
                        <div className="text-xl font-black text-orange-500">{m.score}</div>
                        <div className="text-[10px] text-slate-400 font-bold">匹配分</div>
                      </div>
                    </div>
                  </Link>
                </motion.div>
              );
            })}
          </div>
        )}
      </section>

      {/* 技能清单 */}
      <section className="mt-10">
        <h2 className="hero-title text-2xl md:text-3xl text-center">技能清单 <span className="text-base text-slate-400 font-bold">点一下标记「已掌握」</span></h2>
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          {skillPool.map((s) => {
            const done = data.skillDone.includes(s);
            return (
              <button key={s}
                onClick={() => update((d) => ({ ...d, skillDone: done ? d.skillDone.filter((x) => x !== s) : [...d.skillDone, s] }))}
                className={`px-3.5 py-2 rounded-full text-xs font-bold transition-all ${done ? "bg-emerald-500 text-white shadow-md" : "glass text-slate-600 hover:bg-white/80"}`}>
                {done ? "✓ " : ""}{s}
              </button>
            );
          })}
        </div>
      </section>

      {/* 目标企业追踪 */}
      <section className="mt-10">
        <h2 className="hero-title text-2xl md:text-3xl text-center">目标企业追踪</h2>
        {favCompanies.length === 0 ? (
          <div className="mt-4 glass rounded-3xl p-6 text-center">
            <p className="text-3xl font-black text-slate-300">+</p>
            <p className="mt-2 text-sm text-slate-500">还没有收藏企业，去<Link href="/companies" className="font-black text-orange-500">企业库</Link>收藏几家吧</p>
          </div>
        ) : (
          <div className="mt-4 grid md:grid-cols-2 gap-3">
            {favCompanies.map((c) => {
              const st = data.companyStatus[c.id];
              const g = gradeStyle[c.recommend];
              return (
                <Link key={c.id} href={`/companies/${c.id}`} className="glass rounded-2xl p-4 hover:shadow-xl transition-shadow flex items-center gap-3">
                  <span className={`text-[11px] font-black w-8 h-8 grid place-items-center rounded-xl ${g.badge}`}>{c.recommend}</span>
                  <div className="min-w-0 flex-1">
                    <p className="font-black text-sm">{c.name}</p>
                    <p className="text-xs text-slate-400">{c.city} · {c.type}</p>
                  </div>
                  <span className={`text-[11px] font-black px-2.5 py-1 rounded-full ${st ? "bg-emerald-100 text-emerald-600" : "bg-slate-100 text-slate-400"}`}>
                    {st ?? "未标记"}
                  </span>
                </Link>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}
