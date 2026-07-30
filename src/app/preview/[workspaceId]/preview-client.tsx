"use client";

import Link from "next/link";
import { useStorefrontDraft } from "@/hooks/use-storefront-draft";
import { getStoredAuthSession } from "@/lib/auth-login-storage";
import { StorefrontTemplateView } from "@/components/storefront/storefront-template-view";

type PreviewClientProps = {
  workspaceId: string;
};

export function PreviewClient({ workspaceId }: PreviewClientProps) {
  const signedIn = Boolean(getStoredAuthSession()?.accessToken);
  const draftQuery = useStorefrontDraft(workspaceId, signedIn);

  if (!signedIn) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-3 bg-background px-6 text-center">
        <h1 className="font-serif text-2xl text-primary-blue">
          Sign in to preview
        </h1>
        <p className="max-w-md font-sans text-sm text-muted-foreground">
          Draft storefront previews load from the backend and require a merchant
          session.
        </p>
        <Link
          href="/signin"
          className="mt-2 font-sans text-sm font-semibold text-primary-blue underline"
        >
          Go to sign in
        </Link>
      </div>
    );
  }

  if (draftQuery.isLoading || draftQuery.isFetching) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background font-sans text-sm text-muted-foreground">
        Loading draft preview…
      </div>
    );
  }

  if (draftQuery.isError || !draftQuery.data) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-3 bg-background px-6 text-center">
        <h1 className="font-serif text-2xl text-primary-blue">
          No storefront draft
        </h1>
        <p className="max-w-md font-sans text-sm text-muted-foreground">
          {draftQuery.error instanceof Error
            ? draftQuery.error.message
            : "Open the dashboard Storefront section to create or repair this draft."}
        </p>
        <Link
          href={`/dashboard/${workspaceId}?section=storefront`}
          className="mt-2 font-sans text-sm font-semibold text-primary-blue underline"
        >
          Go to dashboard
        </Link>
      </div>
    );
  }

  return (
    <StorefrontTemplateView
      config={draftQuery.data.config}
      workspaceId={workspaceId}
    />
  );
}
