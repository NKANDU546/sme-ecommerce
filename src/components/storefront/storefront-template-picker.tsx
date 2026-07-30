"use client";

import { useMemo, useState } from "react";
import { StorefrontTemplateView } from "@/components/storefront/storefront-template-view";
import {
  STOREFRONT_TEMPLATE_CATALOG,
  type StorefrontTemplateCatalogEntry,
} from "@/lib/storefront-template-catalog";
import { createInitialStorefrontFromSeed } from "@/lib/storefront-storage";
import type { StorefrontConfig, StorefrontTemplateId } from "@/types/storefront";

type StorefrontTemplatePickerProps = {
  workspaceId: string;
  /** When re-opening from the editor, show a stronger reset warning. */
  replacingExisting?: boolean;
  /** Offer skip without reset (grandfather existing drafts). */
  allowKeepCurrent?: boolean;
  isApplying: boolean;
  onCancel?: () => void;
  onKeepCurrent?: () => void;
  onApply: (template: {
    templateId: string;
    templateVersion: number;
  }) => void | Promise<void>;
};

function previewConfigForTemplate(
  entry: StorefrontTemplateCatalogEntry,
): StorefrontConfig | null {
  if (!entry.available) return null;
  if (entry.id === "classic-boutique") {
    const config = createInitialStorefrontFromSeed();
    return {
      ...config,
      templateId: entry.id as StorefrontTemplateId,
      shopName: "Your shop name",
      tagline: "Replace this with your brand story.",
    };
  }
  return null;
}

export function StorefrontTemplatePicker({
  workspaceId,
  replacingExisting = false,
  allowKeepCurrent = false,
  isApplying,
  onCancel,
  onKeepCurrent,
  onApply,
}: StorefrontTemplatePickerProps) {
  const available = STOREFRONT_TEMPLATE_CATALOG.filter((t) => t.available);
  const [selectedId, setSelectedId] = useState(
    available[0]?.id ?? STOREFRONT_TEMPLATE_CATALOG[0].id,
  );

  const selected =
    STOREFRONT_TEMPLATE_CATALOG.find((t) => t.id === selectedId) ??
    STOREFRONT_TEMPLATE_CATALOG[0];

  const previewConfig = useMemo(
    () => previewConfigForTemplate(selected),
    [selected],
  );

  return (
    <div className="flex min-h-0 flex-1 flex-col overflow-hidden bg-blue-gray/20">
      <header className="shrink-0 border-b border-primary-blue/10 bg-white px-5 py-6 sm:px-8">
        <p className="font-sans text-[11px] font-semibold uppercase tracking-[0.2em] text-primary-blue/55">
          Storefront setup
        </p>
        <h1 className="mt-2 font-serif text-3xl font-light tracking-tight text-primary-blue sm:text-4xl">
          Choose a template
        </h1>
        <p className="mt-3 max-w-2xl font-sans text-sm leading-relaxed text-muted-foreground">
          Preview a ready-made layout with default hero imagery and sections.
          After you pick one, customize copy and add your real products.
        </p>
        {replacingExisting ? (
          <p className="mt-3 max-w-2xl rounded-lg border border-amber-600/20 bg-amber-50 px-3 py-2 font-sans text-xs leading-relaxed text-amber-950">
            Applying a template resets your current draft layout and sample
            content. Published storefronts are unchanged until you publish
            again. Your catalogue products are kept.
          </p>
        ) : null}
      </header>

      <div className="flex min-h-0 flex-1 flex-col overflow-hidden lg:flex-row">
        <aside className="flex max-h-[min(42dvh,22rem)] w-full shrink-0 flex-col overflow-y-auto border-b border-primary-blue/10 bg-white lg:max-h-none lg:w-[min(100%,22rem)] lg:border-b-0 lg:border-r">
          <ul className="flex flex-col gap-3 p-4 sm:p-5">
            {STOREFRONT_TEMPLATE_CATALOG.map((entry) => {
              const isSelected = entry.id === selected.id;
              return (
                <li key={entry.id}>
                  <button
                    type="button"
                    disabled={!entry.available || isApplying}
                    onClick={() => setSelectedId(entry.id)}
                    className={`w-full overflow-hidden rounded-xl border text-left transition-colors disabled:cursor-not-allowed ${
                      isSelected
                        ? "border-primary-blue ring-2 ring-primary-blue/20"
                        : "border-primary-blue/10 hover:border-primary-blue/25"
                    } ${!entry.available ? "opacity-60" : ""}`}
                  >
                    <div className="relative aspect-[16/10] bg-blue-gray/40">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={entry.previewImageUrl}
                        alt=""
                        className="h-full w-full object-cover"
                      />
                      {!entry.available ? (
                        <span className="absolute right-2 top-2 rounded bg-white/95 px-2 py-0.5 font-sans text-[10px] font-semibold uppercase tracking-wide text-primary-blue">
                          Soon
                        </span>
                      ) : null}
                    </div>
                    <div className="space-y-1 p-3">
                      <p className="font-sans text-[10px] font-semibold uppercase tracking-[0.16em] text-primary-blue/45">
                        {entry.vibe}
                      </p>
                      <p className="font-sans text-sm font-semibold text-primary-blue">
                        {entry.name}
                      </p>
                      <p className="font-sans text-xs leading-relaxed text-muted-foreground">
                        {entry.description}
                      </p>
                    </div>
                  </button>
                </li>
              );
            })}
          </ul>
        </aside>

        <div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden">
          <div className="flex shrink-0 flex-wrap items-center justify-between gap-3 border-b border-primary-blue/10 bg-white px-4 py-3 sm:px-6">
            <div>
              <p className="font-sans text-[11px] font-semibold uppercase tracking-[0.14em] text-primary-blue/50">
                Live preview
              </p>
              <p className="mt-0.5 font-sans text-sm font-semibold text-primary-blue">
                {selected.name}
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              {replacingExisting && onCancel ? (
                <button
                  type="button"
                  disabled={isApplying}
                  onClick={onCancel}
                  className="px-3 py-2 font-sans text-sm font-medium text-primary-blue underline decoration-primary-blue/30 underline-offset-4 disabled:opacity-50"
                >
                  Back to editor
                </button>
              ) : null}
              {allowKeepCurrent && onKeepCurrent ? (
                <button
                  type="button"
                  disabled={isApplying}
                  onClick={onKeepCurrent}
                  className="px-3 py-2 font-sans text-sm font-medium text-primary-blue underline decoration-primary-blue/30 underline-offset-4 disabled:opacity-50"
                >
                  Keep current draft
                </button>
              ) : null}
              <button
                type="button"
                disabled={!selected.available || isApplying}
                onClick={() =>
                  void onApply({
                    templateId: selected.id,
                    templateVersion: selected.templateVersion,
                  })
                }
                className="bg-primary-blue px-4 py-2.5 font-sans text-sm font-semibold text-white transition-colors hover:bg-primary-blue/90 disabled:opacity-50"
              >
                {isApplying
                  ? "Applying…"
                  : selected.available
                    ? "Use this template"
                    : "Coming soon"}
              </button>
            </div>
          </div>

          <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain bg-blue-gray/30">
            {previewConfig ? (
              <div className="pointer-events-none origin-top scale-[0.92] sm:scale-100">
                <StorefrontTemplateView
                  config={previewConfig}
                  workspaceId={workspaceId}
                />
              </div>
            ) : (
              <div className="flex min-h-[20rem] flex-col items-center justify-center gap-3 px-6 py-16 text-center">
                <p className="font-serif text-2xl font-light text-primary-blue">
                  Preview coming soon
                </p>
                <p className="max-w-md font-sans text-sm text-muted-foreground">
                  {selected.name} is not available yet. Pick Classic Boutique to
                  start selling with a full layout today.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
