"use client";
import { useState } from "react";
import { getSupabase } from "@/lib/supabase";
import { useUserData } from "@/lib/store";
export default function AccountPanel() {
  const {user,cloudStatus,consent,enableCloudSync,signOut} = useUserData();
  const [email,setEmail]=useState("");const [password,setPassword]=useState("");
  const [message,setMessage]=useState("");const [busy,setBusy]=useState(false);
  const auth=async(signUp:boolean)=>{
    const sb=getSupabase();if(!sb) return setMessage("账号服务未配置，仍可使用游客推荐和本地档案。");
    if(!email.includes("@")||password.length<8) return setMessage("请填写有效邮箱和至少8位密码。");
    setBusy(true);
    try {const {error}=signUp ? await sb.auth.signUp({email,password}) : await sb.auth.signInWithPassword({email,password});
      setMessage(error ? "登录或注册未成功，请检查信息和账号配置。" : signUp ? "若已开启邮箱确认，请检查验证邮件；不会自动上传游客资料。" : "登录成功；未找到云端档案时需要你主动授权保存。");setPassword("");}
    catch {setMessage("账号服务暂不可用，请稍后再试。");}finally{setBusy(false);}
  };
  return <section className="glass rounded-3xl p-5"><h2 className="font-black">账号与私有同步</h2><p className="mt-2 text-xs text-slate-500">{cloudStatus}。已停用原同步码方案；同步需要账号身份与个人权限隔离。</p>{user ? <div className="mt-4"><p className="text-sm">已登录：{user.email}</p><div className="mt-3 flex flex-wrap gap-3">{!consent && <button className="career-primary" onClick={async()=>setMessage(await enableCloudSync())}>授权保存当前账号档案至云端</button>}<button className="career-secondary" onClick={()=>void signOut()}>退出账号</button></div></div>:<div className="mt-4"><div className="grid sm:grid-cols-2 gap-3"><label className="text-xs text-slate-500">账号邮箱<input className="career-input mt-2" type="email" autoComplete="username" value={email} onChange={e=>setEmail(e.target.value)}/></label><label className="text-xs text-slate-500">密码<input className="career-input mt-2" type="password" autoComplete="current-password" value={password} onChange={e=>setPassword(e.target.value)}/></label></div><div className="mt-3 flex gap-3"><button disabled={busy} className="career-primary" onClick={()=>void auth(false)}>登录</button><button disabled={busy} className="career-secondary" onClick={()=>void auth(true)}>注册</button></div></div>}{message && <p className="mt-3 text-sm text-blue-700" role="status">{message}</p>}<p className="mt-3 text-xs text-slate-500">新账号与游客档案分开保存；点击授权后才上传账号资料。原始简历文件不会随档案同步上传。</p></section>;
}
