"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { getSupabase } from "./supabase";
import { emptyUserData, type UserData } from "./types";

const LOCAL_KEY = "print-career-data";
const CODE_KEY = "print-career-sync-code";

function loadLocal(): UserData {
  if (typeof window === "undefined") return emptyUserData;
  try {
    const raw = localStorage.getItem(LOCAL_KEY);
    if (raw) return { ...emptyUserData, ...JSON.parse(raw) };
  } catch {}
  return emptyUserData;
}

export function useUserData() {
  const [data, setData] = useState<UserData>(emptyUserData);
  const [syncCode, setSyncCode] = useState<string>("");
  const [cloudStatus, setCloudStatus] = useState<"未同步" | "已同步" | "同步中" | "本地模式">("本地模式");
  const [loaded, setLoaded] = useState(false);
  const saveTimer = useRef<NodeJS.Timeout | null>(null);

  // 初始化：读本地 → 若有同步码且配置了Supabase则拉云端
  useEffect(() => {
    const local = loadLocal();
    setData(local);
    const code = localStorage.getItem(CODE_KEY) || "";
    setSyncCode(code);
    const sb = getSupabase();
    if (code && sb) {
      setCloudStatus("同步中");
      sb.from("user_data")
        .select("data")
        .eq("sync_code", code)
        .maybeSingle()
        .then(({ data: row, error }) => {
          if (!error && row?.data) {
            const merged = { ...emptyUserData, ...(row.data as UserData) };
            setData(merged);
            localStorage.setItem(LOCAL_KEY, JSON.stringify(merged));
            setCloudStatus("已同步");
          } else {
            setCloudStatus("本地模式");
          }
          setLoaded(true);
        });
    } else {
      setLoaded(true);
    }
  }, []);

  const persist = useCallback(
    (next: UserData, code?: string) => {
      localStorage.setItem(LOCAL_KEY, JSON.stringify(next));
      const activeCode = code ?? localStorage.getItem(CODE_KEY) ?? "";
      const sb = getSupabase();
      if (activeCode && sb) {
        setCloudStatus("同步中");
        if (saveTimer.current) clearTimeout(saveTimer.current);
        saveTimer.current = setTimeout(async () => {
          const { error } = await sb.from("user_data").upsert({
            sync_code: activeCode,
            data: next,
            updated_at: new Date().toISOString(),
          });
          setCloudStatus(error ? "本地模式" : "已同步");
        }, 800);
      }
    },
    []
  );

  const update = useCallback(
    (fn: (d: UserData) => UserData) => {
      setData((prev) => {
        const next = { ...fn(prev), updatedAt: new Date().toISOString() };
        persist(next);
        return next;
      });
    },
    [persist]
  );

  const bindSyncCode = useCallback(
    async (code: string) => {
      localStorage.setItem(CODE_KEY, code);
      setSyncCode(code);
      const sb = getSupabase();
      if (!sb) return "本地模式：未配置云端，数据只保存在本设备";
      const { data: row, error } = await sb
        .from("user_data")
        .select("data")
        .eq("sync_code", code)
        .maybeSingle();
      if (error) return "云端连接失败，数据只保存在本设备";
      if (row?.data) {
        const merged = { ...emptyUserData, ...(row.data as UserData) };
        setData(merged);
        localStorage.setItem(LOCAL_KEY, JSON.stringify(merged));
        setCloudStatus("已同步");
        return "已从云端恢复你的数据";
      }
      // 新同步码：把当前本地数据推上去
      const current = loadLocal();
      await sb.from("user_data").upsert({
        sync_code: code,
        data: current,
        updated_at: new Date().toISOString(),
      });
      setCloudStatus("已同步");
      return "已创建云端档案，其他设备输入同一同步码即可读取";
    },
    []
  );

  return { data, update, syncCode, bindSyncCode, cloudStatus, loaded };
}
