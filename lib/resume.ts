"use client";

import { skillPool, certPool, directionPool } from "./data";

export interface ResumeResult {
  phone?: string;
  email?: string;
  english?: string;
  japanese?: string;
  skills: string[];
  certs: string[];
  directions: string[];
  textLength: number;
}

/** 从文件中提取纯文本（PDF 用 pdf.js 本地解析，全程不上传服务器） */
export async function extractText(file: File): Promise<string> {
  const name = file.name.toLowerCase();
  if (name.endsWith(".txt") || name.endsWith(".md")) {
    return await file.text();
  }
  if (name.endsWith(".pdf")) {
    const pdfjs = await import("pdfjs-dist");
    const base = typeof window !== "undefined" && window.location.pathname.startsWith("/print-career") ? "/print-career" : "";
    pdfjs.GlobalWorkerOptions.workerSrc = `${base}/pdf.worker.min.mjs`;
    const buf = await file.arrayBuffer();
    const pdf = await pdfjs.getDocument({ data: buf }).promise;
    let text = "";
    for (let i = 1; i <= Math.min(pdf.numPages, 5); i++) {
      const page = await pdf.getPage(i);
      const content = await page.getTextContent();
      text += content.items.map((it) => ("str" in it ? it.str : "")).join(" ") + "\n";
    }
    return text;
  }
  throw new Error("暂支持 PDF / TXT / MD 格式；Word 请先另存为 PDF 再上传");
}

/** 从简历文本中识别关键信息 */
export function analyzeResume(text: string): ResumeResult {
  const compact = text.replace(/\s+/g, " ");
  const result: ResumeResult = { skills: [], certs: [], directions: [], textLength: text.length };

  // 电话 / 邮箱
  const phone = compact.match(/1[3-9]\d{9}/);
  if (phone) result.phone = phone[0];
  const email = compact.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/);
  if (email) result.email = email[0];

  // 英语等级（取最高）
  if (/六级|CET[-\s]?6|CET[-\s]?6级/i.test(compact)) result.english = "CET-6";
  else if (/四级|CET[-\s]?4/i.test(compact)) result.english = "CET-4";

  // 日语等级（取最高）
  const jp = compact.match(/N[1-5]/gi);
  if (jp) {
    const best = Math.min(...jp.map((s) => parseInt(s.slice(1), 10)));
    result.japanese = best <= 2 ? `N${best}` : best === 3 ? "N3" : "N5-N4";
  }

  // 技能关键词命中
  result.skills = skillPool.filter((s) => compact.includes(s));
  // 常见技能别名补充
  const aliases: [RegExp, string][] = [
    [/photoshop|\bps\b/i, "Photoshop"],
    [/illustrator|\bai\b/i, "Illustrator"],
    [/indesign/i, "InDesign"],
    [/artioscad|雅图cad/i, "ArtiosCAD"],
    [/剪映|premiere|\bpr\b/i, "短视频拍摄剪辑"],
  ];
  for (const [re, name] of aliases) {
    if (re.test(compact) && skillPool.includes(name) && !result.skills.includes(name)) result.skills.push(name);
  }

  // 证书命中
  result.certs = certPool.filter((c) => {
    if (/JLPT|日语/.test(c) && result.japanese) return true;
    if (/英语|CET/.test(c) && result.english) return true;
    if (/计算机/.test(c) && /计算机二级|NCRE/i.test(compact)) return true;
    if (/普通话/.test(c) && /普通话/.test(compact)) return true;
    if (/Adobe/i.test(c) && /Adobe认证|ACP/.test(compact)) return true;
    if (/G7/i.test(c) && /G7/.test(compact)) return true;
    if (/印前制作员|平版印刷工/.test(c) && /印前制作员|平版印刷工/.test(compact)) return true;
    return false;
  });

  // 意向方向命中
  result.directions = directionPool.filter((d) => {
    const keys = d.split(/[（(/]/)[0];
    return keys.length >= 2 && compact.includes(keys);
  });

  return result;
}
