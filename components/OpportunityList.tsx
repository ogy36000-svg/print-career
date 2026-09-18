"use client";
import { useCareerCatalog } from "./CareerProvider";
export default function OpportunityList({ company }: { company?: string }) {
  const { opportunities, loading } = useCareerCatalog();
  const items =
    opportunities?.items.filter(
      (i) =>
        !company ||
        i.companyName.includes(company) ||
        company.includes(i.companyName),
    ) ?? [];
  const leads = company ? [] : (opportunities?.leads ?? []);
  return (
    <>
      {[
        {
          label: "招聘与往期公告",
          records: items.filter((item) => item.kind !== "reference"),
        },
        {
          label: "职业与学习参考",
          records: items.filter((item) => item.kind === "reference"),
        },
      ]
        .filter((group) => group.records.length)
        .map((group) => (
          <section key={group.label} className="opportunity-group">
            <h3>{group.label}</h3>
            <div className="announcement-list">
              {group.records.map((item) => (
                <a
                  className="notice-card"
                  key={item.id}
                  href={item.sourceUrl}
                  target="_blank"
                  rel="noreferrer"
                >
                  <div className="notice-meta">
                    <span>
                      {item.kind === "history"
                        ? `${item.cohort ?? ""}往期公告`
                        : item.kind === "reference"
                          ? "职业参考"
                          : `${item.cohort ?? ""}校招公告`}
                    </span>
                    {item.city && <span>{item.city}</span>}
                  </div>
                  <h3>
                    {item.title} <span aria-hidden="true">↗</span>
                  </h3>
                  <p className="company-name">{item.companyName}</p>
                  <p>{item.summary}</p>
                  {!!item.requirements.length && (
                    <p className="requirements">
                      {item.requirements.join(" · ")}
                    </p>
                  )}
                  <div className="notice-dates">
                    <span>公告发布时间 {item.publishedAt}</span>
                    {item.checkedAt && (
                      <span>最近读取 {item.checkedAt.slice(0, 10)}</span>
                    )}
                    {item.availability === "stale" && <span>来源暂未更新</span>}
                  </div>
                </a>
              ))}
            </div>
          </section>
        ))}
      {!items.length && !loading && (
        <div className="empty-state">
          <h3>暂未收录相关公告</h3>
          <p>试试搜索更多公开资料，关注原文中的专业要求与截止日期。</p>
        </div>
      )}
      {!!leads.length && (
        <section className="public-leads">
          <h3>搜索到的公开资料</h3>
          <p className="fine-print">
            这些资料可能包含往期招聘、职业或培养信息，具体资格与日期请查看原文。
          </p>
          {leads.map((lead) => (
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
        </section>
      )}
    </>
  );
}
