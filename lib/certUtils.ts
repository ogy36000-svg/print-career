import type { Cert, CertEvent } from "./types";

export interface UpcomingEvent {
  cert: Cert;
  event: CertEvent;
  days: number;
}

/** 取某证书最近的一个未来事件 */
export function nextEventOf(cert: Cert, now = Date.now()): UpcomingEvent | null {
  let best: UpcomingEvent | null = null;
  for (const e of cert.events) {
    const t = new Date(e.date).getTime();
    if (Number.isNaN(t)) continue;
    const days = Math.ceil((t - now) / 86400000);
    if (days < 0) continue; // 已过期的场次不算
    if (!best || days < best.days) best = { cert, event: e, days };
  }
  return best;
}

/** 全部证书的未来事件，按天数排序 */
export function upcomingEvents(certs: Cert[], now = Date.now()): UpcomingEvent[] {
  const all: UpcomingEvent[] = [];
  for (const c of certs) {
    const n = nextEventOf(c, now);
    if (n) all.push(n);
  }
  return all.sort((a, b) => a.days - b.days);
}

export const statusStyle: Record<string, { badge: string; dot: string; label: string }> = {
  官方公布: { badge: "bg-emerald-100 text-emerald-700", dot: "bg-emerald-500", label: "官方公布" },
  按往届推算: { badge: "bg-amber-100 text-amber-700", dot: "bg-amber-500", label: "按往届推算" },
  常年开放: { badge: "bg-blue-100 text-blue-700", dot: "bg-blue-500", label: "常年开放" },
  机构排期: { badge: "bg-slate-100 text-slate-600", dot: "bg-slate-400", label: "机构排期" },
};

export function daysLabel(days: number): string {
  if (days === 0) return "今天";
  if (days === 1) return "明天";
  if (days <= 7) return `${days} 天后`;
  if (days <= 30) return `${days} 天`;
  const months = Math.floor(days / 30);
  return months >= 2 ? `约 ${months} 个月` : `${days} 天`;
}
