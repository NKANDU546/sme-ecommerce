# Storefront Backend Roadmap

Use this roadmap to send work to the backend team progressively. Each step should
be completed and tested before starting the next one.

## Step Order

### Step 01: Foundation

File: `docs/storefront-backend-step-01-foundation.md`

Build the backend source of truth for:

- Users/businesses/workspaces
- Storefront draft config
- Storefront templates
- `classic-boutique` seed data
- Protected draft load/save APIs

Send this first.

### Step 02: Publish And Go Live

File: `docs/storefront-backend-step-02-publish.md`

Add:

- Published storefront snapshots
- Publish API
- Unpublish API
- Publish history
- Live status handling

Send this after Step 01 is completed.

### Step 03: Product Catalog

File: `docs/storefront-backend-step-03-products.md`

Add:

- Product tables
- Product CRUD APIs
- Categories
- Product statuses
- Structured prices

Send this after Step 02 or in parallel with Step 02 if another backend developer
is available.

### Step 03B: Product Merchandising (Sale + New Arrivals)

File: `docs/storefront-backend-step-03b-product-merchandising.md`

Add:

- Optional compare-at (was) price on products
- Derived `onSale` flag
- Merchant/public list filters: `onSale`, `sort=newest|price_*`
- Display labels for compare-at prices

Send this after Step 03 (and ideally after Step 05 public product list exists so
public filters can ship in the same change).

### Step 03C: Product Inventory (Hard Stock)

File: `docs/storefront-backend-step-03c-inventory.md`

Add:

- Required `quantity_available` on every product (no opt-in / unlimited mode)
- Migration default for existing products (`999`)
- Merchant + public `quantityAvailable` / `inStock`
- Cart and checkout stock checks (`INSUFFICIENT_STOCK`)
- Decrement on payment `paid` (idempotent); restock on cancel after paid

Depends on Step 03 (product fields) and Step 06A/06B (cart, checkout, mark-paid).
Cancel restock aligns with Step 06C.

### Step 03D: Merchant Out-Of-Stock Email

File: `docs/storefront-backend-step-03d-out-of-stock-email.md`

Add:

- Email workspace owner when quantity hits 0 (paid decrement or merchant PATCH)
- Idempotency via `out_of_stock_notified_at`
- Async SES; never fail payment on email errors

### Step 04: Media Uploads

File: `docs/storefront-backend-step-04-media.md`

Add:

- Media table
- Signed upload URL API
- Media confirmation
- Media library
- Product image references

Send this after Step 03 starts, because products and storefront sections both
need uploaded images.

### Step 05: Public Storefront APIs

File: `docs/storefront-backend-step-05-public-storefront.md`

Add:

- Public storefront by slug
- Public product list/detail
- Public custom pages
- Published-only data rules
- Basic public caching

Send this after Step 02 and Step 03 are complete.

### Step 06: Cart, Checkout, Orders, And Payments

File: `docs/storefront-backend-step-06-checkout-orders-payments.md`

Add:

- Cart APIs
- Order creation
- Order item snapshots
- Payment records
- Payment provider initialization
- Payment webhook handling

**06C** (order status): `docs/storefront-backend-step-06c-order-status.md` — public
lookup by order number + email, merchant fulfilment status updates.

**03C** (hard inventory): `docs/storefront-backend-step-03c-inventory.md` — product
quantity, cart/checkout enforcement, decrement on paid / restock on cancel.
Ship after 06A/06B (and preferably with 06C for cancel restock).

Send this after public storefront and products are working.

### Step 07: Frontend Migration

File: `docs/storefront-backend-step-07-frontend-migration.md`

Update the current Next.js frontend to use the backend APIs:

- Storefront editor
- Products
- Media uploads
- Publish button
- Preview route
- Public live route
- Cart and checkout

Start this when Steps 01 to 05 are stable. Checkout migration depends on Step 06.

### Step 08: Launch Hardening

File: `docs/storefront-backend-step-08-launch-hardening.md`

Prepare for production:

- Security review
- Validation review
- Payment hardening
- Logging and monitoring
- Rate limiting
- Backups
- Launch checklist

Send this before production launch.

### Step 09: Merchant Analytics

File: `docs/storefront-backend-step-09-merchant-analytics.md`

Add (backend **in place**):

- `GET …/analytics/summary` — paid revenue, order counts, AOV, stock KPIs
- `GET …/analytics/timeseries` — daily paid revenue + orders (zeros filled)
- `GET …/analytics/breakdowns` — status / payment pies, top products, category revenue

Depends on Steps 03 (catalog/stock) and 06 (paid orders). Money in major units.
Frontend: wire Dashboard / Analytics sections to these APIs.

### Step 10: Merchant AI Assist (OpenAI)

File: `docs/storefront-backend-step-10-ai-assist.md`

Add (server-side OpenAI only):

- `POST …/ai/product-draft` — suggest title / summary / slug / category (no DB write)
- `POST …/ai/analytics-explain` — bullets from real Step 09 metrics (no client-supplied totals)

Depends on Steps 03 + 09. Feature flag + rate limit per workspace. FE Accept before save.

### Step 11: Second Template — Minimal Catalogue

File: `docs/storefront-backend-step-11-minimal-catalogue.md`

Add built-in template `minimal-catalogue` (multi-category / general retail):

- Backend seed + `draft/reset` support
- FE renderer, chrome registry, picker catalog entry
- Neutral default copy (not fashion-only)

Prefer this over Step 10 AI assist when prioritizing merchant adoption beyond clothing.

### Step 12: Custom Domains

File: `docs/storefront-backend-step-12-custom-domains.md`

Post-launch branding URLs:

- **12A** Platform subdomain — `{storeSlug}.stores.example.com` (wildcard DNS/TLS)
- **12B** Merchant custom domain — DNS TXT + CNAME verify, TLS provisioning
- Host → store resolve, middleware rewrite, primary origin for Paystack/emails
- Dashboard Domains panel (copy URL / add / verify / set primary / remove)

Depends on Steps 02, 05, 06, and a stable Step 08 path-based live site. Prefer
after Steps 09 + 11 unless merchants block on branded URLs.

## Recommended Timeline

1. Send Step 01 now.
2. Wait for backend foundation APIs to be completed.
3. Send Step 02 for publish/Go Live.
4. Send Step 03 and Step 04 for products and media.
5. Send Step 05 for live public storefront APIs.
6. Send Step 06 for checkout/orders/payments (incl. 06C order status lookup).
7. Send Step 03C for hard inventory once cart/checkout/paid are stable.
8. Use Step 07 internally for frontend integration.
9. Use Step 08 as the launch readiness checklist.
10. Step 09 analytics APIs → dashboard charts UI.
11. Step 11 second template (`minimal-catalogue`) for non-fashion merchants.
12. Step 10 AI assist (product draft + analytics explain) when OpenAI key is ready.
13. Step 12 custom domains (12A platform subdomain, then 12B bring-your-own).

## Parallel Work Option

If the backend team has more than one developer:

- Developer A: Step 02 publish.
- Developer B: Step 03 products.
- Developer C: Step 04 media.

Do not start Step 05 until publish snapshots and product APIs are ready.

## Main Architecture Decision

The main decision is to keep two storefront states:

- `draft`: what the merchant is editing.
- `published`: what customers see.

Publishing should create an immutable snapshot. Public customer APIs should read
only from the latest published snapshot.
