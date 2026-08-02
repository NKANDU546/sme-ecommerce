# Step 11: Second Template — Minimal Catalogue

Add a second **built-in** storefront template for merchants who sell **any
goods** (groceries, hardware, beauty, electronics, gifts, B2B light) — not only
fashion / lifestyle.

OpenAI assist (Step 10) can wait. Template import (HTML/ZIP) is **out of scope**.

## Status

**Backend: required** — seed `minimal-catalogue` like `classic-boutique` (Apply
via `draft/reset` needs it).  
**Frontend: implemented** in this repo — renderer, chrome registry, catalog,
neutral multi-category seed for picker preview.

## Product intent

| | `classic-boutique` | `minimal-catalogue` |
|--|--|--|
| Feel | Editorial retail, storytelling | Clean catalogue, products first |
| Best for | Fashion, beauty, décor, gifts | Multi-category / general SME retail |
| Home bias | Hero story + promos | Shop CTA + featured grid + categories |
| Copy | Seasonal / collection language | Neutral: prices, stock, order easy |

Same commerce engine (products, cart, Paystack, inventory). Only **chrome +
default seed** differ.

## Template id

```text
minimal-catalogue
```

`StorefrontTemplateId` = `"classic-boutique" | "minimal-catalogue"`.

Version: **1** for first ship.

## Backend requirements

1. Register template in `storefront_templates` / versions.
2. Default draft config seed (JSON) for `minimal-catalogue` v1 — multi-category
   **neutral** copy (no “summer collection”, “dresses”, “new season”).
3. `POST …/storefront/draft/reset` with `{ "templateId": "minimal-catalogue" }`
   must load that seed (products catalogue unchanged).
4. `GET /storefront-templates` lists it as available when ready.
5. Publish snapshots store `templateId` + `templateVersion` as today.

### Suggested seed copy (guide)

- Shop name placeholder: merchant brand
- Tagline: e.g. “Clear prices. Easy online orders.”
- Hero heading: “Browse the catalogue”
- Hero sub: “Find what you need, check stock, and check out securely.”
- Featured: “Popular products”
- Features: shipping / secure pay / support (category-agnostic)
- Avoid fashion-only CTAs in defaults

Exact JSON lives in FE seed file for preview; backend seed should match closely.

## Frontend requirements

1. **Chrome registry** — header/footer by `config.templateId` (no Classic hardcode
   on shop / PDP / cart / track pages).
2. **Renderer** — `MinimalCatalogueStorefront` + header/footer variants.
3. **Catalog** — enable `minimal-catalogue` in `STOREFRONT_TEMPLATE_CATALOG`.
4. **Picker preview** — `createInitialStorefrontFromSeed(templateId)`.
5. **Theme** — `themeId` presets: `blue`, `red`, `ink`, `forest`, `teal`, `stone`
   (same allowlist on both templates). Distinct layout, not a new theme system.

### Visual direction (minimal-catalogue)

Distinct from Classic Boutique (not a recolor):

| Surface | Classic Boutique | Minimal Catalogue |
|---------|------------------|-------------------|
| Hero | Full-bleed photo + white serif overlay | **Split** light copy pane + image pane |
| Type | Serif headlines | **Sans** headlines throughout |
| Theme | Blue / red boutique | Default **`ink`** (zinc / cool grey) |
| Products | Soft cards, hover zoom | Dense **hairline grid**, flat cards |
| Benefits | Icon row | Numbered bordered cells |
| Promo | Large dark split panel | Thin horizontal offer band |
| Contact CTA | Full-bleed accent + serif | Light bordered panel, left-aligned |

## Apply flow

Same as today: Templates panel → Choose → `reset` draft with
`templateId: "minimal-catalogue"` → mark chosen → open editor.

## Acceptance

- [ ] Picker shows Classic + Minimal Catalogue as available
- [ ] Preview modal renders Minimal chrome + seed
- [ ] Apply resets draft to Minimal seed (backend)
- [ ] Public `/s/{slug}` and preview shop/PDP/cart use Minimal header/footer when
      `templateId` is `minimal-catalogue`
- [ ] Switching back to Classic Boutique still works
- [ ] Published snapshot keeps previous template until re-publish

## Out of scope

- `bold-retail` (third template)
- HTML / ZIP theme import
- Per-template section schema fork (same section types)
- Custom domain (see Step 12) / CSS upload

## Send order

1. Backend: seed + reset support for `minimal-catalogue`
2. Frontend: registry + components + catalog (can land in parallel with FE-only
   preview; Apply needs backend seed)
