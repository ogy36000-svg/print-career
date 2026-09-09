"use client";

import { useMemo } from "react";
import { motion } from "framer-motion";
import { certsData as bundled, majors, type CertsData } from "@/lib/data";
import { useRemoteData } from "@/lib/remote";
import { useUserData } from "@/lib/store";
import { nextEventOf, daysLabel, statusStyle } from "@/lib/certUtils";

export default function CertsPage() {
  const { data, remote } = useRemoteData<CertsData>("certs", bundled);
  const { data: ud } = useUserData();

  // 与档案专业相关的证书排前面并标注
  const relatedIds = useMemo(() => new Set(majors.find((m) => m.id === ud.profile.major)?.relatedCerts ?? []), [ud.profile.major]);

  const sorted = useMemo(() => {
    return [...data.certs].sort((a, b) => {
      const ra = relatedIds.has(a.id) ? 0 : 1;
      const rb = relatedIds.has(b.id) ? 0 : 1;
      if (ra !== rb) return ra - rb;
      const na = nextEventOf(a)?.days ?? 9999;
      const nb = nextEventOf(b)?.days ?? 9999;
      return na - nb;
    });
  }, [data, relatedIds]);

  return (
    <div className="max-w-5xl mx-auto px-6 py-8 md:py-12">
      <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="hero-title text-3xl md:text-5xl text-center">
        考证中心<span className="text-rose-500">.</span>
      </motion.h1>
      <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }} className="mt-3 max-w-2xl mx-auto text-center text-sm text-slate-500">
        {data.note}
      </motion.p>
      <p className="mt-2 text-center text-[11px] text-slate-400">
        数据更新于 {data.updated}{remote ? "（已同步最新版）" : ""}
      </p>

      {/* 倒计时卡片 */}
      <div className="mt-8 grid md:grid-cols-2 gap-5">
        {sorted.map((cert, i) => {
          const next = nextEventOf(cert);
          return (
            <motion.div
              key={cert.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.05 }}
              className="glass-strong rounded-3xl p-6 relative overflow-hidden"
            >
              <span className="absolute top-0 left-0 right-0 h-1.5" style={{ background: `linear-gradient(90deg, ${cert.color}, transparent)` }} />
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <h2 className="font-black text-lg text-slate-800">{cert.name}</h2>
                    <span className="text-xs font-black text-orange-500">{cert.importance}</span>
                    {relatedIds.has(cert.id) && (
                      <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-violet-100 text-violet-600">与你专业相关</span>
                    )}
                  </div>
                  <p className="mt-0.5 text-xs text-slate-400">{cert.category} · {cert.cost}</p>
                </div>
                {next && (
                  <div className="text-right shrink-0">
                    <p className="text-3xl font-black tabular-nums" style={{ color: cert.color }}>{daysLabel(next.days)}</p>
                    <p className="text-[10px] font-bold text-slate-400">{next.event.label}</p>
                  </div>
                )}
              </div>

              {/* 事件列表 */}
              <div className="mt-4 space-y-2">
                {cert.events.map((e) => {
                  const st = statusStyle[e.status];
                  const past = new Date(e.date).getTime() < Date.now();
                  return (
                    <div key={e.label} className={`flex items-center gap-3 rounded-xl px-3 py-2.5 ${past ? "bg-slate-50/60 opacity-50" : "bg-white/70"}`}>
                      <span className={`w-2 h-2 rounded-full shrink-0 ${st.dot}`} />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold text-slate-700">
                          <span className={`mr-1.5 text-[10px] font-black px-1.5 py-0.5 rounded ${e.type === "报名" ? "bg-blue-100 text-blue-600" : "bg-rose-100 text-rose-600"}`}>{e.type}</span>
                          {e.label}
                        </p>
                        {e.note && <p className="mt-0.5 text-[11px] text-slate-400">{e.note}</p>}
                      </div>
                      <div className="text-right shrink-0">
                        <p className="text-xs font-black text-slate-600 tabular-nums">{e.date.slice(0, 10)}</p>
                        <span className={`text-[10px] font-black px-1.5 py-0.5 rounded-full ${st.badge}`}>{st.label}</span>
                      </div>
                    </div>
                  );
                })}
              </div>

              <p className="mt-4 text-xs text-slate-600 leading-relaxed"><span className="font-black text-slate-700">备考建议：</span>{cert.prep}</p>

              <div className="mt-4 flex items-center justify-between">
                <a href={cert.officialUrl} target="_blank" rel="noreferrer"
                  className="inline-flex items-center gap-1 px-4 py-2 rounded-full text-xs font-black text-white shadow-md hover:scale-105 transition-transform"
                  style={{ background: cert.color }}>
                  {cert.officialName} ↗
                </a>
                <span className="text-[10px] text-slate-400">来源：{cert.source}</span>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* 说明 */}
      <div className="mt-8 glass rounded-2xl p-5 text-xs text-slate-500 leading-relaxed">
        <p className="font-black text-slate-700">关于时间数据</p>
        <p className="mt-1">
          「官方公布」= 来自考试机构正式公告（链接可点击直达官网）；「按往届推算」= 官方尚未公布，根据历年规律预测，公布后会在数据更新时修正。
          本站数据文件联网自动同步最新版，无需重新安装或手动维护。
        </p>
      </div>
    </div>
  );
}
