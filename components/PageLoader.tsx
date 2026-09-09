"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

/** 印刷主题开屏加载：CMYK 四色墨点汇聚成「印」logo，进度条走完后上滑退出 */
export default function PageLoader() {
  const [show, setShow] = useState(false);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    // 每次会话只播一次
    if (sessionStorage.getItem("pc-loaded")) return;
    setShow(true);
    sessionStorage.setItem("pc-loaded", "1");
    let p = 0;
    const t = setInterval(() => {
      p = Math.min(100, p + Math.random() * 16 + 6);
      setProgress(Math.floor(p));
      if (p >= 100) {
        clearInterval(t);
        setTimeout(() => setShow(false), 350);
      }
    }, 110);
    return () => clearInterval(t);
  }, []);

  const dots = [
    { c: "#06b6d4", x: -46, y: -46 }, // C
    { c: "#ec4899", x: 46, y: -46 },  // M
    { c: "#facc15", x: -46, y: 46 },  // Y
    { c: "#1e293b", x: 46, y: 46 },   // K
  ];

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          className="fixed inset-0 z-[100] grid place-items-center bg-[#f6f7fb]"
          exit={{ y: "-100%", transition: { duration: 0.55, ease: [0.76, 0, 0.24, 1] } }}
        >
          {/* 网点纹理背景 */}
          <div
            className="absolute inset-0 opacity-[0.35]"
            style={{
              backgroundImage: "radial-gradient(rgba(100,116,139,0.25) 1px, transparent 1.6px)",
              backgroundSize: "18px 18px",
            }}
          />
          <div className="relative flex flex-col items-center">
            <div className="relative w-32 h-32">
              {dots.map((d, i) => (
                <motion.span
                  key={d.c}
                  className="absolute left-1/2 top-1/2 w-9 h-9 rounded-full mix-blend-multiply"
                  style={{ background: d.c }}
                  initial={{ x: d.x * 1.6, y: d.y * 1.6, opacity: 0, scale: 0.4 }}
                  animate={{ x: [d.x * 1.6, d.x * 0.35, 0], y: [d.y * 1.6, d.y * 0.35, 0], opacity: [0, 1, 1], scale: [0.4, 1, 0.9] }}
                  transition={{ duration: 1.1, delay: i * 0.12, ease: "easeInOut" }}
                />
              ))}
              <motion.div
                className="absolute inset-0 grid place-items-center"
                initial={{ opacity: 0, scale: 0.5, rotate: -8 }}
                animate={{ opacity: 1, scale: 1, rotate: 0 }}
                transition={{ delay: 1.15, type: "spring", stiffness: 220, damping: 14 }}
              >
                <span className="w-14 h-14 rounded-2xl bg-gradient-to-br from-orange-500 to-rose-500 grid place-items-center text-white text-2xl font-black shadow-xl shadow-orange-300">
                  印
                </span>
              </motion.div>
            </div>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="mt-6 text-sm font-black tracking-[0.3em] text-slate-500"
            >
              印向未来
            </motion.p>
            <div className="mt-4 w-44 h-1.5 rounded-full bg-slate-200 overflow-hidden">
              <div className="h-full rounded-full bg-gradient-to-r from-cyan-400 via-rose-400 to-slate-800 transition-all duration-150" style={{ width: `${progress}%` }} />
            </div>
            <p className="mt-2 text-[11px] font-bold text-slate-400 tabular-nums">{progress}%</p>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
