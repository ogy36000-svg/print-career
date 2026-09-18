"use client";
import { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";
import type { User } from "@supabase/supabase-js";
import { getSupabase } from "./supabase";
import { emptyUserData, type UserData } from "./types";
import { canSyncToCloud, normalizeUserData, privateStorageKey } from "./profile-data";
import {createWriteQueue} from "./write-queue";

const readLocal = (id: string | null): UserData => {
  try {return normalizeUserData(JSON.parse(localStorage.getItem(privateStorageKey(id)) ?? "{}"));}
  catch {return normalizeUserData({});}
};
interface Store {
  data: UserData; update: (fn:(d:UserData)=>UserData)=>void; loaded: boolean;
  user: User | null; cloudStatus: string; consent: boolean; sessionGeneration: number;
  enableCloudSync:()=>Promise<string>; signOut:()=>Promise<void>;
}
const Context = createContext<Store | null>(null);
export function UserDataProvider({children}: {children:React.ReactNode}) {
  const [data,setData] = useState(emptyUserData);
  const [loaded,setLoaded] = useState(false);
  const [user,setUser] = useState<User | null>(null);
  const [consent,setConsent] = useState(false);
  const [owner,setOwner] = useState<string | null>(null);
  const [sessionGeneration,setSessionGeneration] = useState(0);
  const [cloudStatus,setCloudStatus] = useState("本地档案，未上传");
  const epoch = useRef(0);
  const saveId = useRef(0);
  const sessionOwner = useRef<string | null>(null);
  const writes = useRef(createWriteQueue());

  useEffect(() => {
    let active = true;
    const accountEpoch = epoch;
    const pendingSave = saveId;
    const sb = getSupabase();
    const load = async (nextUser:User | null) => {
      const id = ++epoch.current;
      sessionOwner.current=nextUser?.id ?? null;
      saveId.current++;
      setLoaded(false);setData(emptyUserData);setConsent(false);setOwner(null);setUser(nextUser);setSessionGeneration(id);
      let next = readLocal(nextUser?.id ?? null);
      let status = "本地档案，未上传";
      let enabled = false;
      if (nextUser && sb) {
        status = "已登录；云端档案尚未启用";
        try {
          const {data:row,error} = await sb.from("career_profiles").select("data").eq("user_id",nextUser.id).maybeSingle();
          if (error) throw error;
          if (row) {
            const cloud=normalizeUserData(row.data);
            if (!(Date.parse(next.updatedAt)>Date.parse(cloud.updatedAt))) next=cloud;
            enabled=true;status="已恢复账号私有档案（保留时间较新的本地修改）";
          }
        } catch {status="云端读取失败；保留本账号本地副本，不自动覆盖云端";}
      }
      if (active && id === epoch.current) {setData(next);setOwner(nextUser?.id ?? null);setConsent(enabled);setCloudStatus(status);setLoaded(true);}
    };
    void load(null);
    if (!sb) return () => {active=false;accountEpoch.current++;};
    void sb.auth.getSession().then(({data:s})=>{if(active && sessionOwner.current !== (s.session?.user.id ?? null)) void load(s.session?.user ?? null);}).catch(()=>{if(active) setCloudStatus("登录服务不可用，保留本地档案");});
    const {data:subscription} = sb.auth.onAuthStateChange((event,session)=>{
      if (event === "SIGNED_IN" || event === "SIGNED_OUT") queueMicrotask(()=>{if(active && sessionOwner.current !== (session?.user.id ?? null)) void load(session?.user ?? null);});
    });
    return () => {active=false;accountEpoch.current++;pendingSave.current++;subscription.subscription.unsubscribe();};
  },[]);

  useEffect(() => {
    if (!loaded || sessionGeneration !== epoch.current || owner !== sessionOwner.current) return;
    try {localStorage.setItem(privateStorageKey(user?.id ?? null),JSON.stringify(data));}
    catch {queueMicrotask(()=>setCloudStatus("浏览器保存不可用；请导出备份或启用账号同步"));}
    const sb = getSupabase();
    if (!sb || !canSyncToCloud(user?.id ?? null,consent,owner)) return;
    const id = ++saveId.current;
    const pendingSave = saveId;
    const timer = setTimeout(async()=>{
      setCloudStatus("正在同步私有档案…");
      try {
        const result = await writes.current(user!.id,async()=>{
          if (id !== saveId.current) return null;
          return await sb.from("career_profiles").upsert({user_id:user!.id,data,updated_at:new Date().toISOString()});
        });
        if (result && id === saveId.current) setCloudStatus(result.error ? "云端保存失败，保留本地副本" : "账号私有档案已同步");
      } catch {if (id === saveId.current) setCloudStatus("云端保存失败，保留本地副本");}
    },800);
    return () => {clearTimeout(timer);pendingSave.current++;};
  },[data,loaded,user,consent,owner,sessionGeneration]);

  const update = useCallback((fn:(d:UserData)=>UserData)=>{
    if (!loaded || sessionGeneration !== epoch.current || owner !== sessionOwner.current) return;
    setData(prev=>sessionGeneration === epoch.current && owner === sessionOwner.current
      ? normalizeUserData({...fn(prev),updatedAt:new Date().toISOString()}) : prev);
  },[loaded,owner,sessionGeneration]);
  const enableCloudSync = async()=>{
    const sb=getSupabase();
    if (!sb || !user || !loaded || sessionGeneration !== epoch.current || owner !== user.id) return "请先登录并等待账号档案读取完成";
    const currentEpoch=epoch.current;
    const result=await writes.current(user.id,async()=> currentEpoch === epoch.current
      ? await sb.from("career_profiles").upsert({user_id:user.id,data,updated_at:new Date().toISOString()}) : null);
    if (!result || currentEpoch !== epoch.current) return "账号已改变，本次同步已结束";
    const {error}=result;
    if (error) return "同步失败；请先执行新版数据库结构，数据仍保留本地";
    setConsent(true);setCloudStatus("账号私有档案已同步");return "已按你的授权保存至账号私有档案";
  };
  const signOut=async()=>{
    const sb=getSupabase();
    epoch.current++;saveId.current++;sessionOwner.current=null;setSessionGeneration(epoch.current);setConsent(false);setOwner(null);setUser(null);setData(readLocal(null));setLoaded(true);setCloudStatus("已退出，当前显示游客本地档案");
    await sb?.auth.signOut();
  };
  return <Context.Provider value={{data,update,loaded,user,consent,cloudStatus,sessionGeneration,enableCloudSync,signOut}}>{children}</Context.Provider>;
}
export function useUserData() {
  const context=useContext(Context);
  if(!context) throw new Error("UserDataProvider is required");
  return context;
}
