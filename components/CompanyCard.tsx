"use client";
import Link from "next/link";
import type { Company } from "@/lib/types";
import FavButton from "./FavButton";
export default function CompanyCard({
  company,
  compact = false,
}: {
  company: Company;
  index?: number;
  compact?: boolean;
}) {
  return (
    <article className="company-card">
      <Link className="company-reading" href={`/companies/${company.id}`}>
        <span className="company-mark">{company.name.slice(0, 1)}</span>
        <h3>{company.name}</h3>
        <p className={compact ? "line-clamp-2" : "line-clamp-3"}>
          {company.desc}
        </p>
        <p className="company-location">
          {company.city} · {company.type}
        </p>
        <div className="direction-tags">
          {company.tags.slice(0, 2).map((t) => (
            <span key={t}>{t}</span>
          ))}
        </div>
        <span className="card-discover">了解企业 →</span>
      </Link>
      <div className="company-actions">
        {company.website ? (
          <a href={company.website} target="_blank" rel="noreferrer">
            官方网站 ↗
          </a>
        ) : (
          <span className="fine-print">企业资料</span>
        )}
        <FavButton companyId={company.id} companyName={company.name} />
      </div>
    </article>
  );
}
