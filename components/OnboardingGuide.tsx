"use client";
import { useEffect, useRef, useState } from "react";
import { useCareerCatalog } from "./CareerProvider";
import { yearLabel, validateSelection } from "@/lib/career/onboarding";
export function trapDialogFocus(event: React.KeyboardEvent<HTMLDialogElement>) {
  if (event.key !== "Tab") return;
  const nodes = Array.from(
    event.currentTarget.querySelectorAll<HTMLElement>(
      'button:not(:disabled), input:not(:disabled), select:not(:disabled), textarea:not(:disabled), a[href], [tabindex="0"]',
    ),
  ).filter((node) => node.getClientRects().length > 0);
  const first = nodes[0];
  const last = nodes.at(-1);
  if (event.shiftKey && document.activeElement === first) {
    event.preventDefault();
    last?.focus();
  } else if (!event.shiftKey && document.activeElement === last) {
    event.preventDefault();
    first?.focus();
  }
}
export default function OnboardingGuide() {
  const { guideOpen, closeGuide, query, setQuery } = useCareerCatalog();
  const dialog = useRef<HTMLDialogElement>(null);
  const [step, setStep] = useState(1);
  const [major, setMajor] = useState("");
  const [grade, setGrade] = useState("");
  const validMajor = !!validateSelection({ major, grade: "1" });
  useEffect(() => {
    if (guideOpen)
      dialog.current
        ?.querySelector<HTMLElement>(
          step === 1 ? "input" : ".year-options button",
        )
        ?.focus();
  }, [step, guideOpen]);
  useEffect(() => {
    if (!guideOpen) return;
    const node = dialog.current;
    if (!node) return;
    const previous = document.activeElement as HTMLElement | null;
    const overflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    node.showModal();
    return () => {
      node.close();
      document.body.style.overflow = overflow;
      previous?.focus();
    };
  }, [guideOpen]);
  useEffect(() => {
    if (guideOpen)
      queueMicrotask(() => {
        setMajor(query.major);
        setGrade(query.grade);
        setStep(1);
      });
  }, [guideOpen, query.major, query.grade]);
  return (
    <dialog
      ref={dialog}
      onKeyDown={trapDialogFocus}
      className="guide-dialog"
      aria-labelledby="guide-heading"
      onCancel={closeGuide}
      onClick={(e) => {
        if (e.target === e.currentTarget) closeGuide();
      }}
    >
      <div className="guide-content">
        <button
          className="dialog-close"
          aria-label="关闭引导"
          onClick={closeGuide}
        >
          ×
        </button>
        <p className="eyebrow">开始你的职景 · {step} / 2</p>
        <h2 id="guide-heading">
          {step === 1 ? "你正在读什么专业" : "你现在读大几"}
        </h2>
        <p className="muted">按专业和年级整理实习机会、行业方向和准备事项</p>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (step === 1 && validMajor) setStep(2);
            else if (grade) setQuery({ major, grade });
          }}
        >
          {step === 1 ? (
            <>
              <label className="field-label" htmlFor="guide-major">
                你的专业
              </label>
              <input
                id="guide-major"
                autoFocus
                required
                maxLength={80}
                className="career-input"
                value={major}
                onChange={(e) => setMajor(e.target.value)}
                placeholder="输入你的专业名称"
              />
              <div className="suggestions">
                {["数字印刷工程", "印尼语", "数字媒体", "软件工程"].map((m) => (
                  <button type="button" key={m} onClick={() => setMajor(m)}>
                    {m}
                  </button>
                ))}
              </div>
              <p className="fine-print">也可以填写其他专业，以上只是例子。</p>
              {!!major.trim() && !validMajor && (
                <p role="alert" className="fine-print">
                  请填写专业名称，可使用文字、数字、空格和括号。
                </p>
              )}
              <button
                className="career-primary guide-next"
                disabled={!validMajor}
              >
                下一步 →
              </button>
            </>
          ) : (
            <>
              <div className="year-options">
                {["1", "2", "3", "4"].map((g, i) => (
                  <button
                    type="button"
                    key={g}
                    aria-pressed={grade === g}
                    onClick={() => setGrade(g)}
                  >
                    <strong>{yearLabel(g)}</strong>
                    <span>
                      {["了解方向", "积累经历", "寻找实习", "求职准备"][i]}
                    </span>
                  </button>
                ))}
              </div>
              <div className="guide-actions">
                <button
                  type="button"
                  className="career-secondary"
                  onClick={() => setStep(1)}
                >
                  上一步
                </button>
                <button className="career-primary" disabled={!grade}>
                  进入我的工作台
                </button>
              </div>
            </>
          )}
        </form>
      </div>
    </dialog>
  );
}
