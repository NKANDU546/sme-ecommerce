"use client";

import { useEffect, useState } from "react";
import { StorefrontTemplateView } from "@/components/storefront/storefront-template-view";
import { loadStorefront } from "@/lib/storefront-storage";
import type { StorefrontConfig } from "@/types/storefront";

type PreviewClientProps = {
  workspaceId: string;
};

export function PreviewClient({ workspaceId }: PreviewClientProps) {
  const [config, setConfig] = useState<StorefrontConfig | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setConfig(loadStorefront(workspaceId));
    setReady(true);
  }, [workspaceId]);

  if (!ready) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background font-sans text-sm text-muted-foreground">
        Loading…
      </div>
    );
  }

  if (!config) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-3 bg-background px-6 text-center">
        <h1 className="font-serif text-2xl text-primary-blue">
          No storefront in this browser
        </h1>
        <p className="max-w-md font-sans text-sm text-muted-foreground">
          Open the dashboard for this workspace, go to{" "}
          <strong>Storefront</strong>, and choose{" "}
          <strong>Use default template</strong>. Previews read from local
          storage on this device only.
        </p>
        <a
          href={`/dashboard/${workspaceId}`}
          className="mt-2 font-sans text-sm font-semibold text-primary-blue underline"
        >
          Go to dashboard
        </a>
      </div>
    );
  }

  return <StorefrontTemplateView config={config} />;
}
