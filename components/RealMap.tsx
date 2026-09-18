"use client";
import { useEffect, useRef, useState } from "react";
import type { Company } from "@/lib/types";
import ChinaMap from "./ChinaMap";
import "leaflet/dist/leaflet.css";
import land from "@/data/world-land.json";
import type { GeoJsonObject } from "geojson";
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
  const activeMap = useRef<import("leaflet").Map | null>(null);
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
        activeMap.current = map;
        setFailed(false);
        // Bundled WGS84 land keeps geographic context usable without a tile network.
        const basePane = map.createPane("basic-land");
        basePane.style.zIndex = "150";
        basePane.style.pointerEvents = "none";
        L.geoJSON(land as unknown as GeoJsonObject, {
          pane: "basic-land",
          interactive: false,
          style: {
            color: "#a9b49e",
            weight: 0.7,
            fillColor: "#dfe5d2",
            fillOpacity: 1,
          },
          attribution:
            '<a href="https://www.naturalearthdata.com/about/terms-of-use/">Natural Earth</a>',
        }).addTo(map);
        setStatus("基础地图已显示，正在读取在线地图。");
        const tiles = L.tileLayer(TILE_URL, {
          maxZoom: 12,
          attribution:
            process.env.NEXT_PUBLIC_MAP_ATTRIBUTION ||
            '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        });
        let loaded = 0;
        timer = setTimeout(() => {
          if (!disposed && !loaded)
            setStatus("在线地图暂未加载，基础地图与地点列表仍可使用。");
        }, 20000);
        tiles.on("tileerror", () => {
          if (disposed) return;
          setStatus("部分在线地图暂未加载，基础地图与地点列表仍可使用。");
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
      if (activeMap.current === map) activeMap.current = null;
    };
  }, [view, companies, selectedId, onSelect, extraMarkers, arcs]);
  return (
    <section>
      <p className="fine-print mb-3">城市与地区参考 · 实际工作地点见岗位公告</p>
      <div
        ref={container}
        style={{
          height,
          backgroundColor: "#eaf0ec",
          display: failed ? "none" : undefined,
        }}
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
            <button
              onClick={() => {
                activeMap.current?.setView(
                  [m.lat, m.lng],
                  Math.max(activeMap.current.getZoom(), 4),
                  {
                    animate: !matchMedia("(prefers-reduced-motion: reduce)")
                      .matches,
                  },
                );
                m.onClick?.();
              }}
            >
              {m.name}
            </button>
          </li>
        ))}
      </ul>
    </section>
  );
}
