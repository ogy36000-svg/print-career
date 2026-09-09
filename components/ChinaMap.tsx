"use client";

import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import chinaGeo from "@/data/china-geo.json";
import type { Company } from "@/lib/types";
import { gradeStyle } from "@/lib/data";

interface GeoRing { name: string; rings: [number, number][][] }

const W = 900;
const H = 680;

/** 等距投影 + 纬度修正，把中国 lng/lat 映射到 viewBox */
function useProjection() {
  return useMemo(() => {
    const all: [number, number][] = [];
    for (const p of (chinaGeo as { provinces: GeoRing[] }).provinces)
      for (const r of p.rings) for (const pt of r) all.push(pt);
    const lngs = all.map((p) => p[0]);
    const lats = all.map((p) => p[1]);
    const minLng = Math.min(...lngs), maxLng = Math.max(...lngs);
    const minLat = Math.min(...lats), maxLat = Math.max(...lats);
    const midLat = (minLat + maxLat) / 2;
    const cos = Math.cos((midLat * Math.PI) / 180);
    const pad = 30;
    const spanX = (maxLng - minLng) * cos;
    const spanY = maxLat - minLat;
    const scale = Math.min((W - pad * 2) / spanX, (H - pad * 2) / spanY);
    const offX = (W - spanX * scale) / 2;
    const offY = (H - spanY * scale) / 2;
    return (lng: number, lat: number): [number, number] => [
      offX + (lng - minLng) * cos * scale,
      H - (offY + (lat - minLat) * scale),
    ];
  }, []);
}

interface ChinaMapProps {
  companies: Company[];
  onSelect?: (company: Company) => void;
  selectedId?: string | null;
  /** 自动播放涌现动画 */
  autoPlay?: boolean;
}

const gradeOrder: Record<string, number> = { S: 0, A: 1, B: 2, C: 3 };

export default function ChinaMap({ companies, onSelect, selectedId }: ChinaMapProps) {
  const project = useProjection();
  const [hovered, setHovered] = useState<string | null>(null);

  const paths = useMemo(() => {
    const list: { name: string; d: string }[] = [];
    for (const p of (chinaGeo as { provinces: GeoRing[] }).provinces) {
      const d = p.rings
        .map((ring) => ring.map((pt, i) => {
          const [x, y] = project(pt[0], pt[1]);
          return `${i === 0 ? "M" : "L"}${x.toFixed(1)},${y.toFixed(1)}`;
        }).join("") + "Z")
        .join("");
      list.push({ name: p.name, d });
    }
    return list;
  }, [project]);

  const points = useMemo(() => {
    const sorted = [...companies].sort(
      (a, b) => (gradeOrder[a.recommend] ?? 9) - (gradeOrder[b.recommend] ?? 9)
    );
    // 同城合并去抖：距离太近的点位轻微错开
    const placed: { x: number; y: number }[] = [];
    return sorted.map((c, i) => {
      let [x, y] = project(c.lng, c.lat);
      let tries = 0;
      while (placed.some((p) => Math.hypot(p.x - x, p.y - y) < 10) && tries < 8) {
        const ang = (tries * Math.PI) / 4;
        x += Math.cos(ang) * 11;
        y += Math.sin(ang) * 11;
        tries++;
      }
      placed.push({ x, y });
      return { ...c, x, y, delay: 0.6 + i * 0.09 };
    });
  }, [companies, project]);

  return (
    <div className="relative w-full">
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto select-none">
        <defs>
          <linearGradient id="land" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#e8eefc" />
            <stop offset="55%" stopColor="#eef2ff" />
            <stop offset="100%" stopColor="#fdf1ea" />
          </linearGradient>
          <filter id="softGlow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="6" result="b" />
            <feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge>
          </filter>
        </defs>

        {/* 省份块：描边动画渐次浮现 */}
        {paths.map((p, i) => (
          <motion.path
            key={p.name + i}
            d={p.d}
            fill="url(#land)"
            stroke="#ffffff"
            strokeWidth="1.2"
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.035, duration: 0.5 }}
            style={{ transformOrigin: "center", filter: "drop-shadow(0 2px 6px rgba(100,116,139,0.15))" }}
          />
        ))}

        {/* 企业点位：S→A→B→C 依次涌现 */}
        {points.map((p) => {
          const isSel = selectedId === p.id;
          const isHov = hovered === p.id;
          const color = gradeStyle[p.recommend]?.color ?? "#94a3b8";
          return (
            <motion.g
              key={p.id}
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: p.delay, type: "spring", stiffness: 300, damping: 18 }}
              style={{ transformOrigin: `${p.x}px ${p.y}px` }}
              onMouseEnter={() => setHovered(p.id)}
              onMouseLeave={() => setHovered(null)}
              onClick={() => onSelect?.(p)}
              className="cursor-pointer"
            >
              {/* 涟漪 */}
              <motion.circle
                cx={p.x} cy={p.y} r="10" fill="none" stroke={color} strokeWidth="1.6"
                initial={{ scale: 0.4, opacity: 0.9 }}
                animate={{ scale: [0.4, 2.4], opacity: [0.9, 0] }}
                transition={{ duration: 2.2, repeat: Infinity, delay: p.delay + 0.4, ease: "easeOut" }}
                style={{ transformOrigin: `${p.x}px ${p.y}px` }}
              />
              <motion.circle
                cx={p.x} cy={p.y}
                r={isSel ? 10 : isHov ? 8.5 : 6}
                fill={color} stroke="#fff" strokeWidth="2.2"
                filter="url(#softGlow)"
                whileHover={{ scale: 1.25 }}
                style={{ transformOrigin: `${p.x}px ${p.y}px` }}
              />
              {(isHov || isSel) && (
                <motion.g initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} className="pointer-events-none">
                  <rect
                    x={Math.max(4, Math.min(W - 150, p.x - 75))}
                    y={Math.max(4, p.y - 52)}
                    width="150" height="40" rx="10"
                    fill="rgba(15,23,42,0.92)"
                  />
                  <text x={Math.max(79, Math.min(W - 75, p.x))} y={Math.max(28, p.y - 36)} textAnchor="middle" fill="#fff" fontSize="13" fontWeight="800">
                    {p.name}
                  </text>
                  <text x={Math.max(79, Math.min(W - 75, p.x))} y={Math.max(44, p.y - 20)} textAnchor="middle" fill="#cbd5e1" fontSize="10" fontWeight="600">
                    {p.city} · {p.type}
                  </text>
                </motion.g>
              )}
            </motion.g>
          );
        })}
      </svg>

      {/* 图例 */}
      <div className="mt-2 flex justify-center gap-4 text-[11px] font-bold text-slate-500">
        <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full" style={{ background: "#ff5a3c" }} />强烈推荐</span>
        <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full" style={{ background: "#2563eb" }} />推荐</span>
        <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full" style={{ background: "#8b5cf6" }} />可投</span>
        <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full" style={{ background: "#94a3b8" }} />特殊/了解</span>
      </div>
    </div>
  );
}
