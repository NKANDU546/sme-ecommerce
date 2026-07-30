# Merchant recipe: New arrivals & Sale pages

Use this after Step 03B (compare-at price + product filters) is live.

## Put products on sale

1. Open **Products** in the dashboard.
2. Edit a product.
3. Set **Price** (selling price) and **Compare-at price** (was / strikethrough).
4. Compare-at must be higher than price. Save / publish the product as **Active**.

Products with a valid compare-at appear in Sale sections automatically.

## New arrivals

No extra flag. Active products sorted by newest `createdAt` appear in New
arrivals sections. Create/publish products as usual.

## Build a New arrivals page

1. Storefront → **Pages & sections** → **Add page**.
2. Title e.g. `New arrivals`, slug e.g. `new-arrivals` (public URL `/{slug}`).
3. Optionally add a **Hero** (you can remove both buttons) for the page title.
4. Add section **New arrivals**.
5. Enable **Show all products** (or set a high custom count).
6. Click **Products only (hide eyebrow, title & button)** so the section is just
   the product grid (page title lives in the Hero / nav).
7. Add a nav link with href `@page:new-arrivals`.

## Build a Sale page

1. Add a page titled `Sale`, slug `sale`.
2. Add section **Sale**.
3. Enable **Show all products**.
4. Click **Products only (hide eyebrow, title, description & button)** so the
   section is just the product grid.
5. Nav link: `@page:sale`.

## Homepage teasers

On the homepage, keep **New arrivals** / **Sale** / **Featured products** with a
small limit (default `4`, Show all off) and point **View all** / the Sale button
to `@page:new-arrivals` or `@page:sale`.

## Shop

`/shop` remains the full catalogue (all active products). Sale and New arrivals
pages are filtered views, not replacements for Shop.
