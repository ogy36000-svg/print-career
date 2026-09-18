"use client";
import { useEffect, useRef, useState } from "react";
import type { Company } from "@/lib/types";
import ChinaMap from "./ChinaMap";
import "leaflet/dist/leaflet.css";
interface RealMapProps {
  companies: Company[];
  onSelect?: (company: Company) => void;
  selectedId?: string | null;
  view?: "china" | "world";
  extraMarkers?: {
    name: string;
    lat: number;
    lng: number;
    color?: string;
    onClick?: () => void;
  }[];
  arcs?: { from: [number, number]; to: [number, number]; color?: string }[];
  height?: number;
}
const EMPTY_MARKERS: NonNullable<RealMapProps["extraMarkers"]> = [];
const EMPTY_ARCS: NonNullable<RealMapProps["arcs"]> = [];
const TILE_URL =
  process.env.NEXT_PUBLIC_MAP_TILE_URL ||
  "https://tile.openstreetmap.org/{z}/{x}/{y}.png";
export default function RealMap({
  companies,
  onSelect,
  selectedId,
  view = "china",
  extraMarkers = EMPTY_MARKERS,
  arcs = EMPTY_ARCS,
  height = 520,
}: RealMapProps) {
  const container = useRef<HTMLDivElement>(null);
  const [status, setStatus] = useState("");
  const [failed, setFailed] = useState(false);
  useEffect(() => {
    let disposed = false;
    let map: import("leaflet").Map | null = null;
    let observer: ResizeObserver | null = null;
    let timer: ReturnType<typeof setTimeout> | undefined;
    void import("leaflet")
      .then((L) => {
        if (disposed || !container.current) return;
        const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
        map = L.map(container.current, {
          center: view === "china" ? [34.5, 108.5] : [20, 50],
          zoom: view === "china" ? 4 : 2,
          minZoom: 2,
          maxZoom: 12,
          attributionControl: true,
          zoomAnimation: !reduced,
          fadeAnimation: !reduced,
          markerZoomAnimation: !reduced,
        });
        const tiles = L.tileLayer(TILE_URL, {
          maxZoom: 12,
          attribution:
            process.env.NEXT_PUBLIC_MAP_ATTRIBUTION ||
            '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        });
        let loaded = 0;
        tiles.on("tileerror", () => {
          if (disposed) return;
          setStatus("部分地图暂未加载，可以继续查看下方地点列表。");
          if (!loaded && !timer)
            timer = setTimeout(() => {
              if (!disposed && !loaded) setFailed(true);
            }, 20000);
        });
        tiles.on("tileload", () => {
          loaded++;
          if (timer) clearTimeout(timer);
          if (!disposed) {
            setStatus("");
            setFailed(false);
          }
        });
        tiles.addTo(map);
        const mark = (
          lat: number,
          lng: number,
          label: string,
          selected: boolean,
          click?: () => void,
        ) => {
          if (!Number.isFinite(lat) || !Number.isFinite(lng)) return;
          const dot = document.createElement("span");
          dot.className = selected ? "map-point selected" : "map-point";
          const tip = document.createElement("span");
          tip.textContent = label;
          const marker = L.marker([lat, lng], {
            icon: L.divIcon({
              html: dot,
              className: "map-marker",
              iconSize: [20, 20],
            }),
            keyboard: true,
            title: label,
          }).addTo(map!);
          marker.bindTooltip(tip);
          if (click) marker.on("click", click);
        };
        companies.forEach((c) =>
          mark(c.lat, c.lng, `${c.name} · ${c.city}`, c.id === selectedId, () =>
            onSelect?.(c),
          ),
        );
        extraMarkers.forEach((m) =>
          mark(m.lat, m.lng, m.name, false, m.onClick),
        );
        arcs.forEach((a) =>
          L.polyline([a.from, a.to], {
            color: a.color ?? "#7b8d7c",
            weight: 2,
            dashArray: "5 6",
          }).addTo(map!),
        );
        observer = new ResizeObserver(() => map?.invalidateSize());
        observer.observe(container.current);
      })
      .catch(() => {
        if (!disposed) setFailed(true);
      });
    return () => {
      disposed = true;
      if (timer) clearTimeout(timer);
      observer?.disconnect();
      map?.off();
      map?.remove();
    };
  }, [view, companies, selectedId, onSelect, extraMarkers, arcs]);
  return (
    <section>
      <p className="fine-print mb-3">城市级位置参考 · 实际工作地点见岗位公告</p>
      <div
        ref={container}
        style={{ height, display: failed ? "none" : undefined }}
        className="map-container"
        aria-label={view === "world" ? "世界地区地图" : "中国城市地图"}
      />
      {status && (
        <p role="status" className="fine-print">
          {status}
        </p>
      )}
      {failed && view === "china" && (
        <ChinaMap
          companies={companies}
          onSelect={onSelect}
          selectedId={selectedId}
        />
      )}
      <ul className="location-list">
        {companies.map((c) => (
          <li key={c.id}>
            <button
              onClick={() => onSelect?.(c)}
              aria-pressed={c.id === selectedId}
            >
              {c.name} · {c.city}
            </button>
          </li>
        ))}
        {extraMarkers.map((m, i) => (
          <li key={`${m.name}-${i}`}>
            <button onClick={m.onClick}>{m.name}</button>
          </li>
        ))}
      </ul>
    </section>
  );
}
