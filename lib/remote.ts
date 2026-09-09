"use client";

import { useEffect, useState } from "react";

/**
 * 动态数据层：网站上线后，数据文件（企业/考证/职业百科/行业趋势）保存在
 * GitHub 仓库 main 分支，客户端启动时拉取最新版本，失败则用打包时的数据兜底。
 * 管理员更新数据 = 推送新的 JSON 到 main 分支，用户刷新即生效，无需重新部署。
 */
const RAW_BASE = "https://raw.githubusercontent.com/ogy36000-svg/print-career/main/data";
const CACHE_PREFIX = "pc-remote:";
const CACHE_TTL = 10 * 60 * 1000; // 10分钟内复用缓存

interface CacheEntry {
  t: number;
  updated: string;
  data: unknown;
}

function readCache<T>(name: string): { data: T; updated: string } | null {
  try {
    const raw = localStorage.getItem(CACHE_PREFIX + name);
    if (!raw) return null;
    const e = JSON.parse(raw) as CacheEntry;
    return { data: e.data as T, updated: e.updated };
  } catch {
    return null;
  }
}

/**
 * useRemoteData(name, fallback)
 * - 立即返回本地缓存或打包数据（不阻塞渲染）
 * - 后台拉取 GitHub 最新数据，若版本更新则替换
 */
export function useRemoteData<T extends { updated: string }>(name: string, fallback: T): { data: T; remote: boolean } {
  const [state, setState] = useState<{ data: T; remote: boolean }>(() => ({ data: fallback, remote: false }));

  useEffect(() => {
    let cancelled = false;
    // 先用本地缓存（如果比打包数据新）
    const cached = readCache<T>(name);
    if (cached && cached.updated > fallback.updated) {
      setState({ data: cached.data, remote: true });
    }
    // 检查缓存新鲜度，新鲜则跳过网络请求
    try {
      const raw = localStorage.getItem(CACHE_PREFIX + name);
      if (raw) {
        const e = JSON.parse(raw) as CacheEntry;
        if (Date.now() - e.t < CACHE_TTL) return;
      }
    } catch {}

    fetch(`${RAW_BASE}/${name}.json?t=${Date.now()}`, { cache: "no-store" })
      .then((r) => (r.ok ? r.json() : null))
      .then((json: T | null) => {
        if (cancelled || !json || typeof json.updated !== "string") return;
        localStorage.setItem(CACHE_PREFIX + name, JSON.stringify({ t: Date.now(), updated: json.updated, data: json }));
        if (json.updated >= fallback.updated) {
          setState({ data: json, remote: true });
        }
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [name]);

  return state;
}
