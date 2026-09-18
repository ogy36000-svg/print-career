"use client";
import { useState } from "react";
import { useCareerCatalog } from "./CareerProvider";
export default function CareerAnalysis() {
  const { workspace } = useCareerCatalog();
  const [roleId, setRoleId] = useState("");
  const role =
    workspace.directions.find((r) => r.id === roleId) ??
    workspace.directions[0];
  return (
    <section className="panel">
      <h2>职业方向</h2>
      <p className="muted">先了解每天做什么，再选择想积累的经验。</p>
      <div className="mt-4 flex flex-wrap gap-2">
        {workspace.directions.map((r) => (
          <button
            className={`research-tab ${r.id === role?.id ? "selected" : ""}`}
            aria-pressed={r.id === role?.id}
            key={r.id}
            onClick={() => setRoleId(r.id)}
          >
            {r.title}
          </button>
        ))}
      </div>
      {role ? (
        <div className="section-space">
          <h3>{role.title}</h3>
          <p className="muted mt-2">{role.environment}</p>
          <div className="content-columns mt-5">
            <div>
              <h4>日常工作</h4>
              <ul className="reading-list">
                {role.tasks.map((t) => (
                  <li key={t}>{t}</li>
                ))}
              </ul>
            </div>
            <div>
              <h4>岗位常见能力</h4>
              <div className="direction-tags mt-3">
                {role.skills.map((s) => (
                  <span key={s}>{s}</span>
                ))}
              </div>
            </div>
          </div>
          <div className="content-columns mt-5">
            {[
              { title: "技术与专业路线", steps: role.technicalPath },
              { title: "协作与管理路线", steps: role.managementPath },
            ].map((p) => (
              <div className="route-panel" key={p.title}>
                <h4>{p.title}</h4>
                <ol className="reading-list">
                  {p.steps.map((s) => (
                    <li key={s}>{s}</li>
                  ))}
                </ol>
              </div>
            ))}
          </div>
          <h4 className="mt-6">了解岗位时可以问</h4>
          <ul className="reading-list">
            {role.bottlenecks.map((s) => (
              <li key={s}>{s}</li>
            ))}
          </ul>
          <p className="muted">学习与升学：{role.study}</p>
          <div className="source-links">
            {role.sourceUrls.map((url, i) => (
              <a href={url} key={url} target="_blank" rel="noreferrer">
                背景参考 {i + 1} ↗
              </a>
            ))}
          </div>
          <p className="fine-print">
            以上是常见发展方向，具体职责与培养安排可向企业进一步确认。
          </p>
        </div>
      ) : (
        <div className="empty-state">
          这个专业的职业介绍还在整理，可以先查找相关岗位和培养资料。
        </div>
      )}
    </section>
  );
}
