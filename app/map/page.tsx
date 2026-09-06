"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { companies, amapSearchLink, gradeStyle } from "@/lib/data";

declare global {
  interface Window {
    AMap?: any;
  }
}

const AMAP_KEY = process.env.NEXT_PUBLIC_AMAP_KEY;

export default function MapPage() {
  const mapRef = useRef<HTMLDivElement>(null);
  const [mapReady, setMapReady] = useState(false);
  const [mapError, setMapError] = useState(false);
  const [filter, setFilter] = useState<string>("全部");

  useEffect(() => {
    if (!AMAP_KEY || mapReady) return;
    const script = document.createElement("script");
    script.src = `https://webapi.amap.com/maps?v=2.0&key=${AMAP_KEY}`;
    script.onload = () => setMapReady(true);
    script.onerror = () => setMapError(true);
    document.head.appendChild(script);
  }, []);

  useEffect(() => {
    if (!mapReady || !mapRef.current || !window.AMap) return;
    const map = new window.AMap.Map(mapRef.current, {
      zoom: 5.4,
      center: [113.3, 26.5],
      viewMode: "2D",
    });
    companies.forEach((c) => {
      const color = c.recommend === "S" ? "#ff5a3c" : c.recommend === "A" ? "#2563eb" : c.recommend === "B" ? "#8b5cf6" : "#94a3b8";
      const marker = new window.AMap.Marker({
        position: [c.lng, c.lat],
        title: c.name,
        content: `<div style="background:${color};color:#fff;font-weight:900;font-size:12px;padding:4px 8px;border-radius:12px;box-shadow:0 2px 8px rgba(0,0,0,.25);white-space:nowrap">${c.name}</div>`,
        offset: new window.AMap.Pixel(-20, -14),
      });
      marker.setMap(map);
    });
    // 学校位置：广州白云区
    new window.AMap.Marker({
      position: [113.2745, 23.2590],
      content: `<div style="background:#14161a;color:#fff;font-weight:900;font-size:12px;padding:5px 10px;border-radius:12px;box-shadow:0 2px 10px rgba(0,0,0,.3)">🏫 我的学校（白云区）</div>`,
      offset: new window.AMap.Pixel(-50, -40),
      zIndex: 200,
    }).setMap(map);
    return () => map.destroy();
  }, [mapReady]);

  const groups = ["全部", "广州", "深圳", "珠三角", "省外"];
  const grouped = companies.filter((c) => {
    if (filter === "全部") return true;
    if (filter === "广州") return c.city === "广州";
    if (filter === "深圳") return c.city === "深圳";
    if (filter === "珠三角") return c.province === "广东" && c.city !== "广州" && c.city !== "深圳";
    return c.province !== "广东";
  });

  return (
    <div className="max-w-6xl mx-auto px-6 py-8 md:py-12">
      <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="hero-title text-3xl md:text-5xl">
        企业地图<span className="text-blue-500">.</span>
      </motion.h1>
      <p className="mt-2 text-slate-500 text-sm md:text-base">
        <span className="inline-block w-2.5 h-2.5 rounded-full bg-[#ff5a3c] mr-1"></span>S级
        <span className="inline-block w-2.5 h-2.5 rounded-full bg-[#2563eb] mx-1 ml-3"></span>A级
        <span className="inline-block w-2.5 h-2.5 rounded-full bg-[#8b5cf6] mx-1 ml-3"></span>B级
        <span className="inline-block w-2.5 h-2.5 rounded-full bg-[#94a3b8] mx-1 ml-3"></span>C级
      </p>

      {/* 地图区 */}
      <div className="mt-5 rounded-[2rem] overflow-hidden ring-1 ring-black/10 bg-white">
        {AMAP_KEY && !mapError ? (
          <div ref={mapRef} className="w-full h-[52vh] md:h-[60vh]" />
        ) : (
          <div className="w-full h-[38vh] grid place-items-center bg-gradient-to-br from-blue-50 via-white to-orange-50">
            <div className="text-center px-6">
              <p className="text-4xl">🗺️</p>
              <p className="mt-3 font-black text-slate-700">互动地图未启用</p>
              <p className="mt-2 text-xs text-slate-500 leading-relaxed max-w-md">
                配置高德地图 Key 后此处显示可缩放的互动地图（免费申请：lbs.amap.com → 创建应用 → Web端JS API → 把 Key 填到环境变量 NEXT_PUBLIC_AMAP_KEY）。
                现在可先用下方列表，点「高德看位置」直接跳转。
              </p>
            </div>
          </div>
        )}
      </div>

      {/* 分组列表 */}
      <div className="mt-6 flex gap-2 overflow-x-auto no-scrollbar py-1">
        {groups.map((g) => (
          <button
            key={g}
            onClick={() => setFilter(g)}
            className={`px-4 py-2 rounded-full text-xs font-black whitespace-nowrap transition-all ${
              filter === g ? "bg-[#14161a] text-white" : "bg-white text-slate-500 ring-1 ring-black/10"
            }`}
          >
            {g}
          </button>
        ))}
      </div>

      <div className="mt-4 space-y-3">
        {grouped.map((c, i) => {
          const g = gradeStyle[c.recommend];
          return (
            <motion.div
              key={c.id}
              initial={{ opacity: 0, x: -16 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: Math.min(i * 0.03, 0.3) }}
              className="bg-white rounded-2xl p-4 ring-1 ring-black/5 flex items-center gap-3"
            >
              <span className={`shrink-0 text-[11px] font-black w-7 h-7 grid place-items-center rounded-xl ${g.badge}`}>{c.recommend}</span>
              <div className="min-w-0 flex-1">
                <Link href={`/companies/${c.id}`} className="font-black text-sm hover:text-orange-500">{c.name}</Link>
                <p className="text-xs text-slate-400 truncate">📍 {c.address}</p>
              </div>
              <a
                href={amapSearchLink(c.fullName, c.city.split("/")[0])}
                target="_blank"
                rel="noreferrer"
                className="shrink-0 text-xs font-black px-3 py-2 rounded-full bg-blue-50 text-blue-600 hover:bg-blue-100"
              >
                高德看位置 ↗
              </a>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
