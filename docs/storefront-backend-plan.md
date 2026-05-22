# Storefront Backend Plan

This document describes the backend work needed to move storefront customization,
products, preview, cart, checkout, and "Go Live" from browser-only storage into
backend APIs and database tables.

## Current Frontend State

The current app is a Next.js storefront/dashboard prototype.

- Auth already talks to the backend through `src/apis/auth.ts`.
- Storefront customization is edited in `src/components/storefront/storefront-editor.tsx`.
- The dashboard storefront panel saves to `localStorage` through `src/lib/storefront-storage.ts`.
- Products save to `localStorage` through `src/lib/catalog-storage.ts`.
- Preview cart saves to `localStorage` through `src/lib/preview-cart-storage.ts`.
- Workspace data is generated in the browser through `src/lib/workspace-id.ts`.
- Customer routes currently live under `/preview/[workspaceId]` and are marked no-index.
- The only available storefront template is `classic-boutique`.

The backend should become the source of truth for storefront data, products,
media, publish state, carts, orders, and public storefront routing.

## Backend Goals

1. Persist every merchant storefront in the database.
2. Support draft editing without changing the public site.
3. Publish a stable live storefront snapshot when the merchant clicks "Go Live".
4. Serve public storefronts from backend data, not browser storage.
5. Store products, images, pages, sections, themes, and templates centrally.
6. Support public cart and checkout flows that create real orders.
7. Keep template definitions versioned so older published sites keep rendering safely.

## Core Concepts

### Draft Storefront

The draft is what the merchant edits in the dashboard. It can change many times
before the public site changes.

### Published Storefront

The published storefront is what customers see. Publishing copies the current
draft config into a published snapshot with metadata such as `publishedAt`,
`publishedBy`, `templateVersion`, and `configVersion`.

### Template

A template is the frontend rendering implementation plus backend metadata that
describes what sections, fields, and defaults it supports. The current template
ID is `classic-boutique`.

### Public Storefront URL

The live site should be resolved by a stable public identifier, for example:

- `/s/{storeSlug}`
- `/store/{storeSlug}`
- custom domain later, for example `shop.example.com`

The current `/preview/[workspaceId]` route should remain for merchant previews.

## Existing Data To Move To Backend

### Storefront Config

Current type: `StorefrontConfig` in `src/types/storefront.ts`.

Backend should store:

- `templateId`
- `themeId`
- `configVersion`
- `shopName`
- `tagline`
- `navLinks`
- `sections`
- `pages`
- `footerBlurb`
- `footerShopLinks`
- `footerPolicyLinks`
- `footerConnectLinks`
- `copyrightLine`
- `cartCountLabel`
- `whatsappNumber`
- `accentColor`
- `updatedAt`

The existing top-level fields like `heroHeading`, `products`, `promos`, and
`features` can stay for compatibility, but the long-term model should prefer
`sections` and `pages` as the main editable content.

### Products

Current type: `CatalogProduct` in `src/types/catalog-product.ts`.

Backend should store products as real structured records instead of only display
strings. For example, use `priceAmount` and `currency` instead of only
`priceLabel`.

### Cart

Current type: `PreviewCartLine` in `src/types/preview-cart.ts`.

Backend should calculate cart totals from product prices, not from frontend
display strings.

## API Design

All merchant APIs should require authentication and must check that the logged-in
user owns or has access to the business/workspace.

### Existing Auth APIs

These already exist in the frontend API client:

| Method | Endpoint | Purpose |
| --- | --- | --- |
| `POST` | `/auth/register` | Register a business account |
| `POST` | `/auth/login` | Log in |
| `GET` | `/account/me` | Load account/business profile |
| `POST` | `/auth/logout` | Log out |
| `GET` | `/auth/verify?token=...` | Verify email |

### Merchant Workspace APIs

| Method | Endpoint | Purpose |
| --- | --- | --- |
| `GET` | `/workspaces` | List workspaces/businesses available to the user |
| `GET` | `/workspaces/{workspaceId}` | Load workspace metadata |
| `PATCH` | `/workspaces/{workspaceId}` | Update workspace name, public slug, contact details |
| `GET` | `/workspaces/{workspaceId}/status` | Return setup status, publish status, and live URL |

### Storefront Draft APIs

| Method | Endpoint | Purpose |
| --- | --- | --- |
| `GET` | `/workspaces/{workspaceId}/storefront/draft` | Load current draft config |
| `PUT` | `/workspaces/{workspaceId}/storefront/draft` | Replace the full draft config |
| `PATCH` | `/workspaces/{workspaceId}/storefront/draft` | Update partial draft fields |
| `POST` | `/workspaces/{workspaceId}/storefront/draft/reset` | Reset draft from selected template defaults |
| `POST` | `/workspaces/{workspaceId}/storefront/draft/duplicate-published` | Copy live config back into draft |
| `GET` | `/workspaces/{workspaceId}/storefront/preview` | Return draft config plus preview metadata |

Recommended draft response:

```json
{
  "success": true,
  "data": {
    "workspaceId": "workspace_123",
    "storefrontId": "storefront_123",
    "status": "draft",
    "templateId": "classic-boutique",
    "templateVersion": 1,
    "configVersion": 5,
    "config": {},
    "updatedAt": "2026-05-22T08:00:00.000Z"
  }
}
```

### Publish APIs

| Method | Endpoint | Purpose |
| --- | --- | --- |
| `POST` | `/workspaces/{workspaceId}/storefront/publish` | Publish current draft as live storefront |
| `GET` | `/workspaces/{workspaceId}/storefront/published` | Load current published snapshot |
| `POST` | `/workspaces/{workspaceId}/storefront/unpublish` | Hide the public storefront |
| `GET` | `/workspaces/{workspaceId}/storefront/publish-history` | List previous publish snapshots |

Recommended publish request:

```json
{
  "confirm": true,
  "notes": "Initial launch"
}
```

Recommended publish response:

```json
{
  "success": true,
  "data": {
    "workspaceId": "workspace_123",
    "publishedSnapshotId": "snapshot_123",
    "publicUrl": "https://app.example.com/s/my-store",
    "publishedAt": "2026-05-22T08:00:00.000Z"
  }
}
```

### Template APIs

| Method | Endpoint | Purpose |
| --- | --- | --- |
| `GET` | `/storefront-templates` | List available templates |
| `GET` | `/storefront-templates/{templateId}` | Load template metadata, versions, default config |
| `GET` | `/storefront-templates/{templateId}/versions/{version}` | Load a specific template version |

Template metadata should include:

- Template ID, name, description, preview image
- Availability status
- Supported themes
- Supported section types
- Default config
- Latest version
- Minimum supported config version

### Product Catalog APIs

| Method | Endpoint | Purpose |
| --- | --- | --- |
| `GET` | `/workspaces/{workspaceId}/products` | List merchant products |
| `POST` | `/workspaces/{workspaceId}/products` | Create product |
| `GET` | `/workspaces/{workspaceId}/products/{productId}` | Load product detail |
| `PATCH` | `/workspaces/{workspaceId}/products/{productId}` | Update product |
| `DELETE` | `/workspaces/{workspaceId}/products/{productId}` | Archive or delete product |
| `POST` | `/workspaces/{workspaceId}/products/{productId}/publish` | Mark product active |
| `POST` | `/workspaces/{workspaceId}/products/{productId}/archive` | Archive product |

Product statuses should map to the current frontend statuses:

- `draft`
- `active`
- `archived`

### Media APIs

| Method | Endpoint | Purpose |
| --- | --- | --- |
| `POST` | `/workspaces/{workspaceId}/media/upload-url` | Create signed upload URL |
| `POST` | `/workspaces/{workspaceId}/media` | Register uploaded media metadata |
| `GET` | `/workspaces/{workspaceId}/media` | List media library |
| `DELETE` | `/workspaces/{workspaceId}/media/{mediaId}` | Delete media |

Images should be stored in object storage such as Azure Blob Storage, S3, or a
similar service. The database should store metadata and public URLs.

### Public Storefront APIs

These APIs should not require merchant authentication.

| Method | Endpoint | Purpose |
| --- | --- | --- |
| `GET` | `/public/storefronts/{storeSlug}` | Load published storefront config |
| `GET` | `/public/storefronts/{storeSlug}/products` | Load visible active products |
| `GET` | `/public/storefronts/{storeSlug}/products/{productSlug}` | Load public product detail |
| `GET` | `/public/storefronts/{storeSlug}/pages/{pageSlug}` | Load custom page |

The public storefront response should only return published data.

### Cart And Checkout APIs

| Method | Endpoint | Purpose |
| --- | --- | --- |
| `POST` | `/public/storefronts/{storeSlug}/carts` | Create cart |
| `GET` | `/public/storefronts/{storeSlug}/carts/{cartId}` | Load cart |
| `POST` | `/public/storefronts/{storeSlug}/carts/{cartId}/items` | Add item |
| `PATCH` | `/public/storefronts/{storeSlug}/carts/{cartId}/items/{itemId}` | Update quantity |
| `DELETE` | `/public/storefronts/{storeSlug}/carts/{cartId}/items/{itemId}` | Remove item |
| `POST` | `/public/storefronts/{storeSlug}/checkout` | Create checkout/order draft |
| `POST` | `/public/storefronts/{storeSlug}/checkout/{checkoutId}/pay` | Initialize payment |
| `POST` | `/payments/paystack/webhook` | Receive payment webhook |
| `GET` | `/public/storefronts/{storeSlug}/orders/{orderId}` | Public order confirmation |

Checkout should create a real order record before payment. Payment confirmation
should come from the payment provider webhook, not only from frontend redirect
state.

## Database Tables

The exact SQL depends on the backend stack, but these are the required entities.

### `users`

Stores platform users.

| Column | Notes |
| --- | --- |
| `id` | Primary key |
| `email` | Unique |
| `password_hash` | If not using external auth |
| `email_verified_at` | Nullable |
| `created_at` | Timestamp |
| `updated_at` | Timestamp |

### `businesses`

Stores merchant business accounts.

| Column | Notes |
| --- | --- |
| `id` | Primary key |
| `owner_user_id` | FK to `users.id` |
| `name` | Business name |
| `email` | Business contact email |
| `phone` | Optional |
| `created_at` | Timestamp |
| `updated_at` | Timestamp |

### `workspaces`

Stores the editable workspace/public store identity.

| Column | Notes |
| --- | --- |
| `id` | Primary key |
| `business_id` | FK to `businesses.id` |
| `name` | Workspace name |
| `public_slug` | Unique public store slug |
| `status` | `draft`, `live`, `unpublished`, `suspended` |
| `created_at` | Timestamp |
| `updated_at` | Timestamp |

### `storefronts`

One logical storefront per workspace.

| Column | Notes |
| --- | --- |
| `id` | Primary key |
| `workspace_id` | FK to `workspaces.id`, unique |
| `template_id` | Current draft template ID |
| `template_version` | Current draft template version |
| `draft_config` | JSON column containing current draft config |
| `draft_config_version` | Current draft schema version |
| `published_snapshot_id` | FK to latest published snapshot, nullable |
| `last_published_at` | Nullable timestamp |
| `created_at` | Timestamp |
| `updated_at` | Timestamp |

### `storefront_publish_snapshots`

Immutable publish history.

| Column | Notes |
| --- | --- |
| `id` | Primary key |
| `storefront_id` | FK to `storefronts.id` |
| `workspace_id` | FK to `workspaces.id` |
| `template_id` | Template used at publish time |
| `template_version` | Template version used at publish time |
| `config` | JSON snapshot served to customers |
| `config_version` | Schema version |
| `published_by_user_id` | FK to `users.id` |
| `published_at` | Timestamp |
| `notes` | Optional |

### `storefront_templates`

Template registry.

| Column | Notes |
| --- | --- |
| `id` | Template ID, for example `classic-boutique` |
| `name` | Human name |
| `description` | Short description |
| `status` | `available`, `coming_soon`, `disabled` |
| `preview_image_url` | Optional |
| `latest_version` | Integer |
| `created_at` | Timestamp |
| `updated_at` | Timestamp |

### `storefront_template_versions`

Versioned defaults and schema for templates.

| Column | Notes |
| --- | --- |
| `id` | Primary key |
| `template_id` | FK to `storefront_templates.id` |
| `version` | Integer |
| `default_config` | JSON |
| `supported_sections` | JSON array |
| `supported_themes` | JSON array |
| `config_schema` | JSON schema or validation metadata |
| `created_at` | Timestamp |

### `products`

Merchant product catalog.

| Column | Notes |
| --- | --- |
| `id` | Primary key |
| `workspace_id` | FK to `workspaces.id` |
| `title` | Product title |
| `slug` | Unique per workspace |
| `sku` | Unique per workspace |
| `description` | Long summary |
| `category_id` | Optional FK |
| `price_amount` | Integer minor units, for example cents |
| `currency` | Example `ZAR` |
| `status` | `draft`, `active`, `archived` |
| `main_image_id` | Optional FK to media |
| `configuration_label` | Optional |
| `warranty_note` | Optional |
| `shipping_note` | Optional |
| `metadata` | JSON for PDP sections/specs |
| `created_at` | Timestamp |
| `updated_at` | Timestamp |

### `product_images`

Stores gallery ordering.

| Column | Notes |
| --- | --- |
| `id` | Primary key |
| `product_id` | FK to `products.id` |
| `media_id` | FK to `media_assets.id` |
| `sort_order` | Integer |
| `created_at` | Timestamp |

### `categories`

Optional normalized product categories.

| Column | Notes |
| --- | --- |
| `id` | Primary key |
| `workspace_id` | FK to `workspaces.id` |
| `name` | Category name |
| `slug` | Unique per workspace |
| `created_at` | Timestamp |
| `updated_at` | Timestamp |

### `media_assets`

Uploaded images and files.

| Column | Notes |
| --- | --- |
| `id` | Primary key |
| `workspace_id` | FK to `workspaces.id` |
| `uploaded_by_user_id` | FK to `users.id` |
| `url` | Public or CDN URL |
| `storage_key` | Object storage key |
| `mime_type` | File type |
| `size_bytes` | File size |
| `width` | Optional image width |
| `height` | Optional image height |
| `created_at` | Timestamp |

### `carts`

Public customer cart.

| Column | Notes |
| --- | --- |
| `id` | Primary key |
| `workspace_id` | FK to `workspaces.id` |
| `customer_session_id` | Anonymous session ID |
| `status` | `active`, `converted`, `abandoned` |
| `currency` | Example `ZAR` |
| `created_at` | Timestamp |
| `updated_at` | Timestamp |

### `cart_items`

Cart line items.

| Column | Notes |
| --- | --- |
| `id` | Primary key |
| `cart_id` | FK to `carts.id` |
| `product_id` | FK to `products.id` |
| `quantity` | Integer |
| `unit_price_amount` | Snapshot price |
| `currency` | Snapshot currency |
| `created_at` | Timestamp |
| `updated_at` | Timestamp |

### `orders`

Final order records.

| Column | Notes |
| --- | --- |
| `id` | Primary key |
| `workspace_id` | FK to `workspaces.id` |
| `cart_id` | Optional FK to `carts.id` |
| `order_number` | Unique readable order reference |
| `customer_name` | Customer name |
| `customer_email` | Optional |
| `customer_phone` | Required if WhatsApp-first |
| `shipping_address` | JSON |
| `subtotal_amount` | Integer minor units |
| `shipping_amount` | Integer minor units |
| `total_amount` | Integer minor units |
| `currency` | Example `ZAR` |
| `status` | `pending_payment`, `paid`, `processing`, `fulfilled`, `cancelled` |
| `payment_status` | `unpaid`, `authorized`, `paid`, `failed`, `refunded` |
| `created_at` | Timestamp |
| `updated_at` | Timestamp |

### `order_items`

Order line snapshots.

| Column | Notes |
| --- | --- |
| `id` | Primary key |
| `order_id` | FK to `orders.id` |
| `product_id` | Nullable FK to `products.id` |
| `title` | Snapshot title |
| `sku` | Snapshot SKU |
| `quantity` | Integer |
| `unit_price_amount` | Snapshot price |
| `total_amount` | Quantity times unit price |
| `currency` | Snapshot currency |

### `payments`

Payment attempts and provider metadata.

| Column | Notes |
| --- | --- |
| `id` | Primary key |
| `order_id` | FK to `orders.id` |
| `provider` | Example `paystack` |
| `provider_reference` | Unique provider reference |
| `amount` | Integer minor units |
| `currency` | Example `ZAR` |
| `status` | `initialized`, `paid`, `failed`, `refunded` |
| `raw_response` | JSON |
| `created_at` | Timestamp |
| `updated_at` | Timestamp |

### `custom_domains`

Optional later feature for merchant-owned domains.

| Column | Notes |
| --- | --- |
| `id` | Primary key |
| `workspace_id` | FK to `workspaces.id` |
| `domain` | Unique domain |
| `status` | `pending`, `verified`, `failed` |
| `verification_token` | DNS verification token |
| `created_at` | Timestamp |
| `updated_at` | Timestamp |

## Storefront Config JSON Shape

The database can store the storefront config as JSON first, because the current
frontend already works with a structured `StorefrontConfig` object. Keep the JSON
validated on write.

Required top-level draft/published config fields:

```json
{
  "templateId": "classic-boutique",
  "themeId": "blue",
  "configVersion": 5,
  "shopName": "SME Operations",
  "tagline": "Curated retail, calmer days.",
  "navLinks": [],
  "sections": [],
  "pages": [],
  "footerBlurb": "",
  "footerShopLinks": [],
  "footerPolicyLinks": [],
  "footerConnectLinks": [],
  "copyrightLine": "",
  "cartCountLabel": "0",
  "whatsappNumber": "+27 00 000 0000",
  "accentColor": "#0a2540",
  "updatedAt": 1779446400000
}
```

Supported section types from the current frontend:

- `hero`
- `featuredProducts`
- `promoBanner`
- `textImage`
- `features`
- `faq`
- `contactCta`

## Publish Flow

1. Merchant edits storefront draft in the dashboard.
2. Frontend autosaves draft through `PUT /workspaces/{workspaceId}/storefront/draft`.
3. Merchant opens preview route, which reads draft data from the backend.
4. Merchant clicks "Go Live".
5. Frontend calls `POST /workspaces/{workspaceId}/storefront/publish`.
6. Backend validates draft config, product references, slug, media URLs, and template version.
7. Backend creates an immutable `storefront_publish_snapshots` row.
8. Backend sets `storefronts.published_snapshot_id` to the new snapshot.
9. Backend marks the workspace `status` as `live`.
10. Public storefront APIs serve only the published snapshot.

## Frontend Migration Steps

1. Add API clients for storefront draft, publish, templates, products, media, carts, and orders.
2. Replace `loadStorefront` and `saveStorefront` usage with backend calls.
3. Replace `loadCatalogProducts` and `saveCatalogProducts` usage with backend calls.
4. Keep `localStorage` only for temporary UI state or anonymous cart session ID.
5. Add a dashboard "Go Live" button that calls the publish API.
6. Keep `/preview/[workspaceId]` for authenticated merchant draft preview.
7. Add a public route such as `/s/[storeSlug]` for published customer storefronts.
8. Update shop/product/cart/checkout pages to use backend data and real order APIs.

## Validation Rules

Backend should reject invalid draft or publish requests when:

- `templateId` does not exist or is disabled.
- `themeId` is not supported by the template.
- `sections` contains unknown section types.
- Custom page slugs are duplicated.
- Public store slug is missing or already used.
- Featured product references point to archived or missing products.
- Required homepage sections are missing.
- Image/media references do not belong to the workspace.
- Product prices are missing or invalid for active products.

## Security And Permissions

- Merchant APIs must require auth.
- Users can only read/write their own workspace data.
- Public APIs must only expose published/live data.
- Do not expose draft config from public endpoints.
- Prefer httpOnly cookies or secure refresh-token handling over long-lived tokens in local storage.
- Payment webhooks must verify provider signatures.
- Media uploads must enforce file type and size limits.

## Template Plan

### Current Template

`classic-boutique` is the only implemented template. It renders:

- Site header
- Homepage sections
- Footer
- Shop collection page styling
- Product detail page styling
- Custom pages

### Coming Templates

The dashboard already displays placeholders for:

- `minimal-catalogue`
- `bold-retail`

Before enabling them, add:

- Frontend renderer component
- Template registry entry in `StorefrontTemplateView`
- Default config seed
- Backend template metadata
- Supported section list
- Preview image
- Migration/validation schema

## Open Decisions

- Final public URL format: `/s/{storeSlug}`, `/store/{storeSlug}`, or custom subdomains.
- Whether storefront configs stay mostly JSON or sections/pages become normalized tables.
- Which backend stack owns database migrations.
- Which object storage provider will host media.
- Whether carts should be anonymous backend carts or browser-local until checkout.
- Whether product inventory is required for version one.
- Whether Paystack is the first payment provider.

## Suggested Build Order

1. Backend database migrations for workspaces, storefronts, templates, products, media, carts, and orders.
2. Seed `classic-boutique` into template tables.
3. Implement merchant storefront draft APIs.
4. Implement product catalog APIs.
5. Implement media upload APIs.
6. Implement publish API and public storefront read APIs.
7. Migrate frontend storefront editor and preview from `localStorage` to backend APIs.
8. Add public live storefront routes.
9. Implement cart, checkout, order, and payment APIs.
10. Remove old browser-only storage paths after backend integration is stable.
