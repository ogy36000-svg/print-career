"use client";

import { useUserData } from "@/lib/store";

export default function FavButton({ companyId, size = "md" }: { companyId: string; size?: "sm" | "md" }) {
  const { data, update } = useUserData();
  const fav = data.favorites.includes(companyId);
  const cls = size === "sm" ? "w-8 h-8 text-sm" : "w-10 h-10 text-lg";
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
        fav ? "bg-rose-500 text-white shadow-lg shadow-rose-200" : "bg-white/90 text-slate-400 border border-slate-200 hover:text-rose-400"
      }`}
    >
      {fav ? "♥" : "♡"}
    </button>
  );
}
