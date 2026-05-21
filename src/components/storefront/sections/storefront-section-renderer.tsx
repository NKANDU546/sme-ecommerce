"use client";

import type { PointerEvent, ReactNode } from "react";
import { useEffect, useRef, useState } from "react";
import { ClassicBoutiqueSmartLink as SmartLink } from "@/components/storefront/templates/classic-boutique-smart-link";
import { storefrontButtonClassName } from "@/components/storefront/storefront-button";
import type {
  StorefrontConfig,
  StorefrontFeatureIconId,
  StorefrontSection,
} from "@/types/storefront";

const SITE_SECTION_LIBRARY: Array<{
  type: StorefrontSection["type"];
  label: string;
}> = [
  { type: "hero", label: "Hero" },
  { type: "featuredProducts", label: "Products" },
  { type: "promoBanner", label: "Promo" },
  { type: "textImage", label: "Text + image" },
  { type: "features", label: "Benefits" },
  { type: "faq", label: "FAQ" },
  { type: "contactCta", label: "Contact" },
];

type SectionDragState = {
  index: number;
  label: string;
  x: number;
  y: number;
};

type SectionRenderGroup =
  | { type: "single"; section: StorefrontSection; index: number }
  | {
      type: "row";
      items: Array<{ section: StorefrontSection; index: number }>;
    };

function getScrollParent(element: HTMLElement): HTMLElement | Window {
  let parent = element.parentElement;
  while (parent) {
    const { overflowY } = window.getComputedStyle(parent);
    if (/(auto|scroll)/.test(overflowY) && parent.scrollHeight > parent.clientHeight) {
      return parent;
    }
    parent = parent.parentElement;
  }
  return window;
}

type StorefrontSectionRendererProps = {
  section: StorefrontSection;
  config: StorefrontConfig;
  workspaceId?: string;
};

function FeatureIcon({ id }: { id: StorefrontFeatureIconId }) {
  const box =
    "flex h-12 w-12 items-center justify-center rounded-md bg-[color:var(--sf-icon-tile-bg)] text-[color:var(--sf-icon-tile-text)]";
  switch (id) {
    case "check":
      return (
        <span className={box} aria-hidden>
          <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        </span>
      );
    case "truck":
      return (
        <span className={box} aria-hidden>
          <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 7h11v10H3V7zm11 0h3l3 3v4h-6M9 19a1 1 0 100-2 1 1 0 000 2zm8 0a1 1 0 100-2 1 1 0 000 2z" />
          </svg>
        </span>
      );
    case "sparkle":
      return (
        <span className={box} aria-hidden>
          <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
            <path strokeLinecap="round" d="M12 3v2m0 14v2M4.2 4.2l1.4 1.4m12.8 12.8l1.4 1.4M3 12h2m14 0h2M4.2 19.8l1.4-1.4M17.4 5.6l1.4-1.4" />
            <path strokeLinecap="round" d="M12 8a4 4 0 104 4 4 4 0 00-4-4z" />
          </svg>
        </span>
      );
  }
}

function SectionProductCard({
  title,
  priceLabel,
  imageUrl,
}: {
  title: string;
  priceLabel: string;
  imageUrl: string;
}) {
  return (
    <article className="group flex flex-col">
      <div className="aspect-square overflow-hidden rounded-xl border border-[color:var(--sf-accent-border-10)] bg-[color:var(--sf-card-frame-bg)]">
        {imageUrl.trim() ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={imageUrl}
            alt=""
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
          />
        ) : null}
      </div>
      <h3 className="mt-4 font-sans text-[15px] font-semibold text-[color:var(--sf-accent)]">
        {title}
      </h3>
      <p className="mt-1 font-sans text-sm text-[color:var(--sf-accent-text-55)]">
        {priceLabel}
      </p>
    </article>
  );
}

export function StorefrontSectionRenderer({
  section,
  workspaceId,
}: StorefrontSectionRendererProps) {
  switch (section.type) {
    case "hero": {
      const heroBg = section.imageUrl.trim();
      return (
        <section
          className="relative min-h-[min(70vh,36rem)] overflow-hidden"
          aria-labelledby={`${section.id}-heading`}
        >
          {heroBg ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={heroBg}
              alt=""
              className="absolute inset-0 h-full w-full object-cover"
            />
          ) : (
            <div
              className="absolute inset-0 bg-[color:var(--sf-hero-placeholder)]"
              aria-hidden
            />
          )}
          <div className="absolute inset-0 bg-gradient-to-r from-black/55 via-black/35 to-transparent" />
          <div className="relative z-10 mx-auto flex min-h-[min(70vh,36rem)] max-w-7xl items-center px-4 py-16 sm:px-8 sm:py-24">
            <div className="max-w-xl">
              <h1
                id={`${section.id}-heading`}
                className="font-serif text-[clamp(2rem,5vw,3.25rem)] font-semibold leading-[1.1] tracking-tight text-white"
              >
                {section.heading}
              </h1>
              <p className="mt-5 font-sans text-base leading-relaxed text-white/90 sm:text-lg">
                {section.subheading}
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <SmartLink
                  link={section.primaryCta}
                  workspaceId={workspaceId}
                  className={storefrontButtonClassName({ size: "lg" })}
                />
                <SmartLink
                  link={section.secondaryCta}
                  workspaceId={workspaceId}
                  className={storefrontButtonClassName({
                    variant: "outline",
                    size: "lg",
                  })}
                />
              </div>
            </div>
          </div>
        </section>
      );
    }
    case "featuredProducts":
      return (
        <section
          className="mx-auto max-w-[100%] px-4 py-14 sm:px-8 sm:py-20"
          aria-labelledby={`${section.id}-heading`}
        >
          <div className="mb-10 flex flex-wrap items-end justify-between gap-4">
            <h2
              id={`${section.id}-heading`}
              className="font-serif text-2xl font-light text-[color:var(--sf-accent)] sm:text-3xl"
            >
              {section.title}
            </h2>
            <SmartLink
              link={section.viewAll}
              workspaceId={workspaceId}
              className={storefrontButtonClassName({ variant: "text" })}
            />
          </div>
          <div className="grid grid-cols-2 gap-5 md:grid-cols-4 md:gap-8">
            {section.products.map((p, i) => (
              <SectionProductCard
                key={`${p.title}-${i}`}
                title={p.title}
                priceLabel={p.priceLabel}
                imageUrl={p.imageUrl}
              />
            ))}
          </div>
        </section>
      );
    case "promoBanner":
      return (
        <section className="border-y border-[color:var(--sf-accent-border-10)] bg-[color:var(--sf-promo-section-bg)] py-14 sm:py-16">
          <div className="mx-auto max-w-[100%] px-4 sm:px-8">
            <a
              href={section.href}
              className="relative flex min-h-[17rem] flex-col justify-end overflow-hidden rounded-xl border border-[color:var(--sf-accent-border-10)] shadow-sm transition-opacity hover:opacity-[0.98] sm:min-h-[20rem]"
            >
              {section.imageUrl.trim() ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={section.imageUrl}
                  alt=""
                  className="absolute inset-0 h-full w-full object-cover"
                />
              ) : (
                <div
                  className="absolute inset-0 bg-[color:var(--sf-promo-placeholder)]"
                  aria-hidden
                />
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/25 to-transparent" />
              <div className="relative z-10 p-6 sm:p-8">
                <h3 className="font-serif text-2xl font-light text-white sm:text-3xl">
                  {section.title}
                </h3>
                <p className="mt-2 max-w-md font-sans text-sm leading-relaxed text-white/85">
                  {section.description}
                </p>
                <span
                  className={storefrontButtonClassName({
                    size: "sm",
                    className: "mt-5 w-fit uppercase tracking-[0.12em]",
                  })}
                >
                  {section.buttonLabel}
                </span>
              </div>
            </a>
          </div>
        </section>
      );
    case "textImage":
      return (
        <section className="bg-[color:var(--sf-page-bg)] px-4 py-14 sm:px-8 sm:py-20">
          <div
            className={`mx-auto grid max-w-7xl items-center gap-8 lg:grid-cols-2 ${
              section.imagePosition === "left" ? "" : "lg:[&>*:first-child]:order-2"
            }`}
          >
            <div className="overflow-hidden rounded-2xl border border-[color:var(--sf-accent-border-10)] bg-[color:var(--sf-card-frame-bg)]">
              {section.imageUrl.trim() ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={section.imageUrl}
                  alt=""
                  className="aspect-[4/3] h-full w-full object-cover"
                />
              ) : (
                <div className="aspect-[4/3] bg-[color:var(--sf-hero-placeholder)]" />
              )}
            </div>
            <div>
              <p className="font-sans text-[11px] font-semibold uppercase tracking-[0.18em] text-[color:var(--sf-accent-text-45)]">
                {section.eyebrow}
              </p>
              <h2 className="mt-3 font-serif text-3xl font-light text-[color:var(--sf-accent)]">
                {section.title}
              </h2>
              <p className="mt-4 font-sans text-sm leading-relaxed text-[color:var(--sf-accent-text-65)] sm:text-base">
                {section.body}
              </p>
              <SmartLink
                link={section.cta}
                workspaceId={workspaceId}
                className={storefrontButtonClassName({
                  variant: "text",
                  className: "mt-6",
                })}
              />
            </div>
          </div>
        </section>
      );
    case "features":
      return (
        <section
          className="bg-[color:var(--sf-values-section-bg)] py-14 sm:py-20"
          aria-labelledby={`${section.id}-heading`}
        >
          <h2 id={`${section.id}-heading`} className="sr-only">
            {section.title || "Why shop with us"}
          </h2>
          <div className="mx-auto grid max-w-[100%] gap-10 px-4 sm:grid-cols-3 sm:gap-12 sm:px-8">
            {section.items.map((f, i) => (
              <div key={`${f.title}-${i}`} className="text-center sm:text-left">
                <div className="mx-auto flex justify-center sm:mx-0 sm:justify-start">
                  <FeatureIcon id={f.icon} />
                </div>
                <h3 className="mt-5 font-sans text-base font-semibold text-[color:var(--sf-accent)]">
                  {f.title}
                </h3>
                <p className="mt-2 font-sans text-sm leading-relaxed text-[color:var(--sf-accent-text-60)]">
                  {f.description}
                </p>
              </div>
            ))}
          </div>
        </section>
      );
    case "faq":
      return (
        <section className="px-4 py-14 sm:px-8 sm:py-20">
          <div className="mx-auto max-w-3xl">
            <h2 className="font-serif text-3xl font-light text-[color:var(--sf-accent)]">
              {section.title}
            </h2>
            <div className="mt-8 divide-y divide-[color:var(--sf-accent-border-10)] rounded-xl border border-[color:var(--sf-accent-border-10)] bg-white">
              {section.items.map((item, i) => (
                <div key={`${item.question}-${i}`} className="p-5">
                  <h3 className="font-sans text-sm font-bold text-[color:var(--sf-accent)]">
                    {item.question}
                  </h3>
                  <p className="mt-2 font-sans text-sm leading-relaxed text-[color:var(--sf-accent-text-60)]">
                    {item.answer}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>
      );
    case "contactCta":
      return (
        <section className="bg-[color:var(--sf-promo-section-bg)] px-4 py-14 sm:px-8 sm:py-20">
          <div className="mx-auto max-w-3xl rounded-2xl border border-[color:var(--sf-accent-border-10)] bg-white p-8 text-center shadow-sm">
            <h2 className="font-serif text-3xl font-light text-[color:var(--sf-accent)]">
              {section.title}
            </h2>
            <p className="mx-auto mt-3 max-w-xl font-sans text-sm leading-relaxed text-[color:var(--sf-accent-text-60)] sm:text-base">
              {section.body}
            </p>
            <a
              href={section.href || "#"}
              className={storefrontButtonClassName({
                className: "mt-6",
              })}
            >
              {section.buttonLabel}
            </a>
          </div>
        </section>
      );
  }
}

export function StorefrontSections({
  sections,
  config,
  workspaceId,
  isEditing = false,
  onMoveSection,
  onAddSection,
  onEditSection,
}: {
  sections: StorefrontSection[];
  config: StorefrontConfig;
  workspaceId?: string;
  isEditing?: boolean;
  onMoveSection?: (from: number, to: number) => void;
  onAddSection?: (type: StorefrontSection["type"], index: number) => void;
  onEditSection?: (sectionId: string) => void;
}) {
  const [dragState, setDragState] = useState<SectionDragState | null>(null);
  const dragStateRef = useRef<SectionDragState | null>(null);
  const scrollParentRef = useRef<HTMLElement | Window | null>(null);
  const pointerPositionRef = useRef<{ x: number; y: number } | null>(null);

  useEffect(() => {
    dragStateRef.current = dragState;
  }, [dragState]);

  useEffect(() => {
    if (!dragState) return;

    function updateDrag(event: globalThis.PointerEvent) {
      pointerPositionRef.current = { x: event.clientX, y: event.clientY };
      setDragState((current) =>
        current
          ? { ...current, x: event.clientX, y: event.clientY }
          : current,
      );
    }

    function finishDrag(event: globalThis.PointerEvent) {
      const current = dragStateRef.current;
      if (!current) return;
      const dropTarget = document
        .elementFromPoint(event.clientX, event.clientY)
        ?.closest<HTMLElement>("[data-section-drop-index]");
      const dropIndex = Number.parseInt(
        dropTarget?.dataset.sectionDropIndex ?? "",
        10,
      );
      if (Number.isInteger(dropIndex)) {
        const to = current.index < dropIndex ? dropIndex - 1 : dropIndex;
        onMoveSection?.(current.index, to);
      }
      setDragState(null);
      pointerPositionRef.current = null;
      scrollParentRef.current = null;
    }

    window.addEventListener("pointermove", updateDrag);
    window.addEventListener("pointerup", finishDrag, { once: true });
    window.addEventListener("pointercancel", finishDrag, { once: true });

    return () => {
      window.removeEventListener("pointermove", updateDrag);
      window.removeEventListener("pointerup", finishDrag);
      window.removeEventListener("pointercancel", finishDrag);
    };
  }, [dragState, onMoveSection]);

  useEffect(() => {
    if (!dragState) return;

    const interval = window.setInterval(() => {
      const position = pointerPositionRef.current;
      const scrollParent = scrollParentRef.current;
      if (!position || !scrollParent) return;

      const rect =
        scrollParent instanceof Window
          ? { top: 0, bottom: window.innerHeight }
          : scrollParent.getBoundingClientRect();
      const edgeSize = 96;
      const maxStep = 18;
      let step = 0;

      if (position.y < rect.top + edgeSize) {
        step = -Math.ceil(((rect.top + edgeSize - position.y) / edgeSize) * maxStep);
      } else if (position.y > rect.bottom - edgeSize) {
        step = Math.ceil(((position.y - (rect.bottom - edgeSize)) / edgeSize) * maxStep);
      }

      if (step === 0) return;
      if (scrollParent instanceof Window) {
        scrollParent.scrollBy({ top: step });
      } else {
        scrollParent.scrollTop += step;
      }
    }, 16);

    return () => window.clearInterval(interval);
  }, [dragState]);

  function startSectionDrag(
    event: PointerEvent<HTMLButtonElement>,
    section: StorefrontSection,
    index: number,
  ) {
    event.preventDefault();
    event.currentTarget.setPointerCapture(event.pointerId);
    const label =
      SITE_SECTION_LIBRARY.find((item) => item.type === section.type)?.label ??
      section.type;
    scrollParentRef.current = getScrollParent(event.currentTarget);
    pointerPositionRef.current = { x: event.clientX, y: event.clientY };
    setDragState({ index, label, x: event.clientX, y: event.clientY });
  }

  function renderDropZone(index: number) {
    if (!isEditing || (!onMoveSection && !onAddSection)) return null;
    const isDragging = dragState !== null;
    return (
      <div
        key={`section-drop-${index}`}
        data-section-drop-index={index}
        className={`mx-4 my-2 rounded-lg border border-dashed px-4 py-3 font-sans transition-colors sm:mx-8 ${
          isDragging
            ? "border-primary-blue bg-white text-primary-blue shadow-sm"
            : "border-primary-blue/25 bg-white/80 text-primary-blue/55"
        }`}
      >
        <div className="flex flex-wrap items-center justify-center gap-2">
          {isDragging && onMoveSection ? (
            <span className="rounded-full bg-primary-blue px-3 py-1.5 text-[11px] font-bold uppercase tracking-[0.12em] text-white">
              Put it here
            </span>
          ) : null}
          {onAddSection ? (
            <>
              <span className="text-[11px] font-bold uppercase tracking-[0.14em]">
                + Add section:
              </span>
              {SITE_SECTION_LIBRARY.map((item) => (
                <button
                  key={item.type}
                  type="button"
                  onClick={() => onAddSection(item.type, index)}
                  className="rounded-full border border-primary-blue/15 bg-white px-2.5 py-1 text-[11px] font-semibold text-primary-blue shadow-sm"
                >
                  + {item.label}
                </button>
              ))}
            </>
          ) : null}
        </div>
      </div>
    );
  }

  function renderEditableFrame(
    section: StorefrontSection,
    index: number,
    children: ReactNode,
  ) {
    if (!isEditing || (!onMoveSection && !onEditSection)) return children;
    const isDraggingThisSection = dragState?.index === index;
    return (
      <div
        key={section.id}
        className={`group/section relative ring-inset transition-opacity ${
          isDraggingThisSection ? "opacity-45" : ""
        }`}
      >
        <div className="pointer-events-none absolute inset-0 z-20 ring-2 ring-primary-blue/35" />
        <div className="absolute left-3 top-3 flex flex-wrap items-center gap-1 rounded-full border border-primary-blue/20 bg-white/95 p-1.5 shadow-lg backdrop-blur">
          {onMoveSection ? (
            <button
              type="button"
              onPointerDown={(event) => startSectionDrag(event, section, index)}
              className="flex h-8 w-8 touch-none cursor-grab items-center justify-center rounded-full bg-primary-blue font-sans text-[13px] font-bold leading-none text-white active:cursor-grabbing"
              aria-label={`Drag section ${index + 1}`}
              title="Hold and drag this section"
            >
              ⋮⋮
            </button>
          ) : null}
        </div>
        {onEditSection ? (
          <button
            type="button"
            onClick={() => onEditSection(section.id)}
            className="absolute right-3 top-3 z-30 flex h-8 w-8 cursor-pointer items-center justify-center rounded-full border border-primary-blue/20 bg-white/95 text-primary-blue shadow-lg backdrop-blur transition-colors hover:bg-blue-gray/30"
            aria-label={`Edit section ${index + 1}`}
            title="Edit this section"
          >
            <svg
              aria-hidden
              className="h-3.5 w-3.5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M19.5 7.125L16.875 4.5"
              />
            </svg>
          </button>
        ) : null}
        {children}
      </div>
    );
  }

  function renderSectionEntry(section: StorefrontSection, index: number) {
    return renderEditableFrame(
      section,
      index,
      <StorefrontSectionRenderer
        section={section}
        config={config}
        workspaceId={workspaceId}
      />,
    );
  }

  const sectionGroups: SectionRenderGroup[] = [];
  for (let index = 0; index < sections.length; index += 1) {
    const section = sections[index];
    if (
      section.desktopLayout === "half" &&
      sections[index + 1]?.desktopLayout === "half"
    ) {
      sectionGroups.push({
        type: "row",
        items: [
          { section, index },
          { section: sections[index + 1], index: index + 1 },
        ],
      });
      index += 1;
    } else {
      sectionGroups.push({ type: "single", section, index });
    }
  }

  return (
    <>
      {dragState ? (
        <div
          className="pointer-events-none fixed z-[120] -translate-x-1/2 -translate-y-1/2 rounded-xl border border-primary-blue/20 bg-white/95 px-4 py-3 font-sans text-xs font-bold uppercase tracking-[0.12em] text-primary-blue shadow-2xl"
          style={{ left: dragState.x, top: dragState.y }}
        >
          Moving {dragState.label}
          <div className="mt-1 text-[10px] font-semibold normal-case tracking-normal text-primary-blue/55">
            Release over “Put it here”
          </div>
        </div>
      ) : null}
      {isEditing ? renderDropZone(0) : null}
      {sectionGroups.map((group) => {
        if (group.type === "single") {
          return (
            <div key={group.section.id}>
              {renderSectionEntry(group.section, group.index)}
              {renderDropZone(group.index + 1)}
            </div>
          );
        }

        const lastIndex = group.items[group.items.length - 1].index;
        return (
          <div key={group.items.map((item) => item.section.id).join("-")}>
            <div className="mx-4 grid gap-4 sm:mx-8 md:grid-cols-2">
              {group.items.map(({ section, index }) => (
                <div key={section.id} className="min-w-0">
                  {renderSectionEntry(section, index)}
                </div>
              ))}
            </div>
            {renderDropZone(lastIndex + 1)}
          </div>
        );
      })}
    </>
  );
}
