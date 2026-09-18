import { notFound } from "next/navigation";
import Link from "next/link";
import { jobSearchLinks } from "@/lib/data";
import { loadCatalog } from "@/lib/server/catalog";
import { asLegacyCompany } from "@/lib/career/backup";
import { curatedOpportunities } from "@/lib/career/opportunities";
import CompanyCard from "@/components/CompanyCard";
import CompanyStatus from "@/components/CompanyStatus";
import FavButton from "@/components/FavButton";
import ResearchPanel from "@/components/ResearchPanel";
export const dynamic = "force-dynamic";
export default async function CompanyDetail({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const { catalog } = await loadCatalog();
  const employer = catalog.employers.find((e) => e.id === id);
  if (!employer) notFound();
  const common = new Set(["英语", "沟通", "内容运营", "管理", "营销"]);
  const similar = catalog.employers
    .filter(
      (e) =>
        e.id !== id &&
        (e.sector === employer.sector ||
          e.tags.some((t) => !common.has(t) && employer.tags.includes(t))),
    )
    .slice(0, 4);
  const notices = curatedOpportunities.filter(
    (n) =>
      n.companyName.includes(employer.name) ||
      employer.name.includes(n.companyName),
  );
  return (
    <div className="workspace">
      <Link className="text-link" href="/companies">
        ← 返回企业
      </Link>
      <header className="company-detail-heading">
        <span className="company-mark">{employer.name.slice(0, 1)}</span>
        <div>
          <p className="eyebrow">
            {employer.city} · {employer.sector}
          </p>
          <h1>{employer.name}</h1>
        </div>
        <FavButton companyId={id} companyName={employer.name} />
      </header>
      <div className="workspace-columns">
        <div className="workspace-main">
          <section className="panel">
            <h2>企业介绍</h2>
            <p className="reading-copy">
              {employer.description ||
                `${employer.name}的业务方向为${employer.sector}。可通过官网进一步了解产品、服务和团队。`}
            </p>
            <div className="direction-tags">
              {employer.tags.map((t) => (
                <span key={t}>{t}</span>
              ))}
            </div>
          </section>
          <section className="section-space">
            <h2>相关公开公告</h2>
            {notices.length ? (
              notices.map((n) => (
                <a
                  className="notice-card"
                  href={n.sourceUrl}
                  key={n.id}
                  target="_blank"
                  rel="noreferrer"
                >
                  <p className="notice-meta">
                    {n.cohort}{" "}
                    {n.kind === "history"
                      ? "往期公告"
                      : n.kind === "reference"
                        ? "职业参考"
                        : "校招公告"}
                  </p>
                  <h3>{n.title} ↗</h3>
                  <p>{n.summary}</p>
                  <p className="requirements">{n.requirements.join(" · ")}</p>
                  <p className="fine-print">公告发布时间 {n.publishedAt}</p>
                </a>
              ))
            ) : (
              <p className="empty-state">
                暂未收录这家企业的相关公告，可以查看官网或搜索公开资料。
              </p>
            )}
          </section>
          <section className="panel section-space">
            <h2>了解岗位时可以问</h2>
            <ul className="reading-list">
              <li>实习生主要负责哪些工作？会参与什么项目？</li>
              <li>工作地点、作息和出差安排是什么？</li>
              <li>是否有固定导师？如何获得反馈、参与培训？</li>
              <li>申请对象、专业与学历要求，以及投递截止日期是什么？</li>
            </ul>
          </section>
          <section className="panel section-space">
            <h2>继续查找岗位</h2>
            <div className="source-links">
              {jobSearchLinks(employer.name).map((l) => (
                <a
                  key={l.platform}
                  href={l.url}
                  target="_blank"
                  rel="noreferrer"
                >
                  在{l.platform}搜索 ↗
                </a>
              ))}
            </div>
          </section>
          <div className="section-space">
            <ResearchPanel initialCompany={employer.name} />
          </div>
        </div>
        <aside className="workspace-sidebar">
          {employer.website && (
            <a
              className="panel block"
              href={employer.website}
              target="_blank"
              rel="noreferrer"
            >
              <h2>官方网站 ↗</h2>
              <p className="fine-print break-all">
                {new URL(employer.website).hostname}
              </p>
            </a>
          )}
          <CompanyStatus companyId={id} />
          <details className="panel">
            <summary>资料来源</summary>
            {employer.evidence.url && (
              <a
                className="text-link block mt-3"
                href={employer.evidence.url}
                target="_blank"
                rel="noreferrer"
              >
                企业资料原文 ↗
              </a>
            )}
            <p className="fine-print mt-3">
              {employer.evidence.checkedAt
                ? `资料日期 ${employer.evidence.checkedAt}`
                : "企业公开资料"}{" "}
              · 目录 {catalog.updated}
            </p>
            <p className="fine-print mt-2">{employer.evidence.note}</p>
          </details>
        </aside>
      </div>
      {!!similar.length && (
        <section className="section-space">
          <h2>相近业务的企业</h2>
          <div className="company-grid mt-5">
            {similar.map((e) => (
              <CompanyCard key={e.id} company={asLegacyCompany(e)} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
