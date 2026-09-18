"use client";

import { useRef, useState } from "react";
import { motion, MotionConfig } from "framer-motion";
import { useUserData } from "@/lib/store";
import WorkspaceContext from "@/components/WorkspaceContext";
import { extractText, analyzeResume, type ResumeResult } from "@/lib/resume";

import AccountPanel from "@/components/AccountPanel";
import { useCareerCatalog } from "@/components/CareerProvider";
import { careerAdvice } from "@/lib/career/engine";

export default function ProfilePage() {
  const { data, update, cloudStatus, loaded } = useUserData();
  const { query, catalog, workspace } = useCareerCatalog();
  const upload = useRef<HTMLInputElement>(null);
  const [parsing, setParsing] = useState(false);
  const [resumeResult, setResumeResult] = useState<ResumeResult | null>(null);
  const [resumeMsg, setResumeMsg] = useState("");
  const [applied, setApplied] = useState(false);
  const [newSkill, setNewSkill] = useState("");

  if (!loaded)
    return (
      <div className="p-10 text-center text-slate-400 font-bold">加载中…</div>
    );

  const p = data.profile;
  const setP = (patch: Partial<typeof p>) => {
    update((d) => ({ ...d, profile: { ...d.profile, ...patch } }));
  };
  const skillOptions = careerAdvice(query, catalog).roles.flatMap(
    (r) => r.skills,
  );
  const toggleIn = (arr: string[], v: string) =>
    arr.includes(v) ? arr.filter((x) => x !== v) : [...arr, v];

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
      const found =
        [r.phone, r.email, r.english, r.japanese].filter(Boolean).length +
        r.skills.length +
        r.certs.length;
      setResumeMsg(
        found > 0
          ? `识别完成，找到 ${found} 项信息，确认后可一键填入档案`
          : "没有识别到有效信息，可以换个格式试试（纯文本 PDF 效果最好）",
      );
    } catch (err) {
      setResumeMsg(
        err instanceof Error ? err.message : "解析失败，换个文件试试",
      );
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
      directions: Array.from(
        new Set([...p.directions, ...resumeResult.directions]),
      ),
      resumeAnalysis: `已从简历识别：${[
        resumeResult.phone && "电话",
        resumeResult.email && "邮箱",
        resumeResult.english,
        resumeResult.japanese,
        resumeResult.skills.length > 0 && `技能${resumeResult.skills.length}项`,
        resumeResult.certs.length > 0 && `证书${resumeResult.certs.length}项`,
      ]
        .filter(Boolean)
        .join("、")}`,
    });
    setApplied(true);
    setResumeMsg("已填入档案，下面各板块可继续手动微调");
  };

  return (
    <MotionConfig reducedMotion="user">
      <div className="workspace reading-width profile-workspace">
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="hero-title text-3xl md:text-5xl text-center"
        >
          我的档案
        </motion.h1>
        <p className="mt-2 text-center text-slate-500 text-sm">
          记录经历、技能与投递进展。{cloudStatus}。
        </p>

        {/* 专业与年级（必填置顶） */}
        <motion.section
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-6 panel"
        >
          <h2 className="font-black text-lg text-slate-800">专业与年级</h2>
          <div className="mt-4">
            <WorkspaceContext />
          </div>
        </motion.section>

        {/* 简历上传（可选） */}
        <Section title="简历上传（可选）" accent>
          <div className="resume-upload">
            <input
              ref={upload}
              type="file"
              accept=".pdf,.txt,.md"
              onChange={handleResumeUpload}
              className="hidden"
              id="resume-upload"
            />
            <button
              type="button"
              disabled={parsing}
              onClick={() => upload.current?.click()}
              className="career-secondary"
            >
              <p className="text-3xl font-black text-violet-300">
                {parsing ? "…" : "↑"}
              </p>
              <p className="mt-2 text-sm font-bold text-slate-600">
                {parsing ? "正在本地识别…" : "点击上传简历（PDF / TXT）"}
              </p>
            </button>
            <p className="fine-print">
              原始文件在浏览器内解析。确认填入的档案信息仅在你开启账号同步后同步，不会用于公开资料搜索。
            </p>
          </div>
          {resumeMsg && (
            <p
              className={`mt-3 text-xs font-bold ${applied ? "text-emerald-600" : "text-violet-600"}`}
            >
              {resumeMsg}
            </p>
          )}
          {resumeResult && !applied && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-3 rounded-2xl bg-white/80 ring-1 ring-violet-200 p-4"
            >
              <p className="text-xs font-black text-violet-600">识别结果预览</p>
              <div className="mt-2 flex flex-wrap gap-1.5 text-[11px] font-bold">
                {resumeResult.phone && (
                  <span className="px-2 py-1 rounded-full bg-slate-100 text-slate-600">
                    电话 {resumeResult.phone}
                  </span>
                )}
                {resumeResult.email && (
                  <span className="px-2 py-1 rounded-full bg-slate-100 text-slate-600">
                    邮箱 {resumeResult.email}
                  </span>
                )}
                {resumeResult.english && (
                  <span className="px-2 py-1 rounded-full bg-blue-100 text-blue-600">
                    {resumeResult.english}
                  </span>
                )}
                {resumeResult.japanese && (
                  <span className="px-2 py-1 rounded-full bg-rose-100 text-rose-600">
                    日语 {resumeResult.japanese}
                  </span>
                )}
                {resumeResult.skills.map((s) => (
                  <span
                    key={s}
                    className="px-2 py-1 rounded-full bg-emerald-100 text-emerald-600"
                  >
                    {s}
                  </span>
                ))}
              </div>
              <button
                onClick={applyResume}
                className="mt-3 w-full py-2.5 rounded-xl bg-violet-500 text-white text-sm font-black hover:scale-[1.02] transition-transform"
              >
                一键填入档案
              </button>
            </motion.div>
          )}
          {p.resumeAnalysis && (
            <p className="mt-3 text-[11px] text-slate-400">
              {p.resumeAnalysis}
            </p>
          )}
        </Section>

        {/* 基本信息 */}
        <Section title="基本信息">
          <div className="grid md:grid-cols-2 gap-3">
            <Field
              label="姓名"
              value={p.name}
              onChange={(v) => setP({ name: v })}
              placeholder="你的名字"
            />
            <Field
              label="电话"
              value={p.phone}
              onChange={(v) => setP({ phone: v })}
              placeholder="手机"
            />
            <Field
              label="邮箱"
              value={p.email}
              onChange={(v) => setP({ email: v })}
              placeholder="求职邮箱"
            />
            <Field
              label="简历/作品集链接"
              value={p.resumeUrl}
              onChange={(v) => setP({ resumeUrl: v })}
              placeholder="网盘或在线简历链接"
            />
          </div>
          <div className="mt-3">
            <label htmlFor="profile-intro" className="field-label">
              自我介绍 / 求职意向
            </label>
            <textarea
              id="profile-intro"
              value={p.intro}
              onChange={(e) => setP({ intro: e.target.value })}
              rows={3}
              placeholder="写下感兴趣的工作、想尝试的方向，以及已有的项目经历…"
              className="w-full px-4 py-3 rounded-2xl bg-white/80 ring-1 ring-slate-200 focus:ring-2 focus:ring-violet-400 outline-none text-sm"
            />
          </div>
        </Section>

        {/* 语言水平 */}
        <Section title="语言水平（选填）">
          <div className="grid md:grid-cols-2 gap-4">
            <SelectField
              label="英语"
              value={p.english}
              options={["无", "CET-4", "CET-6"]}
              onChange={(v) => setP({ english: v })}
            />
            {!!p.japanese && p.japanese !== "无" && (
              <SelectField
                label="日语"
                value={p.japanese}
                options={["无", "N5-N4", "N3", "N2", "N1"]}
                onChange={(v) => setP({ japanese: v })}
              />
            )}
          </div>
        </Section>

        {/* 技能 */}
        <Section title={`我的技能（已选 ${p.skills.length}）`}>
          <div className="mb-3 flex gap-2">
            <input
              aria-label="添加技能"
              value={newSkill}
              onChange={(e) => setNewSkill(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  const v = newSkill.trim();
                  if (v && !p.skills.includes(v))
                    setP({ skills: [...p.skills, v] });
                  setNewSkill("");
                }
              }}
              placeholder="列表没有？自己输入后回车添加"
              className="flex-1 px-4 py-2.5 rounded-2xl bg-white/80 ring-1 ring-slate-200 focus:ring-2 focus:ring-violet-400 outline-none text-sm font-bold"
            />
          </div>
          <ChipGroup
            items={Array.from(new Set([...skillOptions, ...p.skills]))}
            selected={p.skills}
            onToggle={(v) => setP({ skills: toggleIn(p.skills, v) })}
            color="emerald"
          />
        </Section>

        {/* 证书 */}
        <Section title={`已获/在考证书（已选 ${p.certs.length}）`}>
          <ChipGroup
            items={Array.from(
              new Set([
                ...workspace.certificates.map((goal) => goal.name),
                ...p.certs,
              ]),
            )}
            selected={p.certs}
            onToggle={(v) => setP({ certs: toggleIn(p.certs, v) })}
            color="amber"
          />
        </Section>

        {/* 意向方向 */}
        <Section title={`意向方向（已选 ${p.directions.length}）`}>
          <ChipGroup
            items={Array.from(
              new Set([
                ...workspace.directions.map((role) => role.title),
                ...p.directions,
              ]),
            )}
            selected={p.directions}
            onToggle={(v) => setP({ directions: toggleIn(p.directions, v) })}
            color="blue"
          />
        </Section>

        <div className="mt-6">
          <AccountPanel />
        </div>
      </div>
    </MotionConfig>
  );
}

function Section({
  title,
  children,
  accent,
}: {
  title: string;
  children: React.ReactNode;
  accent?: boolean;
}) {
  return (
    <motion.section
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className={`mt-6 panel ${accent ? "resume-panel" : ""}`}
    >
      <h2 className="font-black text-lg text-slate-800">{title}</h2>
      <div className="mt-4">{children}</div>
    </motion.section>
  );
}

function Field({
  label,
  value,
  onChange,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
}) {
  return (
    <label className="field-label">
      <span>{label}</span>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full px-4 py-3 rounded-2xl bg-white/80 ring-1 ring-slate-200 focus:ring-2 focus:ring-violet-400 outline-none text-sm"
      />
    </label>
  );
}

function SelectField({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: string;
  options: string[];
  onChange: (v: string) => void;
}) {
  return (
    <div>
      <p className="text-xs font-black text-slate-400 mb-1.5">{label}</p>
      <div className="flex flex-wrap gap-2">
        {options.map((o) => (
          <button
            key={o}
            aria-pressed={value === o}
            aria-label={`${label} ${o}`}
            onClick={() => onChange(o)}
            className={`px-4 py-2 rounded-full text-xs font-black transition-all ${value === o ? "bg-violet-500 text-white shadow-md" : "bg-white/80 text-slate-500 ring-1 ring-slate-200"}`}
          >
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

function ChipGroup({
  items,
  selected,
  onToggle,
  color,
}: {
  items: string[];
  selected: string[];
  onToggle: (v: string) => void;
  color: string;
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {items.map((it) => (
        <button
          key={it}
          aria-pressed={selected.includes(it)}
          onClick={() => onToggle(it)}
          className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all ${selected.includes(it) ? `${chipColors[color]} text-white shadow-md` : "bg-white/80 text-slate-500 ring-1 ring-slate-200 hover:bg-white"}`}
        >
          {it}
        </button>
      ))}
    </div>
  );
}
