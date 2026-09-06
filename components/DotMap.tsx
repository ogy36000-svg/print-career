"use client";

import { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { Company } from "@/lib/types";
import { gradeStyle } from "@/lib/data";

interface DotMapProps {
  companies: Company[];
  onSelect?: (company: Company) => void;
  selectedId?: string | null;
}

/** 中国/世界地图点位动画：用近似投影把经纬度映射到SVG坐标，点位逐步涌现 */
export default function DotMap({ companies, onSelect, selectedId }: DotMapProps) {
  const [hovered, setHovered] = useState<string | null>(null);

  // 把中国主要区域映射到 800x600 视图（简化墨卡托近似）
  const project = (lng: number, lat: number) => {
    // 中国范围约 lng 73-135, lat 18-53；扩展一点显示世界
    const x = ((lng - 70) / (140 - 70)) * 800;
    const y = ((60 - lat) / (60 - 0)) * 600;
    return { x: Math.max(10, Math.min(790, x)), y: Math.max(10, Math.min(590, y)) };
  };

  const points = useMemo(
    () =>
      companies.map((c, i) => ({
        ...c,
        ...project(c.lng, c.lat),
        delay: i * 0.12,
      })),
    [companies]
  );

  return (
    <div className="relative w-full aspect-[4/3] max-w-4xl mx-auto">
      {/* 背景光晕 */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-64 h-64 rounded-full bg-blue-400/20 blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-72 h-72 rounded-full bg-orange-400/20 blur-3xl animate-pulse" style={{ animationDelay: "1.5s" }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 rounded-full bg-violet-400/10 blur-3xl" />
      </div>

      {/* 简化大陆轮廓（抽象网格+光点） */}
      <svg viewBox="0 0 800 600" className="w-full h-full">
        <defs>
          <radialGradient id="glow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="rgba(255,255,255,0.9)" />
            <stop offset="100%" stopColor="rgba(255,255,255,0)" />
          </radialGradient>
        </defs>

        {/* 网格背景 */}
        <g stroke="rgba(148,163,184,0.12)" strokeWidth="0.5">
          {Array.from({ length: 20 }).map((_, i) => (
            <line key={`v${i}`} x1={i * 40} y1="0" x2={i * 40} y2="600" />
          ))}
          {Array.from({ length: 15 }).map((_, i) => (
            <line key={`h${i}`} x1="0" y1={i * 40} x2="800" y2={i * 40} />
          ))}
        </g>

        {/* 企业点位 */}
        <AnimatePresence>
          {points.map((p) => {
            const isSelected = selectedId === p.id;
            const isHovered = hovered === p.id;
            const color = gradeStyle[p.recommend]?.color ?? "#94a3b8";
            return (
              <motion.g
                key={p.id}
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: p.delay, type: "spring", stiffness: 260, damping: 20 }}
              >
                {/* 扩散涟漪 */}
                <motion.circle
                  cx={p.x}
                  cy={p.y}
                  r="12"
                  fill="none"
                  stroke={color}
                  strokeWidth="1.5"
                  initial={{ scale: 0.5, opacity: 0.8 }}
                  animate={{ scale: [0.5, 2.2, 0.5], opacity: [0.8, 0, 0.8] }}
                  transition={{ duration: 2.4, repeat: Infinity, delay: p.delay + 0.3 }}
                />
                {/* 主点 */}
                <motion.circle
                  cx={p.x}
                  cy={p.y}
                  r={isSelected ? 10 : isHovered ? 8 : 6}
                  fill={color}
                  stroke="#fff"
                  strokeWidth="2"
                  className="cursor-pointer"
                  whileHover={{ scale: 1.3 }}
                  onMouseEnter={() => setHovered(p.id)}
                  onMouseLeave={() => setHovered(null)}
                  onClick={() => onSelect?.(p)}
                />
                {/* 标签 */}
                <motion.text
                  x={p.x}
                  y={p.y - 14}
                  textAnchor="middle"
                  className="pointer-events-none select-none"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: isHovered || isSelected ? 1 : 0 }}
                  fill="#1e293b"
                  fontSize="11"
                  fontWeight="700"
                >
                  {p.name}
                </motion.text>
              </motion.g>
            );
          })}
        </AnimatePresence>
      </svg>

      {/* 底部说明 */}
      <div className="absolute bottom-0 left-0 right-0 flex justify-center gap-4 text-[11px] font-bold text-slate-500">
        <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-[#ff5a3c]" />S级</span>
        <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-[#2563eb]" />A级</span>
        <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-[#8b5cf6]" />B级</span>
        <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-[#94a3b8]" />C级</span>
      </div>
    </div>
  );
}
