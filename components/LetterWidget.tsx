"use client";

import { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useUserData } from "@/lib/store";
import { majors, certs, companies } from "@/lib/data";
import { upcomingEvents, daysLabel } from "@/lib/certUtils";

/** 右下角书信：根据档案生成一封个性化建议信 */
export default function LetterWidget() {
  const { data, loaded } = useUserData();
  const [open, setOpen] = useState(false);

  const letter = useMemo(() => {
    if (!loaded) return null;
    const p = data.profile;
    const major = majors.find((m) => m.id === p.major);
    const lines: string[] = [];

    // 主线建议
    if (p.major === "printing") {
      lines.push("你在数字印刷方向，最顺的一条路是先抓住学校的普理司产业学院——那是送到手边的实习通道，别等资源凉了。主动找老师聊一次，比海投十份简历都有用。");
    } else if (p.major === "packaging") {
      lines.push("包装是印刷行业利润最稳的赛道。把结构设计（ArtiosCAD）练到能出完整盒型，你就超过了大多数应届生。");
    } else {
      lines.push("先把设计三件套和一门手艺练扎实，再谈方向。作品集比成绩单更能说话。");
    }

    // 语言
    if (p.japanese !== "无") {
      lines.push(`你日语已经到 ${p.japanese}，这是稀缺牌。日资印刷企业（凸版、DNP、利丰雅高）长期缺"懂印刷又会日语"的人，N2 考下来，选择权就完全不一样了。`);
    } else {
      lines.push("行业正在出海，外语是最划算的投资。英语四级是底线；如果在学日语，坚持下去，它是差异化王牌。");
    }
    if (p.english === "无") {
      lines.push("提醒一句：英语四级还没过的话，这学期务必拿下——外企和外贸岗的简历关就靠它。");
    }

    // 考证
    const next = upcomingEvents(certs)[0];
    if (next) {
      lines.push(`最近的考证节点：${next.cert.shortName}「${next.event.label}」${daysLabel(next.days)}${next.event.status === "官方公布" ? "（官方已定）" : "（按往届推算）"}，别忘了进考证中心看报名入口。`);
    }

    // 技能差距
    const gaps = (major?.defaultSkills ?? []).filter((s) => !p.skills.some((us) => us.includes(s.slice(0, 2)) || s.includes(us)));
    if (p.skills.length > 0 && gaps.length > 0) {
      lines.push(`对照 ${major?.name ?? "专业"} 的核心技能，你还可以补：${gaps.slice(0, 3).join("、")}。在成长中心把它们点亮吧。`);
    }

    // 投递
    if (data.favorites.length === 0) {
      lines.push("企业库已经帮你按专业筛好了，去收藏几家顺眼的，追踪起来——机会是攒出来的。");
    } else {
      const s = companies.filter((c) => data.favorites.includes(c.id) && c.recommend === "S");
      lines.push(`你已经收藏了 ${data.favorites.length} 家企业${s.length > 0 ? `，其中 ${s.map((x) => x.name).slice(0, 2).join("、")} 是重点推荐，优先投` : ""}。暑期实习≈半个 offer，别等秋招才开始。`);
    }

    return lines;
  }, [data, loaded]);

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
