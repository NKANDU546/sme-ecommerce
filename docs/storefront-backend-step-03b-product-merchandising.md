# Step 03B: Product Merchandising (Sale + New Arrivals)

This step extends the Step 03 product catalog with compare-at pricing and list
filters so storefront sections and custom pages can show **Sale** and **New
arrivals** from real catalogue data — without inventing new product `status`
values.

## Goal

After this step, the backend should be able to:

- Store an optional compare-at (was) price on each product.
- Derive `onSale` when compare-at is greater than the selling price.
- Filter and sort merchant and public product lists by sale / newest / price.
- Return display labels for both selling and compare-at prices.

## Scope

### Included

- `products.compare_at_price_amount` column (nullable).
- Create / update support for `compareAtPriceAmount` and clear.
- Merchant list filters: `onSale`, `sort`.
- Public list filters: `onSale`, `sort` (plus existing `category`, `search`,
  `page`, `limit`).
- Product responses include `compareAtPriceAmount`, `compareAtPriceLabel`,
  `onSale`.

### Not Included

- Product tags or collections.
- New statuses such as `sale` or `new`.
- Percentage discount engine / coupons.
- Variants.
- Changing storefront section allowlists (frontend already has `sale` /
  `newArrivals` section types).

## Database Changes

### Update `products`

| Column | Type | Notes |
| --- | --- | --- |
| `compare_at_price_amount` | integer nullable | Minor units, same currency as `price_amount`. Null = not on sale. |

### Validation

- If `compare_at_price_amount` is set, it must be **strictly greater than**
  `price_amount`.
- Currency stays on `currency` / `price_amount`; do not add a second currency
  column.

### Derived field

```text
onSale = compare_at_price_amount IS NOT NULL
         AND compare_at_price_amount > price_amount
```

Compute in the API response (and optionally as a query filter). Do not add an
`on_sale` column.

## Product Response Shape (extended)

```json
{
  "id": "product_123",
  "workspaceId": "workspace_123",
  "title": "Titanium task light",
  "slug": "titanium-task-light",
  "sku": "SKU-001",
  "priceAmount": 19900,
  "compareAtPriceAmount": 24900,
  "currency": "ZAR",
  "priceLabel": "R 199.00",
  "compareAtPriceLabel": "R 249.00",
  "onSale": true,
  "category": {
    "id": "category_123",
    "name": "Lighting",
    "slug": "lighting"
  },
  "status": "active",
  "imageUrl": "https://example.com/image.jpg",
  "summary": "Long product description",
  "galleryUrls": [],
  "createdAt": "2026-05-22T08:00:00.000Z",
  "updatedAt": "2026-05-22T08:00:00.000Z"
}
```

When not on sale:

- `compareAtPriceAmount`: `null`
- `compareAtPriceLabel`: `null` (or omit)
- `onSale`: `false`

## Merchant APIs

All require merchant authentication and workspace ownership.

### List Products (extended)

```http
GET /workspaces/{workspaceId}/products
```

Existing params: `status`, `categoryId`, `search`, `page`, `limit`.

New params:

| Param | Values | Notes |
| --- | --- | --- |
| `onSale` | `true` / `false` | Optional. `true` = only products with valid compare-at. |
| `sort` | `newest` \| `updated` \| `price_asc` \| `price_desc` | Optional. Default may remain current behaviour; prefer documenting `newest` = `created_at DESC`. |

### Create Product (extended)

```http
POST /workspaces/{workspaceId}/products
```

Accept optional:

```json
{
  "compareAtPriceAmount": 24900
}
```

Omit or send `null` when there is no compare-at price.

### Update Product (extended)

```http
PATCH /workspaces/{workspaceId}/products/{productId}
```

Accept:

```json
{
  "compareAtPriceAmount": 24900
}
```

To clear a sale price:

```json
{
  "clearCompareAtPrice": true
}
```

or

```json
{
  "compareAtPriceAmount": null
}
```

(Pick one clear convention and stick to it; frontend will send
`clearCompareAtPrice: true` when the merchant empties the field on edit.)

### Get / Publish / Archive / Draft

Return the extended product shape. No status changes for merchandising.

## Public APIs (extend Step 05)

### List Public Products (extended)

```http
GET /public/storefronts/{storeSlug}/products
```

Existing: active products only; `category`, `search`, `page`, `limit`.

New:

| Param | Values | Notes |
| --- | --- | --- |
| `onSale` | `true` | Only active products with valid compare-at. |
| `sort` | `newest` \| `price_asc` \| `price_desc` | `newest` = `created_at DESC`. |

### Get Public Product Detail

Include `compareAtPriceAmount`, `compareAtPriceLabel`, `onSale` on the detail
payload.

## Frontend Expectations

After this API ships, the frontend will:

1. Show a **Compare-at price** field on the product form.
2. Drive the **Sale** storefront section from `onSale=true` (no manual cards).
3. Drive **New arrivals** from `sort=newest` with a configurable `limit`.
4. Let merchants build custom pages that only contain those sections (full
   catalogue teasers with higher limits).

## Acceptance Criteria

- Migration adds nullable `compare_at_price_amount`.
- Create/update persist and clear compare-at correctly.
- Invalid compare-at (`<= price_amount`) returns `400` with a clear message.
- Product JSON always includes `onSale` boolean.
- Merchant list `?onSale=true` returns only sale products.
- Public list `?onSale=true` returns only active sale products.
- Public list `?sort=newest` returns newest `created_at` first.
- Existing clients that omit compare-at fields keep working (null / not on sale).

## Implementation Order

1. Migration for `compare_at_price_amount`.
2. Domain validation + response mapping (`priceLabel` / `compareAtPriceLabel` /
   `onSale`).
3. Extend create / update DTOs.
4. Extend merchant list filters.
5. Extend public list filters + detail response.
6. Smoke-test with Postman / integration tests.

## Out Of Scope Reminder

Do **not** add product statuses `sale` or `new`. Merchandising is price + sort /
filter only. Tags/collections can come later without breaking this model.
