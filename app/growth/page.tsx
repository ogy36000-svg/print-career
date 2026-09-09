"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { useUserData } from "@/lib/store";
import { companies, skillPool, gradeStyle, certs as bundledCerts, certTimeline } from "@/lib/data";
import { matchCompanies } from "@/lib/match";
import { upcomingEvents, daysLabel, statusStyle } from "@/lib/certUtils";

const GRAD_DATE = new Date("2027-06-30T00:00:00+08:00");
const nodeColors = ["#ff5a3c", "#2563eb", "#8b5cf6", "#10b981", "#f59e0b"];
const nodeIcons = ["✏️", "💼", "📚", "🏆", "🚀"];

export default function GrowthPage() {
  const { data, update, loaded } = useUserData();
  const [daysLeft, setDaysLeft] = useState(0);

  useEffect(() => {
    const calc = () => setDaysLeft(Math.max(0, Math.ceil((GRAD_DATE.getTime() - Date.now()) / 86400000)));
    calc();
    const t = setInterval(calc, 60000);
    return () => clearInterval(t);
  }, []);

  const matched = useMemo(() => (loaded ? matchCompanies(companies, data).slice(0, 5) : []), [data, loaded]);
  const favCompanies = companies.filter((c) => data.favorites.includes(c.id));
  const upcoming = useMemo(() => upcomingEvents(bundledCerts).slice(0, 3), []);

  const totalTasks = certTimeline.phases.reduce((s, p) => s + p.actions.length, 0);
  const doneTasks = certTimeline.phases.reduce(
    (s, p) => s + p.actions.filter((a) => data.taskDone.includes(a)).length, 0
  );
  const skillProgress = Math.round((data.skillDone.length / Math.max(1, skillPool.length)) * 100);
  const taskProgress = Math.round((doneTasks / Math.max(1, totalTasks)) * 100);

  // 当前节点：第一个未全部完成的阶段
  const currentPhase = certTimeline.phases.findIndex((p) => !p.actions.every((a) => data.taskDone.includes(a)));

  if (!loaded) return <div className="p-10 text-center text-slate-400 font-bold">加载中…</div>;

  const toggleTask = (a: string) =>
    update((d) => ({ ...d, taskDone: d.taskDone.includes(a) ? d.taskDone.filter((x) => x !== a) : [...d.taskDone, a] }));

  return (
    <div className="max-w-4xl mx-auto px-6 py-8 md:py-12">
      <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="hero-title text-3xl md:text-5xl text-center">
        成长中心<span className="text-emerald-500">.</span>
      </motion.h1>
      <p className="mt-2 text-center text-sm text-slate-500">像打游戏闯关一样过完大三：一格一格点亮你的求职路径</p>

      {/* 总览卡片 */}
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="mt-6 glass-strong rounded-3xl p-6 relative overflow-hidden">
        <div className="absolute -top-10 -right-10 w-40 h-40 rounded-full bg-emerald-200/30 blur-3xl" />
        <div className="relative grid grid-cols-3 gap-4 text-center">
          <div>
            <p className="text-4xl md:text-5xl font-black gradient-text tabular-nums">{daysLeft}</p>
            <p className="mt-1 text-[11px] font-bold text-slate-400">距离毕业（天）</p>
          </div>
          <div>
            <p className="text-4xl md:text-5xl font-black text-emerald-500 tabular-nums">{taskProgress}%</p>
            <p className="mt-1 text-[11px] font-bold text-slate-400">闯关进度 {doneTasks}/{totalTasks}</p>
          </div>
          <div>
            <p className="text-4xl md:text-5xl font-black text-cyan-500 tabular-nums">{skillProgress}%</p>
            <p className="mt-1 text-[11px] font-bold text-slate-400">技能点亮 {data.skillDone.length}/{skillPool.length}</p>
          </div>
        </div>
      </motion.div>

      {/* 考证倒计时条 */}
      <div className="mt-6 flex gap-3 overflow-x-auto no-scrollbar pb-1">
        {upcoming.map((u) => {
          const st = statusStyle[u.event.status];
          return (
            <Link key={u.cert.id + u.event.label} href="/certs"
              className="shrink-0 glass rounded-2xl px-4 py-3 flex items-center gap-3 hover:scale-[1.03] transition-transform">
              <span className="w-2.5 h-2.5 rounded-full" style={{ background: u.cert.color }} />
              <div>
                <p className="text-xs font-black text-slate-700">{u.cert.shortName} · {u.event.label}</p>
                <p className="text-[10px] text-slate-400"><span className={`font-black ${u.days <= 7 ? "text-rose-500" : ""}`}>{daysLabel(u.days)}</span> · {st.label}</p>
              </div>
            </Link>
          );
        })}
      </div>

      {/* 闯关路径（Duolingo 式） */}
      <section className="mt-10">
        <h2 className="hero-title text-2xl md:text-3xl text-center">大三闯关路径</h2>
        <p className="mt-2 text-center text-xs text-slate-400">点任务前的圆圈标记完成，进度自动保存</p>
        <div className="mt-8 relative">
          {/* 中央虚线 */}
          <div className="absolute left-1/2 top-0 bottom-0 w-0.5 -translate-x-1/2 border-l-2 border-dashed border-slate-200 hidden md:block" />
          <div className="absolute left-5 top-0 bottom-0 w-0.5 border-l-2 border-dashed border-slate-200 md:hidden" />

          {certTimeline.phases.map((phase, i) => {
            const allDone = phase.actions.every((a) => data.taskDone.includes(a));
            const isCurrent = i === (currentPhase === -1 ? certTimeline.phases.length - 1 : currentPhase);
            const left = i % 2 === 0;
            const color = nodeColors[i % nodeColors.length];
            return (
              <motion.div
                key={phase.period}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className={`relative mb-8 md:w-1/2 ${left ? "md:pr-12" : "md:ml-auto md:pl-12"} pl-14 md:pl-0`}
              >
                {/* 节点圆 */}
                <div className={`absolute left-5 md:left-auto top-0 -translate-x-1/2 ${left ? "md:left-full md:translate-x-[-50%]" : "md:left-0 md:translate-x-[-50%]"} md:top-2`}>
                  <motion.div
                    animate={isCurrent && !allDone ? { scale: [1, 1.12, 1] } : {}}
                    transition={{ repeat: Infinity, duration: 1.6 }}
                    className="w-11 h-11 rounded-full grid place-items-center text-lg shadow-lg ring-4 ring-white/80"
                    style={{ background: allDone ? "#10b981" : color, opacity: allDone || isCurrent ? 1 : 0.45 }}
                  >
                    {allDone ? "✓" : nodeIcons[i % nodeIcons.length]}
                  </motion.div>
                </div>

                <div className={`glass rounded-3xl p-5 ${isCurrent && !allDone ? "ring-2 ring-offset-2" : ""}`} style={{ ["--tw-ring-color" as string]: isCurrent && !allDone ? color : undefined }}>
                  <div className="flex items-center justify-between gap-2">
                    <p className="font-black text-slate-800">{phase.period}</p>
                    {allDone
                      ? <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-600">已完成</span>
                      : isCurrent
                        ? <span className="text-[10px] font-black px-2 py-0.5 rounded-full text-white" style={{ background: color }}>进行中</span>
                        : <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-slate-100 text-slate-400">待解锁</span>}
                  </div>
                  <p className="mt-0.5 text-[11px] font-bold" style={{ color }}>重点：{phase.priority}</p>
                  <ul className="mt-3 space-y-2">
                    {phase.actions.map((a) => {
                      const done = data.taskDone.includes(a);
                      return (
                        <li key={a}>
                          <button onClick={() => toggleTask(a)} className="flex items-start gap-2.5 text-left w-full group">
                            <span className={`mt-0.5 w-4.5 h-4.5 w-[18px] h-[18px] rounded-full border-2 grid place-items-center shrink-0 transition-all text-[10px] font-black ${done ? "bg-emerald-500 border-emerald-500 text-white" : "border-slate-300 text-transparent group-hover:border-emerald-400"}`}>✓</span>
                            <span className={`text-sm ${done ? "text-slate-400 line-through" : "text-slate-700"}`}>{a}</span>
                          </button>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              </motion.div>
            );
          })}
        </div>
      </section>

      {/* 技能点亮 */}
      <section className="mt-10">
        <h2 className="hero-title text-2xl md:text-3xl text-center">技能点亮 <span className="text-base text-slate-400 font-bold">会一个点一个</span></h2>
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          {skillPool.map((s) => {
            const done = data.skillDone.includes(s);
            return (
              <button key={s}
                onClick={() => update((d) => ({ ...d, skillDone: done ? d.skillDone.filter((x) => x !== s) : [...d.skillDone, s] }))}
                className={`px-3.5 py-2 rounded-full text-xs font-bold transition-all ${done ? "bg-emerald-500 text-white shadow-md scale-105" : "glass text-slate-600 hover:bg-white/80"}`}>
                {done ? "✓ " : ""}{s}
              </button>
            );
          })}
        </div>
      </section>

      {/* 为你匹配 */}
      <section className="mt-10">
        <div className="flex items-end justify-between">
          <h2 className="hero-title text-2xl md:text-3xl">为你匹配的企业</h2>
          <Link href="/profile" className="text-xs font-black text-violet-500 hover:underline">完善档案更准</Link>
        </div>
        {data.profile.skills.length === 0 && data.profile.directions.length === 0 ? (
          <div className="mt-4 glass rounded-3xl p-6 text-center">
            <p className="font-black text-violet-600">还没有档案数据</p>
            <p className="mt-1 text-sm text-slate-500">去「档案」选好专业年级、勾选技能，或上传简历自动识别，这里会按匹配分重新排序。</p>
            <Link href="/profile" className="mt-3 inline-block px-5 py-2.5 rounded-full bg-violet-500 text-white text-sm font-black">
              去填档案 / 传简历
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
