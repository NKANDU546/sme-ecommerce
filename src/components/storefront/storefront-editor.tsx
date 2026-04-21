"use client";

import type { ComponentPropsWithoutRef } from "react";
import type {
  StorefrontConfig,
  StorefrontFeature,
  StorefrontFeatureIconId,
  StorefrontLink,
  StorefrontProductPlaceholder,
  StorefrontPromoCard,
} from "@/types/storefront";

type StorefrontEditorProps = {
  config: StorefrontConfig;
  onChange: (next: StorefrontConfig) => void;
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

export function StorefrontEditor({ config, onChange }: StorefrontEditorProps) {
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

  return (
    <div className="space-y-6">
      <p className="font-sans text-xs leading-relaxed text-muted-foreground">
        Layout matches the stakeholder reference (nav, hero, grid, promos,
        value props, footer). Data saves in{" "}
        <span className="font-medium text-primary-blue/80">localStorage</span>{" "}
        until your API is ready. Defaults live in{" "}
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

      <div className="border-t border-primary-blue/10 pt-5">
        <p className="font-sans text-[11px] font-semibold uppercase tracking-[0.16em] text-primary-blue/60">
          Navigation
        </p>
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
        <ul className="mt-3 space-y-3">
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
      </div>

      <div className="border-t border-primary-blue/10 pt-5">
        <p className="font-sans text-[11px] font-semibold uppercase tracking-[0.16em] text-primary-blue/60">
          Hero (full-width background)
        </p>
        <div className="mt-3 space-y-4">
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
      </div>

      <div className="border-t border-primary-blue/10 pt-5">
        <p className="font-sans text-[11px] font-semibold uppercase tracking-[0.16em] text-primary-blue/60">
          Featured grid
        </p>
        <div className="mt-3 space-y-3">
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
      </div>

      <Field
        label="Cart badge (e.g. 0)"
        id="sf-cart"
        value={config.cartCountLabel}
        onChange={(e) => patch({ cartCountLabel: e.target.value })}
      />
      <Field
        label="Accent colour (hex, reserved for future use)"
        id="sf-accent"
        value={config.accentColor}
        onChange={(e) => patch({ accentColor: e.target.value })}
      />
      <Field
        label="WhatsApp number (optional, for future CTAs)"
        id="sf-wa"
        placeholder="+27 …"
        value={config.whatsappNumber}
        onChange={(e) => patch({ whatsappNumber: e.target.value })}
      />

      <div className="border-t border-primary-blue/10 pt-5">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <p className="font-sans text-[11px] font-semibold uppercase tracking-[0.16em] text-primary-blue/60">
            Products
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
                onChange={(e) => patchProduct(i, { imageUrl: e.target.value })}
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
                  onChange={(e) => patchProduct(i, { title: e.target.value })}
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

      <div className="border-t border-primary-blue/10 pt-5">
        <p className="font-sans text-[11px] font-semibold uppercase tracking-[0.16em] text-primary-blue/60">
          Promo tiles (wide + narrow)
        </p>
        <div className="mt-3 space-y-4">
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
      </div>

      <div className="border-t border-primary-blue/10 pt-5">
        <p className="font-sans text-[11px] font-semibold uppercase tracking-[0.16em] text-primary-blue/60">
          Value columns (3)
        </p>
        <ul className="mt-3 space-y-4">
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
      </div>

      <div className="border-t border-primary-blue/10 pt-5">
        <p className="font-sans text-[11px] font-semibold uppercase tracking-[0.16em] text-primary-blue/60">
          Footer
        </p>
        <div className="mt-3 space-y-3">
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
      </div>
    </div>
  );
}
