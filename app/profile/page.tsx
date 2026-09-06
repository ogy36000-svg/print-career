"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { useUserData } from "@/lib/store";
import { skillPool, certPool, directionPool, majors, gradeOptions } from "@/lib/data";

export default function ProfilePage() {
  const { data, update, syncCode, bindSyncCode, cloudStatus, loaded } = useUserData();
  const [codeInput, setCodeInput] = useState("");
  const [syncMsg, setSyncMsg] = useState("");
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [resumeMsg, setResumeMsg] = useState("");

  if (!loaded) return <div className="p-10 text-center text-slate-400 font-bold">加载中…</div>;

  const p = data.profile;
  const setP = (patch: Partial<typeof p>) => update((d) => ({ ...d, profile: { ...d.profile, ...patch } }));
  const toggleIn = (arr: string[], v: string) => (arr.includes(v) ? arr.filter((x) => x !== v) : [...arr, v]);

  const genCode = () => {
    const code = "YIN-" + Math.random().toString(36).slice(2, 8).toUpperCase();
    setCodeInput(code);
  };

  const handleResumeUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setResumeFile(file);
    setResumeMsg(`已选择：${file.name}（AI 分析功能需要接入大模型 API，当前为占位演示）`);
    // 预留：未来接入 AI 分析后，把解析结果写入 resumeAnalysis
  };

  return (
    <div className="max-w-3xl mx-auto px-6 py-8 md:py-12">
      <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="hero-title text-3xl md:text-5xl text-center">
        我的档案<span className="text-violet-500">.</span>
      </motion.h1>
      <p className="mt-2 text-center text-slate-500 text-sm">填得越完整，推荐越准。数据自动保存{cloudStatus === "已同步" ? "，并已同步到云端" : "在本设备"}</p>

      {/* 云同步 */}
      <div className="mt-6 glass-strong rounded-3xl p-6">
        <h2 className="font-black text-lg text-slate-800">云端同步（手机电脑互通）</h2>
        <p className="mt-1 text-xs text-slate-500">
          当前状态：{syncCode ? `已绑定同步码 ${syncCode}（${cloudStatus}）` : "未绑定同步码，数据只存在这台设备"}
        </p>
        <div className="mt-4 flex flex-col md:flex-row gap-2">
          <input
            value={codeInput}
            onChange={(e) => setCodeInput(e.target.value.trim())}
            placeholder="输入或生成一个同步码，如 YIN-ABC123"
            className="flex-1 px-4 py-3 rounded-2xl bg-white/80 ring-1 ring-slate-200 text-sm font-bold outline-none focus:ring-2 focus:ring-violet-400"
          />
          <div className="flex gap-2">
            <button onClick={genCode} className="px-4 py-3 rounded-2xl bg-white/80 ring-1 ring-slate-200 text-sm font-black hover:bg-white">
              随机生成
            </button>
            <button
              onClick={async () => {
                if (!codeInput) return setSyncMsg("请先输入或生成同步码");
                const msg = await bindSyncCode(codeInput);
                setSyncMsg(msg);
              }}
              className="px-5 py-3 rounded-2xl bg-violet-500 text-white text-sm font-black hover:scale-105 transition-transform"
            >
              绑定并同步
            </button>
          </div>
        </div>
        {syncMsg && <p className="mt-2 text-xs font-bold text-violet-600">{syncMsg}</p>}
        <p className="mt-3 text-[11px] text-slate-400">在另一台设备打开本站 → 档案 → 输入同一同步码 → 数据自动恢复。</p>
      </div>

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

      {/* 专业与年级 */}
      <Section title="专业与年级">
        <div className="grid md:grid-cols-2 gap-4">
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
      </Section>

      {/* 语言水平 */}
      <Section title="语言水平">
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

      {/* 简历上传（可选） */}
      <Section title="简历上传（可选，AI 分析预留）">
        <div className="border-2 border-dashed border-slate-200 rounded-2xl p-6 text-center hover:border-violet-300 transition-colors">
          <input type="file" accept=".pdf,.doc,.docx,.jpg,.png" onChange={handleResumeUpload} className="hidden" id="resume-upload" />
          <label htmlFor="resume-upload" className="cursor-pointer">
            <p className="text-3xl font-black text-slate-300">+</p>
            <p className="mt-2 text-sm font-bold text-slate-500">点击上传简历（PDF / Word / 图片）</p>
            <p className="mt-1 text-xs text-slate-400">上传后 AI 将自动识别你的技能、经历，让推荐更精准（功能预留）</p>
          </label>
        </div>
        {resumeMsg && <p className="mt-3 text-xs font-bold text-violet-600">{resumeMsg}</p>}
        {p.resumeAnalysis && (
          <div className="mt-3 p-3 rounded-xl bg-violet-50/80 text-xs text-slate-600">
            <p className="font-black text-violet-600">AI 分析结果：</p>
            <p className="mt-1">{p.resumeAnalysis}</p>
          </div>
        )}
      </Section>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <motion.section initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="mt-6 glass rounded-3xl p-6">
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
