"use client";

import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { GoLiveModal } from "@/components/storefront/go-live-modal";
import { UnpublishModal } from "@/components/storefront/unpublish-modal";
import { useWorkspace } from "@/hooks/use-workspaces";
import {
  usePublishHistory,
  usePublishStorefront,
  usePublishedStorefront,
  useUnpublishStorefront,
} from "@/hooks/use-storefront-publish";

type StorefrontPublishControlsProps = {
  workspaceId: string;
  /** Flush pending draft autosave before publishing. */
  flushDraftSave: () => Promise<void>;
  hasUnsavedDraft: boolean;
};

/** Fixed locale/timezone so SSR and client render the same label. */
function formatPublishedAt(value: string | null | undefined): string | null {
  if (!value) return null;
  const ms = Date.parse(value);
  if (Number.isNaN(ms)) return value;
  return new Date(ms).toLocaleString("en-GB", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "UTC",
  });
}

function normalizeStatus(status: string | undefined): string {
  return (status ?? "DRAFT").toString().toUpperCase();
}

export function StorefrontPublishControls({
  workspaceId,
  flushDraftSave,
  hasUnsavedDraft,
}: StorefrontPublishControlsProps) {
  const [showHistory, setShowHistory] = useState(false);
  const [goLiveOpen, setGoLiveOpen] = useState(false);
  const [unpublishOpen, setUnpublishOpen] = useState(false);
  const [copyState, setCopyState] = useState<"idle" | "copied" | "error">(
    "idle",
  );
  const [origin, setOrigin] = useState("");

  useEffect(() => {
    setOrigin(window.location.origin);
  }, []);

  const workspaceQuery = useWorkspace(workspaceId);
  const publishedQuery = usePublishedStorefront(workspaceId);
  const historyQuery = usePublishHistory(workspaceId);
  const publishMutation = usePublishStorefront(workspaceId);
  const unpublishMutation = useUnpublishStorefront(workspaceId);

  const status = normalizeStatus(
    publishedQuery.data?.status ?? workspaceQuery.data?.status,
  );
  const isLive = status === "LIVE";
  const publicSlug =
    publishedQuery.data?.publicSlug ?? workspaceQuery.data?.publicSlug ?? null;

  function buildPublicStoreUrl(slug: string): string {
    return origin ? `${origin}/s/${slug}` : `/s/${slug}`;
  }

  const publicStoreUrl = publicSlug ? buildPublicStoreUrl(publicSlug) : null;
  const publishedAtLabel = formatPublishedAt(
    publishedQuery.data?.publishedAt ?? null,
  );

  const statusLabel = useMemo(() => {
    if (isLive) return "Live";
    if (status === "UNPUBLISHED") return "Unpublished";
    return "Draft";
  }, [isLive, status]);

  const statusClass = isLive
    ? "bg-emerald-50 text-emerald-800 ring-emerald-700/15"
    : status === "UNPUBLISHED"
      ? "bg-amber-50 text-amber-900 ring-amber-700/15"
      : "bg-blue-gray/50 text-primary-blue/70 ring-primary-blue/10";

  const busy = publishMutation.isPending || unpublishMutation.isPending;

  async function copyPublicLink() {
    if (!publicStoreUrl) return;
    try {
      await navigator.clipboard.writeText(publicStoreUrl);
      setCopyState("copied");
      toast.success("Store link copied");
      window.setTimeout(() => setCopyState("idle"), 2000);
    } catch {
      setCopyState("error");
      toast.error("Could not copy the store link");
      window.setTimeout(() => setCopyState("idle"), 2000);
    }
  }

  async function confirmPublish() {
    try {
      await flushDraftSave();
      const result = await publishMutation.mutateAsync({});
      setGoLiveOpen(false);

      const [published, workspace] = await Promise.all([
        publishedQuery.refetch(),
        workspaceQuery.refetch(),
      ]);
      const slug =
        published.data?.publicSlug ?? workspace.data?.publicSlug ?? null;
      const link = slug ? buildPublicStoreUrl(slug) : null;

      toast.success("Storefront is live", {
        description: link
          ? link
          : `Snapshot ${result.publishedSnapshotId.slice(0, 8)}… published.`,
        action: link
          ? {
              label: "Copy link",
              onClick: () => {
                void navigator.clipboard.writeText(link);
              },
            }
          : undefined,
      });
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Publish failed.",
      );
    }
  }

  async function confirmUnpublish() {
    try {
      await unpublishMutation.mutateAsync();
      setUnpublishOpen(false);
      toast.success("Storefront unpublished");
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Unpublish failed.",
      );
    }
  }

  const canUnpublish =
    Boolean(publishedQuery.data) && status !== "UNPUBLISHED";

  return (
    <div className="shrink-0 border-b border-primary-blue/10 bg-blue-gray/25 px-5 py-3">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0 flex-1 space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            <span
              className={`inline-flex rounded-full px-2.5 py-1 font-sans text-[10px] font-bold uppercase tracking-wide ring-1 ${statusClass}`}
            >
              {statusLabel}
            </span>
            {publishedAtLabel ? (
              <span className="font-sans text-[11px] text-muted-foreground">
                Last published {publishedAtLabel}
              </span>
            ) : (
              <span className="font-sans text-[11px] text-muted-foreground">
                Not published yet
              </span>
            )}
            {hasUnsavedDraft ? (
              <span className="font-sans text-[11px] font-medium text-amber-800">
                Unsaved draft will be saved before publish
              </span>
            ) : null}
          </div>

          {publicStoreUrl ? (
            <div className="flex max-w-xl flex-col gap-2 sm:flex-row sm:items-center">
              <div className="min-w-0 flex-1 border border-primary-blue/15 bg-white px-3 py-2">
                <p className="font-sans text-[10px] font-semibold uppercase tracking-[0.14em] text-primary-blue/50">
                  Store link
                </p>
                <p
                  className="mt-0.5 truncate font-sans text-xs font-medium text-primary-blue"
                  title={publicStoreUrl}
                >
                  {publicStoreUrl}
                </p>
              </div>
              <button
                type="button"
                onClick={() => void copyPublicLink()}
                className="shrink-0 border border-primary-blue/20 bg-white px-3.5 py-2 font-sans text-xs font-semibold text-primary-blue transition-colors hover:bg-blue-gray/40"
              >
                {copyState === "copied"
                  ? "Copied"
                  : copyState === "error"
                    ? "Copy failed"
                    : "Copy link"}
              </button>
            </div>
          ) : (
            <p className="font-sans text-[11px] text-muted-foreground">
              After you go live, your public store link will appear here to copy.
            </p>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => setGoLiveOpen(true)}
            disabled={busy}
            className="bg-primary-blue px-3.5 py-2 font-sans text-xs font-semibold text-white transition-colors hover:bg-primary-blue/90 disabled:pointer-events-none disabled:opacity-60"
          >
            {isLive ? "Publish update" : "Go Live"}
          </button>
          {canUnpublish ? (
            <button
              type="button"
              onClick={() => setUnpublishOpen(true)}
              disabled={busy}
              className="border border-primary-blue/20 bg-white px-3.5 py-2 font-sans text-xs font-semibold text-primary-blue transition-colors hover:bg-blue-gray/40 disabled:pointer-events-none disabled:opacity-50"
            >
              Unpublish
            </button>
          ) : null}
        </div>
      </div>

      <div className="mt-3">
        <button
          type="button"
          onClick={() => setShowHistory((v) => !v)}
          className="font-sans text-[11px] font-semibold text-primary-blue underline decoration-primary-blue/30 underline-offset-2 hover:decoration-primary-blue"
        >
          {showHistory ? "Hide history" : "Publish history"}
        </button>
      </div>

      {showHistory ? (
        <div className="mt-3 max-h-40 overflow-y-auto border border-primary-blue/10 bg-white px-3 py-2">
          {historyQuery.isLoading ? (
            <p className="font-sans text-[11px] text-muted-foreground">
              Loading history…
            </p>
          ) : historyQuery.isError ? (
            <p className="font-sans text-[11px] text-red-700">
              {historyQuery.error instanceof Error
                ? historyQuery.error.message
                : "Could not load history."}
            </p>
          ) : !historyQuery.data?.length ? (
            <p className="font-sans text-[11px] text-muted-foreground">
              No publish snapshots yet.
            </p>
          ) : (
            <ul className="space-y-2">
              {historyQuery.data.map((item) => (
                <li
                  key={item.snapshotId}
                  className="font-sans text-[11px] text-primary-blue/80"
                >
                  <span className="font-semibold text-primary-blue">
                    {formatPublishedAt(item.publishedAt) ?? item.publishedAt}
                  </span>
                  <span className="text-muted-foreground">
                    {" "}
                    · {item.templateId} v{item.templateVersion}
                  </span>
                  {item.notes ? (
                    <span className="block text-muted-foreground">
                      {item.notes}
                    </span>
                  ) : null}
                </li>
              ))}
            </ul>
          )}
        </div>
      ) : null}

      <GoLiveModal
        open={goLiveOpen}
        onClose={() => setGoLiveOpen(false)}
        onConfirm={() => void confirmPublish()}
        isLive={isLive}
        hasUnsavedDraft={hasUnsavedDraft}
        publicSlug={publicSlug}
        isSubmitting={publishMutation.isPending}
      />

      <UnpublishModal
        open={unpublishOpen}
        onClose={() => setUnpublishOpen(false)}
        onConfirm={() => void confirmUnpublish()}
        isSubmitting={unpublishMutation.isPending}
      />
    </div>
  );
}
