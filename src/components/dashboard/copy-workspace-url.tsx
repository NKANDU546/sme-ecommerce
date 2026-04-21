"use client";

import { useState } from "react";

type CopyWorkspaceUrlProps = {
  workspaceId: string;
};

export function CopyWorkspaceUrl({ workspaceId }: CopyWorkspaceUrlProps) {
  const [state, setState] = useState<"idle" | "copied" | "error">("idle");

  async function copy() {
    try {
      const url =
        typeof window !== "undefined"
          ? `${window.location.origin}/dashboard/${workspaceId}`
          : `/dashboard/${workspaceId}`;
      await navigator.clipboard.writeText(url);
      setState("copied");
      setTimeout(() => setState("idle"), 2000);
    } catch {
      setState("error");
      setTimeout(() => setState("idle"), 2000);
    }
  }

  return (
    <button
      type="button"
      onClick={copy}
      className="shrink-0 rounded border border-primary-blue/20 bg-white px-3 py-1.5 font-sans text-xs font-medium text-primary-blue transition-colors hover:bg-blue-gray/40"
    >
      {state === "copied"
        ? "Copied"
        : state === "error"
          ? "Copy failed"
          : "Copy link"}
    </button>
  );
}
