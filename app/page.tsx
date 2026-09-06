"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { companies, jobs, companiesData } from "@/lib/data";
import CompanyCard from "@/components/CompanyCard";

const fadeUp = {
  initial: { opacity: 0, y: 30 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true },
};

const popIn = {
  initial: { opacity: 0, scale: 0.7, y: 20 },
  animate: { opacity: 1, scale: 1, y: 0 },
};

export default function Home() {
  const sCompanies = companies.filter((c) => c.recommend === "S");
  const cityCount = new Set(companies.map((c) => c.city)).size;

  return (
    <div className="overflow-x-clip">
      {/* ============ HERO ============ */}
      <section className="relative px-6 pt-14 pb-16 md:pt-24 md:pb-24">
        <div className="pointer-events-none absolute -top-20 -left-24 w-80 h-80 rounded-full bg-orange-300/40 blur-3xl animate-floaty" />
        <div className="pointer-events-none absolute top-10 -right-24 w-96 h-96 rounded-full bg-blue-300/40 blur-3xl animate-floaty" style={{ animationDelay: "-6s" }} />
        <div className="pointer-events-none absolute bottom-0 left-1/3 w-72 h-72 rounded-full bg-violet-300/30 blur-3xl animate-floaty" style={{ animationDelay: "-3s" }} />

        <div className="relative max-w-6xl mx-auto">
          <motion.p {...popIn} transition={{ type: "spring", stiffness: 200, damping: 16 }} className="inline-block text-xs md:text-sm font-black px-4 py-1.5 rounded-full bg-[#14161a] text-white tracking-widest">
            广州科技职业技术大学 · 24级数字印刷本科三班
          </motion.p>
          <motion.h1 {...popIn} transition={{ type: "spring", stiffness: 120, damping: 18, delay: 0.12 }} className="hero-title mt-5 text-5xl md:text-8xl">
            印向<span className="gradient-text">未来</span>
          </motion.h1>
          <motion.p {...popIn} transition={{ type: "spring", stiffness: 120, damping: 18, delay: 0.24 }} className="mt-5 max-w-2xl text-base md:text-xl text-slate-600 leading-relaxed">
            为你量身定制的<span className="font-black text-slate-900">印刷包装行业求职导航</span>——
            {companies.length} 家精选企业、{jobs.length} 条职业方向、一键直达各大招聘平台实时岗位。
            大三这一年，把每一步都走在点上。
          </motion.p>
          <motion.div {...popIn} transition={{ delay: 0.36 }} className="mt-8 flex flex-wrap gap-3">
            <Link href="/companies" className="px-7 py-3.5 rounded-full bg-[#14161a] text-white font-black text-sm md:text-base hover:scale-105 transition-transform shadow-xl shadow-slate-300">
              进入企业库 →
            </Link>
            <Link href="/growth" className="px-7 py-3.5 rounded-full bg-white ring-1 ring-black/10 font-black text-sm md:text-base hover:scale-105 transition-transform">
              看我这一年怎么准备
            </Link>
          </motion.div>
        </div>
      </section>

      {/* ============ 数据总览（滚动数字感） ============ */}
      <section className="px-6 py-10 bg-[#14161a] text-white rounded-t-[2.5rem]">
        <div className="max-w-6xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-6">
          {[
            { num: companies.length, unit: "家", label: "精选企业", color: "text-orange-400" },
            { num: jobs.length, unit: "条", label: "职业方向", color: "text-blue-400" },
            { num: cityCount, unit: "城", label: "覆盖城市", color: "text-cyan-400" },
            { num: 5, unit: "个", label: "招聘平台直达", color: "text-violet-400" },
          ].map((s, i) => (
            <motion.div key={s.label} {...fadeUp} transition={{ delay: i * 0.08 }} className="text-center md:text-left">
              <div className={`text-4xl md:text-6xl font-black ${s.color}`}>
                {s.num}<span className="text-xl md:text-2xl">{s.unit}</span>
              </div>
              <p className="mt-1 text-xs md:text-sm text-slate-400 font-bold">{s.label}</p>
            </motion.div>
          ))}
        </div>
        <p className="max-w-6xl mx-auto mt-6 text-[11px] text-slate-500">
          数据更新于 {companiesData.updated} · 来源：{companiesData.sources[0]}
        </p>
      </section>

      {/* ============ 企业名跑马灯 ============ */}
      <section className="bg-[#14161a] text-white pb-10 overflow-hidden">
        <div className="flex whitespace-nowrap animate-marquee gap-8 w-max">
          {[...companies, ...companies].map((c, i) => (
            <span key={i} className="text-slate-500 font-black text-lg">
              {c.name} <span className="text-orange-500 mx-2">✦</span>
            </span>
          ))}
        </div>
      </section>

      {/* ============ S级强烈推荐 ============ */}
      <section className="px-6 py-14 md:py-20 max-w-6xl mx-auto">
        <motion.h2 {...fadeUp} className="hero-title text-3xl md:text-5xl">
          重点锁定<span className="text-orange-500">.</span>
        </motion.h2>
        <motion.p {...fadeUp} className="mt-3 text-slate-500 md:text-lg">
          结合你的专业、区位（广州白云）、日语备考与校企合作资源，这 {sCompanies.length} 家优先级最高
        </motion.p>
        <div className="mt-8 grid md:grid-cols-2 gap-5">
          {sCompanies.map((c, i) => (
            <CompanyCard key={c.id} company={c} index={i} />
          ))}
        </div>
      </section>

      {/* ============ 职业方向 ============ */}
      <section className="px-6 py-14 bg-gradient-to-b from-white to-orange-50/60">
        <div className="max-w-6xl mx-auto">
          <motion.h2 {...fadeUp} className="hero-title text-3xl md:text-5xl">
            {jobs.length} 条方向<span className="text-blue-500">，</span>总有一条适合你
          </motion.h2>
          <motion.p {...fadeUp} className="mt-3 text-slate-500 md:text-lg">点任意方向，直接看岗位要求 + 跳招聘平台查实时岗位</motion.p>
          <div className="mt-8 grid grid-cols-2 md:grid-cols-3 gap-4">
            {jobs.map((j, i) => (
              <motion.div
                key={j.id}
                {...fadeUp}
                transition={{ delay: (i % 3) * 0.08 }}
                whileHover={{ scale: 1.03 }}
                className="bg-white rounded-3xl p-5 ring-1 ring-black/5 card-hover"
              >
                <span className="text-[11px] font-black px-2 py-0.5 rounded-full bg-gradient-to-r from-blue-500 to-cyan-500 text-white">{j.category}</span>
                <h3 className="mt-2 font-black text-base md:text-lg">{j.title}</h3>
                <p className="mt-1 text-xs text-orange-500 font-bold">{j.salary}</p>
                <p className="mt-2 text-xs text-slate-500 line-clamp-2 leading-relaxed">{j.requirements}</p>
                <div className="mt-3 flex flex-wrap gap-1">
                  {j.skills.slice(0, 3).map((s) => (
                    <span key={s} className="text-[10px] px-1.5 py-0.5 rounded bg-slate-100 text-slate-500 font-bold">{s}</span>
                  ))}
                </div>
                <a
                  href={`https://www.zhipin.com/web/geek/job?query=${encodeURIComponent(j.searchKeyword)}`}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-3 inline-block text-xs font-black text-blue-600 hover:underline"
                >
                  BOSS直聘查实时岗位 →
                </a>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ============ 使用指南 ============ */}
      <section className="px-6 py-14 md:py-20 max-w-6xl mx-auto">
        <motion.h2 {...fadeUp} className="hero-title text-3xl md:text-5xl">怎么用这座导航站<span className="text-violet-500">？</span></motion.h2>
        <div className="mt-8 grid md:grid-cols-4 gap-4">
          {[
            { step: "01", title: "逛企业库", desc: "按城市/等级/类型筛选，收藏心仪企业，一键跳招聘平台看它在招什么", href: "/companies", color: "from-orange-500 to-rose-500" },
            { step: "02", title: "看地图", desc: "企业分布一目了然，优先锁定广州本地与珠三角机会", href: "/map", color: "from-blue-500 to-cyan-500" },
            { step: "03", title: "填档案", desc: "录入技能、证书、语言水平，系统按匹配度重新给你排序推荐", href: "/profile", color: "from-violet-500 to-purple-500" },
            { step: "04", title: "盯成长", desc: "毕业倒计时+技能清单+投递追踪，把大三这一年用满", href: "/growth", color: "from-emerald-500 to-teal-500" },
          ].map((g, i) => (
            <motion.div key={g.step} {...fadeUp} transition={{ delay: i * 0.08 }}>
              <Link href={g.href} className="block group">
                <div className="bg-white rounded-3xl p-6 ring-1 ring-black/5 card-hover h-full">
                  <span className={`text-3xl font-black bg-gradient-to-r ${g.color} bg-clip-text text-transparent`}>{g.step}</span>
                  <h3 className="mt-3 font-black text-lg group-hover:text-orange-500 transition-colors">{g.title}</h3>
                  <p className="mt-2 text-sm text-slate-500 leading-relaxed">{g.desc}</p>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </section>

      <footer className="px-6 py-10 bg-[#14161a] text-center">
        <p className="text-slate-500 text-xs leading-relaxed">
          印向未来 · 个人实习求职导航 | 数据来源于公开渠道（{companiesData.sources.slice(0, 2).join("、")}等），岗位信息以各招聘平台实时页面为准
        </p>
      </footer>
    </div>
  );
}
