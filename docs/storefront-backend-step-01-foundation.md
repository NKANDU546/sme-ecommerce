# Step 01: Storefront Backend Foundation

This is the first implementation step for the backend team. The goal is to
create the minimum backend foundation needed before products, publish, checkout,
payments, or public storefronts are added.

## Goal

Replace browser-generated workspace/storefront state with backend-owned records.

After this step, the backend should be able to:

- Know which business/workspace belongs to the logged-in merchant.
- Create or load a storefront record for that workspace.
- Seed the first template: `classic-boutique`.
- Store the merchant's draft storefront config in the database.
- Return the draft config to the frontend.

This step does not need to implement Go Live yet. It only prepares the foundation
that publishing will use in the next step.

## Why This Comes First

The current frontend stores storefront customization in `localStorage`. Before
the team can build "Go Live", products, carts, checkout, or public store URLs,
the backend needs a stable data model for:

- Users
- Businesses
- Workspaces
- Storefronts
- Storefront templates
- Draft storefront config

Without this foundation, later APIs will not have a reliable `workspaceId`,
`storefrontId`, or `templateId` to attach data to.

## Scope

### Included

- Database tables for users/business/workspace/storefront/template foundation.
- Template seed data for `classic-boutique`.
- Auth-protected workspace read API.
- Auth-protected storefront draft read/update APIs.
- Basic validation for template ID, theme ID, config version, and sections.

### Not Included Yet

- Publishing / Go Live
- Public storefront route/API
- Product catalog APIs
- Media upload APIs
- Cart and checkout
- Orders
- Payments
- Custom domains

## Database Tables

Create these tables first.

### `users`

If these already exist in the auth backend, reuse the existing table instead of
creating a duplicate.

| Column | Type | Notes |
| --- | --- | --- |
| `id` | UUID/string | Primary key |
| `email` | string | Unique |
| `password_hash` | string | If backend owns passwords |
| `email_verified_at` | timestamp nullable | Email verification status |
| `created_at` | timestamp | Created date |
| `updated_at` | timestamp | Updated date |

### `businesses`

| Column | Type | Notes |
| --- | --- | --- |
| `id` | UUID/string | Primary key |
| `owner_user_id` | UUID/string | FK to `users.id` |
| `name` | string | Business name |
| `email` | string | Business contact email |
| `phone` | string nullable | Optional contact phone |
| `created_at` | timestamp | Created date |
| `updated_at` | timestamp | Updated date |

### `workspaces`

| Column | Type | Notes |
| --- | --- | --- |
| `id` | UUID/string | Primary key |
| `business_id` | UUID/string | FK to `businesses.id` |
| `name` | string | Workspace/store name |
| `public_slug` | string nullable | Unique public slug, used later |
| `status` | string | Start with `draft` |
| `created_at` | timestamp | Created date |
| `updated_at` | timestamp | Updated date |

Recommended `status` values:

- `draft`
- `live`
- `unpublished`
- `suspended`

For step 01, only `draft` is required.

### `storefronts`

| Column | Type | Notes |
| --- | --- | --- |
| `id` | UUID/string | Primary key |
| `workspace_id` | UUID/string | FK to `workspaces.id`, unique |
| `template_id` | string | Example: `classic-boutique` |
| `template_version` | integer | Start with `1` |
| `draft_config` | JSON | Current editable storefront config |
| `draft_config_version` | integer | Current config schema version |
| `published_snapshot_id` | UUID/string nullable | Leave null in step 01 |
| `last_published_at` | timestamp nullable | Leave null in step 01 |
| `created_at` | timestamp | Created date |
| `updated_at` | timestamp | Updated date |

### `storefront_templates`

| Column | Type | Notes |
| --- | --- | --- |
| `id` | string | Primary key, example `classic-boutique` |
| `name` | string | Human name |
| `description` | string | Short description |
| `status` | string | `available`, `coming_soon`, or `disabled` |
| `preview_image_url` | string nullable | Optional |
| `latest_version` | integer | Start with `1` |
| `created_at` | timestamp | Created date |
| `updated_at` | timestamp | Updated date |

### `storefront_template_versions`

| Column | Type | Notes |
| --- | --- | --- |
| `id` | UUID/string | Primary key |
| `template_id` | string | FK to `storefront_templates.id` |
| `version` | integer | Start with `1` |
| `default_config` | JSON | Default storefront config |
| `supported_sections` | JSON array | Allowed section types |
| `supported_themes` | JSON array | Allowed theme IDs |
| `config_schema` | JSON nullable | Optional validation metadata |
| `created_at` | timestamp | Created date |

## Seed Data

Seed the first template.

### Template

```json
{
  "id": "classic-boutique",
  "name": "Classic Boutique",
  "description": "A polished storefront with hero content, featured products, promos, and value props.",
  "status": "available",
  "latestVersion": 1
}
```

### Supported Themes

```json
["blue", "red"]
```

### Supported Sections

```json
[
  "hero",
  "featuredProducts",
  "promoBanner",
  "textImage",
  "features",
  "faq",
  "contactCta"
]
```

### Default Config

Use the current frontend default config from:

`src/data/default-storefront.json`

The backend can store this as the `default_config` for template version `1`.

## APIs For Step 01

All APIs in this step require merchant authentication.

### Get Workspaces

```http
GET /workspaces
```

Returns workspaces owned by the logged-in user.

Example response:

```json
{
  "success": true,
  "data": [
    {
      "id": "workspace_123",
      "businessId": "business_123",
      "name": "My Store",
      "publicSlug": null,
      "status": "draft",
      "createdAt": "2026-05-22T08:00:00.000Z",
      "updatedAt": "2026-05-22T08:00:00.000Z"
    }
  ]
}
```

### Get Workspace

```http
GET /workspaces/{workspaceId}
```

Returns one workspace if the logged-in user owns it.

### Get Storefront Draft

```http
GET /workspaces/{workspaceId}/storefront/draft
```

If the workspace has no storefront yet, the backend may either:

- Return `404 STOREFRONT_NOT_FOUND`, and let the frontend call create/reset.
- Or auto-create the storefront from `classic-boutique`.

Recommended for a smoother frontend migration: auto-create from
`classic-boutique` the first time this endpoint is called.

Example response:

```json
{
  "success": true,
  "data": {
    "workspaceId": "workspace_123",
    "storefrontId": "storefront_123",
    "templateId": "classic-boutique",
    "templateVersion": 1,
    "configVersion": 5,
    "config": {},
    "updatedAt": "2026-05-22T08:00:00.000Z"
  }
}
```

`config` should contain the full draft storefront config.

### Update Storefront Draft

```http
PUT /workspaces/{workspaceId}/storefront/draft
```

Replaces the full draft config.

Example request:

```json
{
  "templateId": "classic-boutique",
  "templateVersion": 1,
  "configVersion": 5,
  "config": {}
}
```

Example response:

```json
{
  "success": true,
  "data": {
    "workspaceId": "workspace_123",
    "storefrontId": "storefront_123",
    "templateId": "classic-boutique",
    "templateVersion": 1,
    "configVersion": 5,
    "config": {},
    "updatedAt": "2026-05-22T08:05:00.000Z"
  }
}
```

### Reset Draft From Template

```http
POST /workspaces/{workspaceId}/storefront/draft/reset
```

Resets the draft to a template default.

Example request:

```json
{
  "templateId": "classic-boutique",
  "templateVersion": 1
}
```

## Validation Rules

For step 01, validate at least:

- The logged-in user owns the workspace.
- `templateId` exists.
- `templateId` is `available`.
- `templateVersion` exists for that template.
- `themeId` is supported by the selected template version.
- `configVersion` is present.
- `sections` is an array.
- Every section has an `id` and `type`.
- Every section `type` is in `supported_sections`.
- `pages` is an array.
- Custom page slugs are unique inside the config.

## Error Shape

Use a consistent error envelope.

```json
{
  "success": false,
  "error": {
    "code": "INVALID_STOREFRONT_CONFIG",
    "message": "The storefront config contains an unsupported section type."
  }
}
```

Suggested error codes:

- `UNAUTHORIZED`
- `FORBIDDEN`
- `WORKSPACE_NOT_FOUND`
- `TEMPLATE_NOT_FOUND`
- `TEMPLATE_DISABLED`
- `STOREFRONT_NOT_FOUND`
- `INVALID_STOREFRONT_CONFIG`
- `VALIDATION_ERROR`

## Acceptance Criteria

The backend team is done with step 01 when:

- A logged-in merchant can load their workspace from the backend.
- A workspace has one backend storefront record.
- `classic-boutique` exists in template tables.
- The backend stores a draft storefront config in the database.
- The backend can return that draft config by `workspaceId`.
- The backend can replace the draft config through a protected API.
- Draft config is validated before saving.
- No public customer storefront is required yet.
- No publish snapshot is required yet.

## Suggested Implementation Order

1. Confirm whether `users` and `businesses` already exist in the current backend.
2. Add or reuse `users` and `businesses`.
3. Add `workspaces`.
4. Add `storefront_templates`.
5. Add `storefront_template_versions`.
6. Seed `classic-boutique`.
7. Add `storefronts`.
8. Implement workspace ownership checks.
9. Implement `GET /workspaces`.
10. Implement `GET /workspaces/{workspaceId}`.
11. Implement `GET /workspaces/{workspaceId}/storefront/draft`.
12. Implement `PUT /workspaces/{workspaceId}/storefront/draft`.
13. Implement `POST /workspaces/{workspaceId}/storefront/draft/reset`.
14. Add backend tests for ownership, validation, load, save, and reset.

## What Comes Next

Step 02 should add the publish model:

- `storefront_publish_snapshots`
- `POST /workspaces/{workspaceId}/storefront/publish`
- `GET /workspaces/{workspaceId}/storefront/published`
- `POST /workspaces/{workspaceId}/storefront/unpublish`
- Public `live` vs private `draft` separation
