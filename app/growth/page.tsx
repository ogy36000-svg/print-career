"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { useUserData } from "@/lib/store";
import { companies, skillPool, gradeStyle } from "@/lib/data";
import { matchCompanies } from "@/lib/match";

const GRAD_DATE = new Date("2027-06-30T00:00:00+08:00");

const certTimeline = [
  { time: "2026 大三上", items: ["英语四级（必须拿下）", "日语 JLPT N3（12月考试）", "计算机二级", "开始攒作品集：3个完整包装设计"] },
  { time: "2026-2027 寒假", items: ["第一段实习：校企合作企业（普理司/麦普）或白云区印刷厂", "完善简历并录入本站档案"] },
  { time: "2027 大三下", items: ["日语 JLPT N2（如N3已过）", "英语六级（有余力）", "Adobe认证 / G7色彩认证（走技术路线）", "印前制作员/平版印刷工职业等级证书"] },
  { time: "2027 暑假-秋招", items: ["第二段对口实习：S级企业", "9-11月秋招集中投递", "锁定offer"] },
];

export default function GrowthPage() {
  const { data, update, loaded } = useUserData();
  const [daysLeft, setDaysLeft] = useState(0);

  useEffect(() => {
    const calc = () => setDaysLeft(Math.max(0, Math.ceil((GRAD_DATE.getTime() - Date.now()) / 86400000)));
    calc();
    const t = setInterval(calc, 60000);
    return () => clearInterval(t);
  }, []);

  const matched = useMemo(() => (loaded ? matchCompanies(companies, data).slice(0, 6) : []), [data, loaded]);
  const favCompanies = companies.filter((c) => data.favorites.includes(c.id));
  const progress = Math.round((data.skillDone.length / Math.max(1, skillPool.length)) * 100);

  if (!loaded) return <div className="p-10 text-center text-slate-400 font-bold">加载中…</div>;

  return (
    <div className="max-w-5xl mx-auto px-6 py-8 md:py-12">
      <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="hero-title text-3xl md:text-5xl">
        成长中心<span className="text-emerald-500">.</span>
      </motion.h1>

      {/* 倒计时 */}
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="mt-6 bg-[#14161a] rounded-3xl p-6 md:p-8 text-white relative overflow-hidden">
        <div className="absolute -top-10 -right-10 w-40 h-40 rounded-full bg-orange-500/30 blur-3xl" />
        <p className="text-xs font-black text-slate-400 tracking-widest">距离 2027 年 6 月毕业大约还有</p>
        <div className="mt-2 flex items-end gap-3">
          <span className="text-6xl md:text-8xl font-black gradient-text">{daysLeft}</span>
          <span className="text-xl font-black mb-2 md:mb-4">天</span>
        </div>
        <p className="mt-2 text-xs text-slate-400">技能掌握进度 {progress}% · 收藏企业 {data.favorites.length} 家 · 投递标记 {Object.keys(data.companyStatus).length} 条</p>
        <div className="mt-3 h-2 rounded-full bg-white/10 overflow-hidden">
          <motion.div initial={{ width: 0 }} animate={{ width: `${progress}%` }} transition={{ duration: 0.8 }} className="h-full bg-gradient-to-r from-emerald-400 to-cyan-400 rounded-full" />
        </div>
      </motion.div>

      {/* 个性化推荐 */}
      <section className="mt-10">
        <div className="flex items-end justify-between">
          <h2 className="hero-title text-2xl md:text-3xl">为你匹配的企业</h2>
          <Link href="/profile" className="text-xs font-black text-violet-500 hover:underline">完善档案更准 →</Link>
        </div>
        {data.profile.skills.length === 0 && data.profile.directions.length === 0 ? (
          <div className="mt-4 bg-violet-50 rounded-3xl p-6 ring-1 ring-violet-100">
            <p className="font-black text-violet-700">还没有档案数据</p>
            <p className="mt-1 text-sm text-slate-600">去「我的档案」勾选技能、证书和意向方向，这里会按匹配分重新排序企业。</p>
            <Link href="/profile" className="mt-3 inline-block px-5 py-2.5 rounded-full bg-violet-500 text-white text-sm font-black">去填档案 →</Link>
          </div>
        ) : (
          <div className="mt-4 space-y-3">
            {matched.map((m, i) => {
              const g = gradeStyle[m.company.recommend];
              return (
                <motion.div key={m.company.id} initial={{ opacity: 0, x: -16 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.05 }}>
                  <Link href={`/companies/${m.company.id}`} className="block bg-white rounded-2xl p-4 ring-1 ring-black/5 card-hover">
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
        <h2 className="hero-title text-2xl md:text-3xl">技能清单 <span className="text-base text-slate-400 font-bold">点一下标记「已掌握」</span></h2>
        <div className="mt-4 flex flex-wrap gap-2">
          {skillPool.map((s) => {
            const done = data.skillDone.includes(s);
            return (
              <button key={s}
                onClick={() => update((d) => ({ ...d, skillDone: done ? d.skillDone.filter((x) => x !== s) : [...d.skillDone, s] }))}
                className={`px-3.5 py-2 rounded-full text-xs font-bold transition-all ${done ? "bg-emerald-500 text-white shadow-md line-through" : "bg-white text-slate-600 ring-1 ring-black/10 hover:ring-emerald-300"}`}>
                {done ? "✓ " : ""}{s}
              </button>
            );
          })}
        </div>
      </section>

      {/* 证书规划时间线 */}
      <section className="mt-10">
        <h2 className="hero-title text-2xl md:text-3xl">这一年怎么考证</h2>
        <div className="mt-5 space-y-0 relative">
          <div className="absolute left-[15px] top-2 bottom-2 w-0.5 bg-gradient-to-b from-orange-300 via-blue-300 to-emerald-300" />
          {certTimeline.map((t, i) => (
            <motion.div key={t.time} initial={{ opacity: 0, x: -16 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.06 }} className="relative pl-10 pb-6">
              <div className="absolute left-2 top-1.5 w-4 h-4 rounded-full bg-white ring-4 ring-orange-200" style={{ backgroundColor: ["#ff5a3c", "#2563eb", "#8b5cf6", "#10b981"][i] }} />
              <p className="font-black text-sm text-slate-800">{t.time}</p>
              <div className="mt-2 bg-white rounded-2xl p-4 ring-1 ring-black/5">
                <ul className="space-y-1.5">
                  {t.items.map((it) => (
                    <li key={it} className="text-sm text-slate-600 flex gap-2"><span className="text-emerald-500 font-black">·</span>{it}</li>
                  ))}
                </ul>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* 目标企业追踪 */}
      <section className="mt-10">
        <h2 className="hero-title text-2xl md:text-3xl">目标企业追踪 <span className="text-base text-slate-400 font-bold">♥ 收藏的企业会出现在这里</span></h2>
        {favCompanies.length === 0 ? (
          <div className="mt-4 bg-white rounded-3xl p-6 ring-1 ring-black/5 text-center">
            <p className="text-3xl">♡</p>
            <p className="mt-2 text-sm text-slate-500">还没有收藏企业，去<Link href="/companies" className="font-black text-orange-500">企业库</Link>点几个小心心吧</p>
          </div>
        ) : (
          <div className="mt-4 grid md:grid-cols-2 gap-3">
            {favCompanies.map((c) => {
              const st = data.companyStatus[c.id];
              const g = gradeStyle[c.recommend];
              return (
                <Link key={c.id} href={`/companies/${c.id}`} className="bg-white rounded-2xl p-4 ring-1 ring-black/5 card-hover flex items-center gap-3">
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
