"use client";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { backupCatalog } from "@/lib/career/backup";
import { validateCatalog } from "@/lib/career/validation";
import {
  readSelection,
  saveSelection,
  validateSelection,
  type Selection,
} from "@/lib/career/onboarding";
import { workspaceTemplate } from "@/lib/career/workspace";
import type { CareerQuery, OpportunityResponse } from "@/lib/career/types";
import { useUserData } from "@/lib/store";
import { getSupabase } from "@/lib/supabase";
import { mergeOpportunityResults } from "@/lib/career/workspace-results";
function useWorkspace() {
  const { user, loaded, update } = useUserData();
  const owner = user?.id ?? null;
  const [catalog, setCatalog] = useState(backupCatalog);
  const [selection, setSelection] = useState<{
    owner: string | null;
    value: Selection | null;
  } | null>(null);
  const [editing, setEditing] = useState(false);
  const [dismissed, setDismissed] = useState<string | null>(null);
  const profile = loaded && selection?.owner === owner ? selection.value : null;
  const query: CareerQuery = profile ?? { major: "", grade: "" };
  const signature = JSON.stringify([
    owner,
    query.major.trim().toLowerCase(),
    query.grade,
  ]);
  const currentSignature = useRef(signature);
  useEffect(() => {
    currentSignature.current = signature;
  }, [signature]);
  const [result, setResult] = useState<{
    signature: string;
    data: OpportunityResponse;
  } | null>(null);
  const [status, setStatus] = useState({
    signature: "",
    busy: false,
    error: "",
  });
  const controller = useRef<AbortController | null>(null);
  useEffect(() => {
    let active = true;
    queueMicrotask(() => {
      if (active && loaded) {
        let value: Selection | null = null;
        try {
          value = readSelection(localStorage, owner);
        } catch {}
        setSelection({ owner, value });
      }
    });
    return () => {
      active = false;
    };
  }, [owner, loaded]);
  useEffect(() => {
    const abort = new AbortController();
    void fetch("/api/catalog/", { signal: abort.signal })
      .then((r) => r.json())
      .then((j) => setCatalog(validateCatalog(j.catalog)))
      .catch(() => {});
    return () => abort.abort();
  }, []);
  const setQuery = useCallback(
    (q: CareerQuery) => {
      const value = validateSelection(q);
      if (!value || !loaded) return;
      const nextSignature = JSON.stringify([
        owner,
        value.major.trim().toLowerCase(),
        value.grade,
      ]);
      if (nextSignature !== signature) controller.current?.abort();
      setSelection({ owner, value });
      try {
        saveSelection(localStorage, owner, value);
      } catch {}
      update((d) => ({ ...d, profile: { ...d.profile, ...value } }));
      setEditing(false);
    },
    [loaded, owner, signature, update],
  );
  const request = useCallback(
    async (force = false, search = false) => {
      if (!query.major) return;
      controller.current?.abort();
      const abort = new AbortController();
      controller.current = abort;
      const target = signature;
      setStatus({ signature: target, busy: true, error: "" });
      const timeout = setTimeout(() => abort.abort("timeout"), 65000);
      try {
        const sb = getSupabase();
        const session =
          search && sb ? (await sb.auth.getSession()).data.session : null;
        const params = new URLSearchParams({
          major: query.major,
          grade: query.grade,
          ...(force ? { refresh: "1" } : {}),
        });
        const r = await fetch(
          `/api/opportunities/${search ? "" : `?${params}`}`,
          {
            method: search ? "POST" : "GET",
            cache: "no-store",
            signal: abort.signal,
            headers: search
              ? {
                  "Content-Type": "application/json",
                  ...(session
                    ? { Authorization: `Bearer ${session.access_token}` }
                    : {}),
                }
              : undefined,
            body: search
              ? JSON.stringify({ major: query.major, grade: query.grade })
              : undefined,
          },
        );
        if (!r.ok)
          throw Error(
            r.status === 401
              ? "登录后可以搜索更多公告。"
              : r.status === 429
                ? "查询较多，请稍后再试。"
                : "公开来源暂时不可用，请稍后更新资料。",
          );
        const data: OpportunityResponse = await r.json();
        if (!abort.signal.aborted && currentSignature.current === target) {
          setResult((previous) => ({
            signature: target,
            data: mergeOpportunityResults(
              previous?.signature === target ? previous.data : null,
              data,
            ),
          }));
          setStatus({ signature: target, busy: false, error: "" });
        }
      } catch (error) {
        if (
          currentSignature.current === target &&
          (!abort.signal.aborted || abort.signal.reason === "timeout")
        )
          setStatus({
            signature: target,
            busy: false,
            error:
              abort.signal.reason === "timeout"
                ? "读取时间较长，请稍后重试。"
                : error instanceof Error
                  ? error.message
                  : "暂时无法读取资料。",
          });
      } finally {
        clearTimeout(timeout);
      }
    },
    [query.major, query.grade, signature],
  );
  useEffect(() => {
    let active = true;
    queueMicrotask(() => {
      if (active) void request();
    });
    const visible = () => {
      if (document.visibilityState === "visible") void request();
    };
    const timer = setInterval(visible, 15 * 60 * 1000);
    document.addEventListener("visibilitychange", visible);
    return () => {
      active = false;
      controller.current?.abort();
      clearInterval(timer);
      document.removeEventListener("visibilitychange", visible);
    };
  }, [request]);
  const opportunities = result?.signature === signature ? result.data : null;
  return {
    catalog,
    query,
    setQuery,
    profile,
    ready: loaded && selection?.owner === owner,
    workspace: workspaceTemplate(query, catalog),
    opportunities,
    loading: status.signature === signature && status.busy,
    message:
      (status.signature === signature ? status.error : "") ||
      (opportunities?.message?.includes("不可读") ||
      opportunities?.message?.includes("无法读取")
        ? opportunities.message
        : ""),
    checkedAt: opportunities?.checkedAt ?? "",
    mode: "workspace",
    refresh: (force = false) => request(force),
    searchMore: () => request(false, true),
    guideOpen:
      editing ||
      (loaded &&
        selection?.owner === owner &&
        !profile &&
        dismissed !== (owner ?? "guest")),
    openGuide: () => setEditing(true),
    closeGuide: () => {
      setEditing(false);
      setDismissed(owner ?? "guest");
    },
  };
}
const Context = createContext<ReturnType<typeof useWorkspace> | null>(null);
export function CareerProvider({ children }: { children: React.ReactNode }) {
  const value = useWorkspace();
  return <Context.Provider value={value}>{children}</Context.Provider>;
}
export function useCareerCatalog() {
  const context = useContext(Context);
  if (!context) throw Error("CareerProvider required");
  return context;
}
