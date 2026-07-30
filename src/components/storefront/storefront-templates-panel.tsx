"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { StorefrontTemplatePicker } from "@/components/storefront/storefront-template-picker";
import { useResetStorefrontDraft, useStorefrontDraft } from "@/hooks/use-storefront-draft";
import { usePublishedStorefront } from "@/hooks/use-storefront-publish";
import { getStoredAuthSession } from "@/lib/auth-login-storage";
import {
  getChosenStorefrontTemplateId,
  markStorefrontTemplateChosen,
} from "@/lib/storefront-template-setup";

type StorefrontTemplatesPanelProps = {
  workspaceId: string;
};

export function StorefrontTemplatesPanel({
  workspaceId,
}: StorefrontTemplatesPanelProps) {
  const router = useRouter();
  const [signedIn, setSignedIn] = useState(false);
  const [authReady, setAuthReady] = useState(false);
  const [activeTemplateId, setActiveTemplateId] = useState<string | null>(null);

  useEffect(() => {
    setSignedIn(Boolean(getStoredAuthSession()?.accessToken));
    setAuthReady(true);
  }, []);

  useEffect(() => {
    setActiveTemplateId(getChosenStorefrontTemplateId(workspaceId));
  }, [workspaceId]);

  const draftQuery = useStorefrontDraft(workspaceId, signedIn);
  const publishedQuery = usePublishedStorefront(workspaceId, signedIn);
  const resetMutation = useResetStorefrontDraft(workspaceId);

  useEffect(() => {
    if (!signedIn) return;
    if (draftQuery.isLoading || publishedQuery.isLoading) return;

    const chosen = getChosenStorefrontTemplateId(workspaceId);
    if (chosen) {
      setActiveTemplateId(chosen);
      return;
    }

    const fromDraft =
      draftQuery.data?.config.templateId ??
      draftQuery.data?.draft.templateId ??
      null;

    if (publishedQuery.data && fromDraft) {
      markStorefrontTemplateChosen(workspaceId, String(fromDraft));
      setActiveTemplateId(String(fromDraft));
    }
  }, [
    signedIn,
    workspaceId,
    draftQuery.isLoading,
    draftQuery.data,
    publishedQuery.isLoading,
    publishedQuery.data,
  ]);

  async function handleApply(input: {
    templateId: string;
    templateVersion: number;
  }) {
    if (activeTemplateId === input.templateId) {
      toast.message("This template is already selected");
      return;
    }

    try {
      await resetMutation.mutateAsync({
        templateId: input.templateId,
        templateVersion: input.templateVersion,
      });
      markStorefrontTemplateChosen(workspaceId, input.templateId);
      setActiveTemplateId(input.templateId);
      toast.success("Template applied", {
        description: "Opening My Store so you can customize it.",
      });
      router.push(`/dashboard/${workspaceId}?section=storefront`);
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Could not apply the storefront template.",
      );
    }
  }

  if (!authReady) {
    return (
      <div className="flex flex-1 items-center justify-center px-6 py-16 font-sans text-sm text-muted-foreground">
        Loading templates…
      </div>
    );
  }

  if (!signedIn) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-3 px-6 py-16 text-center">
        <h2 className="font-serif text-2xl font-light text-primary-blue">
          Sign in required
        </h2>
        <Link
          href="/signin"
          className="mt-2 font-sans text-sm font-semibold text-primary-blue underline"
        >
          Go to sign in
        </Link>
      </div>
    );
  }

  if (draftQuery.isLoading || publishedQuery.isLoading) {
    return (
      <div className="flex flex-1 items-center justify-center px-6 py-16 font-sans text-sm text-muted-foreground">
        Loading templates…
      </div>
    );
  }

  return (
    <StorefrontTemplatePicker
      workspaceId={workspaceId}
      activeTemplateId={activeTemplateId}
      replacingExisting={Boolean(activeTemplateId)}
      isApplying={resetMutation.isPending}
      onCancel={
        activeTemplateId
          ? () => {
              router.push(`/dashboard/${workspaceId}?section=storefront`);
            }
          : undefined
      }
      onApply={handleApply}
    />
  );
}
