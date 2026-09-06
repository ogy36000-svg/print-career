# 印向未来 · 数字印刷实习求职导航

为广州科技职业技术大学 24级数字印刷本科定制的个人实习求职网站。

## 功能
- **首页**：定位、数据总览、S级推荐、12条职业方向
- **企业库**：49 家精选企业，搜索 + 等级/地区/类型筛选 + 收藏 + 招聘平台实时搜索直达
- **企业详情**：简介、岗位、技能要求、语言/海外机会、投递状态标记
- **企业地图**：高德地图标注（未配 Key 时为分组列表 + 高德跳转）
- **我的档案**：信息/技能/证书/语言/意向，本地存储 + Supabase 同步码云同步
- **成长中心**：毕业倒计时、技能清单、证书时间线、个性化匹配推荐、目标企业追踪

## 本地运行
```bash
npm install
npm run dev
```

## 配置（均可选，不配也能用）
复制 `.env.example` 为 `.env.local` 填入：
- `NEXT_PUBLIC_SUPABASE_URL` / `NEXT_PUBLIC_SUPABASE_ANON_KEY`：云端同步。Supabase 建项目后在 SQL Editor 执行 `supabase/schema.sql`
- `NEXT_PUBLIC_AMAP_KEY`：高德开发者平台（lbs.amap.com）创建「Web端(JS API)」应用获取

## 部署
推送到 GitHub 后在 Vercel 一键导入，环境变量在 Vercel 项目设置里同样配置即可。

## 数据更新
`data/companies.json` / `data/jobs.json` 为精选数据库（附来源），更新后推送即自动重新部署。
