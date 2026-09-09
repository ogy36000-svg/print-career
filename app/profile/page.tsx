"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { useUserData } from "@/lib/store";
import { skillPool, certPool, directionPool, majors, gradeOptions } from "@/lib/data";
import { extractText, analyzeResume, type ResumeResult } from "@/lib/resume";

export default function ProfilePage() {
  const { data, update, syncCode, bindSyncCode, cloudStatus, loaded } = useUserData();
  const [codeInput, setCodeInput] = useState("");
  const [syncMsg, setSyncMsg] = useState("");
  const [showSync, setShowSync] = useState(false);
  const [parsing, setParsing] = useState(false);
  const [resumeResult, setResumeResult] = useState<ResumeResult | null>(null);
  const [resumeMsg, setResumeMsg] = useState("");
  const [applied, setApplied] = useState(false);

  if (!loaded) return <div className="p-10 text-center text-slate-400 font-bold">加载中…</div>;

  const p = data.profile;
  const setP = (patch: Partial<typeof p>) => update((d) => ({ ...d, profile: { ...d.profile, ...patch } }));
  const toggleIn = (arr: string[], v: string) => (arr.includes(v) ? arr.filter((x) => x !== v) : [...arr, v]);

  const handleResumeUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setParsing(true);
    setResumeMsg("");
    setResumeResult(null);
    setApplied(false);
    try {
      const text = await extractText(file);
      const r = analyzeResume(text);
      setResumeResult(r);
      const found = [r.phone, r.email, r.english, r.japanese].filter(Boolean).length + r.skills.length + r.certs.length;
      setResumeMsg(found > 0 ? `识别完成，找到 ${found} 项信息，确认后可一键填入档案` : "没有识别到有效信息，可以换个格式试试（纯文本 PDF 效果最好）");
    } catch (err) {
      setResumeMsg(err instanceof Error ? err.message : "解析失败，换个文件试试");
    }
    setParsing(false);
    e.target.value = "";
  };

  const applyResume = () => {
    if (!resumeResult) return;
    setP({
      phone: resumeResult.phone ?? p.phone,
      email: resumeResult.email ?? p.email,
      english: resumeResult.english ?? p.english,
      japanese: resumeResult.japanese ?? p.japanese,
      skills: Array.from(new Set([...p.skills, ...resumeResult.skills])),
      certs: Array.from(new Set([...p.certs, ...resumeResult.certs])),
      directions: Array.from(new Set([...p.directions, ...resumeResult.directions])),
      resumeAnalysis: `已从简历识别：${[
        resumeResult.phone && "电话",
        resumeResult.email && "邮箱",
        resumeResult.english,
        resumeResult.japanese,
        resumeResult.skills.length > 0 && `技能${resumeResult.skills.length}项`,
        resumeResult.certs.length > 0 && `证书${resumeResult.certs.length}项`,
      ].filter(Boolean).join("、")}`,
    });
    setApplied(true);
    setResumeMsg("已填入档案，下面各板块可继续手动微调");
  };

  return (
    <div className="max-w-3xl mx-auto px-6 py-8 md:py-12">
      <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="hero-title text-3xl md:text-5xl text-center">
        我的档案<span className="text-violet-500">.</span>
      </motion.h1>
      <p className="mt-2 text-center text-slate-500 text-sm">专业+年级必填，其余可传简历自动识别。数据只存在你本设备{cloudStatus === "已同步" ? "，并已同步云端" : ""}。</p>

      {/* 专业与年级（必填置顶） */}
      <motion.section initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="mt-6 glass-strong rounded-3xl p-6 ring-2 ring-violet-200/60">
        <h2 className="font-black text-lg text-slate-800">专业与年级 <span className="text-xs font-black text-violet-500">必填，推荐全靠它</span></h2>
        <div className="mt-4 grid md:grid-cols-2 gap-4">
          <div>
            <p className="text-xs font-black text-slate-400 mb-2">专业方向</p>
            <div className="flex flex-wrap gap-2">
              {majors.map((m) => (
                <button key={m.id} onClick={() => setP({ major: m.id })}
                  className={`px-4 py-2 rounded-full text-xs font-black transition-all ${p.major === m.id ? "bg-violet-500 text-white shadow-md" : "bg-white/80 text-slate-500 ring-1 ring-slate-200"}`}>
                  {m.name}
                </button>
              ))}
            </div>
          </div>
          <div>
            <p className="text-xs font-black text-slate-400 mb-2">年级</p>
            <div className="flex flex-wrap gap-2">
              {gradeOptions.map((g) => (
                <button key={g.id} onClick={() => setP({ grade: g.id })}
                  className={`px-4 py-2 rounded-full text-xs font-black transition-all ${p.grade === g.id ? "bg-violet-500 text-white shadow-md" : "bg-white/80 text-slate-500 ring-1 ring-slate-200"}`}>
                  {g.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </motion.section>

      {/* 简历上传（可选） */}
      <Section title="简历上传（可选）" accent>
        <div className="border-2 border-dashed border-violet-200 rounded-2xl p-6 text-center hover:border-violet-400 transition-colors bg-violet-50/40">
          <input type="file" accept=".pdf,.txt,.md" onChange={handleResumeUpload} className="hidden" id="resume-upload" />
          <label htmlFor="resume-upload" className="cursor-pointer">
            <p className="text-3xl font-black text-violet-300">{parsing ? "…" : "↑"}</p>
            <p className="mt-2 text-sm font-bold text-slate-600">{parsing ? "正在本地识别…" : "点击上传简历（PDF / TXT）"}</p>
            <p className="mt-1 text-xs text-slate-400">全程在你浏览器本地解析，不上传到任何服务器。识别出电话/邮箱/英语日语等级/技能后一键填入。</p>
          </label>
        </div>
        {resumeMsg && <p className={`mt-3 text-xs font-bold ${applied ? "text-emerald-600" : "text-violet-600"}`}>{resumeMsg}</p>}
        {resumeResult && !applied && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mt-3 rounded-2xl bg-white/80 ring-1 ring-violet-200 p-4">
            <p className="text-xs font-black text-violet-600">识别结果预览</p>
            <div className="mt-2 flex flex-wrap gap-1.5 text-[11px] font-bold">
              {resumeResult.phone && <span className="px-2 py-1 rounded-full bg-slate-100 text-slate-600">电话 {resumeResult.phone}</span>}
              {resumeResult.email && <span className="px-2 py-1 rounded-full bg-slate-100 text-slate-600">邮箱 {resumeResult.email}</span>}
              {resumeResult.english && <span className="px-2 py-1 rounded-full bg-blue-100 text-blue-600">{resumeResult.english}</span>}
              {resumeResult.japanese && <span className="px-2 py-1 rounded-full bg-rose-100 text-rose-600">日语 {resumeResult.japanese}</span>}
              {resumeResult.skills.map((s) => <span key={s} className="px-2 py-1 rounded-full bg-emerald-100 text-emerald-600">{s}</span>)}
            </div>
            <button onClick={applyResume} className="mt-3 w-full py-2.5 rounded-xl bg-violet-500 text-white text-sm font-black hover:scale-[1.02] transition-transform">
              一键填入档案
            </button>
          </motion.div>
        )}
        {p.resumeAnalysis && <p className="mt-3 text-[11px] text-slate-400">{p.resumeAnalysis}</p>}
      </Section>

      {/* 基本信息 */}
      <Section title="基本信息">
        <div className="grid md:grid-cols-2 gap-3">
          <Field label="姓名" value={p.name} onChange={(v) => setP({ name: v })} placeholder="你的名字" />
          <Field label="电话" value={p.phone} onChange={(v) => setP({ phone: v })} placeholder="手机" />
          <Field label="邮箱" value={p.email} onChange={(v) => setP({ email: v })} placeholder="求职邮箱" />
          <Field label="简历/作品集链接" value={p.resumeUrl} onChange={(v) => setP({ resumeUrl: v })} placeholder="网盘或在线简历链接" />
        </div>
        <div className="mt-3">
          <p className="text-xs font-black text-slate-400 mb-1.5">自我介绍 / 求职意向</p>
          <textarea
            value={p.intro}
            onChange={(e) => setP({ intro: e.target.value })}
            rows={3}
            placeholder="例：数字印刷本科大三在读，备考日语N3，想找珠三角包装/数码印刷方向实习…"
            className="w-full px-4 py-3 rounded-2xl bg-white/80 ring-1 ring-slate-200 focus:ring-2 focus:ring-violet-400 outline-none text-sm"
          />
        </div>
      </Section>

      {/* 语言水平 */}
      <Section title="语言水平（出海/外企的关键）">
        <div className="grid md:grid-cols-2 gap-4">
          <SelectField label="英语" value={p.english} options={["无", "CET-4", "CET-6"]} onChange={(v) => setP({ english: v })} />
          <SelectField label="日语" value={p.japanese} options={["无", "N5-N4", "N3", "N2", "N1"]} onChange={(v) => setP({ japanese: v })} />
        </div>
      </Section>

      {/* 技能 */}
      <Section title={`我的技能（已选 ${p.skills.length}）`}>
        <ChipGroup items={skillPool} selected={p.skills} onToggle={(v) => setP({ skills: toggleIn(p.skills, v) })} color="emerald" />
      </Section>

      {/* 证书 */}
      <Section title={`已获/在考证书（已选 ${p.certs.length}）`}>
        <ChipGroup items={certPool} selected={p.certs} onToggle={(v) => setP({ certs: toggleIn(p.certs, v) })} color="amber" />
      </Section>

      {/* 意向方向 */}
      <Section title={`意向方向（已选 ${p.directions.length}）`}>
        <ChipGroup items={directionPool} selected={p.directions} onToggle={(v) => setP({ directions: toggleIn(p.directions, v) })} color="blue" />
      </Section>

      {/* 云同步（折叠到底部） */}
      <div className="mt-6 glass rounded-3xl p-5">
        <button onClick={() => setShowSync(!showSync)} className="w-full flex items-center justify-between">
          <span className="font-black text-sm text-slate-700">云端同步（换设备时用，可选）</span>
          <span className="text-xs font-bold text-slate-400">{syncCode ? `已绑定 ${syncCode} · ${cloudStatus}` : "未开启"} {showSync ? "▲" : "▼"}</span>
        </button>
        {showSync && (
          <div className="mt-4">
            <div className="flex flex-col md:flex-row gap-2">
              <input
                value={codeInput}
                onChange={(e) => setCodeInput(e.target.value.trim())}
                placeholder="输入或生成一个同步码，如 YIN-ABC123"
                className="flex-1 px-4 py-3 rounded-2xl bg-white/80 ring-1 ring-slate-200 text-sm font-bold outline-none focus:ring-2 focus:ring-violet-400"
              />
              <div className="flex gap-2">
                <button onClick={() => setCodeInput("YIN-" + Math.random().toString(36).slice(2, 8).toUpperCase())} className="px-4 py-3 rounded-2xl bg-white/80 ring-1 ring-slate-200 text-sm font-black hover:bg-white">
                  随机生成
                </button>
                <button
                  onClick={async () => {
                    if (!codeInput) return setSyncMsg("请先输入或生成同步码");
                    setSyncMsg(await bindSyncCode(codeInput));
                  }}
                  className="px-5 py-3 rounded-2xl bg-violet-500 text-white text-sm font-black hover:scale-105 transition-transform"
                >
                  绑定
                </button>
              </div>
            </div>
            {syncMsg && <p className="mt-2 text-xs font-bold text-violet-600">{syncMsg}</p>}
            <p className="mt-3 text-[11px] text-slate-400">另一台设备打开本站 → 档案 → 输入同一同步码即可恢复数据。</p>
          </div>
        )}
      </div>
    </div>
  );
}

function Section({ title, children, accent }: { title: string; children: React.ReactNode; accent?: boolean }) {
  return (
    <motion.section initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className={`mt-6 rounded-3xl p-6 ${accent ? "glass-strong" : "glass"}`}>
      <h2 className="font-black text-lg text-slate-800">{title}</h2>
      <div className="mt-4">{children}</div>
    </motion.section>
  );
}

function Field({ label, value, onChange, placeholder }: { label: string; value: string; onChange: (v: string) => void; placeholder?: string }) {
  return (
    <div>
      <p className="text-xs font-black text-slate-400 mb-1.5">{label}</p>
      <input value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder}
        className="w-full px-4 py-3 rounded-2xl bg-white/80 ring-1 ring-slate-200 focus:ring-2 focus:ring-violet-400 outline-none text-sm" />
    </div>
  );
}

function SelectField({ label, value, options, onChange }: { label: string; value: string; options: string[]; onChange: (v: string) => void }) {
  return (
    <div>
      <p className="text-xs font-black text-slate-400 mb-1.5">{label}</p>
      <div className="flex flex-wrap gap-2">
        {options.map((o) => (
          <button key={o} onClick={() => onChange(o)}
            className={`px-4 py-2 rounded-full text-xs font-black transition-all ${value === o ? "bg-violet-500 text-white shadow-md" : "bg-white/80 text-slate-500 ring-1 ring-slate-200"}`}>
            {o}
          </button>
        ))}
      </div>
    </div>
  );
}

const chipColors: Record<string, string> = {
  emerald: "bg-emerald-500",
  amber: "bg-amber-500",
  blue: "bg-blue-500",
};

function ChipGroup({ items, selected, onToggle, color }: { items: string[]; selected: string[]; onToggle: (v: string) => void; color: string }) {
  return (
    <div className="flex flex-wrap gap-2">
      {items.map((it) => (
        <button key={it} onClick={() => onToggle(it)}
          className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all ${selected.includes(it) ? `${chipColors[color]} text-white shadow-md` : "bg-white/80 text-slate-500 ring-1 ring-slate-200 hover:bg-white"}`}>
          {it}
        </button>
      ))}
    </div>
  );
}
