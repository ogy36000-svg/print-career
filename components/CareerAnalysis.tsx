"use client";
import { useState } from "react";
import { careerAdvice, promotionScenario } from "@/lib/career/engine";
import { useCareerCatalog } from "./CareerProvider";
export default function CareerAnalysis() {
  const {query,catalog} = useCareerCatalog(); const advice = careerAdvice(query,catalog);
  const [roleId,setRoleId] = useState("");const role = advice.roles.find(r => r.id === roleId) ?? advice.roles[0];
  return <section id="career-analysis" className="glass-strong rounded-3xl p-5 md:p-7">
    <p className="section-kicker">CAREER LENS · 职业研究</p><h2 className="mt-2 text-2xl font-black">不只找第一份实习。</h2>
    <p className="mt-3 text-sm text-slate-600">路径是一般方向分析，不是企业的晋升承诺。具体年限、名额、待遇与培养机制，需要公开公告或企业确认。</p>
    <div className="mt-4 flex flex-wrap gap-2">{advice.roles.map(r => <button key={r.id} onClick={() => setRoleId(r.id)} className={`research-tab ${role?.id === r.id ? "selected" : ""}`}>{r.title}</button>)}</div>
    {role ? <div className="mt-5"><h3 className="text-lg font-black">{role.title}</h3><p className="mt-2 text-sm leading-relaxed text-slate-600">{role.environment}</p><div className="mt-4 grid md:grid-cols-2 gap-4">{[{title:"技术路线",steps:role.technicalPath},{title:"管理路线",steps:role.managementPath}].map(p => <div key={p.title} className="rounded-2xl bg-slate-50 p-4"><h4 className="font-bold text-sm">{p.title}</h4><ol className="mt-3 space-y-2">{p.steps.map((s,i) => <li key={s} className="flex gap-2 text-sm text-slate-600"><span className="text-emerald-700 font-bold">{i+1}.</span>{s}</li>)}</ol></div>)}</div><h4 className="mt-4 font-bold text-sm">接受实习前，需要问清</h4><ul className="mt-2 space-y-2 text-sm text-slate-600">{role.bottlenecks.map(b => <li key={b}>• {b}</li>)}</ul><p className="mt-4 text-sm text-slate-700">学习与考研：{role.study}</p><div className="mt-3 flex flex-wrap gap-3">{role.sourceUrls.map((url,i) => <a key={url} href={url} target="_blank" rel="noreferrer" className="text-xs text-blue-700 underline">背景参考 {i+1} ↗</a>)}</div><p className="mt-2 text-xs text-slate-400">路径与问题清单是一般建议，不是来源对特定企业晋升的证明。</p></div> : <p className="mt-4 text-sm text-slate-500">目录尚未覆盖该专业，可以先联网查培养方案与真实岗位。</p>}
    <details className="mt-5 rounded-2xl border border-slate-200 p-4"><summary className="font-bold text-sm cursor-pointer">机长 / 班组编制情景工具（手动假设）</summary><PromotionCalculator /></details>
    <div className="mt-5 rounded-2xl bg-blue-50 p-4"><h3 className="font-bold">竞争与考研：先看证据，再定目标</h3><p className="mt-2 text-sm text-slate-600 leading-relaxed">专业培养方案、岗位学历要求、公开招录背景统计是三种不同证据。不能用大学排名推断录用概率，也不能由少数公示推断全部员工学校。</p>
      {advice.roles.some(r => ["traditional","digital","color"].includes(r.id)) && <p className="mt-2 text-sm text-slate-600">可从<a className="text-blue-700 underline" href="https://zhaosheng.xaut.edu.cn/zhuanyejieshao/yinshuabaozhuangyushuzimeitixueyuan/2017-04-10/76.html" target="_blank" rel="noreferrer">西安理工大学印刷工程专业介绍</a>比较课程训练。“武汉理工”与“武汉大学”需要核实准确学校和专业，不能混写。</p>}
      <ul className="mt-3 space-y-2 text-sm text-slate-600"><li>招录学校占比 / 人数：尚未取得可核验的汇总数据，不展示推测。</li><li>补强重点：真实项目、实训经历、问题分析、语言沟通，而非只增加证书数量。</li><li>考研比较：目标岗位是否要求硕士、研究方向、招生条件、成本与自身基础。</li></ul>
    </div>
  </section>;
}
function PromotionCalculator() {
  const [values,setValues] = useState({machines:"",shifts:"",leadersPerShift:"",occupied:""});
  const entries = [{key:"machines",label:"假设机器数量"},{key:"shifts",label:"每天运行班次"},{key:"leadersPerShift",label:"每台每班负责人"},{key:"occupied",label:"目前已占编制"}] as const;
  let result: ReturnType<typeof promotionScenario> | null = null;let error = "";
  if (values.machines && values.shifts && values.leadersPerShift) {
    try {result=promotionScenario({machines:Number(values.machines),shifts:Number(values.shifts),leadersPerShift:Number(values.leadersPerShift),occupied:values.occupied ? Number(values.occupied) : null});} catch {error="请输入有效整数，班次和每班负责人至少为1。";}
  }
  return <div><div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-3">{entries.map(e => <label key={e.key} className="text-xs font-bold text-slate-500">{e.label}<input className="career-input mt-2" type="number" min="0" max="10000" step="1" value={values[e.key]} onChange={v => setValues({...values,[e.key]:v.target.value})} /></label>)}</div><p className="mt-3 text-sm text-slate-600">{error || (result ? `假设编制：${result.slots}；假设空缺：${result.vacancies ?? "还缺已占编制数据"}。` : "参数未填写，无法估计编制。")}</p><p className="mt-2 text-xs text-amber-800">只按“机器 × 班次 × 每班负责人”演示。工厂可能多人带多机、共用负责人或另有储备编制，必须核实。退休时间与等待晋升年限无法由这些参数推导。</p></div>;
}
