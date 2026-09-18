"use client";
import { useCareerCatalog } from "./CareerProvider";
import { yearLabel } from "@/lib/career/onboarding";
export default function WorkspaceContext() {
  const { profile, openGuide } = useCareerCatalog();
  return (
    <div className="workspace-context">
      <span>
        {profile
          ? `${profile.major} · ${yearLabel(profile.grade)}`
          : "设置你的专业与年级"}
      </span>
      <button onClick={openGuide}>
        {profile ? "修改" : "开始设置"} <span aria-hidden="true">↗</span>
      </button>
    </div>
  );
}
