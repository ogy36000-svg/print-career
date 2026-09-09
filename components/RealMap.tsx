"use client";

import { useEffect, useRef, useState } from "react";
import type { Company } from "@/lib/types";
import { gradeStyle } from "@/lib/data";
import ChinaMap from "./ChinaMap";
import "leaflet/dist/leaflet.css";

interface RealMapProps {
  companies: Company[];
  onSelect?: (company: Company) => void;
  selectedId?: string | null;
  /** world=世界视图（出海）, china=中国视图 */
  view?: "china" | "world";
  /** 额外标记点（如出海目的地） */
  extraMarkers?: { name: string; lat: number; lng: number; color?: string; onClick?: () => void }[];
  /** 弧线（[从经纬度, 到经纬度]） */
  arcs?: { from: [number, number]; to: [number, number]; color?: string }[];
  height?: number;
}

/** 高德矢量瓦片（免Key公开端点） */
const TILE_URL = "https://webrd0{s}.is.autonavi.com/appmaptile?lang=zh_cn&size=1&scale=1&style=8&x={x}&y={y}&z={z}";

/**
 * 真实地图（Leaflet + 高德瓦片）：可缩放拖动，点位精确按经纬度落点。
 * 瓦片加载失败时自动降级为内置 SVG 示意地图。
 */
export default function RealMap({ companies, onSelect, selectedId, view = "china", extraMarkers = [], arcs = [], height = 520 }: RealMapProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [failed, setFailed] = useState(false);
  const [ready, setReady] = useState(false);
  const mapRef = useRef<import("leaflet").Map | null>(null);

  useEffect(() => {
    let disposed = false;
    let map: import("leaflet").Map | null = null;

    (async () => {
      const L = await import("leaflet");
      if (disposed || !ref.current) return;

      map = L.map(ref.current, {
        center: view === "china" ? [34.5, 108.5] : [28, 60],
        zoom: view === "china" ? 4 : 2,
        minZoom: view === "china" ? 3 : 2,
        maxZoom: 12,
        zoomControl: true,
        attributionControl: false,
        scrollWheelZoom: true,
      });
      mapRef.current = map;

      const tiles = L.tileLayer(TILE_URL, { subdomains: "1234", maxZoom: 18 });
      let tileFailed = false;
      tiles.on("tileerror", () => {
        if (!tileFailed) { tileFailed = true; setFailed(true); }
      });
      tiles.addTo(map);

      // 企业点位（涟漪 divIcon）
      const order: Record<string, number> = { S: 0, A: 1, B: 2, C: 3 };
      const sorted = [...companies].sort((a, b) => (order[a.recommend] ?? 9) - (order[b.recommend] ?? 9));
      sorted.forEach((c, i) => {
        const color = gradeStyle[c.recommend]?.color ?? "#94a3b8";
        const icon = L.divIcon({
          className: "pc-marker",
          html: `<div class="pc-dot" style="--c:${color};animation-delay:${Math.min(i * 0.12, 3)}s"><span class="pc-pulse"></span></div>`,
          iconSize: [18, 18],
          iconAnchor: [9, 9],
        });
        const m = L.marker([c.lat, c.lng], { icon }).addTo(map!);
        m.bindTooltip(`${c.name} · ${c.city}`, { direction: "top", offset: [0, -10] });
        m.on("click", () => onSelect?.(c));
      });

      // 额外标记
      for (const em of extraMarkers) {
        const icon = L.divIcon({
          className: "pc-marker",
          html: `<div class="pc-dot" style="--c:${em.color ?? "#2563eb"}"><span class="pc-pulse"></span></div>`,
          iconSize: [18, 18],
          iconAnchor: [9, 9],
        });
        const m = L.marker([em.lat, em.lng], { icon }).addTo(map!);
        m.bindTooltip(em.name, { direction: "top", offset: [0, -10] });
        if (em.onClick) m.on("click", em.onClick);
      }

      // 弧线（虚线 polyline 模拟）
      for (const arc of arcs) {
        const [fLat, fLng] = arc.from;
        const [tLat, tLng] = arc.to;
        const mid: [number, number] = [(fLat + tLat) / 2 + Math.abs(tLng - fLng) * 0.18, (fLng + tLng) / 2];
        const curve: [number, number][] = [];
        for (let t = 0; t <= 1.001; t += 0.05) {
          const lat = (1 - t) * (1 - t) * fLat + 2 * (1 - t) * t * mid[0] + t * t * tLat;
          const lng = (1 - t) * (1 - t) * fLng + 2 * (1 - t) * t * mid[1] + t * t * tLng;
          curve.push([lat, lng]);
        }
        L.polyline(curve, { color: arc.color ?? "#f43f5e", weight: 2, dashArray: "6 6", opacity: 0.85 }).addTo(map!);
      }

      setReady(true);
    })().catch(() => setFailed(true));

    return () => {
      disposed = true;
      map?.remove();
      mapRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [view, companies.length]);

  if (failed) {
    // 降级：SVG 示意地图（仅中国视图有意义）
    return <ChinaMap companies={companies} onSelect={onSelect} selectedId={selectedId} />;
  }

  return (
    <div className="relative">
      {!ready && (
        <div className="absolute inset-0 z-10 grid place-items-center rounded-3xl bg-slate-50/80">
          <div className="flex items-center gap-2 text-sm font-bold text-slate-400">
            <span className="w-4 h-4 rounded-full border-2 border-slate-300 border-t-orange-500 animate-spin" />
            地图加载中…
          </div>
        </div>
      )}
      <div ref={ref} style={{ height }} className="w-full rounded-3xl overflow-hidden ring-1 ring-slate-200 shadow-inner" />
      <style jsx global>{`
        .pc-marker { background: transparent; border: none; }
        .pc-dot { position: relative; width: 18px; height: 18px; }
        .pc-dot::before {
          content: ""; position: absolute; inset: 4px; border-radius: 9999px;
          background: var(--c); border: 2px solid #fff;
          box-shadow: 0 2px 8px rgba(0,0,0,0.35);
        }
        .pc-pulse {
          position: absolute; inset: 0; border-radius: 9999px;
          border: 2px solid var(--c);
          animation: pc-pulse 2.2s ease-out infinite;
          animation-delay: inherit;
        }
        @keyframes pc-pulse {
          0% { transform: scale(0.5); opacity: 0.9; }
          100% { transform: scale(2.4); opacity: 0; }
        }
        .leaflet-tooltip {
          border-radius: 10px; border: none; box-shadow: 0 4px 14px rgba(0,0,0,0.18);
          font-weight: 800; font-size: 12px; color: #1e293b; padding: 5px 10px;
        }
      `}</style>
    </div>
  );
}
