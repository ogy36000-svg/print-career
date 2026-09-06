"use client";

import { useUserData } from "@/lib/store";

export default function FavButton({ companyId, size = "md" }: { companyId: string; size?: "sm" | "md" }) {
  const { data, update } = useUserData();
  const fav = data.favorites.includes(companyId);
  const cls = size === "sm" ? "w-8 h-8 text-sm" : "w-10 h-10 text-base";
  return (
    <button
      aria-label={fav ? "取消收藏" : "收藏"}
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        update((d) => ({
          ...d,
          favorites: fav
            ? d.favorites.filter((f) => f !== companyId)
            : [...d.favorites, companyId],
        }));
      }}
      className={`${cls} rounded-full grid place-items-center transition-all active:scale-90 ${
        fav
          ? "bg-gradient-to-br from-rose-500 to-orange-500 text-white shadow-lg shadow-rose-200/50"
          : "bg-white/80 text-slate-300 border border-slate-200 hover:text-rose-400 hover:border-rose-200"
      }`}
    >
      <svg viewBox="0 0 24 24" fill={fav ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2" className="w-4 h-4">
        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
      </svg>
    </button>
  );
}
