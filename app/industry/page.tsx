"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { industryData as bundled } from "@/lib/data";
import type { IndustryData } from "@/lib/types";
import { useRemoteData } from "@/lib/remote";
import RealMap from "@/components/RealMap";

export default function IndustryPage() {
  const { data, remote } = useRemoteData<IndustryData>("industry", bundled);
  const [showTerms, setShowTerms] = useState(false);

  const cn = data.overseas.china ?? { lat: 35, lng: 105 };
  const destMarkers = data.overseas.destinations
    .filter((d) => d.lat !== undefined)
    .map((d) => ({ name: `${d.name} · ${d.companies}`, lat: d.lat!, lng: d.lng!, color: "#2563eb" }));
  const arcs = data.overseas.destinations
    .filter((d) => d.lat !== undefined)
    .map((d) => ({ from: [cn.lat, cn.lng] as [number, number], to: [d.lat!, d.lng!] as [number, number], color: "#f43f5e" }));

  return (
    <div className="max-w-5xl mx-auto px-6 py-8 md:py-12">
      <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="hero-title text-3xl md:text-5xl text-center">
        行业趋势<span className="text-cyan-500">.</span>
      </motion.h1>
      <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }} className="mt-3 max-w-2xl mx-auto text-center text-sm text-slate-500">
        内卷、出海、数码化、绿色化。每条趋势附新闻源，点进去看原文自己判断。
      </motion.p>
      <p className="mt-2 text-center text-[11px] text-slate-400">数据更新于 {data.updated}{remote ? "（已同步最新版）" : ""}</p>

      {/* 趋势卡片（可点击信源） */}
      <div className="mt-8 grid md:grid-cols-2 gap-5">
        {data.trends.map((t, i) => (
          <motion.div
            key={t.id}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.06 }}
            className="glass-strong rounded-3xl p-6 flex flex-col"
          >
            <div className="flex items-center gap-2">
              <span className={`text-[10px] font-black px-2 py-0.5 rounded-full text-white ${t.badge === "机会" ? "bg-emerald-500" : t.badge === "趋势" ? "bg-blue-500" : "bg-orange-500"}`}>{t.badge}</span>
              <h2 className="font-black text-lg text-slate-800">{t.title}</h2>
            </div>
            <p className="mt-3 text-sm text-slate-600 leading-relaxed">{t.summary}</p>
            <div className="mt-3 rounded-2xl bg-gradient-to-r from-orange-50/80 to-rose-50/80 ring-1 ring-orange-100/50 p-3">
              <p className="text-xs text-slate-600 leading-relaxed">{t.detail}</p>
            </div>
            {/* 信源链接 */}
            {t.links && t.links.length > 0 && (
              <div className="mt-4 pt-3 border-t border-slate-100 space-y-1.5">
                {t.links.map((l) => (
                  <a key={l.url} href={l.url} target="_blank" rel="noreferrer"
                    className="flex items-center gap-2 text-xs font-bold text-blue-600 hover:text-blue-800 hover:underline">
                    <span className="w-1.5 h-1.5 rounded-full bg-blue-400 shrink-0" />
                    <span className="truncate">{l.title}</span>
                    <span className="shrink-0">↗</span>
                  </a>
                ))}
              </div>
            )}
            <p className="mt-3 text-[10px] text-slate-400">来源：{t.source}</p>
          </motion.div>
        ))}
      </div>

      {/* 出海真实地图 */}
      <section className="mt-12">
        <h2 className="hero-title text-2xl md:text-4xl text-center">产能出海<span className="text-blue-500">地图</span></h2>
        <p className="mt-2 text-center text-sm text-slate-500">{data.overseas.note} · 真实地图可缩放，悬停看企业</p>
        <div className="mt-6">
          <RealMap
            companies={[]}
            view="world"
            height={480}
            extraMarkers={[
              { name: "中国（制造基地）", lat: cn.lat, lng: cn.lng, color: "#f43f5e" },
              ...destMarkers,
            ]}
            arcs={arcs}
          />
        </div>
        <div className="mt-4 grid grid-cols-2 md:grid-cols-3 gap-3">
          {data.overseas.destinations.map((d, i) => (
            <motion.div key={d.name} initial={{ opacity: 0, y: 14 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.05 }}
              className="glass rounded-2xl p-4">
              <p className="font-black text-sm text-slate-800">{d.name}</p>
              <p className="mt-0.5 text-[10px] font-bold text-blue-500">{d.companies}</p>
              <p className="mt-1.5 text-xs text-slate-500 leading-relaxed">{d.note}</p>
            </motion.div>
          ))}
        </div>
        <p className="mt-4 text-center text-xs text-slate-400">
          出海岗位关键门槛：外语。英语是标配（东南亚/北美），日语对接日资体系，都能换来驻外补贴和更快的晋升通道。
        </p>
      </section>

      {/* 印刷英语（默认折叠） */}
      <section className="mt-12">
        <div className="glass rounded-3xl p-6">
          <button onClick={() => setShowTerms(!showTerms)} className="w-full flex items-center justify-between">
            <div className="text-left">
              <h2 className="font-black text-lg text-slate-800">印刷英语高频术语 <span className="text-xs font-bold text-slate-400">（外贸/设备方向用得着，可选看）</span></h2>
            </div>
            <span className="text-slate-400 font-black">{showTerms ? "收起 ▲" : "展开 ▼"}</span>
          </button>
          {showTerms && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <p className="mt-3 text-xs text-slate-500 leading-relaxed">{data.english.why}</p>
              <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-3">
                {data.english.terms.map((t) => (
                  <div key={t.en} className="rounded-2xl bg-white/70 p-3 text-center">
                    <p className="font-black text-sm text-slate-800">{t.en}</p>
                    <p className="mt-1 text-xs text-emerald-600 font-bold">{t.zh}</p>
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </div>
      </section>

      <p className="mt-10 text-center text-[11px] text-slate-400">来源：{data.sources.join("、")}</p>
    </div>
  );
}
