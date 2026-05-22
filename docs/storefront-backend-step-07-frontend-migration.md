# Step 07: Frontend Migration To Backend APIs

This step updates the current Next.js frontend to use the backend APIs created in
Steps 01 through 06.

## Goal

Replace browser-only storefront, product, and cart persistence with backend API
calls while keeping the current UI working.

After this step, the frontend should:

- Load workspace data from the backend.
- Load and save draft storefront config through backend APIs.
- Publish storefronts through the backend.
- Load products from backend APIs.
- Upload images through backend media APIs.
- Use public storefront APIs for live customer pages.
- Use backend carts and checkout APIs.

## Scope

### Included

- API client modules.
- React Query hooks.
- Dashboard storefront editor migration.
- Product dashboard migration.
- Preview route migration.
- Public live storefront route.
- Cart and checkout migration.

### Not Included

- Major UI redesign.
- New templates.
- New checkout features beyond existing flow.

## Current Local Storage To Replace

| Current file | Current purpose | Replacement |
| --- | --- | --- |
| `src/lib/storefront-storage.ts` | Stores storefront config in browser | Storefront draft APIs |
| `src/lib/catalog-storage.ts` | Stores products in browser | Product APIs |
| `src/lib/preview-cart-storage.ts` | Stores preview cart in browser | Cart APIs or temporary cart session ID |
| `src/lib/workspace-id.ts` | Generates local workspace | Workspace APIs |
| `src/lib/auth-login-storage.ts` | Stores auth session | Keep short-term, improve later with secure cookies |

## Frontend API Modules To Add

Recommended files:

- `src/apis/workspaces.ts`
- `src/apis/storefronts.ts`
- `src/apis/storefront-templates.ts`
- `src/apis/products.ts`
- `src/apis/media.ts`
- `src/apis/public-storefronts.ts`
- `src/apis/carts.ts`
- `src/apis/checkout.ts`

Use the existing pattern from `src/apis/auth.ts`.

## React Query Hooks To Add

Recommended files:

- `src/hooks/use-workspaces.ts`
- `src/hooks/use-storefront-draft.ts`
- `src/hooks/use-storefront-publish.ts`
- `src/hooks/use-products.ts`
- `src/hooks/use-media.ts`
- `src/hooks/use-public-storefront.ts`
- `src/hooks/use-cart.ts`
- `src/hooks/use-checkout.ts`

## Dashboard Storefront Migration

Update `src/components/storefront/storefront-panel.tsx`.

Replace:

- `loadStorefront(workspaceId)`
- `saveStorefront(workspaceId, config)`
- `createInitialStorefrontFromSeed()`

With:

- `GET /workspaces/{workspaceId}/storefront/draft`
- `PUT /workspaces/{workspaceId}/storefront/draft`
- `POST /workspaces/{workspaceId}/storefront/draft/reset`

Keep autosave, but debounce API writes to avoid saving on every keystroke.

Recommended debounce:

- 500ms to 1000ms after editing stops.
- Save immediately before navigating away if possible.

## Add Go Live Button

Add a dashboard action that calls:

```http
POST /workspaces/{workspaceId}/storefront/publish
```

Show:

- Draft saved state.
- Last published time.
- Public URL after publish.
- Publish validation errors.

## Product Dashboard Migration

Update dashboard product components to use:

- `GET /workspaces/{workspaceId}/products`
- `POST /workspaces/{workspaceId}/products`
- `PATCH /workspaces/{workspaceId}/products/{productId}`
- `POST /workspaces/{workspaceId}/products/{productId}/publish`
- `POST /workspaces/{workspaceId}/products/{productId}/archive`

Remove dependency on `src/lib/catalog-storage.ts` after the migration is stable.

## Media Migration

Update image fields so merchants can upload images instead of only pasting URLs.

Flow:

1. Frontend requests upload URL.
2. Frontend uploads directly to storage.
3. Frontend confirms upload.
4. Frontend saves returned media URL or media ID into product/storefront config.

## Preview Route Migration

Keep the current route:

```text
/preview/[workspaceId]
```

But change it to load draft config from:

```http
GET /workspaces/{workspaceId}/storefront/preview
```

Preview routes should require merchant auth or a secure preview token. Do not
make draft previews publicly indexable.

## Public Live Route

Add a customer-facing route such as:

```text
/s/[storeSlug]
/s/[storeSlug]/shop
/s/[storeSlug]/shop/[productSlug]
/s/[storeSlug]/page/[pageSlug]
/s/[storeSlug]/cart
/s/[storeSlug]/checkout
```

These routes should call public APIs:

- `GET /public/storefronts/{storeSlug}`
- `GET /public/storefronts/{storeSlug}/products`
- `GET /public/storefronts/{storeSlug}/products/{productSlug}`
- `GET /public/storefronts/{storeSlug}/pages/{pageSlug}`

## Cart And Checkout Migration

Replace preview cart storage with backend cart APIs.

The browser can keep only:

- `cartId`
- anonymous `customerSessionId`

The backend should own:

- cart lines
- prices
- totals
- order creation
- payment state

## Migration Safety

During migration, keep old local storage helpers temporarily as fallback only for
development. Remove them after the backend path is stable.

Do not keep two sources of truth long term.

## Acceptance Criteria

Step 07 is complete when:

- Storefront editor loads/saves draft config through backend APIs.
- Product dashboard loads/saves products through backend APIs.
- Images can be uploaded through media APIs.
- Dashboard has a working Go Live button.
- Preview route reads draft data from backend.
- Public route reads published data from backend.
- Cart/checkout use backend APIs.
- Local storage is no longer the source of truth for storefront/products/cart.

## Suggested Implementation Order

1. Add API client modules.
2. Add query hooks.
3. Migrate workspace loading.
4. Migrate storefront draft load/save/reset.
5. Add publish UI.
6. Migrate product dashboard.
7. Add media upload UI.
8. Migrate preview routes.
9. Add public live routes.
10. Migrate cart and checkout.
11. Remove local-storage-only flows after verification.

## What Comes Next

Step 08 covers launch hardening: security, monitoring, validation, tests, and
production readiness.
