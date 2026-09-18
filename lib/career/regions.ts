import type { OpportunityRecord } from "./types";

export interface RegionContext {
  name: string;
  lat: number;
  lng: number;
  sources: { title: string; url: string }[];
}

export function opportunityRegions(
  records: OpportunityRecord[],
): RegionContext[] {
  // Geographic centers are contextual markers, never employer addresses.
  const centers = [
    { match: /深圳/, name: "深圳 · 城市参考", lat: 22.55, lng: 114.06 },
    { match: /九江/, name: "九江 · 城市参考", lat: 29.71, lng: 115.99 },
    { match: /苏州/, name: "苏州 · 城市参考", lat: 31.3, lng: 120.59 },
    { match: /广东/, name: "广东 · 省级参考", lat: 23.4, lng: 113.5 },
    { match: /烟台/, name: "烟台 · 城市参考", lat: 37.46, lng: 121.45 },
    {
      match: /印尼|印度尼西亚/,
      name: "印度尼西亚 · 国家参考",
      lat: -2,
      lng: 118,
    },
    { match: /北京/, name: "北京 · 城市参考", lat: 39.9, lng: 116.4 },
  ];
  const regions = new Map<string, RegionContext>();
  for (const record of records) {
    if (!record.city) continue;
    for (const center of centers) {
      if (!center.match.test(record.city)) continue;
      const region = regions.get(center.name) ?? {
        name: center.name,
        lat: center.lat,
        lng: center.lng,
        sources: [],
      };
      if (!region.sources.some((source) => source.url === record.sourceUrl)) {
        region.sources.push({ title: record.title, url: record.sourceUrl });
      }
      regions.set(center.name, region);
    }
  }
  return [...regions.values()];
}
