"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { rolesData as bundled, type RolesData, jobSearchLinks } from "@/lib/data";
import { useRemoteData } from "@/lib/remote";

export default function RolesPage() {
  const { data, remote } = useRemoteData<RolesData>("roles", bundled);
  const [openId, setOpenId] = useState<string | null>(null);

  return (
    <div className="max-w-4xl mx-auto px-6 py-8 md:py-12">
      <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="hero-title text-3xl md:text-5xl text-center">
        职业百科<span className="text-blue-500">.</span>
      </motion.h1>
      <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }} className="mt-3 max-w-2xl mx-auto text-center text-sm text-slate-500">
        每个岗位的真实面貌：做什么、用什么设备、好处坏处、职业健康、薪资路径。{data.note}
      </motion.p>
      <p className="mt-2 text-center text-[11px] text-slate-400">数据更新于 {data.updated}{remote ? "（已同步最新版）" : ""}</p>

      <div className="mt-8 space-y-4">
        {data.roles.map((r, i) => {
          const open = openId === r.id;
          return (
            <motion.div
              key={r.id}
              id={r.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: Math.min(i * 0.05, 0.3) }}
              className="glass-strong rounded-3xl overflow-hidden scroll-mt-24"
            >
              {/* 头部（可点击展开） */}
              <button onClick={() => setOpenId(open ? null : r.id)} className="w-full text-left p-6 flex items-center gap-4">
                <span className="w-12 h-12 rounded-2xl grid place-items-center text-white font-black text-lg shrink-0 shadow-lg" style={{ background: r.color }}>
                  {r.title.slice(0, 1)}
                </span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h2 className="font-black text-lg text-slate-800">{r.title}</h2>
                    <span className="text-[10px] font-black px-2 py-0.5 rounded-full text-white" style={{ background: r.color }}>{r.category}</span>
                  </div>
                  <p className="mt-1 text-xs text-slate-500 line-clamp-1">{r.intro}</p>
                </div>
                <motion.span animate={{ rotate: open ? 180 : 0 }} className="text-slate-400 font-black shrink-0">▾</motion.span>
              </button>

              {open && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="px-6 pb-6 -mt-2">
                  <p className="text-sm text-slate-600 leading-relaxed">{r.intro}</p>
                  <p className="mt-3 text-sm text-slate-600 leading-relaxed"><span className="font-black text-slate-800">每天做什么：</span>{r.daily}</p>

                  <div className="mt-4 grid md:grid-cols-2 gap-4">
                    <div className="rounded-2xl bg-white/70 p-4">
                      <p className="text-xs font-black text-slate-400">常用设备</p>
                      <div className="mt-2 flex flex-wrap gap-1.5">
                        {r.equipment.map((e) => <span key={e} className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-slate-100 text-slate-600">{e}</span>)}
                      </div>
                      <p className="mt-3 text-xs font-black text-slate-400">常用软件</p>
                      <div className="mt-2 flex flex-wrap gap-1.5">
                        {r.software.map((s) => <span key={s} className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-blue-50 text-blue-600">{s}</span>)}
                      </div>
                    </div>
                    <div className="rounded-2xl bg-white/70 p-4 space-y-2.5 text-xs">
                      <p><span className="font-black text-slate-700">入行要求：</span><span className="text-slate-600">{r.requirements}</span></p>
                      <p><span className="font-black text-slate-700">薪资参考：</span><span className="font-black" style={{ color: r.color }}>{r.salary}</span></p>
                      <p><span className="font-black text-slate-700">晋升路径：</span><span className="text-slate-600">{r.growth}</span></p>
                      <p><span className="font-black text-slate-700">外语要求：</span><span className="text-slate-600">{r.english}</span></p>
                      <p><span className="font-black text-slate-700">适合谁：</span><span className="text-slate-600">{r.fit}</span></p>
                    </div>
                  </div>

                  {/* 好坏对照 */}
                  <div className="mt-4 grid md:grid-cols-2 gap-4">
                    <div className="rounded-2xl bg-emerald-50/80 ring-1 ring-emerald-100 p-4">
                      <p className="text-xs font-black text-emerald-600">好处</p>
                      <ul className="mt-2 space-y-1.5">
                        {r.pros.map((x) => <li key={x} className="text-xs text-slate-600 flex gap-1.5"><span className="text-emerald-500 font-black shrink-0">✓</span>{x}</li>)}
                      </ul>
                    </div>
                    <div className="rounded-2xl bg-rose-50/80 ring-1 ring-rose-100 p-4">
                      <p className="text-xs font-black text-rose-500">坏处</p>
                      <ul className="mt-2 space-y-1.5">
                        {r.cons.map((x) => <li key={x} className="text-xs text-slate-600 flex gap-1.5"><span className="text-rose-400 font-black shrink-0">✗</span>{x}</li>)}
                      </ul>
                    </div>
                  </div>

                  {/* 职业健康 */}
                  <div className="mt-4 rounded-2xl bg-amber-50/80 ring-1 ring-amber-100 p-4">
                    <p className="text-xs font-black text-amber-600">职业健康提示</p>
                    <p className="mt-1.5 text-xs text-slate-600 leading-relaxed">{r.health}</p>
                  </div>

                  {/* 招聘直达 */}
                  <div className="mt-4">
                    <p className="text-xs font-black text-slate-400">实时岗位直达</p>
                    <div className="mt-2 grid grid-cols-3 md:grid-cols-6 gap-2">
                      {jobSearchLinks(r.searchKeyword).map((l) => (
                        <a key={l.platform} href={l.url} target="_blank" rel="noreferrer"
                          className={`${l.color} rounded-xl px-2 py-2.5 text-center text-[11px] font-black text-white hover:scale-105 active:scale-95 transition-transform shadow-sm`}>
                          {l.platform}
                        </a>
                      ))}
                    </div>
                  </div>
                </motion.div>
              )}
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
