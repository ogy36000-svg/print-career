"use client";
import { useCareerCatalog } from "@/components/CareerProvider";
import CareerAnalysis from "@/components/CareerAnalysis";
import ResearchPanel from "@/components/ResearchPanel";
import WorkspaceContext from "@/components/WorkspaceContext";
export default function RolesPage() {
  const { query } = useCareerCatalog();
  return (
    <div className="workspace reading-width">
      <WorkspaceContext />
      <h1 className="hero-title text-3xl">把未来的工作看具体</h1>
      <p className="mt-4 text-sm text-slate-500">
        工作日常、常见能力，以及可以逐步探索的发展方向。
      </p>
      <div className="mt-6">
        <CareerAnalysis />
      </div>
      <div className="mt-6">
        <ResearchPanel key={query.major} initialTopic="career" />
      </div>
    </div>
  );
}
