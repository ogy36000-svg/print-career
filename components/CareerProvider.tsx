"use client";
import { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";
import { backupCatalog } from "@/lib/career/backup";
import { validateCatalog } from "@/lib/career/validation";
import type { CareerCatalog, CareerQuery } from "@/lib/career/types";
interface CareerState {
  catalog: CareerCatalog; mode: string; message: string; checkedAt: string; loading: boolean;
  query: CareerQuery; setQuery: (q: CareerQuery) => void; refresh: (force?:boolean) => Promise<void>;
}
const Context = createContext<CareerState | null>(null);
export function CareerProvider({children}: {children: React.ReactNode}) {
  const [state,setState] = useState({catalog:backupCatalog,mode:"backup",message:"正在检查最新目录…",checkedAt:""});
  const [loading,setLoading] = useState(false);
  const [query,setQuery] = useState<CareerQuery>({major:"数字印刷工程",grade:"3",city:"",skills:[]});
  const generation = useRef(0);
  const refresh = useCallback(async (force=false) => {
    const id = ++generation.current; setLoading(true);
    try {
      const r = await fetch(force ? "/api/catalog/?refresh=1" : "/api/catalog/",{cache:"no-store",signal:AbortSignal.timeout(10000)});
      if (!r.ok) throw new Error("catalog unavailable");
      const json = await r.json(); const catalog = validateCatalog(json.catalog);
      if (id === generation.current) setState({catalog,mode:json.mode === "cloud" ? "cloud" : "backup",message:String(json.message),checkedAt:String(json.checkedAt)});
    } catch {
      if (id === generation.current) setState(s => ({...s,mode:s.mode === "cloud" ? "stale" : "backup",message:"刷新失败，保留上次目录；当前不能确认岗位已更新。"}));
    } finally {if (id === generation.current) setLoading(false);}
  },[]);
  useEffect(() => {
    let active = true;
    const requests = generation;
    queueMicrotask(() => {if (active) void refresh(false);});
    const visible = () => {if (document.visibilityState === "visible") void refresh(false);};
    document.addEventListener("visibilitychange",visible);
    return () => {active=false;requests.current++;document.removeEventListener("visibilitychange",visible);};
  },[refresh]);
  return <Context.Provider value={{...state,loading,query,setQuery,refresh}}>{children}</Context.Provider>;
}
export function useCareerCatalog() {
  const context = useContext(Context);
  if (!context) throw new Error("CareerProvider is required");
  return context;
}
