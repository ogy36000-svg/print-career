"use client";
import { useEffect, useRef, useState } from "react";
import { useCareerCatalog } from "./CareerProvider";
import { yearLabel } from "@/lib/career/onboarding";
import { trapDialogFocus } from "./OnboardingGuide";
export default function LetterWidget() {
  const { profile, workspace } = useCareerCatalog();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    if (!open) return;
    const node = ref.current;
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
  }, [open]);
  if (!profile) return null;
  return (
    <>
      <button className="letter-trigger" onClick={() => setOpen(true)}>
        一张小笺 ↗
      </button>
      <dialog
        ref={ref}
        onKeyDown={trapDialogFocus}
        className="letter-paper"
        aria-labelledby="letter-title"
        onCancel={() => setOpen(false)}
        onClick={(e) => {
          if (e.target === e.currentTarget) setOpen(false);
        }}
      >
        <button
          className="dialog-close"
          aria-label="关闭小笺"
          onClick={() => setOpen(false)}
        >
          ×
        </button>
        <p className="eyebrow">写给 {yearLabel(profile.grade)}的你</p>
        <h2 id="letter-title">给下一步留一点时间</h2>
        <p>学{profile.major}，可以先从一件具体的事开始。</p>
        <p>
          {workspace.nextSteps[0] ??
            "选一份感兴趣的岗位公告，记下工作内容和你想问的问题。"}
        </p>
        <p>
          浏览公告时，把感兴趣的职责、需要准备的作品和不确定的问题记下来。一次做好一小步，就有了下次继续的起点。
        </p>
        <p className="letter-signature">职景</p>
        <button className="career-secondary" onClick={() => setOpen(false)}>
          收起小笺
        </button>
      </dialog>
    </>
  );
}
