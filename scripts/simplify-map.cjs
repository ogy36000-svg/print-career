// 简化中国国界 GeoJSON：降精度 + 抽稀，输出轻量 paths
const fs = require("fs");
const raw = JSON.parse(fs.readFileSync(__dirname + "/china-raw.json", "utf8"));

// raw 可能是 FeatureCollection（含南海诸岛子要素）或单 Feature
let geoms = [];
if (raw.type === "FeatureCollection") {
  for (const f of raw.features) {
    const g = f.geometry;
    if (!g) continue;
    if (g.type === "Polygon") geoms.push(g.coordinates);
    if (g.type === "MultiPolygon") geoms.push(...g.coordinates);
  }
} else if (raw.geometry) {
  const g = raw.geometry;
  if (g.type === "Polygon") geoms.push(g.coordinates);
  if (g.type === "MultiPolygon") geoms.push(...g.coordinates);
}

// 每 N 个点抽稀（保留首尾），精度 2 位
function simplifyRing(ring, step) {
  const out = [];
  for (let i = 0; i < ring.length; i += step) {
    out.push([+ring[i][0].toFixed(2), +ring[i][1].toFixed(2)]);
  }
  const last = ring[ring.length - 1];
  out.push([+last[0].toFixed(2), +last[1].toFixed(2)]);
  return out;
}

const polygons = [];
for (const poly of geoms) {
  const outer = poly[0];
  if (!outer || outer.length < 10) continue;
  const step = Math.max(1, Math.floor(outer.length / 400));
  const ring = simplifyRing(outer, step);
  // 过滤太小的岛
  const lngs = ring.map((p) => p[0]), lats = ring.map((p) => p[1]);
  const w = Math.max(...lngs) - Math.min(...lngs), h = Math.max(...lats) - Math.min(...lats);
  if (w * h < 0.15) continue;
  polygons.push(ring);
}

fs.writeFileSync(__dirname + "/../data/china-outline.json", JSON.stringify({ polygons }));
console.log("polygons:", polygons.length, "size:", fs.statSync(__dirname + "/../data/china-outline.json").size);
