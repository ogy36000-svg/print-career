"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { useUserData } from "@/lib/store";
import { skillPool, certPool, directionPool } from "@/lib/data";

export default function ProfilePage() {
  const { data, update, syncCode, bindSyncCode, cloudStatus, loaded } = useUserData();
  const [codeInput, setCodeInput] = useState("");
  const [syncMsg, setSyncMsg] = useState("");

  if (!loaded) return <div className="p-10 text-center text-slate-400 font-bold">加载中…</div>;

  const p = data.profile;
  const setP = (patch: Partial<typeof p>) => update((d) => ({ ...d, profile: { ...d.profile, ...patch } }));
  const toggleIn = (arr: string[], v: string) => (arr.includes(v) ? arr.filter((x) => x !== v) : [...arr, v]);

  const genCode = () => {
    const code = "YIN-" + Math.random().toString(36).slice(2, 8).toUpperCase();
    setCodeInput(code);
  };

  return (
    <div className="max-w-4xl mx-auto px-6 py-8 md:py-12">
      <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="hero-title text-3xl md:text-5xl">
        我的档案<span className="text-violet-500">.</span>
      </motion.h1>
      <p className="mt-2 text-slate-500 text-sm">填得越完整，首页和这里的推荐越准。数据自动保存{cloudStatus === "已同步" ? "，并已同步到云端 ☁️" : "在本设备"}</p>

      {/* 云同步 */}
      <div className="mt-6 bg-gradient-to-r from-violet-500 to-purple-500 rounded-3xl p-6 text-white">
        <h2 className="font-black text-lg">☁️ 云端同步（手机电脑互通）</h2>
        <p className="mt-1 text-xs text-white/80 leading-relaxed">
          当前状态：{syncCode ? `已绑定同步码 ${syncCode}（${cloudStatus}）` : "未绑定同步码，数据只存在这台设备"}
        </p>
        <div className="mt-4 flex flex-col md:flex-row gap-2">
          <input
            value={codeInput}
            onChange={(e) => setCodeInput(e.target.value.trim())}
            placeholder="输入或生成一个同步码，如 YIN-ABC123"
            className="flex-1 px-4 py-3 rounded-2xl text-slate-800 text-sm font-bold outline-none"
          />
          <div className="flex gap-2">
            <button onClick={genCode} className="px-4 py-3 rounded-2xl bg-white/20 text-sm font-black hover:bg-white/30">随机生成</button>
            <button
              onClick={async () => {
                if (!codeInput) return setSyncMsg("请先输入或生成同步码");
                const msg = await bindSyncCode(codeInput);
                setSyncMsg(msg);
              }}
              className="px-5 py-3 rounded-2xl bg-white text-violet-600 text-sm font-black hover:scale-105 transition-transform"
            >
              绑定并同步
            </button>
          </div>
        </div>
        {syncMsg && <p className="mt-2 text-xs font-bold text-white/90">💬 {syncMsg}</p>}
        <p className="mt-3 text-[11px] text-white/70">在另一台设备打开本站 → 我的 → 输入同一同步码 → 数据自动恢复。记好你的同步码！</p>
      </div>

      {/* 基本信息 */}
      <Section title="👤 基本信息">
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
            className="w-full px-4 py-3 rounded-2xl bg-white ring-1 ring-black/10 focus:ring-2 focus:ring-violet-400 outline-none text-sm"
          />
        </div>
      </Section>

      {/* 语言水平 */}
      <Section title="🌏 语言水平">
        <div className="grid md:grid-cols-2 gap-4">
          <SelectField label="英语" value={p.english} options={["无", "CET-4", "CET-6"]} onChange={(v) => setP({ english: v })} />
          <SelectField label="日语" value={p.japanese} options={["无", "N5-N4", "N3", "N2", "N1"]} onChange={(v) => setP({ japanese: v })} />
        </div>
      </Section>

      {/* 技能 */}
      <Section title={`🧰 我的技能（已选 ${p.skills.length}）`}>
        <ChipGroup items={skillPool} selected={p.skills} onToggle={(v) => setP({ skills: toggleIn(p.skills, v) })} color="emerald" />
      </Section>

      {/* 证书 */}
      <Section title={`📜 已获/在考证书（已选 ${p.certs.length}）`}>
        <ChipGroup items={certPool} selected={p.certs} onToggle={(v) => setP({ certs: toggleIn(p.certs, v) })} color="amber" />
      </Section>

      {/* 意向方向 */}
      <Section title={`🎯 意向方向（已选 ${p.directions.length}）`}>
        <ChipGroup items={directionPool} selected={p.directions} onToggle={(v) => setP({ directions: toggleIn(p.directions, v) })} color="blue" />
        <p className="mt-3 text-xs text-slate-400">选好后去「成长中心」看为你重新排序的推荐企业</p>
      </Section>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <motion.section initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="mt-6 bg-white rounded-3xl p-6 ring-1 ring-black/5">
      <h2 className="font-black text-lg">{title}</h2>
      <div className="mt-4">{children}</div>
    </motion.section>
  );
}

function Field({ label, value, onChange, placeholder }: { label: string; value: string; onChange: (v: string) => void; placeholder?: string }) {
  return (
    <div>
      <p className="text-xs font-black text-slate-400 mb-1.5">{label}</p>
      <input value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder}
        className="w-full px-4 py-3 rounded-2xl bg-white ring-1 ring-black/10 focus:ring-2 focus:ring-violet-400 outline-none text-sm" />
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
            className={`px-4 py-2 rounded-full text-xs font-black transition-all ${value === o ? "bg-violet-500 text-white shadow-md" : "bg-slate-50 text-slate-500 ring-1 ring-black/5"}`}>
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
          className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all ${selected.includes(it) ? `${chipColors[color]} text-white shadow-md` : "bg-slate-50 text-slate-500 ring-1 ring-black/5 hover:ring-black/20"}`}>
          {it}
        </button>
      ))}
    </div>
  );
}
