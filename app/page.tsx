"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { companies, majors, gradeOptions, companiesData } from "@/lib/data";
import { quickMatchByMajor } from "@/lib/match";
import CompanyCard from "@/components/CompanyCard";
import DotMap from "@/components/DotMap";
import type { Company } from "@/lib/types";

const fadeUp = {
  initial: { opacity: 0, y: 30 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true },
};

export default function Home() {
  const [major, setMajor] = useState("printing");
  const [grade, setGrade] = useState("3");
  const [showMap, setShowMap] = useState(false);
  const [selectedCompany, setSelectedCompany] = useState<Company | null>(null);

  const matched = useMemo(() => quickMatchByMajor(companies, major), [major]);
  const top6 = matched.slice(0, 6).map((m) => m.company);
  const mapCompanies = matched.slice(0, 20).map((m) => m.company);

  const handleExplore = () => {
    setShowMap(true);
    setTimeout(() => {
      document.getElementById("map-section")?.scrollIntoView({ behavior: "smooth" });
    }, 100);
  };

  return (
    <div className="overflow-x-clip">
      {/* Hero */}
      <section className="relative px-6 pt-14 pb-10 md:pt-20 md:pb-16">
        <div className="relative max-w-5xl mx-auto text-center">
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-block text-xs md:text-sm font-black px-4 py-1.5 rounded-full glass text-slate-600"
          >
            为大学生量身定制的实习求职导航
          </motion.p>
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="hero-title mt-5 text-5xl md:text-7xl"
          >
            选专业，看企业<span className="gradient-text">自己来找你</span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="mt-5 max-w-2xl mx-auto text-base md:text-lg text-slate-500"
          >
            {companies.length} 家精选企业 · 一键直达招聘平台实时岗位 · 考证规划 · 云端同步
          </motion.p>

          {/* 选择器 */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="mt-10 glass rounded-3xl p-6 max-w-2xl mx-auto"
          >
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <p className="text-xs font-black text-slate-400 mb-2 text-left">你的专业</p>
                <div className="flex flex-wrap gap-2">
                  {majors.map((m) => (
                    <button
                      key={m.id}
                      onClick={() => { setMajor(m.id); setShowMap(false); }}
                      className={`px-4 py-2.5 rounded-2xl text-sm font-bold transition-all ${
                        major === m.id
                          ? "bg-slate-900 text-white shadow-lg"
                          : "bg-white/80 text-slate-500 hover:bg-white"
                      }`}
                    >
                      {m.name}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <p className="text-xs font-black text-slate-400 mb-2 text-left">你的年级</p>
                <div className="flex flex-wrap gap-2">
                  {gradeOptions.map((g) => (
                    <button
                      key={g.id}
                      onClick={() => setGrade(g.id)}
                      className={`px-4 py-2.5 rounded-2xl text-sm font-bold transition-all ${
                        grade === g.id
                          ? "bg-slate-900 text-white shadow-lg"
                          : "bg-white/80 text-slate-500 hover:bg-white"
                      }`}
                    >
                      {g.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
            <button
              onClick={handleExplore}
              className="mt-6 w-full py-4 rounded-2xl bg-gradient-to-r from-orange-500 to-rose-500 text-white font-black text-base shadow-lg shadow-orange-200 hover:shadow-xl hover:scale-[1.02] transition-all"
            >
              看看哪些企业在等你
            </button>
          </motion.div>
        </div>
      </section>

      {/* 地图动画区 */}
      <AnimatePresence>
        {showMap && (
          <motion.section
            id="map-section"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="px-6 pb-10 overflow-hidden"
          >
            <div className="max-w-5xl mx-auto">
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="text-center mb-4"
              >
                <h2 className="hero-title text-2xl md:text-4xl">
                  这些企业正在<span className="gradient-text">你的地图</span>上等你
                </h2>
                <p className="mt-2 text-sm text-slate-500">点地图上的光点查看企业详情</p>
              </motion.div>
              <div className="glass rounded-[2rem] p-4 md:p-8">
                <DotMap
                  companies={mapCompanies}
                  onSelect={(c) => setSelectedCompany(c)}
                  selectedId={selectedCompany?.id}
                />
              </div>

              {/* 选中企业快速卡片 */}
              <AnimatePresence>
                {selectedCompany && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 20 }}
                    className="mt-4 max-w-md mx-auto"
                  >
                    <CompanyCard company={selectedCompany} compact />
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.section>
        )}
      </AnimatePresence>

      {/* 推荐企业 */}
      <section className="px-6 py-12 md:py-16">
        <div className="max-w-5xl mx-auto">
          <motion.h2 {...fadeUp} className="hero-title text-3xl md:text-5xl text-center">
            重点推荐<span className="text-orange-500">.</span>
          </motion.h2>
          <motion.p {...fadeUp} className="mt-3 text-center text-slate-500">
            按 {majors.find(m => m.id === major)?.name} 方向为你精选
          </motion.p>
          <div className="mt-8 grid md:grid-cols-2 gap-5">
            {top6.map((c, i) => (
              <CompanyCard key={c.id} company={c} index={i} />
            ))}
          </div>
          <div className="mt-8 text-center">
            <Link href="/companies" className="inline-block px-8 py-3.5 rounded-full bg-slate-900 text-white font-black text-sm hover:scale-105 transition-transform shadow-lg">
              进入企业库查看全部 {companies.length} 家
            </Link>
          </div>
        </div>
      </section>

      {/* 职业方向 */}
      <section className="px-6 py-12 md:py-16">
        <div className="max-w-5xl mx-auto">
          <motion.h2 {...fadeUp} className="hero-title text-3xl md:text-5xl text-center">
            12 条职业方向<span className="text-blue-500">，点它直接看岗位</span>
          </motion.h2>
          <motion.p {...fadeUp} className="mt-3 text-center text-slate-500">
            每个方向都附带 BOSS直聘 / 前程无忧 / 智联 / 猎聘 实时搜索入口
          </motion.p>
          <div className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { t: "数码印刷操作", k: "数码印刷", s: "5-8K" },
              { t: "印前制作", k: "印前制作", s: "5-7K" },
              { t: "包装结构设计", k: "包装结构设计", s: "6-12K" },
              { t: "包装/平面设计", k: "包装设计师", s: "5-10K" },
              { t: "色彩管理", k: "色彩管理", s: "6-10K" },
              { t: "品质工程师", k: "印刷 品质工程师", s: "5-8K" },
              { t: "外贸业务", k: "印刷 外贸业务", s: "4-6K+提成" },
              { t: "新媒体运营", k: "印刷 新媒体运营", s: "4-8K" },
              { t: "设备工程师", k: "数码印刷设备", s: "6-12K" },
              { t: "销售/客户经理", k: "印刷 销售", s: "4-6K+提成" },
              { t: "生产计划PMC", k: "印刷 PMC", s: "5-7K" },
              { t: "印后工艺", k: "印后加工", s: "5-7K" },
            ].map((j, i) => (
              <motion.a
                key={j.t}
                href={`https://www.zhipin.com/web/geek/job?query=${encodeURIComponent(j.k)}`}
                target="_blank"
                rel="noreferrer"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.04 }}
                whileHover={{ scale: 1.05, y: -4 }}
                className="glass rounded-2xl p-4 text-center cursor-pointer block"
              >
                <p className="font-black text-sm text-slate-800">{j.t}</p>
                <p className="mt-1 text-xs text-orange-500 font-bold">{j.s}</p>
                <p className="mt-2 text-[10px] text-slate-400 font-bold">BOSS直聘实时岗位</p>
              </motion.a>
            ))}
          </div>
        </div>
      </section>

      {/* 底部 */}
      <footer className="px-6 py-10 text-center">
        <p className="text-xs text-slate-400">
          数据更新于 {companiesData.updated} · 招聘平台岗位数据实时 · 考证时间以官方公告为准
        </p>
      </footer>
    </div>
  );
}
