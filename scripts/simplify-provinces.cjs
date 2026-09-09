// 省级中国地图简化：每省抽稀到 ~120 点，精度 2 位
const fs = require("fs");
const raw = JSON.parse(fs.readFileSync(__dirname + "/china-full.json", "utf8"));

function simplifyRing(ring, maxPts) {
  const step = Math.max(1, Math.floor(ring.length / maxPts));
  const out = [];
  for (let i = 0; i < ring.length; i += step) out.push([+ring[i][0].toFixed(2), +ring[i][1].toFixed(2)]);
  const last = ring[ring.length - 1];
  const l = [+last[0].toFixed(2), +last[1].toFixed(2)];
  if (out[out.length - 1][0] !== l[0] || out[out.length - 1][1] !== l[1]) out.push(l);
  return out;
}

const provinces = [];
for (const f of raw.features) {
  const name = f.properties?.name || "";
  const g = f.geometry;
  if (!g) continue;
  const polys = g.type === "Polygon" ? [g.coordinates] : g.type === "MultiPolygon" ? g.coordinates : [];
  const rings = [];
  for (const poly of polys) {
    const outer = poly[0];
    if (!outer || outer.length < 8) continue;
    const ring = simplifyRing(outer, 120);
    const lngs = ring.map((p) => p[0]), lats = ring.map((p) => p[1]);
    const w = Math.max(...lngs) - Math.min(...lngs), h = Math.max(...lats) - Math.min(...lats);
    if (w * h < 0.12) continue; // 去掉小岛碎片
    rings.push(ring);
  }
  if (rings.length > 0) provinces.push({ name, rings });
}

const out = { provinces };
fs.writeFileSync(__dirname + "/../data/china-geo.json", JSON.stringify(out));
console.log("provinces:", provinces.length, "size:", (fs.statSync(__dirname + "/../data/china-geo.json").size / 1024).toFixed(1) + "KB");
