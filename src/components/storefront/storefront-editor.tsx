"use client";

import Link from "next/link";
import type { ComponentPropsWithoutRef, ReactNode } from "react";
import { useEffect, useState } from "react";
import { STOREFRONT_THEME_DEFINITIONS } from "@/lib/storefront-themes";
import type {
  StorefrontConfig,
  StorefrontCustomPage,
  StorefrontFeature,
  StorefrontFeatureIconId,
  StorefrontLink,
  StorefrontProductPlaceholder,
  StorefrontPromoCard,
  StorefrontSection,
  StorefrontThemeId,
} from "@/types/storefront";

type StorefrontEditorSectionId =
  | "appearance"
  | "pages"
  | "brand"
  | "navbar"
  | "hero"
  | "products"
  | "promos"
  | "values"
  | "footer";

const EDITOR_SECTIONS: { id: StorefrontEditorSectionId; label: string }[] = [
  { id: "appearance", label: "Appearance" },
  { id: "pages", label: "Pages & sections" },
  { id: "brand", label: "Brand" },
  { id: "navbar", label: "Navbar" },
  { id: "hero", label: "Hero" },
  { id: "products", label: "Products" },
  { id: "promos", label: "Promos" },
  { id: "values", label: "Value props" },
  { id: "footer", label: "Footer" },
];

export type StorefrontCustomizeMode = "sections" | "section";

type StorefrontEditorProps = {
  config: StorefrontConfig;
  onChange: (next: StorefrontConfig) => void;
  /** Lets the parent resize the shell (e.g. hide preview) when a section is open vs. the list. */
  onCustomizeModeChange?: (mode: StorefrontCustomizeMode) => void;
  /** Shown next to Return on small screens while the preview column is hidden. */
  previewHref?: string;
};

function Field({
  label,
  id,
  ...inputProps
}: ComponentPropsWithoutRef<"input"> & { label: string; id: string }) {
  return (
    <div>
      <label
        htmlFor={id}
        className="mb-1.5 block font-sans text-[11px] font-semibold uppercase tracking-[0.16em] text-primary-blue/60"
      >
        {label}
      </label>
      <input
        id={id}
        className="w-full border border-primary-blue/15 bg-white px-3 py-2 font-sans text-sm text-foreground outline-none focus-visible:border-primary-blue/35 focus-visible:ring-2 focus-visible:ring-primary-blue/15"
        {...inputProps}
      />
    </div>
  );
}

function TextAreaField({
  label,
  id,
  ...props
}: ComponentPropsWithoutRef<"textarea"> & { label: string; id: string }) {
  return (
    <div>
      <label
        htmlFor={id}
        className="mb-1.5 block font-sans text-[11px] font-semibold uppercase tracking-[0.16em] text-primary-blue/60"
      >
        {label}
      </label>
      <textarea
        id={id}
        rows={3}
        className="w-full resize-y border border-primary-blue/15 bg-white px-3 py-2 font-sans text-sm text-foreground outline-none focus-visible:border-primary-blue/35 focus-visible:ring-2 focus-visible:ring-primary-blue/15"
        {...props}
      />
    </div>
  );
}

function LinkPairEditor({
  label,
  link,
  onChange,
  idPrefix,
}: {
  label: string;
  link: StorefrontLink;
  onChange: (next: StorefrontLink) => void;
  idPrefix: string;
}) {
  return (
    <div className="rounded border border-primary-blue/10 bg-blue-gray/15 p-3">
      <p className="mb-2 font-sans text-[11px] font-semibold uppercase tracking-[0.14em] text-primary-blue/55">
        {label}
      </p>
      <div className="grid gap-2 sm:grid-cols-2">
        <Field
          label="Label"
          id={`${idPrefix}-l`}
          value={link.label}
          onChange={(e) => onChange({ ...link, label: e.target.value })}
        />
        <Field
          label="Link (URL or #)"
          id={`${idPrefix}-h`}
          value={link.href}
          onChange={(e) => onChange({ ...link, href: e.target.value })}
        />
      </div>
    </div>
  );
}

const EMPTY_PRODUCT: StorefrontProductPlaceholder = {
  title: "New product",
  priceLabel: "R 0.00",
  imageUrl: "",
};

const SECTION_LIBRARY: Array<{
  type: StorefrontSection["type"];
  label: string;
  description: string;
}> = [
  {
    type: "hero",
    label: "Hero banner",
    description: "Large image-led intro with two buttons.",
  },
  {
    type: "featuredProducts",
    label: "Featured products",
    description: "A simple grid of highlighted products.",
  },
  {
    type: "promoBanner",
    label: "Promo banner",
    description: "Sale or campaign card with image and CTA.",
  },
  {
    type: "textImage",
    label: "Text + image",
    description: "Story block with supporting image.",
  },
  {
    type: "features",
    label: "Benefits",
    description: "Three feature columns with icons.",
  },
  {
    type: "faq",
    label: "FAQ",
    description: "Frequently asked questions.",
  },
  {
    type: "contactCta",
    label: "Contact CTA",
    description: "WhatsApp or contact call-to-action.",
  },
];

function slugifyPageTitle(title: string, fallback: string): string {
  const slug = title
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
  return slug || fallback;
}

function newSection(type: StorefrontSection["type"]): StorefrontSection {
  const id = `${type}-${Date.now()}`;
  switch (type) {
    case "hero":
      return {
        id,
        type,
        imageUrl: "",
        heading: "New page hero",
        subheading: "Tell customers what this page is about.",
        primaryCta: { label: "Shop collection", href: "@shop" },
        secondaryCta: { label: "Learn more", href: "#" },
      };
    case "featuredProducts":
      return {
        id,
        type,
        title: "Featured products",
        viewAll: { label: "View all", href: "@shop" },
        products: [{ ...EMPTY_PRODUCT }],
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
          {
            question: "Can I contact you first?",
            answer: "Yes, use the contact button and we will help on WhatsApp.",
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

export function StorefrontEditor({
  config,
  onChange,
  onCustomizeModeChange,
  previewHref,
}: StorefrontEditorProps) {
  const [section, setSection] = useState<StorefrontEditorSectionId>(
    EDITOR_SECTIONS[0].id,
  );
  const [showSectionPicker, setShowSectionPicker] = useState(true);
  const [selectedPageId, setSelectedPageId] = useState<"home" | string>("home");

  useEffect(() => {
    onCustomizeModeChange?.(
      showSectionPicker ? "sections" : "section",
    );
  }, [showSectionPicker, onCustomizeModeChange]);

  function patch(partial: Partial<StorefrontConfig>) {
    onChange({ ...config, ...partial });
  }

  function patchNav(i: number, next: StorefrontLink) {
    const navLinks = config.navLinks.map((l, j) => (j === i ? next : l));
    patch({ navLinks });
  }

  function patchProduct(
    index: number,
    partial: Partial<StorefrontProductPlaceholder>,
  ) {
    const products = config.products.map((p, j) =>
      j === index ? { ...p, ...partial } : p,
    );
    patch({ products });
  }

  function moveProduct(from: number, to: number) {
    if (to < 0 || to >= config.products.length) return;
    const products = [...config.products];
    const [row] = products.splice(from, 1);
    products.splice(to, 0, row);
    patch({ products });
  }

  function addProduct() {
    patch({ products: [...config.products, { ...EMPTY_PRODUCT }] });
  }

  function removeProduct(index: number) {
    if (config.products.length <= 1) return;
    patch({ products: config.products.filter((_, i) => i !== index) });
  }

  function patchPromo(index: 0 | 1, partial: Partial<StorefrontPromoCard>) {
    const next = { ...config.promos[index], ...partial };
    const promos: [StorefrontPromoCard, StorefrontPromoCard] =
      index === 0
        ? [next, config.promos[1]]
        : [config.promos[0], next];
    patch({ promos });
  }

  function patchFeature(index: number, partial: Partial<StorefrontFeature>) {
    const features = config.features.map((f, j) =>
      j === index ? { ...f, ...partial } : f,
    ) as StorefrontConfig["features"];
    patch({ features });
  }

  function patchFooterColumn(
    key: "footerShopLinks" | "footerPolicyLinks" | "footerConnectLinks",
    index: number,
    next: StorefrontLink,
  ) {
    const list = config[key].map((l, j) => (j === index ? next : l));
    patch({ [key]: list });
  }

  const selectedPage =
    selectedPageId === "home"
      ? null
      : config.pages.find((p) => p.id === selectedPageId) ?? null;
  const editableSections =
    selectedPageId === "home" ? config.sections : selectedPage?.sections ?? [];

  function patchSections(nextSections: StorefrontSection[]) {
    if (selectedPageId === "home") {
      patch({ sections: nextSections });
      return;
    }
    patch({
      pages: config.pages.map((page) =>
        page.id === selectedPageId
          ? { ...page, sections: nextSections }
          : page,
      ),
    });
  }

  function patchSelectedPage(partial: Partial<StorefrontCustomPage>) {
    if (selectedPageId === "home") return;
    patch({
      pages: config.pages.map((page) =>
        page.id === selectedPageId ? { ...page, ...partial } : page,
      ),
    });
  }

  function addPage() {
    const n = config.pages.length + 1;
    const title = `New page ${n}`;
    const page: StorefrontCustomPage = {
      id: `page-${Date.now()}`,
      title,
      slug: slugifyPageTitle(title, `page-${n}`),
      sections: [newSection("hero")],
    };
    patch({ pages: [...config.pages, page] });
    setSelectedPageId(page.id);
  }

  function removeSelectedPage() {
    if (selectedPageId === "home") return;
    patch({ pages: config.pages.filter((page) => page.id !== selectedPageId) });
    setSelectedPageId("home");
  }

  function addSection(type: StorefrontSection["type"]) {
    patchSections([...editableSections, newSection(type)]);
  }

  function moveSection(from: number, to: number) {
    if (to < 0 || to >= editableSections.length) return;
    const next = [...editableSections];
    const [row] = next.splice(from, 1);
    next.splice(to, 0, row);
    patchSections(next);
  }

  function removeSection(index: number) {
    if (editableSections.length <= 1) return;
    patchSections(editableSections.filter((_, i) => i !== index));
  }

  function patchSectionAt(index: number, nextSection: StorefrontSection) {
    patchSections(
      editableSections.map((item, i) => (i === index ? nextSection : item)),
    );
  }

  const sectionLabel =
    EDITOR_SECTIONS.find((s) => s.id === section)?.label ?? section;

  function selectSection(id: StorefrontEditorSectionId) {
    setSection(id);
    setShowSectionPicker(false);
  }

  function selectTheme(themeId: StorefrontThemeId) {
    patch({
      themeId,
      accentColor: STOREFRONT_THEME_DEFINITIONS[themeId].defaultAccent,
    });
  }

  function renderSectionFields(item: StorefrontSection, index: number) {
    switch (item.type) {
      case "hero":
        return (
          <div className="space-y-3">
            <Field
              label="Heading"
              id={`sec-${item.id}-heading`}
              value={item.heading}
              onChange={(e) =>
                patchSectionAt(index, { ...item, heading: e.target.value })
              }
            />
            <TextAreaField
              label="Subheading"
              id={`sec-${item.id}-subheading`}
              value={item.subheading}
              onChange={(e) =>
                patchSectionAt(index, { ...item, subheading: e.target.value })
              }
            />
            <Field
              label="Background image URL"
              id={`sec-${item.id}-image`}
              value={item.imageUrl}
              onChange={(e) =>
                patchSectionAt(index, { ...item, imageUrl: e.target.value })
              }
            />
            <LinkPairEditor
              label="Primary button"
              link={item.primaryCta}
              idPrefix={`sec-${item.id}-primary`}
              onChange={(next) =>
                patchSectionAt(index, { ...item, primaryCta: next })
              }
            />
            <LinkPairEditor
              label="Secondary button"
              link={item.secondaryCta}
              idPrefix={`sec-${item.id}-secondary`}
              onChange={(next) =>
                patchSectionAt(index, { ...item, secondaryCta: next })
              }
            />
          </div>
        );
      case "featuredProducts":
        return (
          <div className="space-y-3">
            <Field
              label="Title"
              id={`sec-${item.id}-title`}
              value={item.title}
              onChange={(e) =>
                patchSectionAt(index, { ...item, title: e.target.value })
              }
            />
            <LinkPairEditor
              label="View all link"
              link={item.viewAll}
              idPrefix={`sec-${item.id}-view-all`}
              onChange={(next) =>
                patchSectionAt(index, { ...item, viewAll: next })
              }
            />
            <div className="space-y-3">
              <div className="flex items-center justify-between gap-2">
                <p className="font-sans text-[11px] font-semibold uppercase tracking-[0.14em] text-primary-blue/55">
                  Products
                </p>
                <button
                  type="button"
                  onClick={() =>
                    patchSectionAt(index, {
                      ...item,
                      products: [...item.products, { ...EMPTY_PRODUCT }],
                    })
                  }
                  className="font-sans text-xs font-semibold text-primary-blue underline decoration-primary-blue/30 underline-offset-2"
                >
                  Add product
                </button>
              </div>
              {item.products.map((product, productIndex) => (
                <div
                  key={`${item.id}-product-${productIndex}`}
                  className="rounded border border-primary-blue/10 bg-white p-3"
                >
                  <div className="mb-2 flex items-center justify-between gap-2">
                    <p className="font-sans text-[10px] font-semibold uppercase tracking-[0.14em] text-primary-blue/45">
                      Product {productIndex + 1}
                    </p>
                    <button
                      type="button"
                      disabled={item.products.length <= 1}
                      onClick={() =>
                        patchSectionAt(index, {
                          ...item,
                          products: item.products.filter(
                            (_, i) => i !== productIndex,
                          ),
                        })
                      }
                      className="font-sans text-xs font-semibold text-red-700/90 disabled:opacity-30"
                    >
                      Remove
                    </button>
                  </div>
                  <div className="grid gap-2">
                    <Field
                      label="Title"
                      id={`sec-${item.id}-product-${productIndex}-title`}
                      value={product.title}
                      onChange={(e) =>
                        patchSectionAt(index, {
                          ...item,
                          products: item.products.map((p, i) =>
                            i === productIndex
                              ? { ...p, title: e.target.value }
                              : p,
                          ),
                        })
                      }
                    />
                    <Field
                      label="Price"
                      id={`sec-${item.id}-product-${productIndex}-price`}
                      value={product.priceLabel}
                      onChange={(e) =>
                        patchSectionAt(index, {
                          ...item,
                          products: item.products.map((p, i) =>
                            i === productIndex
                              ? { ...p, priceLabel: e.target.value }
                              : p,
                          ),
                        })
                      }
                    />
                    <Field
                      label="Image URL"
                      id={`sec-${item.id}-product-${productIndex}-image`}
                      value={product.imageUrl}
                      onChange={(e) =>
                        patchSectionAt(index, {
                          ...item,
                          products: item.products.map((p, i) =>
                            i === productIndex
                              ? { ...p, imageUrl: e.target.value }
                              : p,
                          ),
                        })
                      }
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
      case "promoBanner":
        return (
          <div className="space-y-3">
            <Field
              label="Title"
              id={`sec-${item.id}-title`}
              value={item.title}
              onChange={(e) =>
                patchSectionAt(index, { ...item, title: e.target.value })
              }
            />
            <TextAreaField
              label="Description"
              id={`sec-${item.id}-description`}
              value={item.description}
              onChange={(e) =>
                patchSectionAt(index, {
                  ...item,
                  description: e.target.value,
                })
              }
            />
            <Field
              label="Button label"
              id={`sec-${item.id}-button`}
              value={item.buttonLabel}
              onChange={(e) =>
                patchSectionAt(index, {
                  ...item,
                  buttonLabel: e.target.value,
                })
              }
            />
            <Field
              label="Link"
              id={`sec-${item.id}-href`}
              value={item.href}
              onChange={(e) =>
                patchSectionAt(index, { ...item, href: e.target.value })
              }
            />
            <Field
              label="Image URL"
              id={`sec-${item.id}-image`}
              value={item.imageUrl}
              onChange={(e) =>
                patchSectionAt(index, { ...item, imageUrl: e.target.value })
              }
            />
          </div>
        );
      case "textImage":
        return (
          <div className="space-y-3">
            <Field
              label="Eyebrow"
              id={`sec-${item.id}-eyebrow`}
              value={item.eyebrow}
              onChange={(e) =>
                patchSectionAt(index, { ...item, eyebrow: e.target.value })
              }
            />
            <Field
              label="Title"
              id={`sec-${item.id}-title`}
              value={item.title}
              onChange={(e) =>
                patchSectionAt(index, { ...item, title: e.target.value })
              }
            />
            <TextAreaField
              label="Body"
              id={`sec-${item.id}-body`}
              value={item.body}
              onChange={(e) =>
                patchSectionAt(index, { ...item, body: e.target.value })
              }
            />
            <Field
              label="Image URL"
              id={`sec-${item.id}-image`}
              value={item.imageUrl}
              onChange={(e) =>
                patchSectionAt(index, { ...item, imageUrl: e.target.value })
              }
            />
            <label
              htmlFor={`sec-${item.id}-position`}
              className="block font-sans text-[11px] font-semibold uppercase tracking-[0.16em] text-primary-blue/60"
            >
              Image position
            </label>
            <select
              id={`sec-${item.id}-position`}
              value={item.imagePosition}
              onChange={(e) =>
                patchSectionAt(index, {
                  ...item,
                  imagePosition:
                    e.target.value === "left" ? "left" : "right",
                })
              }
              className="w-full border border-primary-blue/15 bg-white px-3 py-2 font-sans text-sm outline-none"
            >
              <option value="left">Left</option>
              <option value="right">Right</option>
            </select>
            <LinkPairEditor
              label="Button"
              link={item.cta}
              idPrefix={`sec-${item.id}-cta`}
              onChange={(next) => patchSectionAt(index, { ...item, cta: next })}
            />
          </div>
        );
      case "features":
        return (
          <div className="space-y-3">
            <Field
              label="Section title"
              id={`sec-${item.id}-title`}
              value={item.title}
              onChange={(e) =>
                patchSectionAt(index, { ...item, title: e.target.value })
              }
            />
            {item.items.map((feature, featureIndex) => (
              <div
                key={`${item.id}-feature-${featureIndex}`}
                className="rounded border border-primary-blue/10 bg-white p-3"
              >
                <Field
                  label={`Feature ${featureIndex + 1} title`}
                  id={`sec-${item.id}-feature-${featureIndex}-title`}
                  value={feature.title}
                  onChange={(e) =>
                    patchSectionAt(index, {
                      ...item,
                      items: item.items.map((f, i) =>
                        i === featureIndex ? { ...f, title: e.target.value } : f,
                      ),
                    })
                  }
                />
                <div className="mt-2">
                  <TextAreaField
                    label="Description"
                    id={`sec-${item.id}-feature-${featureIndex}-description`}
                    value={feature.description}
                    onChange={(e) =>
                      patchSectionAt(index, {
                        ...item,
                        items: item.items.map((f, i) =>
                          i === featureIndex
                            ? { ...f, description: e.target.value }
                            : f,
                        ),
                      })
                    }
                  />
                </div>
              </div>
            ))}
          </div>
        );
      case "faq":
        return (
          <div className="space-y-3">
            <Field
              label="Title"
              id={`sec-${item.id}-title`}
              value={item.title}
              onChange={(e) =>
                patchSectionAt(index, { ...item, title: e.target.value })
              }
            />
            {item.items.map((faq, faqIndex) => (
              <div
                key={`${item.id}-faq-${faqIndex}`}
                className="rounded border border-primary-blue/10 bg-white p-3"
              >
                <div className="mb-2 flex items-center justify-between gap-2">
                  <p className="font-sans text-[10px] font-semibold uppercase tracking-[0.14em] text-primary-blue/45">
                    FAQ {faqIndex + 1}
                  </p>
                  <button
                    type="button"
                    disabled={item.items.length <= 1}
                    onClick={() =>
                      patchSectionAt(index, {
                        ...item,
                        items: item.items.filter((_, i) => i !== faqIndex),
                      })
                    }
                    className="font-sans text-xs font-semibold text-red-700/90 disabled:opacity-30"
                  >
                    Remove
                  </button>
                </div>
                <Field
                  label="Question"
                  id={`sec-${item.id}-faq-${faqIndex}-question`}
                  value={faq.question}
                  onChange={(e) =>
                    patchSectionAt(index, {
                      ...item,
                      items: item.items.map((f, i) =>
                        i === faqIndex
                          ? { ...f, question: e.target.value }
                          : f,
                      ),
                    })
                  }
                />
                <div className="mt-2">
                  <TextAreaField
                    label="Answer"
                    id={`sec-${item.id}-faq-${faqIndex}-answer`}
                    value={faq.answer}
                    onChange={(e) =>
                      patchSectionAt(index, {
                        ...item,
                        items: item.items.map((f, i) =>
                          i === faqIndex ? { ...f, answer: e.target.value } : f,
                        ),
                      })
                    }
                  />
                </div>
              </div>
            ))}
            <button
              type="button"
              onClick={() =>
                patchSectionAt(index, {
                  ...item,
                  items: [
                    ...item.items,
                    { question: "New question", answer: "New answer" },
                  ],
                })
              }
              className="font-sans text-xs font-semibold text-primary-blue underline decoration-primary-blue/30 underline-offset-2"
            >
              Add FAQ
            </button>
          </div>
        );
      case "contactCta":
        return (
          <div className="space-y-3">
            <Field
              label="Title"
              id={`sec-${item.id}-title`}
              value={item.title}
              onChange={(e) =>
                patchSectionAt(index, { ...item, title: e.target.value })
              }
            />
            <TextAreaField
              label="Body"
              id={`sec-${item.id}-body`}
              value={item.body}
              onChange={(e) =>
                patchSectionAt(index, { ...item, body: e.target.value })
              }
            />
            <Field
              label="Button label"
              id={`sec-${item.id}-button`}
              value={item.buttonLabel}
              onChange={(e) =>
                patchSectionAt(index, {
                  ...item,
                  buttonLabel: e.target.value,
                })
              }
            />
            <Field
              label="Link"
              id={`sec-${item.id}-href`}
              value={item.href}
              onChange={(e) =>
                patchSectionAt(index, { ...item, href: e.target.value })
              }
            />
          </div>
        );
    }
  }

  let body: ReactNode;
  switch (section) {
    case "appearance":
      body = (
        <div className="space-y-5">
          <p className="font-sans text-xs leading-relaxed text-muted-foreground">
            Choose the main colour theme for storefront backgrounds, text, and
            buttons. Data saves in{" "}
            <span className="font-medium text-primary-blue/80">
              localStorage
            </span>{" "}
            until your API is ready.
          </p>
          <div>
            <label
              htmlFor="sf-theme"
              className="mb-1.5 block font-sans text-[11px] font-semibold uppercase tracking-[0.16em] text-primary-blue/60"
            >
              Theme preset
            </label>
            <select
              id="sf-theme"
              className="w-full border border-primary-blue/15 bg-white px-3 py-2 font-sans text-sm outline-none focus-visible:border-primary-blue/35 focus-visible:ring-2 focus-visible:ring-primary-blue/15"
              value={config.themeId}
              onChange={(e) =>
                selectTheme(e.target.value as StorefrontThemeId)
              }
            >
              {Object.values(STOREFRONT_THEME_DEFINITIONS).map((t) => (
                <option key={t.id} value={t.id}>
                  {t.label}
                </option>
              ))}
            </select>
            <p className="mt-2 font-sans text-[11px] leading-relaxed text-muted-foreground">
              Switching theme updates the live preview immediately.
            </p>
          </div>
        </div>
      );
      break;
    case "pages":
      body = (
        <div className="space-y-6">
          <div>
            <div className="flex flex-wrap items-center justify-between gap-2">
              <p className="font-sans text-[11px] font-semibold uppercase tracking-[0.16em] text-primary-blue/60">
                Pages
              </p>
              <button
                type="button"
                onClick={addPage}
                className="font-sans text-xs font-semibold text-primary-blue underline decoration-primary-blue/30 underline-offset-2"
              >
                Add page
              </button>
            </div>
            <div className="mt-3 flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => setSelectedPageId("home")}
                className={`rounded border px-3 py-2 font-sans text-xs font-semibold ${
                  selectedPageId === "home"
                    ? "border-primary-blue bg-primary-blue text-white"
                    : "border-primary-blue/15 bg-white text-primary-blue"
                }`}
              >
                Homepage
              </button>
              {config.pages.map((page) => (
                <button
                  key={page.id}
                  type="button"
                  onClick={() => setSelectedPageId(page.id)}
                  className={`rounded border px-3 py-2 font-sans text-xs font-semibold ${
                    selectedPageId === page.id
                      ? "border-primary-blue bg-primary-blue text-white"
                      : "border-primary-blue/15 bg-white text-primary-blue"
                  }`}
                >
                  {page.title}
                </button>
              ))}
            </div>
          </div>

          {selectedPage ? (
            <div className="rounded border border-primary-blue/10 bg-blue-gray/15 p-3">
              <div className="grid gap-3 sm:grid-cols-2">
                <Field
                  label="Page title"
                  id={`page-${selectedPage.id}-title`}
                  value={selectedPage.title}
                  onChange={(e) => {
                    const title = e.target.value;
                    patchSelectedPage({
                      title,
                      slug: slugifyPageTitle(title, selectedPage.slug),
                    });
                  }}
                />
                <Field
                  label="Page slug"
                  id={`page-${selectedPage.id}-slug`}
                  value={selectedPage.slug}
                  onChange={(e) =>
                    patchSelectedPage({
                      slug: slugifyPageTitle(e.target.value, selectedPage.slug),
                    })
                  }
                />
              </div>
              {previewHref ? (
                <Link
                  href={`${previewHref}/page/${selectedPage.slug}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-3 inline-flex font-sans text-xs font-semibold text-primary-blue underline decoration-primary-blue/30 underline-offset-2"
                >
                  Preview page
                </Link>
              ) : null}
              <button
                type="button"
                onClick={removeSelectedPage}
                className="ml-4 font-sans text-xs font-semibold text-red-700/90 underline decoration-red-700/25 underline-offset-2"
              >
                Remove page
              </button>
            </div>
          ) : null}

          <div className="rounded border border-primary-blue/10 bg-white p-3">
            <p className="font-sans text-[11px] font-semibold uppercase tracking-[0.16em] text-primary-blue/60">
              Section library
            </p>
            <div className="mt-3 grid gap-2">
              {SECTION_LIBRARY.map((item) => (
                <button
                  key={item.type}
                  type="button"
                  onClick={() => addSection(item.type)}
                  className="rounded border border-primary-blue/10 bg-blue-gray/15 p-3 text-left transition-colors hover:bg-blue-gray/35"
                >
                  <span className="block font-sans text-sm font-semibold text-primary-blue">
                    {item.label}
                  </span>
                  <span className="mt-1 block font-sans text-xs leading-relaxed text-muted-foreground">
                    {item.description}
                  </span>
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-4">
            <p className="font-sans text-[11px] font-semibold uppercase tracking-[0.16em] text-primary-blue/60">
              Sections
            </p>
            {editableSections.map((item, index) => (
              <div
                key={item.id}
                className="rounded border border-primary-blue/10 bg-blue-gray/15 p-3"
              >
                <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <p className="font-sans text-sm font-semibold text-primary-blue">
                      {SECTION_LIBRARY.find((s) => s.type === item.type)?.label ??
                        item.type}
                    </p>
                    <p className="font-sans text-[10px] uppercase tracking-[0.14em] text-primary-blue/45">
                      Section {index + 1}
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-1">
                    <button
                      type="button"
                      disabled={index === 0}
                      onClick={() => moveSection(index, index - 1)}
                      className="rounded border border-primary-blue/15 bg-white px-2 py-1 font-sans text-[11px] font-medium text-primary-blue disabled:opacity-30"
                    >
                      Up
                    </button>
                    <button
                      type="button"
                      disabled={index === editableSections.length - 1}
                      onClick={() => moveSection(index, index + 1)}
                      className="rounded border border-primary-blue/15 bg-white px-2 py-1 font-sans text-[11px] font-medium text-primary-blue disabled:opacity-30"
                    >
                      Down
                    </button>
                    <button
                      type="button"
                      disabled={editableSections.length <= 1}
                      onClick={() => removeSection(index)}
                      className="rounded border border-primary-blue/15 bg-white px-2 py-1 font-sans text-[11px] font-medium text-red-700/90 disabled:opacity-30"
                    >
                      Remove
                    </button>
                  </div>
                </div>
                {renderSectionFields(item, index)}
              </div>
            ))}
          </div>
        </div>
      );
      break;
    case "brand":
      body = (
        <div className="space-y-4">
          <p className="font-sans text-xs leading-relaxed text-muted-foreground">
            Shown in the header and footer. Defaults live in{" "}
            <code className="rounded bg-blue-gray/50 px-1 text-[11px]">
              default-storefront.json
            </code>
            .
          </p>
          <Field
            label="Brand name (header & footer)"
            id="sf-shop-name"
            value={config.shopName}
            onChange={(e) => patch({ shopName: e.target.value })}
          />
          <TextAreaField
            label="Tagline (under logo)"
            id="sf-tagline"
            value={config.tagline}
            onChange={(e) => patch({ tagline: e.target.value })}
          />
        </div>
      );
      break;
    case "navbar":
      body = (
        <div className="space-y-5">
          <Field
            label="Active nav item (0 = first link)"
            id="sf-nav-active"
            type="number"
            min={0}
            max={Math.max(0, config.navLinks.length - 1)}
            value={config.activeNavIndex}
            onChange={(e) =>
              patch({ activeNavIndex: Number(e.target.value) || 0 })
            }
          />
          <ul className="space-y-3">
            {config.navLinks.map((link, i) => (
              <li key={i}>
                <LinkPairEditor
                  label={`Nav link ${i + 1}`}
                  link={link}
                  idPrefix={`nav-${i}`}
                  onChange={(next) => patchNav(i, next)}
                />
              </li>
            ))}
          </ul>
          <Field
            label="Cart badge (e.g. 0)"
            id="sf-cart"
            value={config.cartCountLabel}
            onChange={(e) => patch({ cartCountLabel: e.target.value })}
          />
        </div>
      );
      break;
    case "hero":
      body = (
        <div className="space-y-4">
          <Field
            label="Hero background image URL (HTTPS)"
            id="sf-hero-bg"
            placeholder="https://…"
            value={config.heroBackgroundImageUrl}
            onChange={(e) =>
              patch({ heroBackgroundImageUrl: e.target.value })
            }
          />
          <Field
            label="Hero heading"
            id="sf-hero-heading"
            value={config.heroHeading}
            onChange={(e) => patch({ heroHeading: e.target.value })}
          />
          <TextAreaField
            label="Hero subheading"
            id="sf-hero-sub"
            value={config.heroSubheading}
            onChange={(e) => patch({ heroSubheading: e.target.value })}
          />
          <LinkPairEditor
            label="Primary button"
            link={config.heroPrimaryCta}
            idPrefix="hero-pri"
            onChange={(next) => patch({ heroPrimaryCta: next })}
          />
          <LinkPairEditor
            label="Secondary button"
            link={config.heroSecondaryCta}
            idPrefix="hero-sec"
            onChange={(next) => patch({ heroSecondaryCta: next })}
          />
        </div>
      );
      break;
    case "products":
      body = (
        <div className="space-y-6">
          <div className="space-y-3">
            <p className="font-sans text-[11px] font-semibold uppercase tracking-[0.16em] text-primary-blue/60">
              Featured block
            </p>
            <Field
              label="Section title"
              id="sf-featured-title"
              value={config.featuredTitle}
              onChange={(e) => patch({ featuredTitle: e.target.value })}
            />
            <LinkPairEditor
              label="“View all” link"
              link={config.featuredViewAll}
              idPrefix="feat-all"
              onChange={(next) => patch({ featuredViewAll: next })}
            />
          </div>
          <div className="border-t border-primary-blue/10 pt-5">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <p className="font-sans text-[11px] font-semibold uppercase tracking-[0.16em] text-primary-blue/60">
                Product grid
              </p>
              <button
                type="button"
                onClick={addProduct}
                className="font-sans text-xs font-semibold text-primary-blue underline decoration-primary-blue/30 underline-offset-2 hover:decoration-primary-blue"
              >
                Add product
              </button>
            </div>
            <ul className="mt-3 space-y-4">
              {config.products.map((p, i) => (
                <li
                  key={`${i}-${p.title}`}
                  className="rounded border border-primary-blue/10 bg-blue-gray/20 p-3"
                >
                  <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                    <span className="font-sans text-[10px] font-semibold uppercase tracking-[0.14em] text-primary-blue/45">
                      #{i + 1}
                    </span>
                    <div className="flex flex-wrap gap-1">
                      <button
                        type="button"
                        disabled={i === 0}
                        onClick={() => moveProduct(i, i - 1)}
                        className="rounded border border-primary-blue/15 bg-white px-2 py-1 font-sans text-[11px] font-medium text-primary-blue disabled:opacity-30"
                      >
                        Up
                      </button>
                      <button
                        type="button"
                        disabled={i === config.products.length - 1}
                        onClick={() => moveProduct(i, i + 1)}
                        className="rounded border border-primary-blue/15 bg-white px-2 py-1 font-sans text-[11px] font-medium text-primary-blue disabled:opacity-30"
                      >
                        Down
                      </button>
                      <button
                        type="button"
                        disabled={config.products.length <= 1}
                        onClick={() => removeProduct(i)}
                        className="rounded border border-primary-blue/15 bg-white px-2 py-1 font-sans text-[11px] font-medium text-red-700/90 disabled:opacity-30"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                  <Field
                    label="Image URL (HTTPS)"
                    id={`sf-p-${i}-img`}
                    placeholder="https://…"
                    value={p.imageUrl}
                    onChange={(e) =>
                      patchProduct(i, { imageUrl: e.target.value })
                    }
                  />
                  {p.imageUrl.trim() ? (
                    <div className="mt-2 overflow-hidden rounded border border-primary-blue/10">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={p.imageUrl}
                        alt=""
                        className="h-24 w-full object-cover"
                      />
                    </div>
                  ) : null}
                  <div className="mt-3">
                    <Field
                      label="Title"
                      id={`sf-p-${i}-t`}
                      value={p.title}
                      onChange={(e) =>
                        patchProduct(i, { title: e.target.value })
                      }
                    />
                  </div>
                  <div className="mt-2">
                    <Field
                      label="Price label"
                      id={`sf-p-${i}-p`}
                      value={p.priceLabel}
                      onChange={(e) =>
                        patchProduct(i, { priceLabel: e.target.value })
                      }
                    />
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      );
      break;
    case "promos":
      body = (
        <div className="space-y-4">
          {([0, 1] as const).map((idx) => (
            <div
              key={idx}
              className="rounded border border-primary-blue/10 bg-white p-3"
            >
              <p className="mb-2 font-sans text-xs font-semibold text-primary-blue">
                Promo {idx + 1}
              </p>
              <div className="space-y-2">
                <Field
                  label="Title"
                  id={`promo-${idx}-t`}
                  value={config.promos[idx].title}
                  onChange={(e) => patchPromo(idx, { title: e.target.value })}
                />
                <TextAreaField
                  label="Description"
                  id={`promo-${idx}-d`}
                  value={config.promos[idx].description}
                  onChange={(e) =>
                    patchPromo(idx, { description: e.target.value })
                  }
                />
                <Field
                  label="Button label"
                  id={`promo-${idx}-b`}
                  value={config.promos[idx].buttonLabel}
                  onChange={(e) =>
                    patchPromo(idx, { buttonLabel: e.target.value })
                  }
                />
                <Field
                  label="Background image URL"
                  id={`promo-${idx}-i`}
                  value={config.promos[idx].imageUrl}
                  onChange={(e) =>
                    patchPromo(idx, { imageUrl: e.target.value })
                  }
                />
                <Field
                  label="Link"
                  id={`promo-${idx}-h`}
                  value={config.promos[idx].href}
                  onChange={(e) => patchPromo(idx, { href: e.target.value })}
                />
              </div>
            </div>
          ))}
        </div>
      );
      break;
    case "values":
      body = (
        <ul className="space-y-4">
          {config.features.map((f, i) => (
            <li
              key={i}
              className="rounded border border-primary-blue/10 bg-blue-gray/15 p-3"
            >
              <div className="mb-2 font-sans text-xs font-semibold text-primary-blue">
                Column {i + 1}
              </div>
              <Field
                label="Title"
                id={`feat-${i}-t`}
                value={f.title}
                onChange={(e) => patchFeature(i, { title: e.target.value })}
              />
              <div className="mt-2">
                <TextAreaField
                  label="Description"
                  id={`feat-${i}-d`}
                  value={f.description}
                  onChange={(e) =>
                    patchFeature(i, { description: e.target.value })
                  }
                />
              </div>
              <div className="mt-2">
                <label
                  htmlFor={`feat-${i}-icon`}
                  className="mb-1.5 block font-sans text-[11px] font-semibold uppercase tracking-[0.16em] text-primary-blue/60"
                >
                  Icon
                </label>
                <select
                  id={`feat-${i}-icon`}
                  className="w-full border border-primary-blue/15 bg-white px-3 py-2 font-sans text-sm outline-none"
                  value={f.icon}
                  onChange={(e) =>
                    patchFeature(i, {
                      icon: e.target.value as StorefrontFeatureIconId,
                    })
                  }
                >
                  <option value="check">Check</option>
                  <option value="truck">Truck</option>
                  <option value="sparkle">Sparkle</option>
                </select>
              </div>
            </li>
          ))}
        </ul>
      );
      break;
    case "footer":
      body = (
        <div className="space-y-4">
          <TextAreaField
            label="Brand blurb (first column)"
            id="sf-foot-blurb"
            value={config.footerBlurb}
            onChange={(e) => patch({ footerBlurb: e.target.value })}
          />
          <Field
            label="Copyright line"
            id="sf-copy"
            value={config.copyrightLine}
            onChange={(e) => patch({ copyrightLine: e.target.value })}
          />
          <Field
            label="WhatsApp number (optional, for future CTAs)"
            id="sf-wa"
            placeholder="+27 …"
            value={config.whatsappNumber}
            onChange={(e) => patch({ whatsappNumber: e.target.value })}
          />
          <p className="pt-2 font-sans text-[11px] font-semibold uppercase tracking-[0.14em] text-primary-blue/50">
            Shop links
          </p>
          {config.footerShopLinks.map((l, i) => (
            <LinkPairEditor
              key={i}
              label={`Link ${i + 1}`}
              link={l}
              idPrefix={`fs-${i}`}
              onChange={(next) => patchFooterColumn("footerShopLinks", i, next)}
            />
          ))}
          <p className="pt-2 font-sans text-[11px] font-semibold uppercase tracking-[0.14em] text-primary-blue/50">
            Policy links
          </p>
          {config.footerPolicyLinks.map((l, i) => (
            <LinkPairEditor
              key={i}
              label={`Link ${i + 1}`}
              link={l}
              idPrefix={`fp-${i}`}
              onChange={(next) =>
                patchFooterColumn("footerPolicyLinks", i, next)
              }
            />
          ))}
          <p className="pt-2 font-sans text-[11px] font-semibold uppercase tracking-[0.14em] text-primary-blue/50">
            Connect links
          </p>
          {config.footerConnectLinks.map((l, i) => (
            <LinkPairEditor
              key={i}
              label={`Link ${i + 1}`}
              link={l}
              idPrefix={`fc-${i}`}
              onChange={(next) =>
                patchFooterColumn("footerConnectLinks", i, next)
              }
            />
          ))}
        </div>
      );
      break;
  }

  const sectionNav = (
    <nav
      className="min-h-0 flex-1 overflow-y-auto overscroll-contain border-primary-blue/10 py-2 lg:border-b lg:pb-3"
      aria-label="Storefront sections"
    >
      <ul className="flex flex-col gap-0.5">
        {EDITOR_SECTIONS.map(({ id, label }) => (
          <li key={id}>
            <button
              type="button"
              onClick={() => selectSection(id)}
              className="flex w-full items-center justify-between rounded-md px-2.5 py-2 text-left font-sans text-sm text-primary-blue transition-colors hover:bg-blue-gray/40"
            >
              <span>{label}</span>
              <span aria-hidden className="text-primary-blue/35">
                ›
              </span>
            </button>
          </li>
        ))}
      </ul>
    </nav>
  );

  if (showSectionPicker) {
    return <div className="flex min-h-0 flex-1 flex-col">{sectionNav}</div>;
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="shrink-0 border-b border-primary-blue/10 bg-white pb-3 pt-0.5">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <button
            type="button"
            onClick={() => setShowSectionPicker(true)}
            className="inline-flex items-center gap-2 rounded-md px-1 py-1.5 font-sans text-sm font-semibold text-primary-blue transition-colors hover:bg-blue-gray/40"
          >
            <span aria-hidden className="text-base leading-none">
              ←
            </span>
            <span>Return</span>
          </button>
          <div className="flex min-w-0 flex-1 items-center justify-end gap-3 sm:justify-between">
            <p className="hidden min-w-0 truncate font-sans text-xs font-medium text-primary-blue/70 sm:block">
              {sectionLabel}
            </p>
            {previewHref ? (
              <Link
                href={previewHref}
                target="_blank"
                rel="noopener noreferrer"
                className="shrink-0 font-sans text-xs font-semibold text-primary-blue underline decoration-primary-blue/30 underline-offset-2 hover:decoration-primary-blue lg:hidden"
              >
                Preview
              </Link>
            ) : null}
          </div>
        </div>
        <p className="mt-1 font-sans text-xs font-medium text-primary-blue/70 sm:hidden">
          {sectionLabel}
        </p>
      </div>
      <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain py-4">
        <h2 className="sr-only">{sectionLabel}</h2>
        {body}
      </div>
    </div>
  );
}
