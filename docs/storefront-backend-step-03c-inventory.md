# Step 03C: Product Inventory (Hard Stock)

Companion to Step 03 / 03B. Every sellable product has a real stock quantity.
Cart, checkout, and payment (Step 06) must respect that quantity. **No opt-in
flag** — inventory is always on.

## Goals

- Store `quantity_available` on every product (required integer ≥ 0).
- Expose stock on merchant and public product APIs (`quantityAvailable`,
  derived `inStock`).
- Reject cart add/update and checkout when requested qty exceeds available.
- Decrement stock atomically when payment becomes `paid`.
- Restock when a paid / processing order is cancelled (and stock was already
  decremented).
- Merchant can adjust quantity via product create/update (and Inventory UI).

## Product decision: hard stock

| Rule | Detail |
|------|--------|
| Always tracked | No `trackInventory` / soft-unlimited mode |
| Active products | May have `quantityAvailable = 0` (sold out on purpose) |
| Draft / archived | Still store quantity; not sold until `active` |
| Create / publish | `quantityAvailable` required on create; must be present when marking `active` |

## Scope

### Included

- `products.quantity_available` column (integer, not null).
- Migration default for existing rows (see below).
- Product create/update validation.
- Merchant + public product response fields.
- Cart add/update stock checks.
- Checkout re-check before creating the order.
- Decrement on payment `paid` (idempotent with webhook).
- Restock on merchant cancel when stock was decremented.
- Error code `INSUFFICIENT_STOCK`.

### Not Included

- Cart soft-hold / reservation TTL.
- Variants (size/colour) with per-variant stock.
- Multi-warehouse / locations.
- Low-stock email alerts.
- Barcodes, PO, supplier receiving.
- Separate Inventory entity table (v1 = quantity on `products`).

## Prerequisites

- Step 03 product catalog.
- Step 06A cart + checkout + orders (for enforcement).
- Step 06B payment webhook / mark-paid (for decrement).
- Step 06C cancel transition (for restock) if cancel is used after paid.

## Database Changes

### Update `products`

| Column | Type | Notes |
| --- | --- | --- |
| `quantity_available` | integer not null | Units left to sell. ≥ 0. |

### Migration for existing products

Do **not** default to `0` (would sell-out every live SKU).

Recommended:

```text
quantity_available = 999
```

Merchants then correct counts in the dashboard. Document this in release notes.

### Optional audit (nice-to-have, not required for v1)

If useful later: `inventory_movements` (product_id, delta, reason, order_id,
created_at). Not required to ship hard stock.

## Derived fields

```text
inStock = quantity_available > 0
```

Compute in API responses. Do not store `in_stock` as a column.

Public list/detail may optionally filter `inStock=true` later; not required for
this step’s MVP.

## Product Response Shape (extended)

```json
{
  "id": "product_123",
  "workspaceId": "workspace_123",
  "title": "Titanium task light",
  "slug": "titanium-task-light",
  "sku": "SKU-001",
  "priceAmount": 19900,
  "compareAtPriceAmount": null,
  "currency": "ZAR",
  "priceLabel": "R 199.00",
  "compareAtPriceLabel": null,
  "onSale": false,
  "quantityAvailable": 12,
  "inStock": true,
  "status": "active",
  "createdAt": "2026-05-22T08:00:00.000Z",
  "updatedAt": "2026-05-22T08:00:00.000Z"
}
```

When sold out: `quantityAvailable: 0`, `inStock: false`.

## Merchant APIs

### Create / update product

`POST /workspaces/{workspaceId}/products`  
`PATCH /workspaces/{workspaceId}/products/{productId}`

Request fields (add):

| Field | Rules |
|-------|--------|
| `quantityAvailable` | Required on create. Integer ≥ 0. On patch, omit = leave unchanged. |

Publish / set `active`:

- Reject if `quantityAvailable` is null (should not happen after migration).
- Allow `0` (active but sold out).

### List products

Existing list returns `quantityAvailable` and `inStock` on each item.

Optional query (nice-to-have):

| Param | Meaning |
|-------|---------|
| `inStock` | `true` / `false` | Filter by `quantity_available > 0` |

No new Inventory CRUD routes in v1 — the dashboard Inventory panel reads/writes
products.

## Public APIs

Product list and detail responses include `quantityAvailable` and `inStock`.

Customers do not need a separate stock endpoint.

## Cart And Checkout Rules (Step 06)

### Add / update cart item

Before accepting quantity `q` for product `P`:

1. `P` must be `active` (existing rule).
2. `q` must be ≥ 1 (existing).
3. **New:** `q <= P.quantity_available`.

On failure:

```json
{
  "success": false,
  "error": {
    "code": "INSUFFICIENT_STOCK",
    "message": "Not enough stock for this product."
  }
}
```

Optionally include `availableQuantity` in the error payload for UI max qty.

### Checkout (`POST …/checkout`)

Re-check every line against **current** `quantity_available` before creating the
order. Same `INSUFFICIENT_STOCK` if any line fails.

Do **not** decrement at checkout. Order stays `pending_payment` / `unpaid` until
payment succeeds; unpaid carts should not permanently consume stock.

### No cart reservation (v1)

Two customers may both hold the last unit in cart until one pays. The second
fails at checkout or at payment decrement. Acceptable for MVP.

## Payment: Decrement On Paid

When payment + order become `paid` (Paystack webhook or verified mark-paid):

For each order line with `product_id` and `quantity`:

```text
UPDATE products
SET quantity_available = quantity_available - :qty
WHERE id = :productId
  AND quantity_available >= :qty
```

- If any line’s update affects 0 rows → treat as stock failure:
  - Prefer failing the paid transition only if payment was not yet applied; in
    practice payment may already be captured — then mark order for manual
    review / cancel+refund path, and log loudly.
  - Minimum bar: **never** let `quantity_available` go negative.
- Run inside the same idempotent “mark paid” transaction / guard used in 06B
  so a duplicate webhook does **not** double-decrement.
- Snapshot order line quantities remain as ordered; only live product stock
  changes.

Suggested order-level flag (optional): `inventory_decremented` boolean so
restock knows whether to reverse.

## Cancel: Restock

When merchant cancels an order that already decremented stock
(typically from `paid` or `processing` → `cancelled` per Step 06C):

- For each line: `quantity_available += line.quantity`.
- Idempotent: only restock once (use `inventory_decremented` or equivalent).
- Do **not** restock if the order never reached `paid` / never decremented.

Cancel from `pending_payment` / `unpaid`: no stock change.

## Frontend (this repo) — expected after backend

| Area | Behaviour |
|------|-----------|
| Product form | Required **Stock quantity** field |
| Inventory panel | List products with qty; edit qty (reuse product PATCH) |
| PDP | Hide/disable Add to cart when `!inStock`; clamp qty selector |
| Cart / checkout | Surface `INSUFFICIENT_STOCK`; refresh cart |
| Shop grids | Optional sold-out badge / dim |

Preview/local catalog may keep mock quantities until wired.

## Acceptance Criteria

- Migration adds `quantity_available NOT NULL` with default `999` for existing rows.
- Create product without `quantityAvailable` → `400`.
- Product responses include `quantityAvailable` and `inStock`.
- Add to cart with `q > quantity_available` → `INSUFFICIENT_STOCK`.
- Checkout with stale cart qty → `INSUFFICIENT_STOCK`.
- Mark order paid decrements stock once; duplicate webhook does not double-decrement.
- Cancel after paid restocks once.
- `quantity_available` never goes below 0.

## Suggested Implementation Order

1. Migration + backfill `quantity_available = 999`.
2. Extend product create/update/list/detail responses.
3. Cart add/update stock check.
4. Checkout stock re-check.
5. Decrement in mark-paid (idempotent with 06B webhook).
6. Restock on cancel (06C).
7. Tests: race-friendly decrement (`WHERE quantity >= qty`), webhook idempotency, restock once.
8. Frontend: product form + Inventory panel + storefront sold-out UX.

## Out Of Scope (later)

- Soft / untracked inventory mode
- Hold-at-add-to-cart with TTL
- Variant-level stock
- Low-stock thresholds and notifications
- Inventory CSV import/export
