"use client";

import { useSyncExternalStore } from "react";

export const INTERNAL_TRAFFIC_STORAGE_KEY = "gameting:internal-traffic";

function subscribe(callback: () => void) {
  window.addEventListener("storage", callback);
  return () => window.removeEventListener("storage", callback);
}

function getSnapshot() {
  try {
    return localStorage.getItem(INTERNAL_TRAFFIC_STORAGE_KEY) === "1";
  } catch {
    return false;
  }
}

export function InternalTrafficNotice() {
  const excluded = useSyncExternalStore(subscribe, getSnapshot, () => false);

  if (!excluded) return null;

  const enableAnalytics = () => {
    try {
      localStorage.removeItem(INTERNAL_TRAFFIC_STORAGE_KEY);
    } finally {
      window.location.reload();
    }
  };

  return (
    <aside className="fixed inset-x-3 bottom-3 z-[100] mx-auto flex max-w-md items-center justify-between gap-3 rounded-2xl border border-indigo-200 bg-white/95 px-4 py-3 text-sm shadow-xl backdrop-blur" role="status">
      <span className="font-semibold text-slate-700">내부 접속으로 표시되어 GA4 집계에서 제외 중입니다.</span>
      <button
        type="button"
        onClick={enableAnalytics}
        className="shrink-0 rounded-xl bg-indigo-600 px-3 py-2 text-xs font-black text-white hover:bg-indigo-700"
      >
        측정 다시 켜기
      </button>
    </aside>
  );
}
