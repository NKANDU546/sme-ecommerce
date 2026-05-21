"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import {
  StorefrontEditor,
  type StorefrontCustomizeMode,
} from "@/components/storefront/storefront-editor";
import { StorefrontTemplateView } from "@/components/storefront/storefront-template-view";
import {
  createInitialStorefrontFromSeed,
  loadStorefront,
  saveStorefront,
} from "@/lib/storefront-storage";
import type { StorefrontConfig, StorefrontSection } from "@/types/storefront";

type StorefrontPanelProps = {
  workspaceId: string;
};

type TemplateCard = {
  name: string;
  description: string;
  tag: string;
  available: boolean;
};

const STOREFRONT_TEMPLATE_CARDS: TemplateCard[] = [
  {
    name: "Classic Boutique",
    description:
      "A polished storefront with hero content, featured products, promos, and value props.",
    tag: "Available now",
    available: true,
  },
  {
    name: "Minimal Catalogue",
    description:
      "A lean product-first layout for stores that want a simple catalogue feel.",
    tag: "Not yet available",
    available: false,
  },
  {
    name: "Bold Retail",
    description:
      "A high-contrast campaign-style homepage for launches, sales, and seasonal drops.",
    tag: "Not yet available",
    available: false,
  },
];

function createStorefrontSection(type: StorefrontSection["type"]): StorefrontSection {
  const id = `${type}-${Date.now()}`;
  switch (type) {
    case "hero":
      return {
        id,
        type,
        imageUrl: "",
        heading: "New page hero",
        subheading: "Tell customers what this section is about.",
        primaryCta: { label: "Shop collection", href: "@shop" },
        secondaryCta: { label: "Learn more", href: "#" },
      };
    case "featuredProducts":
      return {
        id,
        type,
        title: "Featured products",
        viewAll: { label: "View all", href: "@shop" },
        products: [{ title: "New product", priceLabel: "R 0.00", imageUrl: "" }],
      };
    case "promoBanner":
      return {
        id,
        type,
        title: "Special offer",
        description: "Highlight a launch, sale, or seasonal promotion.",
        buttonLabel: "Shop now",
        imageUrl: "",
        href: "@shop",
      };
    case "textImage":
      return {
        id,
        type,
        eyebrow: "Story",
        title: "Add your story",
        body: "Use this section to explain your brand, service, or product range.",
        imageUrl: "",
        imagePosition: "right",
        cta: { label: "Learn more", href: "#" },
      };
    case "features":
      return {
        id,
        type,
        title: "Why shop with us",
        items: [
          {
            title: "Fast service",
            description: "Help customers understand why ordering is easy.",
            icon: "check",
          },
          {
            title: "Reliable delivery",
            description: "Explain pickup, shipping, or local fulfilment.",
            icon: "truck",
          },
          {
            title: "Helpful support",
            description: "Mention WhatsApp support or personal service.",
            icon: "sparkle",
          },
        ],
      };
    case "faq":
      return {
        id,
        type,
        title: "Frequently asked questions",
        items: [
          {
            question: "How do I place an order?",
            answer: "Browse products, add them to cart, and complete checkout.",
          },
        ],
      };
    case "contactCta":
      return {
        id,
        type,
        title: "Need help?",
        body: "Message us and we will help you choose the right products.",
        buttonLabel: "Contact us",
        href: "#",
      };
  }
}

export function StorefrontPanel({ workspaceId }: StorefrontPanelProps) {
  const [config, setConfig] = useState<StorefrontConfig | null>(null);
  const [hydrated, setHydrated] = useState(false);
  const [customizeMode, setCustomizeMode] =
    useState<StorefrontCustomizeMode>("sections");
  const [sectionEditTarget, setSectionEditTarget] = useState<{
    id: string;
    requestId: number;
  } | null>(null);

  useEffect(() => {
    const id = window.setTimeout(() => {
      setConfig(loadStorefront(workspaceId));
      setHydrated(true);
    }, 0);
    return () => window.clearTimeout(id);
  }, [workspaceId]);

  const persist = useCallback(
    (next: StorefrontConfig) => {
      const stamped = { ...next, updatedAt: Date.now() };
      setConfig(stamped);
      saveStorefront(workspaceId, stamped);
    },
    [workspaceId],
  );

  const moveHomepageSection = useCallback(
    (from: number, to: number) => {
      if (!config || to < 0 || to >= config.sections.length || from === to) {
        return;
      }
      const sections = [...config.sections];
      const [section] = sections.splice(from, 1);
      sections.splice(to, 0, section);
      persist({ ...config, sections });
    },
    [config, persist],
  );

  const addHomepageSection = useCallback(
    (type: StorefrontSection["type"], index: number) => {
      if (!config) return;
      const sections = [...config.sections];
      sections.splice(index, 0, createStorefrontSection(type));
      persist({ ...config, sections });
    },
    [config, persist],
  );

  const editHomepageSection = useCallback((sectionId: string) => {
    setSectionEditTarget((current) => ({
      id: sectionId,
      requestId: (current?.requestId ?? 0) + 1,
    }));
  }, []);

  function startFromTemplate() {
    const initial = createInitialStorefrontFromSeed();
    persist(initial);
  }

  if (!hydrated) {
    return (
      <div className="flex flex-1 items-center justify-center px-6 py-16 font-sans text-sm text-muted-foreground">
        Loading storefront…
      </div>
    );
  }

  if (!config) {
    return (
      <div className="flex flex-1 flex-col px-6 py-10 sm:px-8 sm:py-14">
        <div className="mx-auto w-full max-w-6xl">
          <div className="max-w-2xl">
            <p className="font-sans text-xs font-semibold uppercase tracking-[0.18em] text-primary-blue/55">
              Storefront templates
            </p>
            <h2 className="mt-3 font-serif text-3xl font-light text-primary-blue sm:text-4xl">
              Choose a template
            </h2>
            <p className="mt-4 font-sans text-sm leading-relaxed text-muted-foreground sm:text-base">
              Start with a storefront layout, then edit copy, colours, WhatsApp
              details, and products from the dashboard. More templates are
              coming soon.
            </p>
          </div>

          <ul className="mt-8 grid gap-5 md:grid-cols-3">
            {STOREFRONT_TEMPLATE_CARDS.map((template) => (
              <li
                key={template.name}
                className={`flex min-h-80 flex-col overflow-hidden rounded-xl border bg-white shadow-sm ${
                  template.available
                    ? "border-primary-blue/15"
                    : "border-primary-blue/10 opacity-75"
                }`}
              >
                <div className="border-b border-primary-blue/10 bg-blue-gray/25 p-4">
                  <div className="overflow-hidden rounded-lg border border-primary-blue/10 bg-white p-3">
                    <div className="h-28 rounded-md bg-gradient-to-br from-primary-blue via-primary-blue/80 to-blue-gray" />
                    <div className="mt-3 h-2 w-2/3 rounded-full bg-primary-blue/20" />
                    <div className="mt-2 h-2 w-1/2 rounded-full bg-primary-blue/10" />
                  </div>
                </div>

                <div className="flex flex-1 flex-col p-5">
                  <div className="flex items-start justify-between gap-3">
                    <h3 className="font-sans text-base font-bold text-primary-blue">
                      {template.name}
                    </h3>
                    <span
                      className={`shrink-0 rounded-full px-2.5 py-1 font-sans text-[10px] font-bold uppercase tracking-wide ${
                        template.available
                          ? "bg-emerald-50 text-emerald-800 ring-1 ring-emerald-700/15"
                          : "bg-blue-gray/50 text-primary-blue/55 ring-1 ring-primary-blue/10"
                      }`}
                    >
                      {template.tag}
                    </span>
                  </div>
                  <p className="mt-3 flex-1 font-sans text-sm leading-relaxed text-muted-foreground">
                    {template.description}
                  </p>
                  <button
                    type="button"
                    onClick={template.available ? startFromTemplate : undefined}
                    disabled={!template.available}
                    className={`mt-5 inline-flex items-center justify-center rounded-md px-4 py-2.5 font-sans text-sm font-semibold transition-colors ${
                      template.available
                        ? "bg-primary-blue text-white hover:bg-primary-blue/90"
                        : "cursor-not-allowed border border-primary-blue/10 bg-blue-gray/30 text-primary-blue/45"
                    }`}
                  >
                    {template.available
                      ? "Choose this template"
                      : "Not yet available"}
                  </button>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    );
  }

  const asideMobileHeightClass =
    customizeMode === "section"
      ? "max-lg:min-h-0 max-lg:max-h-[calc(100dvh-6rem)] max-lg:flex-1"
      : "max-lg:max-h-[min(60dvh,28rem)]";

  return (
    <div className="flex min-h-0 flex-1 flex-col overflow-hidden lg:flex-row">
      <aside
        className={`flex min-h-0 w-full shrink-0 flex-col overflow-hidden border-b border-primary-blue/10 bg-white ${asideMobileHeightClass} lg:sticky lg:top-0 lg:z-20 lg:max-h-[calc(100dvh-6rem)] lg:w-[min(100%,22rem)] lg:self-start lg:border-b-0 lg:border-r`}
      >
        <div className="flex shrink-0 flex-wrap items-center justify-between gap-2 border-b border-primary-blue/10 px-5 py-4">
          <p className="font-sans text-xs font-semibold uppercase tracking-[0.18em] text-primary-blue/55">
            Customize
          </p>
          <Link
            href={`/preview/${workspaceId}`}
            target="_blank"
            rel="noopener noreferrer"
            className="hidden font-sans text-xs font-medium text-primary-blue underline decoration-primary-blue/30 underline-offset-2 hover:decoration-primary-blue lg:inline"
          >
            Open customer preview
          </Link>
        </div>
        <div className="flex min-h-0 flex-1 flex-col overflow-hidden px-5 pt-2">
          <StorefrontEditor
            config={config}
            onChange={persist}
            previewHref={`/preview/${workspaceId}`}
            onCustomizeModeChange={setCustomizeMode}
            sectionEditTarget={sectionEditTarget}
          />
        </div>
        <footer
          className={`sticky bottom-0 z-10 shrink-0 border-t border-primary-blue/10 bg-white/95 px-5 py-3 backdrop-blur supports-[backdrop-filter]:bg-white/85 ${
            customizeMode === "section" ? "max-lg:hidden" : ""
          }`}
        >
          <p className="font-sans text-[11px] leading-relaxed text-muted-foreground">
            Edits save automatically in this browser until your API is ready.
          </p>
          <Link
            href={`/preview/${workspaceId}`}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-2 inline-flex font-sans text-xs font-semibold text-primary-blue underline decoration-primary-blue/30 underline-offset-2 hover:decoration-primary-blue lg:hidden"
          >
            Open customer preview
          </Link>
        </footer>
      </aside>
      <div
        className={`flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden bg-blue-gray/30 ${
          customizeMode === "section" ? "max-lg:hidden" : ""
        }`}
      >
        <p className="sticky top-0 z-10 shrink-0 border-b border-primary-blue/10 bg-white/90 px-4 py-2 text-center font-sans text-[11px] uppercase tracking-[0.14em] text-primary-blue/50 backdrop-blur supports-[backdrop-filter]:bg-white/75">
          Live preview · template: {config.templateId}
        </p>
        <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain">
          <StorefrontTemplateView
            config={config}
            workspaceId={workspaceId}
            isEditing
            onMoveSection={moveHomepageSection}
            onAddSection={addHomepageSection}
            onEditSection={editHomepageSection}
          />
        </div>
        <footer className="shrink-0 border-t border-primary-blue/10 bg-white px-4 py-2.5 text-center font-sans text-[11px] leading-snug text-primary-blue/55">
          <span className="font-medium text-primary-blue/70">
            {config.shopName}
          </span>
          <span className="mx-1.5 text-primary-blue/30" aria-hidden>
            ·
          </span>
          <span>{config.copyrightLine}</span>
        </footer>
      </div>
    </div>
  );
}
