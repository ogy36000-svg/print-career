"use client";

import { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useUserData } from "@/lib/store";
import { useCareerCatalog } from "./CareerProvider";
import { careerAdvice } from "@/lib/career/engine";


/** 右下角书信：根据档案生成一封个性化建议信 */
export default function LetterWidget() {
  const { data, loaded } = useUserData();
  const [open, setOpen] = useState(false);
  const {query,catalog} = useCareerCatalog();

  const letter = useMemo(() => {
    if (!loaded) return null;
    const advice=careerAdvice(query,catalog);
    return [
      `当前关注：${query.major || "尚未填写专业"}。推荐是研究线索，不等于录用或晋升概率。`,
      ...advice.plan.slice(0,2),
      advice.missingSkills.length ? `可以优先补强：${advice.missingSkills.slice(0,4).join("、")}。用项目或实习经历证明，而非只列技能名词。` : "对照具体岗位公告准备技能证据；没有证据时不随意推荐证书。",
      `已收藏 ${data.favorites.length} 个企业研究对象。投递前再次核实公告、日期、地点与要求。`,
      "职业环境、晋升编制和往届录用背景请查看深度研究；没有公开资料的数字需要向企业询问，不根据学校名猜胜算。",
    ];
  }, [data.favorites.length, loaded, query, catalog]);

  if (!loaded) return null;

  return (
    <>
      {/* 浮动信封按钮 */}
      <motion.button
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 1.2, type: "spring", stiffness: 260, damping: 16 }}
        onClick={() => setOpen(true)}
        aria-label="写给你的信"
        className="fixed bottom-24 md:bottom-8 right-4 md:right-8 z-40 w-14 h-14 rounded-2xl bg-gradient-to-br from-amber-400 to-orange-500 shadow-xl shadow-orange-200 grid place-items-center hover:scale-110 active:scale-95 transition-transform"
      >
        <svg viewBox="0 0 24 24" className="w-7 h-7 text-white" fill="none" stroke="currentColor" strokeWidth="1.8">
          <rect x="3" y="5" width="18" height="14" rx="2" />
          <path d="M3 7l9 6 9-6" />
        </svg>
        <span className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-rose-500 animate-pulse" />
      </motion.button>

      {/* 书信弹窗 */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[90] bg-slate-900/40 backdrop-blur-sm grid place-items-center p-4"
            onClick={() => setOpen(false)}
          >
            <motion.div
              initial={{ y: 60, rotate: -2, opacity: 0 }}
              animate={{ y: 0, rotate: 0, opacity: 1 }}
              exit={{ y: 60, opacity: 0 }}
              transition={{ type: "spring", stiffness: 200, damping: 22 }}
              onClick={(e) => e.stopPropagation()}
              className="relative w-full max-w-lg max-h-[80vh] overflow-y-auto rounded-md shadow-2xl"
              style={{
                background: "linear-gradient(160deg, #fffdf5 0%, #fdf6e3 100%)",
                backgroundImage: "repeating-linear-gradient(transparent, transparent 31px, rgba(180,160,120,0.15) 32px)",
              }}
            >
              {/* 邮票 */}
              <div className="absolute top-4 right-4 w-14 h-16 rounded-sm bg-gradient-to-br from-rose-400 to-orange-400 grid place-items-center rotate-3 shadow-md" style={{ outline: "2px dashed rgba(255,255,255,0.7)", outlineOffset: "-4px" }}>
                <span className="text-white text-xl font-black">印</span>
              </div>

              <div className="p-7 md:p-9 pr-24 md:pr-28" style={{ fontFamily: "'Kaiti SC','STKaiti','KaiTi',serif" }}>
                <p className="text-lg font-bold text-slate-700">
                  {data.profile.name ? `亲爱的 ${data.profile.name}：` : "亲爱的同学："}
                </p>
                <p className="mt-4 text-sm leading-8 text-slate-600">
                  见字如面。看了你的档案，想跟你聊几句心里话：
                </p>
                <div className="mt-3 space-y-4">
                  {letter?.map((l, i) => (
                    <motion.p
                      key={i}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.3 + i * 0.25 }}
                      className="text-sm leading-8 text-slate-700"
                    >
                      {l}
                    </motion.p>
                  ))}
                </div>
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.4 + (letter?.length ?? 0) * 0.25 }}
                  className="mt-6 text-sm leading-8 text-slate-600"
                >
                  一步一步来，路都是印出来的。
                </motion.p>
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.6 + (letter?.length ?? 0) * 0.25 }}
                  className="mt-4 text-right text-sm font-bold text-slate-700"
                >
                  —— 印向未来
                </motion.p>
                <button
                  onClick={() => setOpen(false)}
                  className="mt-6 w-full py-2.5 rounded-xl bg-slate-800 text-white text-sm font-black hover:scale-[1.02] transition-transform"
                  style={{ fontFamily: "inherit" }}
                >
                  收好了
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
