"use client";
import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { getSupabase } from "@/lib/supabase";
import { validateResearchBundle } from "@/lib/career/research";
import type { ResearchBundle, ResearchTopic } from "@/lib/career/types";
import { useCareerCatalog } from "./CareerProvider";
const topics: { id: ResearchTopic; label: string }[] = [
  { id: "internship", label: "实习与招聘" },
  { id: "career", label: "行业与职业" },
  { id: "competition", label: "培养与升学" },
];
export default function ResearchPanel({
  initialCompany = "",
  initialTopic = "internship",
}: {
  initialCompany?: string;
  initialTopic?: ResearchTopic;
}) {
  const { query, catalog } = useCareerCatalog();
  const [company, setCompany] = useState(initialCompany);
  const [topic, setTopic] = useState<ResearchTopic>(initialTopic);
  const [result, setResult] = useState<{
    signature: string;
    bundle: ResearchBundle;
  } | null>(null);
  const [status, setStatus] = useState({
    signature: "",
    busy: false,
    message: "",
  });
  const controller = useRef<AbortController | null>(null);
  const signature = JSON.stringify([query.major, company, topic]);
  const current = result?.signature === signature ? result.bundle : null;
  useEffect(() => {
    const requests = controller;
    return () => requests.current?.abort();
  }, [signature]);
  const research = async () => {
    controller.current?.abort();
    const abort = new AbortController();
    controller.current = abort;
    const target = signature;
    setStatus({ signature: target, busy: true, message: "" });
    try {
      const sb = getSupabase();
      const session = sb ? (await sb.auth.getSession()).data.session : null;
      const response = await fetch("/api/research/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(session
            ? { Authorization: `Bearer ${session.access_token}` }
            : {}),
        },
        body: JSON.stringify({ major: query.major, company, topic }),
        signal: abort.signal,
      });
      if (!response.ok)
        throw Error(
          response.status === 401
            ? "登录后可以查询公开资料。"
            : response.status === 429
              ? "查询较多，请稍后再试。"
              : "公开来源暂时不可用，请稍后重试。",
        );
      const bundle = validateResearchBundle(await response.json(), catalog);
      if (!bundle) throw Error("暂时无法读取查询结果，请重试。");
      if (!abort.signal.aborted) setResult({ signature: target, bundle });
    } catch (error) {
      if (!abort.signal.aborted)
        setStatus({
          signature: target,
          busy: false,
          message: error instanceof Error ? error.message : "查询暂时不可用。",
        });
    } finally {
      if (!abort.signal.aborted) setStatus((s) => ({ ...s, busy: false }));
    }
  };
  const busy = status.signature === signature && status.busy;
  return (
    <section className="panel" id="research">
      <h2>查找公开资料</h2>
      <p className="muted">
        围绕{query.major || "你的专业"}，继续了解企业、岗位与培养信息。
      </p>
      <div className="mt-4 flex flex-wrap gap-2">
        {topics.map((t) => (
          <button
            key={t.id}
            aria-pressed={topic === t.id}
            onClick={() => setTopic(t.id)}
            className={`research-tab ${topic === t.id ? "selected" : ""}`}
          >
            {t.label}
          </button>
        ))}
      </div>
      <div className="research-form">
        <label className="field-label">
          企业或机构（可选）
          <input
            className="career-input mt-2"
            aria-label="指定研究企业"
            value={company}
            maxLength={80}
            onChange={(e) => setCompany(e.target.value)}
            placeholder={`想了解哪家${query.major ? "相关" : ""}企业？`}
          />
        </label>
        <button
          className="career-primary"
          disabled={busy || !query.major}
          onClick={() => void research()}
        >
          {busy ? "正在查找…" : "查找资料 ↗"}
        </button>
      </div>
      <p className="fine-print">
        只发送专业、企业和查询主题，不发送简历或联系方式
      </p>
      {status.signature === signature && status.message && (
        <p role="alert" className="notice">
          {status.message} <Link href="/profile">账号与档案 →</Link>
        </p>
      )}
      {current && (
        <div className="public-leads">
          <h3>搜索到的公开资料</h3>
          <p className="fine-print">
            最近读取 {new Date(current.checkedAt).toLocaleDateString("zh-CN")} ·
            公告日期与适用对象见原文
          </p>
          {!current.leads.length && (
            <p className="muted">
              没有找到相关资料，可以调整企业名称或查询主题。
            </p>
          )}
          {current.leads.map((lead) => (
            <a key={lead.url} href={lead.url} target="_blank" rel="noreferrer">
              <h4>{lead.title}</h4>
              <p className="source-excerpt">{lead.excerpt}</p>
              <span className="fine-print">
                {new URL(lead.url).hostname} · 查看原文 ↗
                {lead.checkedAt && (
                  <> · 最近读取 {lead.checkedAt.slice(0, 10)}</>
                )}
              </span>
            </a>
          ))}
        </div>
      )}
    </section>
  );
}
