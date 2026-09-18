"use client";
import { useCareerCatalog } from "@/components/CareerProvider";
import { careerAdvice } from "@/lib/career/engine";
import ResearchPanel from "@/components/ResearchPanel";
import WorkspaceContext from "@/components/WorkspaceContext";
export default function CertsPage() {
  const { query, catalog } = useCareerCatalog();
  const advice = careerAdvice(query, catalog);
  return (
    <div className="workspace reading-width">
      <WorkspaceContext />
      <h1 className="hero-title text-3xl">证书与学习目标</h1>
      <p className="mt-4 text-sm text-slate-500">
        结合感兴趣的岗位安排学习，报名条件与时间可查看官方入口。
      </p>
      <section className="mt-6 grid md:grid-cols-2 gap-5">
        {advice.certificates.map((cert) => (
          <article className="panel" key={cert.name}>
            <span className="data-badge">
              {cert.kind === "goal" ? "个人提升目标" : "按岗位选考"}
            </span>
            <h2 className="mt-3 text-xl font-black">{cert.name}</h2>
            <p className="mt-3 text-sm text-slate-600 leading-relaxed">
              {cert.reason}
            </p>
            <a
              className="mt-4 inline-block text-link"
              href={cert.sourceUrl}
              target="_blank"
              rel="noreferrer"
            >
              查看官方入口 ↗
            </a>
          </article>
        ))}
        {!advice.certificates.length && (
          <article className="empty-state md:col-span-2">
            <h2 className="font-bold">当前没有足够依据推荐特定证书</h2>
            <p className="mt-2 text-sm text-slate-500">
              先查看5条真实岗位公告，找重复出现的技能；不要因为目录未覆盖就随意买培训。
            </p>
          </article>
        )}
      </section>
      <div className="mt-6 glass rounded-3xl p-5">
        <h2 className="font-black">怎么判断值不值得考</h2>
        <ul className="mt-3 space-y-2 text-sm text-slate-600">
          <li>• 官方报考资格是否适合你的学历和年级？</li>
          <li>• 目标企业的当期公告是否明确要求或认可？</li>
          <li>• 备考时间是否会挤掉项目、实习和英语等更重要能力？</li>
        </ul>
      </div>
      <div className="mt-6">
        <ResearchPanel key={query.major} initialTopic="competition" />
      </div>
    </div>
  );
}
