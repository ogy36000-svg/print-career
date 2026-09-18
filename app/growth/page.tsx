"use client";
import Link from "next/link";
import { useCareerCatalog } from "@/components/CareerProvider";
import WorkspaceContext from "@/components/WorkspaceContext";
import { useUserData } from "@/lib/store";
export default function GrowthPage() {
  const { workspace, query, profile } = useCareerCatalog();
  const { data, update, loaded } = useUserData();
  return (
    <div className="workspace reading-width">
      <WorkspaceContext />
      <header className="workspace-heading">
        <div>
          <p className="eyebrow">{workspace.stage}</p>
          <h1>我的行动清单</h1>
          <p className="muted">把准备拆成具体的小事，完成一项，记下一项。</p>
        </div>
      </header>
      {profile && (
        <section className="panel">
          <h2>这一阶段的准备</h2>
          <ul className="task-list">
            {workspace.nextSteps.map((step) => {
              const key = `${query.major}:${query.grade}:${step}`;
              return (
                <li key={key}>
                  <label>
                    <input
                      type="checkbox"
                      disabled={!loaded}
                      checked={data.taskDone.includes(key)}
                      onChange={() =>
                        update((d) => ({
                          ...d,
                          taskDone: d.taskDone.includes(key)
                            ? d.taskDone.filter((x) => x !== key)
                            : [...d.taskDone, key],
                        }))
                      }
                    />
                    <span>{step}</span>
                  </label>
                </li>
              );
            })}
          </ul>
          <Link className="text-link" href="/profile">
            整理我的经历与技能 →
          </Link>
        </section>
      )}
      <div className="side-note mt-6">
        <h2>做完之后，留下什么</h2>
        <p className="muted">
          一份作品、一段项目记录，或一次面试复盘。记下你做了什么、遇到什么问题、如何解决，之后写简历也更具体。
        </p>
      </div>
    </div>
  );
}
