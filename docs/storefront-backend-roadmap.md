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

## Recommended Timeline

1. Send Step 01 now.
2. Wait for backend foundation APIs to be completed.
3. Send Step 02 for publish/Go Live.
4. Send Step 03 and Step 04 for products and media.
5. Send Step 05 for live public storefront APIs.
6. Send Step 06 for checkout/orders/payments.
7. Use Step 07 internally for frontend integration.
8. Use Step 08 as the launch readiness checklist.

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
