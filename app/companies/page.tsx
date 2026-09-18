"use client";
import { useState } from "react";
import CompanyCard from "@/components/CompanyCard";
import { useCareerCatalog } from "@/components/CareerProvider";
import { asLegacyCompany } from "@/lib/career/backup";
import { recommendCompanies } from "@/lib/career/engine";
import WorkspaceContext from "@/components/WorkspaceContext";
export default function CompaniesPage() {
  const { catalog, query } = useCareerCatalog();
  const [search, setSearch] = useState("");
  const [city, setCity] = useState("");
  const [sector, setSector] = useState("");
  const [matchedOnly, setMatchedOnly] = useState(true);
  const matches = recommendCompanies(catalog.employers, query, catalog);
  const candidates = matchedOnly
    ? matches.map((m) => m.employer)
    : catalog.employers;
  const shown = candidates.filter(
    (e) =>
      (!city || e.city === city) &&
      (!sector || e.sector === sector) &&
      (!search.trim() ||
        [e.name, e.city, e.sector, ...e.tags]
          .join(" ")
          .toLowerCase()
          .includes(search.trim().toLowerCase())),
  );
  return (
    <div className="workspace">
      <WorkspaceContext />
      <h1 className="hero-title text-3xl">了解相关企业</h1>
      <p className="mt-3 text-sm text-slate-500">
        从业务内容与工作地点开始，了解值得进一步关注的企业。
      </p>
      <div className="mt-6 panel">
        <div className="mt-4 grid sm:grid-cols-3 gap-3">
          <input
            aria-label="搜索企业"
            className="career-input"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="公司、城市或能力…"
            maxLength={100}
          />
          <select
            aria-label="企业城市"
            className="career-input"
            value={city}
            onChange={(e) => setCity(e.target.value)}
          >
            <option value="">全部城市 / 地区</option>
            {[...new Set(catalog.employers.map((e) => e.city))]
              .sort()
              .map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
          </select>
          <select
            aria-label="企业行业"
            className="career-input"
            value={sector}
            onChange={(e) => setSector(e.target.value)}
          >
            <option value="">全部行业</option>
            {[...new Set(catalog.employers.map((e) => e.sector))]
              .sort()
              .map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
          </select>
        </div>
        <label className="mt-4 flex gap-2 text-sm font-bold">
          <input
            type="checkbox"
            checked={matchedOnly}
            onChange={(e) => setMatchedOnly(e.target.checked)}
          />
          只看当前专业关联企业（{matches.length}个）
        </label>
      </div>
      <p className="mt-5 text-sm text-slate-500">
        {shown.length} 家企业 · 招聘安排请查看各企业的具体公告
      </p>
      <div className="mt-4 company-grid">
        {shown.map((e, i) => (
          <CompanyCard key={e.id} company={asLegacyCompany(e)} index={i} />
        ))}
      </div>
      {!shown.length && (
        <p className="empty-state mt-5 text-sm text-slate-500">
          暂时没有符合筛选的企业。可以调整筛选，或回工作台搜索公开资料。
        </p>
      )}
    </div>
  );
}
