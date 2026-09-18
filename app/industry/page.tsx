"use client";
import { useMemo } from "react";
import { useCareerCatalog } from "@/components/CareerProvider";
import WorkspaceContext from "@/components/WorkspaceContext";
import OpportunityList from "@/components/OpportunityList";
import ResearchPanel from "@/components/ResearchPanel";
import RealMap from "@/components/RealMap";
import { opportunityRegions } from "@/lib/career/regions";
import type { Company } from "@/lib/types";
const NO_COMPANIES: Company[] = [];
export default function IndustryPage() {
  const { workspace, profile, opportunities } = useCareerCatalog();
  const regions = useMemo(
    () => opportunityRegions(opportunities?.items ?? []),
    [opportunities?.items],
  );
  return (
    <div className="workspace">
      <WorkspaceContext />
      <header className="workspace-heading">
        <div>
          <p className="eyebrow">行业与地区</p>
          <h1>看看专业通向哪里</h1>
          <p className="muted">从业务内容、工作地点和项目方式了解你的选择。</p>
        </div>
      </header>
      {profile && (
        <>
          <div className="content-columns">
            <section className="panel">
              <h2>{workspace.label}的行业方向</h2>
              <ul className="reading-list">
                {workspace.industry.map((s) => (
                  <li key={s}>{s}</li>
                ))}
              </ul>
              {!workspace.industry.length && (
                <p className="muted">
                  这个专业的行业介绍还在整理，可以先从公开资料了解。
                </p>
              )}
              <div className="source-links">
                {Array.from(
                  new Set(workspace.directions.flatMap((r) => r.sourceUrls)),
                ).map((url, i) => (
                  <a key={url} href={url} target="_blank" rel="noreferrer">
                    行业背景参考 {i + 1} ↗
                  </a>
                ))}
              </div>
            </section>
            <section className="panel">
              <h2>跨地区与海外视角</h2>
              <ul className="reading-list">
                {workspace.globalOutlook.map((s) => (
                  <li key={s}>{s}</li>
                ))}
              </ul>
              <p className="fine-print">
                了解海外岗位时，可以询问工作语言、实际地点、指导安排和合同保障。
              </p>
            </section>
          </div>
          <section className="panel section-space">
            <h2>公告中的城市与地区</h2>
            <p className="muted">
              地图标记城市、省份或国家的地理中心，具体岗位地点请查看来源公告。
            </p>
            <div className="mt-4">
              <RealMap
                companies={NO_COMPANIES}
                extraMarkers={regions}
                view="world"
                height={360}
              />
            </div>
            {!regions.length && (
              <p className="fine-print">
                现有资料尚未明确可标注的地区，可以继续查找公开公告。
              </p>
            )}
            <div className="region-sources">
              {regions.map((region) => (
                <div key={region.name}>
                  <h3>{region.name}</h3>
                  <div className="source-links">
                    {region.sources.map((source) => (
                      <a
                        key={source.url}
                        href={source.url}
                        target="_blank"
                        rel="noreferrer"
                      >
                        {source.title} ↗
                      </a>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </section>
          <section className="section-space">
            <h2>相关公开公告</h2>
            <OpportunityList />
          </section>
          <div className="section-space">
            <ResearchPanel key={workspace.label} initialTopic="career" />
          </div>
        </>
      )}
    </div>
  );
}
