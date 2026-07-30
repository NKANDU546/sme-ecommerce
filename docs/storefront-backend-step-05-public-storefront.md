# Step 05: Public Storefront APIs

This step exposes the published storefront to customers. It builds on publish
snapshots from Step 02, products from Step 03, and media from Step 04.

## Goal

Allow customer-facing routes to load a live storefront by public slug without
merchant authentication.

After this step, the backend should be able to:

- Resolve a store by public slug.
- Return only published storefront data.
- Return active products for the public shop page.
- Return public product detail.
- Return custom page data.
- Hide unpublished, draft, suspended, or missing stores.

## Scope

### Included

- Public storefront read APIs.
- Public product list/detail APIs.
- Public custom page API.
- Live/draft separation.
- Basic SEO metadata fields.

### Not Included Yet

- Cart and checkout.
- Payments.
- Custom domains.
- Inventory reservations.

## Public Data Rule

Public APIs must never return draft data.

Only return:

- Latest published snapshot.
- Active products.
- Media URLs that are ready and public.
- Public workspace/store metadata.

If a workspace is `draft`, `unpublished`, or `suspended`, public APIs should
return `404 STORE_NOT_FOUND` or `403 STORE_NOT_AVAILABLE`.

## APIs For Step 05

These APIs do not require merchant authentication.

### Get Public Storefront

```http
GET /public/storefronts/{storeSlug}
```

Returns the latest published storefront snapshot and basic store metadata.

Example response:

```json
{
  "success": true,
  "data": {
    "workspaceId": "workspace_123",
    "storeSlug": "my-store",
    "storeName": "My Store",
    "status": "live",
    "templateId": "classic-boutique",
    "templateVersion": 1,
    "configVersion": 5,
    "config": {},
    "publishedAt": "2026-05-22T08:00:00.000Z",
    "seo": {
      "title": "My Store",
      "description": "Shop products from My Store",
      "imageUrl": "https://cdn.example.com/hero.jpg"
    }
  }
}
```

### Get Public Products

```http
GET /public/storefronts/{storeSlug}/products
```

Returns active products only.

Supported query params:

- `category`
- `search`
- `page`
- `limit`

### Get Public Product Detail

```http
GET /public/storefronts/{storeSlug}/products/{productSlug}
```

Returns one active product. Archived and draft products should return not found.

### Get Public Custom Page

```http
GET /public/storefronts/{storeSlug}/pages/{pageSlug}
```

Returns a custom page from the published storefront snapshot.

Page slugs should come from the published config, not the current draft.

## Optional SEO Fields

The current frontend does not yet have a complete SEO model. Add this now if the
backend team can support it cleanly:

### `workspaces`

| Column | Type | Notes |
| --- | --- | --- |
| `seo_title` | string nullable | Storefront meta title |
| `seo_description` | string nullable | Storefront meta description |
| `seo_image_id` | UUID/string nullable | FK to `media_assets.id` |

### `products`

| Column | Type | Notes |
| --- | --- | --- |
| `seo_title` | string nullable | Product meta title |
| `seo_description` | string nullable | Product meta description |

If this feels too early, generate SEO values from existing store/product fields.

## Response Mapping To Current Frontend

The public storefront response should give the frontend the same object shape it
currently expects from `StorefrontConfig`.

The public products response should give the frontend the same display fields it
currently expects from `CatalogProduct`, plus structured price fields.

This keeps the frontend migration small:

- Replace `loadStorefront(workspaceId)` with public storefront API.
- Replace `loadCatalogProducts(workspaceId)` with public products API.

## Caching

Public storefront responses can be cached because they come from immutable
published snapshots.

Recommended:

- Cache public storefront by `storeSlug` and `publishedSnapshotId`.
- Cache public product list briefly.
- Clear or bypass cache when publishing a new snapshot.

Avoid caching draft APIs.

## Error Codes

- `STORE_NOT_FOUND`
- `STORE_NOT_AVAILABLE`
- `PUBLIC_STOREFRONT_NOT_PUBLISHED`
- `PUBLIC_PRODUCT_NOT_FOUND`
- `PUBLIC_PAGE_NOT_FOUND`

## Acceptance Criteria

Step 05 is complete when:

- Public storefront can be loaded by slug.
- Draft storefronts are not exposed publicly.
- Unpublished storefronts are not exposed publicly.
- Public product list returns only active products.
- Public product detail returns only active products.
- Public custom pages come from the published snapshot.
- API response shape is ready for frontend live route integration.

## Suggested Implementation Order

1. Add public storefront resolver by `public_slug`.
2. Implement `GET /public/storefronts/{storeSlug}`.
3. Implement `GET /public/storefronts/{storeSlug}/products`.
4. Implement `GET /public/storefronts/{storeSlug}/products/{productSlug}`.
5. Implement `GET /public/storefronts/{storeSlug}/pages/{pageSlug}`.
6. Add caching rules if backend stack supports them.
7. Add tests for draft/live/unpublished visibility.
8. Add tests that draft config is never returned from public APIs.

## What Comes Next

Step 06 adds customer carts, checkout, orders, and payment provider integration.
