"use client";

import { useState } from "react";

export function CopyButton({ code }: { code: string }) {
  const [copied, setCopied] = useState(false);

  async function copy() {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // noop
    }
  }

  return (
    <button
      type="button"
      onClick={copy}
      className="rounded-md border border-[var(--color-brand)] bg-white px-3 py-1 text-xs font-medium text-[var(--color-brand)] hover:bg-[var(--color-brand)] hover:text-white"
    >
      {copied ? "복사됨" : "복사"}
    </button>
  );
}
