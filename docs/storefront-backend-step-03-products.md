# Step 03: Product Catalog

This step moves product management from browser storage into backend APIs and
database tables.

## Goal

Allow merchants to create, edit, archive, and publish products from the backend.

After this step, the backend should be able to:

- Store products by workspace.
- Return products to the merchant dashboard.
- Support product statuses: `draft`, `active`, `archived`.
- Store structured prices instead of only display strings.
- Store product detail page content used by the storefront template.

Public customer product APIs come later in Step 05.

## Scope

### Included

- Product tables.
- Category table.
- Merchant product CRUD APIs.
- Product status APIs.
- Basic product validation.
- Price fields in minor units.

### Not Included Yet

- Media upload API. Use image URL fields until Step 04.
- Public product browsing API.
- Inventory tracking.
- Variants/options.
- Discounting.
- Checkout.

## Current Frontend Data

The current frontend product type is `CatalogProduct` in
`src/types/catalog-product.ts`.

Current fields:

- `id`
- `title`
- `sku`
- `priceLabel`
- `category`
- `status`
- `imageUrl`
- `updatedAt`
- PDP fields like `summary`, `galleryUrls`, `standards`, `hardwareSpecs`, and `sidebarSections`

Backend should preserve enough data to render the existing UI, but should store
money as structured values.

## Database Changes

### `categories`

| Column | Type | Notes |
| --- | --- | --- |
| `id` | UUID/string | Primary key |
| `workspace_id` | UUID/string | FK to `workspaces.id` |
| `name` | string | Category name |
| `slug` | string | Unique per workspace |
| `created_at` | timestamp | Created date |
| `updated_at` | timestamp | Updated date |

### `products`

| Column | Type | Notes |
| --- | --- | --- |
| `id` | UUID/string | Primary key |
| `workspace_id` | UUID/string | FK to `workspaces.id` |
| `category_id` | UUID/string nullable | FK to `categories.id` |
| `title` | string | Product title |
| `slug` | string | Unique per workspace |
| `sku` | string | Unique per workspace |
| `description` | text nullable | Main product summary |
| `price_amount` | integer | Minor units, for example cents |
| `currency` | string | Example `ZAR` |
| `status` | string | `draft`, `active`, `archived` |
| `image_url` | string nullable | Temporary until media table integration |
| `configuration_label` | string nullable | PDP field |
| `warranty_note` | string nullable | PDP field |
| `shipping_note` | string nullable | PDP field |
| `metadata` | JSON nullable | PDP highlights/specs/sidebar content |
| `created_at` | timestamp | Created date |
| `updated_at` | timestamp | Updated date |

### Optional: `product_images`

This can wait until Step 04 if media is not ready.

| Column | Type | Notes |
| --- | --- | --- |
| `id` | UUID/string | Primary key |
| `product_id` | UUID/string | FK to `products.id` |
| `image_url` | string | Temporary URL field |
| `sort_order` | integer | Gallery ordering |
| `created_at` | timestamp | Created date |

## Product Response Shape

Return both structured money and frontend-friendly display fields.

```json
{
  "id": "product_123",
  "workspaceId": "workspace_123",
  "title": "Titanium task light",
  "slug": "titanium-task-light",
  "sku": "SKU-001",
  "priceAmount": 24900,
  "currency": "ZAR",
  "priceLabel": "R 249.00",
  "category": {
    "id": "category_123",
    "name": "Lighting",
    "slug": "lighting"
  },
  "status": "active",
  "imageUrl": "https://example.com/image.jpg",
  "summary": "Long product description",
  "galleryUrls": [],
  "configurationLabel": "Available options",
  "warrantyNote": "One year warranty",
  "shippingNote": "Ships in 2-3 days",
  "metadata": {},
  "createdAt": "2026-05-22T08:00:00.000Z",
  "updatedAt": "2026-05-22T08:00:00.000Z"
}
```

## APIs For Step 03

All APIs in this step require merchant authentication and workspace ownership.

### List Products

```http
GET /workspaces/{workspaceId}/products
```

Supported query params:

- `status`
- `categoryId`
- `search`
- `page`
- `limit`

### Create Product

```http
POST /workspaces/{workspaceId}/products
```

Example request:

```json
{
  "title": "Titanium task light",
  "sku": "SKU-001",
  "priceAmount": 24900,
  "currency": "ZAR",
  "categoryName": "Lighting",
  "status": "draft",
  "imageUrl": "https://example.com/image.jpg",
  "summary": "A compact light for daily work."
}
```

### Get Product

```http
GET /workspaces/{workspaceId}/products/{productId}
```

### Update Product

```http
PATCH /workspaces/{workspaceId}/products/{productId}
```

Partial update. Only provided fields should change.

### Archive Product

```http
POST /workspaces/{workspaceId}/products/{productId}/archive
```

Sets status to `archived`.

### Publish Product

```http
POST /workspaces/{workspaceId}/products/{productId}/publish
```

Sets status to `active` after validation.

### Return Product To Draft

```http
POST /workspaces/{workspaceId}/products/{productId}/draft
```

Sets status to `draft`.

## Category APIs

These can be simple in version one.

```http
GET /workspaces/{workspaceId}/categories
POST /workspaces/{workspaceId}/categories
PATCH /workspaces/{workspaceId}/categories/{categoryId}
```

If the team wants to move faster, product create/update can accept `categoryName`
and auto-create categories.

## Validation Rules

Validate:

- Product belongs to the workspace.
- `title` is required.
- `sku` is unique per workspace.
- `slug` is unique per workspace.
- `priceAmount` is an integer greater than or equal to zero.
- `currency` is supported. Start with `ZAR`.
- `status` is one of `draft`, `active`, `archived`.
- Active products must have title, SKU, price, and currency.
- Gallery/image URLs must be valid URLs until media upload exists.

## Error Codes

- `PRODUCT_NOT_FOUND`
- `PRODUCT_SKU_EXISTS`
- `PRODUCT_SLUG_EXISTS`
- `INVALID_PRODUCT_STATUS`
- `INVALID_PRODUCT_PRICE`
- `CATEGORY_NOT_FOUND`
- `INVALID_PRODUCT_DATA`

## Acceptance Criteria

Step 03 is complete when:

- A merchant can list products for their workspace.
- A merchant can create a product.
- A merchant can update a product.
- A merchant can view one product.
- A merchant can archive a product.
- A merchant can mark a valid product active.
- Product data is isolated by workspace ownership.
- Price is stored as `price_amount` and `currency`.
- API responses can still support the current frontend fields.

## Suggested Implementation Order

1. Add `categories` migration.
2. Add `products` migration.
3. Add product normalization and price formatting helpers.
4. Implement product list/create/read/update APIs.
5. Implement product status APIs.
6. Add category list/create/update APIs or auto-create category by name.
7. Add tests for ownership, SKU uniqueness, price validation, and status changes.

## What Comes Next

Step 04 adds media upload and connects storefront/product images to backend-owned
media records.
