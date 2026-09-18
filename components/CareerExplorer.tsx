"use client";
import Link from "next/link";
import { recommendCompanies, recommendVacancies } from "@/lib/career/engine";
import { asLegacyCompany } from "@/lib/career/backup";
import { useCareerCatalog } from "./CareerProvider";
import WorkspaceContext from "./WorkspaceContext";
import CompanyCard from "./CompanyCard";
import OpportunityList from "./OpportunityList";
import ResearchPanel from "./ResearchPanel";
export default function CareerExplorer() {
  const {
    catalog,
    query,
    profile,
    ready,
    openGuide,
    workspace,
    loading,
    refresh,
    searchMore,
    message,
    checkedAt,
  } = useCareerCatalog();
  const companies = recommendCompanies(catalog.employers, query, catalog);
  const vacancies = recommendVacancies(catalog.vacancies, query, catalog);
  if (!profile)
    return (
      <div className="workspace neutral-workspace">
        <p className="eyebrow">实习与职业发展</p>
        <h1>从你的专业，走向下一步</h1>
        <p className="muted">整理值得关注的公告、企业与准备事项。</p>
        <button
          className="career-primary"
          disabled={!ready}
          onClick={openGuide}
        >
          {ready ? "开始设置" : "正在准备工作台…"}
        </button>
        <div className="neutral-sections" aria-hidden="true">
          <span>发现机会</span>
          <span>了解方向</span>
          <span>积累经历</span>
        </div>
      </div>
    );
  return (
    <div className="workspace">
      <WorkspaceContext />
      <header className="workspace-heading">
        <div>
          <p className="eyebrow">我的工作台</p>
          <h1>实习与职业机会</h1>
          <p className="muted">
            {workspace.stage}，从一份公告和一个具体行动开始。
          </p>
        </div>
        <button
          className="career-secondary"
          disabled={loading}
          onClick={() => void refresh(true)}
        >
          {loading ? "正在读取…" : "更新资料 ↻"}
        </button>
      </header>
      <div className="workspace-columns">
        <div className="workspace-main">
          <section>
            <div className="section-heading">
              <h2>公开公告与职业参考</h2>
              <span className="fine-print">
                {checkedAt
                  ? `最近读取 ${new Date(checkedAt).toLocaleDateString("zh-CN")}`
                  : "从学校与企业公开来源整理"}
              </span>
            </div>
            <p className="fine-print section-intro">
              届别、发布时间和具体要求见每条公告；往期信息可用于了解岗位。
            </p>
            {message && (
              <p role="alert" className="notice">
                {message} <Link href="/profile">账号与档案 →</Link>
              </p>
            )}
            <OpportunityList />
            {loading && (
              <p role="status" className="fine-print">
                正在读取公开来源，稍等片刻。
              </p>
            )}
            <button
              className="source-search"
              disabled={loading}
              onClick={() => void searchMore()}
            >
              搜索更多公告 ↗
            </button>
          </section>
          {!!vacancies.length && (
            <section className="section-space">
              <h2>有效期内的职位</h2>
              {vacancies.map((v) => (
                <a
                  className="notice-card"
                  key={v.id}
                  href={v.sourceUrl}
                  target="_blank"
                  rel="noreferrer"
                >
                  <h3>{v.title}</h3>
                  <p>
                    {v.city} · {v.requirements.join("；")}
                  </p>
                  <span className="fine-print">
                    有效至 {v.expiresAt} · 查看职位 ↗
                  </span>
                </a>
              ))}
            </section>
          )}
          <section className="section-space">
            <div className="section-heading">
              <h2>了解相关企业</h2>
              <Link href="/companies" className="text-link">
                全部企业 →
              </Link>
            </div>
            <p className="fine-print section-intro">
              从业务和工作内容判断方向，再查看具体招聘要求。
            </p>
            <div className="company-grid" data-testid="employer-grid">
              {companies.slice(0, 6).map(({ employer }) => (
                <CompanyCard
                  key={employer.id}
                  company={asLegacyCompany(employer)}
                />
              ))}
            </div>
            {!companies.length && (
              <div className="empty-state">
                <h3>还没有收录这个专业的相关企业</h3>
                <p>可以搜索公开公告，从原文中的企业和岗位继续了解。</p>
                <a href="#research" className="text-link">
                  查找公开资料 ↓
                </a>
              </div>
            )}
          </section>
          <div className="section-space">
            <ResearchPanel key={query.major} />
          </div>
        </div>
        <aside className="workspace-sidebar">
          <section className="side-note">
            <p className="eyebrow">{workspace.stage}</p>
            <h2>这一阶段，先做什么</h2>
            <ol>
              {workspace.nextSteps.slice(0, 3).map((step) => (
                <li key={step}>{step}</li>
              ))}
            </ol>
            <Link href="/growth" className="text-link">
              打开我的行动清单 →
            </Link>
          </section>
          <section className="sidebar-links">
            <h2>把方向看具体</h2>
            <Link href="/roles">
              职业方向 <span>日常工作与能力 →</span>
            </Link>
            <Link href="/industry">
              行业与地区 <span>产业方向与海外视角 →</span>
            </Link>
            <Link href="/certs">
              学习目标 <span>按方向安排准备 →</span>
            </Link>
          </section>
          <p className="fine-print">
            公开来源在页面可见时定期检查。最近读取时间与公告发布时间分别展示。
          </p>
        </aside>
      </div>
      <footer className="workspace-footer">职景 · 把了解变成下一步</footer>
    </div>
  );
}
