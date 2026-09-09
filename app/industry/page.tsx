"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { industryData as bundled } from "@/lib/data";
import type { IndustryData } from "@/lib/types";
import { useRemoteData } from "@/lib/remote";

export default function IndustryPage() {
  const { data, remote } = useRemoteData<IndustryData>("industry", bundled);
  const [activeDest, setActiveDest] = useState<number | null>(null);
  const [termCount, setTermCount] = useState(12);

  // 中国位置（坐标为 100x100 画布上的百分比）
  const cn = { x: 78, y: 55 };

  return (
    <div className="max-w-5xl mx-auto px-6 py-8 md:py-12">
      <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="hero-title text-3xl md:text-5xl text-center">
        行业趋势<span className="text-cyan-500">.</span>
      </motion.h1>
      <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }} className="mt-3 max-w-2xl mx-auto text-center text-sm text-slate-500">
        印刷行业正在发生什么：内卷、出海、数码化、绿色化。看懂大行情，才能选对位置。
      </motion.p>
      <p className="mt-2 text-center text-[11px] text-slate-400">数据更新于 {data.updated}{remote ? "（已同步最新版）" : ""}</p>

      {/* 趋势卡片 */}
      <div className="mt-8 grid md:grid-cols-2 gap-5">
        {data.trends.map((t, i) => (
          <motion.div
            key={t.id}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.06 }}
            className="glass-strong rounded-3xl p-6"
          >
            <div className="flex items-center gap-2">
              <span className={`text-[10px] font-black px-2 py-0.5 rounded-full text-white ${t.badge === "机会" ? "bg-emerald-500" : t.badge === "趋势" ? "bg-blue-500" : "bg-orange-500"}`}>{t.badge}</span>
              <h2 className="font-black text-lg text-slate-800">{t.title}</h2>
            </div>
            <p className="mt-3 text-sm text-slate-600 leading-relaxed">{t.summary}</p>
            <div className="mt-3 rounded-2xl bg-gradient-to-r from-orange-50/80 to-rose-50/80 ring-1 ring-orange-100/50 p-3">
              <p className="text-xs text-slate-600 leading-relaxed">{t.detail}</p>
            </div>
            <p className="mt-3 text-[10px] text-slate-400">来源：{t.source}</p>
          </motion.div>
        ))}
      </div>

      {/* 出海地图（抽象航线图） */}
      <section className="mt-12">
        <h2 className="hero-title text-2xl md:text-4xl text-center">产能出海<span className="text-blue-500">地图</span></h2>
        <p className="mt-2 text-center text-sm text-slate-500">{data.overseas.note} · 点目的地看详情</p>
        <div className="mt-6 glass rounded-[2rem] p-4 md:p-6">
          <div className="relative w-full aspect-[2/1]">
            {/* 点阵世界底纹 */}
            <div
              className="absolute inset-0 rounded-3xl overflow-hidden"
              style={{
                background: "linear-gradient(135deg, #eef4ff 0%, #f0f9ff 50%, #fff7ed 100%)",
              }}
            >
              <div
                className="absolute inset-0 opacity-40"
                style={{
                  backgroundImage: "radial-gradient(rgba(59,130,246,0.35) 1.2px, transparent 1.8px)",
                  backgroundSize: "22px 22px",
                }}
              />
              {/* 航线 */}
              <svg className="absolute inset-0 w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
                {data.overseas.destinations.map((d, i) => {
                  const mx = (cn.x + d.x) / 2;
                  const my = Math.min(cn.y, d.y) - 14;
                  return (
                    <motion.path
                      key={d.name}
                      d={`M ${cn.x} ${cn.y} Q ${mx} ${my} ${d.x} ${d.y}`}
                      fill="none"
                      stroke={activeDest === i ? "#f43f5e" : "#60a5fa"}
                      strokeWidth={activeDest === i ? 0.7 : 0.4}
                      strokeDasharray="2 1.6"
                      strokeLinecap="round"
                      initial={{ pathLength: 0, opacity: 0 }}
                      whileInView={{ pathLength: 1, opacity: 1 }}
                      viewport={{ once: true }}
                      transition={{ duration: 1.1, delay: 0.3 + i * 0.15 }}
                    />
                  );
                })}
              </svg>
              {/* 中国点 */}
              <motion.div
                initial={{ scale: 0 }}
                whileInView={{ scale: 1 }}
                viewport={{ once: true }}
                className="absolute -translate-x-1/2 -translate-y-1/2"
                style={{ left: `${cn.x}%`, top: `${cn.y}%` }}
              >
                <span className="relative flex w-5 h-5">
                  <span className="absolute inline-flex w-full h-full rounded-full bg-rose-500 opacity-60 animate-ping" />
                  <span className="relative inline-flex w-5 h-5 rounded-full bg-gradient-to-br from-orange-500 to-rose-500 border-2 border-white shadow-lg" />
                </span>
                <p className="absolute top-6 left-1/2 -translate-x-1/2 text-[11px] font-black text-slate-800 whitespace-nowrap">中国</p>
              </motion.div>
              {/* 目的地 */}
              {data.overseas.destinations.map((d, i) => (
                <motion.button
                  key={d.name}
                  initial={{ scale: 0 }}
                  whileInView={{ scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.8 + i * 0.15, type: "spring", stiffness: 260, damping: 15 }}
                  onClick={() => setActiveDest(activeDest === i ? null : i)}
                  className="absolute -translate-x-1/2 -translate-y-1/2 group"
                  style={{ left: `${d.x}%`, top: `${d.y}%` }}
                >
                  <span className={`block w-4 h-4 rounded-full border-2 border-white shadow-md transition-all ${activeDest === i ? "bg-rose-500 scale-125" : "bg-blue-500 group-hover:scale-125"}`} />
                  <span className="absolute top-5 left-1/2 -translate-x-1/2 text-[10px] font-black text-slate-700 whitespace-nowrap">{d.name}</span>
                </motion.button>
              ))}
            </div>
          </div>
          {/* 目的地详情 */}
          {activeDest !== null && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mt-4 glass-strong rounded-2xl p-4">
              <div className="flex items-center gap-2">
                <p className="font-black text-slate-800">{data.overseas.destinations[activeDest].name}</p>
                <span className="text-[10px] font-bold text-slate-400">{data.overseas.destinations[activeDest].companies}</span>
              </div>
              <p className="mt-1 text-xs text-slate-600 leading-relaxed">{data.overseas.destinations[activeDest].note}</p>
            </motion.div>
          )}
        </div>
        <p className="mt-3 text-center text-xs text-slate-400">
          出海岗位关键门槛：外语。英语是标配（东南亚/北美），日语对接日资体系，都能换来驻外补贴和更快的晋升通道。
        </p>
      </section>

      {/* 印刷英语 */}
      <section className="mt-12">
        <h2 className="hero-title text-2xl md:text-4xl text-center">印刷英语<span className="text-emerald-500">高频术语</span></h2>
        <p className="mt-2 max-w-2xl mx-auto text-center text-sm text-slate-500">{data.english.why}</p>
        <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-3">
          {data.english.terms.slice(0, termCount).map((t, i) => (
            <motion.div
              key={t.en}
              initial={{ opacity: 0, y: 14 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: (i % 8) * 0.04 }}
              className="glass rounded-2xl p-3.5 text-center card-hover"
            >
              <p className="font-black text-sm text-slate-800">{t.en}</p>
              <p className="mt-1 text-xs text-emerald-600 font-bold">{t.zh}</p>
            </motion.div>
          ))}
        </div>
        {termCount < data.english.terms.length && (
          <div className="mt-5 text-center">
            <button onClick={() => setTermCount(data.english.terms.length)} className="px-6 py-2.5 rounded-full bg-white/80 ring-1 ring-slate-200 text-xs font-black text-slate-600 hover:scale-105 transition-transform">
              展开全部 {data.english.terms.length} 个术语
            </button>
          </div>
        )}
      </section>

      <p className="mt-10 text-center text-[11px] text-slate-400">来源：{data.sources.join("、")}</p>
    </div>
  );
}
