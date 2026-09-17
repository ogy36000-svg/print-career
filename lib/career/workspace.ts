import type { CareerCatalog, CareerQuery, CareerWorkspace } from "./types";
import { careerAdvice, resolveMajor } from "./engine";

export function workspaceTemplate(query: CareerQuery, catalog: CareerCatalog): CareerWorkspace {
  const major = resolveMajor(query.major, catalog);
  const advice = careerAdvice(query, catalog);
  const stage = ({"1":"认识方向","2":"积累项目","3":"实习准备","4":"投递与选择"} as Record<string,string>)[query.grade] ?? "实习准备";
  const context: Record<string,{industry:string[];globalOutlook:string[];project:string}> = {
    printing: {industry:["数字印刷、印前与色彩管理","包装、材料与质量工程","设备商、工业打印及传统工厂：分别核实现场与班制"],globalOutlook:["研究喷墨、UV与工业打印应用，关注可复现的工艺验证","包装供应链有海外业务；具体语言与派驻条件逐条核实"],project:"做一份文件预检、色差控制或包装打样案例"},
    indonesian: {industry:["翻译与产品本地化","国际运营、生产计划与跨境商务","东南亚地区知识与国际沟通"],globalOutlook:["结合印度尼西亚语言、东南亚地区知识和业务实践","海外出差与派驻需核实合同、指导与保障；学校培养模式按本届确认"],project:"完成一份双语翻译或东南亚商务案例，记录术语与资料来源"},
    "digital-media": {industry:["视觉设计与视频、动画制作","交互原型、数字产品与互动展示","媒体项目制作与作品授权"],globalOutlook:["用可展示的视觉或互动项目研究数字媒体应用","本地化、可访问性和作品版权是跨地区项目的实际议题"],project:"完成一个视觉叙事、视频或可运行交互原型并记录反馈"},
  };
  const selected = major ? context[major.id] : null;
  return {majorId:major?.id ?? null,label:major?.label ?? query.major,stage,
    introduction:`${major?.label ?? query.major} · ${stage}。从岗位日常与项目证据安排下一步。`,
    industry:selected?.industry ?? advice.roles.map(r=>r.title),directions:advice.roles,
    nextSteps:[...advice.plan,...(selected ? [selected.project] : [])],
    globalOutlook:selected?.globalOutlook ?? ["从公开公告和行业资料了解地区、职责与培养安排，再作选择。"],certificates:advice.certificates};
}
