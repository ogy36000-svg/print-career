"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { useUserData } from "@/lib/store";
import { companies, skillPool, gradeStyle, certs as bundledCerts, certTimeline, majors, gradeOptions, type CertsData } from "@/lib/data";
import { matchCompanies } from "@/lib/match";
import { upcomingEvents, daysLabel, statusStyle } from "@/lib/certUtils";
import { useRemoteData } from "@/lib/remote";

const GRAD_DATE = new Date("2027-06-30T00:00:00+08:00");
const nodeColors = ["#ff5a3c", "#2563eb", "#8b5cf6", "#10b981", "#f59e0b"];
const nodeIcons = ["✏️", "💼", "📚", "🏆", "🚀"];

export default function GrowthPage() {
  const { data, update, loaded } = useUserData();
  const { data: certData } = useRemoteData<CertsData>("certs", { updated: "", note: "", certs: bundledCerts, timeline: { note: "", phases: [] } });
  const [daysLeft, setDaysLeft] = useState(0);
  const [newSkill, setNewSkill] = useState("");

  useEffect(() => {
    const calc = () => setDaysLeft(Math.max(0, Math.ceil((GRAD_DATE.getTime() - Date.now()) / 86400000)));
    calc();
    const t = setInterval(calc, 60000);
    return () => clearInterval(t);
  }, []);

  const matched = useMemo(() => (loaded ? matchCompanies(companies, data).slice(0, 5) : []), [data, loaded]);
  const favCompanies = companies.filter((c) => data.favorites.includes(c.id));
  const upcoming = useMemo(() => upcomingEvents(certData.certs).slice(0, 4), [certData]);
  const allSkills = useMemo(() => Array.from(new Set([...skillPool, ...data.customSkills])), [data.customSkills]);

  const totalTasks = certTimeline.phases.reduce((s, p) => s + p.actions.length, 0);
  const doneTasks = certTimeline.phases.reduce((s, p) => s + p.actions.filter((a) => data.taskDone.includes(a)).length, 0);
  const taskProgress = Math.round((doneTasks / Math.max(1, totalTasks)) * 100);
  const currentPhase = certTimeline.phases.findIndex((p) => !p.actions.every((a) => data.taskDone.includes(a)));
  const majorName = majors.find((m) => m.id === data.profile.major)?.name ?? "未设置";

  if (!loaded) return <div className="p-10 text-center text-slate-400 font-bold">加载中…</div>;

  const toggleTask = (a: string) =>
    update((d) => ({ ...d, taskDone: d.taskDone.includes(a) ? d.taskDone.filter((x) => x !== a) : [...d.taskDone, a] }));

  const addCustomSkill = () => {
    const v = newSkill.trim();
    if (!v) return;
    if (!allSkills.includes(v)) update((d) => ({ ...d, customSkills: [...d.customSkills, v] }));
    setNewSkill("");
  };

  return (
    <div className="max-w-6xl mx-auto px-4 md:px-6 py-8 md:py-12">
      <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="hero-title text-3xl md:text-5xl text-center">
        成长中心<span className="text-emerald-500">.</span>
      </motion.h1>
      <p className="mt-2 text-center text-sm text-slate-500">横向闯关路径 + 两侧看板，一屏看清你的求职进度</p>

      <div className="mt-8 lg:grid lg:grid-cols-[240px_1fr_300px] lg:gap-5 lg:items-start">
        {/* 左看板：倒计时 + 考证 */}
        <aside className="space-y-4 mb-6 lg:mb-0 lg:sticky lg:top-24">
          <div className="glass-strong rounded-3xl p-5 text-center">
            <p className="text-[11px] font-black text-slate-400 tracking-widest">距离毕业大约</p>
            <p className="mt-1 text-4xl font-black gradient-text tabular-nums">{daysLeft}</p>
            <p className="text-[11px] font-bold text-slate-400">天</p>
            <div className="mt-3 h-2 rounded-full bg-slate-100 overflow-hidden">
              <motion.div initial={{ width: 0 }} animate={{ width: `${taskProgress}%` }} className="h-full bg-gradient-to-r from-emerald-400 to-cyan-400 rounded-full" />
            </div>
            <p className="mt-1.5 text-[11px] font-bold text-slate-500">闯关 {doneTasks}/{totalTasks}</p>
          </div>
          <div className="glass rounded-3xl p-4">
            <div className="flex items-center justify-between">
              <p className="text-xs font-black text-slate-500">考证倒计时</p>
              <Link href="/certs" className="text-[10px] font-black text-rose-500 hover:underline">全部 →</Link>
            </div>
            <div className="mt-2 space-y-2">
              {upcoming.map((u) => {
                const st = statusStyle[u.event.status];
                return (
                  <Link key={u.cert.id + u.event.label} href="/certs" className="flex items-center gap-2 rounded-xl bg-white/70 px-3 py-2 hover:bg-white transition-colors">
                    <span className="w-2 h-2 rounded-full shrink-0" style={{ background: u.cert.color }} />
                    <div className="min-w-0 flex-1">
                      <p className="text-[11px] font-black text-slate-700 truncate">{u.cert.shortName} · {u.event.label}</p>
                      <p className="text-[10px] text-slate-400">{st.label}</p>
                    </div>
                    <span className={`text-xs font-black tabular-nums ${u.days <= 7 ? "text-rose-500" : "text-slate-600"}`}>{daysLabel(u.days)}</span>
                  </Link>
                );
              })}
            </div>
          </div>
        </aside>

        {/* 中：横向闯关路径 */}
        <main className="min-w-0">
          <div className="glass rounded-3xl p-5">
            <div className="flex items-center justify-between">
              <h2 className="font-black text-lg text-slate-800">闯关路径</h2>
              <span className="text-[11px] font-bold text-slate-400">横向滑动 →</span>
            </div>
            <div className="mt-4 overflow-x-auto no-scrollbar">
              <div className="flex gap-4 min-w-max pb-2 relative">
                {/* 横向连接线 */}
                <div className="absolute left-8 right-8 top-6 h-0.5 bg-gradient-to-r from-orange-200 via-blue-200 to-emerald-200" />
                {certTimeline.phases.map((phase, i) => {
                  const allDone = phase.actions.every((a) => data.taskDone.includes(a));
                  const isCurrent = i === (currentPhase === -1 ? certTimeline.phases.length - 1 : currentPhase);
                  const color = nodeColors[i % nodeColors.length];
                  return (
                    <motion.div
                      key={phase.period}
                      initial={{ opacity: 0, y: 16 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: i * 0.06 }}
                      className="relative w-60 shrink-0 pt-14"
                    >
                      {/* 节点 */}
                      <motion.div
                        animate={isCurrent && !allDone ? { scale: [1, 1.15, 1] } : {}}
                        transition={{ repeat: Infinity, duration: 1.6 }}
                        className="absolute top-0 left-6 w-12 h-12 rounded-full grid place-items-center text-lg shadow-lg ring-4 ring-white z-10"
                        style={{ background: allDone ? "#10b981" : color, opacity: allDone || isCurrent ? 1 : 0.4 }}
                      >
                        {allDone ? "✓" : nodeIcons[i % nodeIcons.length]}
                      </motion.div>
                      <div className={`rounded-2xl bg-white/80 p-4 ring-1 ${isCurrent && !allDone ? "ring-2" : "ring-slate-100"}`} style={{ ["--tw-ring-color" as string]: isCurrent && !allDone ? color : undefined }}>
                        <div className="flex items-center justify-between gap-2">
                          <p className="font-black text-sm text-slate-800">{phase.period}</p>
                          {allDone
                            ? <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-600 shrink-0">完成</span>
                            : isCurrent
                              ? <span className="text-[10px] font-black px-2 py-0.5 rounded-full text-white shrink-0" style={{ background: color }}>进行中</span>
                              : <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-slate-100 text-slate-400 shrink-0">待解锁</span>}
                        </div>
                        <p className="mt-0.5 text-[10px] font-bold" style={{ color }}>重点：{phase.priority}</p>
                        <ul className="mt-2.5 space-y-2">
                          {phase.actions.map((a) => {
                            const done = data.taskDone.includes(a);
                            return (
                              <li key={a}>
                                <button onClick={() => toggleTask(a)} className="flex items-start gap-2 text-left w-full group">
                                  <span className={`mt-0.5 w-[16px] h-[16px] rounded-full border-2 grid place-items-center shrink-0 transition-all text-[9px] font-black ${done ? "bg-emerald-500 border-emerald-500 text-white" : "border-slate-300 text-transparent group-hover:border-emerald-400"}`}>✓</span>
                                  <span className={`text-xs leading-snug ${done ? "text-slate-400 line-through" : "text-slate-700"}`}>{a}</span>
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
            </div>
          </div>

          {/* 技能点亮（可自定义） */}
          <div className="mt-5 glass rounded-3xl p-5">
            <h2 className="font-black text-lg text-slate-800">技能点亮 <span className="text-xs font-bold text-slate-400">会一个点一个，也可以自己添加</span></h2>
            <div className="mt-3 flex gap-2">
              <input
                value={newSkill}
                onChange={(e) => setNewSkill(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && addCustomSkill()}
                placeholder="输入你会的技能，如：CTP制版、剪映…"
                className="flex-1 px-4 py-2.5 rounded-2xl bg-white/80 ring-1 ring-slate-200 focus:ring-2 focus:ring-emerald-400 outline-none text-sm font-bold"
              />
              <button onClick={addCustomSkill} className="px-5 py-2.5 rounded-2xl bg-emerald-500 text-white text-sm font-black hover:scale-105 transition-transform shrink-0">
                添加
              </button>
            </div>
            <div className="mt-3 flex flex-wrap gap-2">
              {allSkills.map((s) => {
                const done = data.skillDone.includes(s);
                const isCustom = data.customSkills.includes(s);
                return (
                  <button key={s}
                    onClick={() => update((d) => ({ ...d, skillDone: done ? d.skillDone.filter((x) => x !== s) : [...d.skillDone, s] }))}
                    className={`px-3.5 py-2 rounded-full text-xs font-bold transition-all ${done ? "bg-emerald-500 text-white shadow-md" : "bg-white/70 ring-1 ring-slate-200 text-slate-600 hover:bg-white"}`}>
                    {done ? "✓ " : ""}{s}{isCustom && <span className="ml-1 opacity-60">·自定义</span>}
                  </button>
                );
              })}
            </div>
            <p className="mt-3 text-[11px] font-bold text-slate-400">已点亮 {data.skillDone.length}/{allSkills.length}</p>
          </div>
        </main>

        {/* 右看板：档案摘要 + 匹配榜 + 追踪 */}
        <aside className="mt-6 lg:mt-0 space-y-4 lg:sticky lg:top-24">
          {/* 档案摘要 */}
          <div className="glass rounded-3xl p-4">
            <div className="flex items-center justify-between">
              <p className="text-xs font-black text-slate-500">我的档案</p>
              <Link href="/profile" className="text-[10px] font-black text-violet-500 hover:underline">编辑 →</Link>
            </div>
            <p className="mt-2 text-xs text-slate-600">{majorName} · {gradeOptions.find((g) => g.id === data.profile.grade)?.label ?? "大三"}</p>
            <p className="mt-1 text-[11px] text-slate-400">
              技能 {data.profile.skills.length} · 证书 {data.profile.certs.length} · 意向 {data.profile.directions.length}
              {data.profile.resumeAnalysis ? " · 简历已识别" : ""}
            </p>
            {(data.profile.skills.length === 0) && (
              <Link href="/profile" className="mt-2 block text-center text-[11px] font-black text-white bg-violet-500 rounded-xl py-2 hover:scale-[1.02] transition-transform">
                上传简历自动识别
              </Link>
            )}
          </div>

          {/* 匹配企业榜 */}
          <div className="glass rounded-3xl p-4">
            <p className="text-xs font-black text-slate-500">为你匹配 TOP5</p>
            <div className="mt-2 space-y-2">
              {matched.map((m, i) => {
                const g = gradeStyle[m.company.recommend];
                return (
                  <Link key={m.company.id} href={`/companies/${m.company.id}`} className="flex items-center gap-2 rounded-xl bg-white/70 px-3 py-2 hover:bg-white transition-colors">
                    <span className="text-sm font-black text-slate-300 w-4">{i + 1}</span>
                    <span className={`text-[9px] font-black w-5 h-5 grid place-items-center rounded-md ${g.badge} shrink-0`}>{m.company.recommend}</span>
                    <span className="text-xs font-black text-slate-700 truncate flex-1">{m.company.name}</span>
                    <span className="text-xs font-black text-orange-500 tabular-nums">{m.score}</span>
                  </Link>
                );
              })}
            </div>
          </div>

          {/* 目标企业追踪 */}
          <div className="glass rounded-3xl p-4">
            <p className="text-xs font-black text-slate-500">目标企业追踪</p>
            {favCompanies.length === 0 ? (
              <p className="mt-2 text-[11px] text-slate-400">还没收藏，去<Link href="/companies" className="font-black text-orange-500">企业库</Link>点爱心</p>
            ) : (
              <div className="mt-2 space-y-2">
                {favCompanies.map((c) => {
                  const st = data.companyStatus[c.id];
                  return (
                    <Link key={c.id} href={`/companies/${c.id}`} className="flex items-center gap-2 rounded-xl bg-white/70 px-3 py-2 hover:bg-white transition-colors">
                      <span className="text-xs font-black text-slate-700 truncate flex-1">{c.name}</span>
                      <span className={`text-[10px] font-black px-2 py-0.5 rounded-full ${st ? "bg-emerald-100 text-emerald-600" : "bg-slate-100 text-slate-400"}`}>{st ?? "未标记"}</span>
                    </Link>
                  );
                })}
              </div>
            )}
          </div>
        </aside>
      </div>
    </div>
  );
}
