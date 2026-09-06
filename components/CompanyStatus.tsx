"use client";

import { useUserData } from "@/lib/store";

const statuses = ["想投", "已投递", "面试中", "拿到offer", "已放弃"] as const;
const colors: Record<string, string> = {
  想投: "bg-blue-500",
  已投递: "bg-violet-500",
  面试中: "bg-amber-500",
  拿到offer: "bg-emerald-500",
  已放弃: "bg-slate-400",
};

export default function CompanyStatus({ companyId }: { companyId: string }) {
  const { data, update } = useUserData();
  const current = data.companyStatus[companyId];

  return (
    <div className="mt-4 bg-white rounded-3xl p-5 ring-1 ring-black/5">
      <p className="text-sm font-black">📮 我的投递状态{current ? <span className={`ml-2 text-xs px-2 py-0.5 rounded-full text-white ${colors[current]}`}>{current}</span> : <span className="ml-2 text-xs text-slate-400">未标记</span>}</p>
      <div className="mt-3 flex flex-wrap gap-2">
        {statuses.map((s) => (
          <button
            key={s}
            onClick={() =>
              update((d) => ({
                ...d,
                companyStatus: { ...d.companyStatus, [companyId]: s },
              }))
            }
            className={`px-3.5 py-1.5 rounded-full text-xs font-black transition-all ${
              current === s ? `${colors[s]} text-white shadow-md` : "bg-slate-50 text-slate-500 ring-1 ring-black/5 hover:ring-black/20"
            }`}
          >
            {s}
          </button>
        ))}
        {current && (
          <button
            onClick={() =>
              update((d) => {
                const next = { ...d.companyStatus };
                delete next[companyId];
                return { ...d, companyStatus: next };
              })
            }
            className="px-3.5 py-1.5 rounded-full text-xs font-bold text-slate-400 hover:text-rose-500"
          >
            清除
          </button>
        )}
      </div>
    </div>
  );
}
