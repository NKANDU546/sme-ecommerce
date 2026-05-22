# Step 02: Publish And Go Live

This step adds the real "Go Live" flow. It builds on Step 01, where the backend
already owns workspaces, storefront templates, and draft storefront config.

## Goal

Allow a merchant to publish the current draft storefront so customers can later
see a stable live version.

After this step, the backend should be able to:

- Validate the current draft storefront.
- Create an immutable published snapshot.
- Mark the workspace/storefront as live.
- Return the latest published snapshot to authenticated merchant users.
- Unpublish a storefront without deleting draft or publish history.

This step does not need to expose public customer routes yet. Public storefront
serving comes in Step 05.

## Scope

### Included

- `storefront_publish_snapshots` table.
- Publish API.
- Published snapshot read API for merchant dashboard.
- Unpublish API.
- Publish history API.
- Validation before publish.

### Not Included Yet

- Public storefront API.
- Product catalog management.
- Media upload.
- Cart, checkout, orders, and payments.
- Custom domains.

## Database Changes

### `storefront_publish_snapshots`

Create immutable publish records.

| Column | Type | Notes |
| --- | --- | --- |
| `id` | UUID/string | Primary key |
| `storefront_id` | UUID/string | FK to `storefronts.id` |
| `workspace_id` | UUID/string | FK to `workspaces.id` |
| `template_id` | string | Template used at publish time |
| `template_version` | integer | Template version used at publish time |
| `config` | JSON | Full published config snapshot |
| `config_version` | integer | Storefront config schema version |
| `published_by_user_id` | UUID/string | FK to `users.id` |
| `published_at` | timestamp | Publish timestamp |
| `notes` | string nullable | Optional publish notes |

### Update `storefronts`

Use the existing columns from Step 01:

- `published_snapshot_id`
- `last_published_at`

When publishing succeeds, update both.

### Update `workspaces`

Set `status` to:

- `live` after successful publish.
- `unpublished` after unpublish.

Keep draft config unchanged when publishing or unpublishing.

## APIs For Step 02

All APIs in this step require merchant authentication and workspace ownership.

### Publish Storefront

```http
POST /workspaces/{workspaceId}/storefront/publish
```

Publishes the current draft.

Example request:

```json
{
  "confirm": true,
  "notes": "Initial launch"
}
```

Example response:

```json
{
  "success": true,
  "data": {
    "workspaceId": "workspace_123",
    "storefrontId": "storefront_123",
    "publishedSnapshotId": "snapshot_123",
    "status": "live",
    "publishedAt": "2026-05-22T08:00:00.000Z"
  }
}
```

### Get Published Storefront

```http
GET /workspaces/{workspaceId}/storefront/published
```

Returns the latest published snapshot for the merchant dashboard.

If nothing has been published yet, return `404 PUBLISHED_STOREFRONT_NOT_FOUND`.

### Get Publish History

```http
GET /workspaces/{workspaceId}/storefront/publish-history
```

Returns previous publish snapshots, newest first.

Response should include metadata only by default. Avoid returning every full JSON
snapshot unless the client requests one.

### Get Publish Snapshot

```http
GET /workspaces/{workspaceId}/storefront/publish-history/{snapshotId}
```

Returns one snapshot and its full config.

### Unpublish Storefront

```http
POST /workspaces/{workspaceId}/storefront/unpublish
```

Hides the storefront from public live access later.

Do not delete:

- Draft config
- Published snapshots
- Products
- Media

Example response:

```json
{
  "success": true,
  "data": {
    "workspaceId": "workspace_123",
    "status": "unpublished",
    "lastPublishedAt": "2026-05-22T08:00:00.000Z"
  }
}
```

## Publish Validation

Before creating a snapshot, validate:

- Logged-in user owns the workspace.
- Workspace exists.
- Storefront exists.
- Draft config exists.
- Template exists and is available.
- Template version exists.
- Draft `templateId` matches a supported template.
- Draft `themeId` is supported by the template.
- Draft `sections` are valid.
- Draft `pages` have unique slugs.
- Draft `shopName` is present.
- Workspace has or can generate a stable `public_slug`.

For Step 02, product references can be validated lightly because product APIs are
added in Step 03. If featured products are still placeholder objects, allow them.

## Public Slug Rule

Publishing should require a public slug.

Recommended behavior:

1. If `workspaces.public_slug` exists, use it.
2. If missing, generate one from workspace/business name.
3. If the generated slug is taken, append a short suffix.
4. Save it before finishing publish.

Example:

- Business name: `Nkandu Fashion`
- Generated slug: `nkandu-fashion`
- Conflict fallback: `nkandu-fashion-8f3a`

## Error Codes

Add these errors:

- `PUBLISH_CONFIRMATION_REQUIRED`
- `STOREFRONT_DRAFT_NOT_FOUND`
- `PUBLISHED_STOREFRONT_NOT_FOUND`
- `INVALID_PUBLISH_CONFIG`
- `PUBLIC_SLUG_UNAVAILABLE`
- `PUBLISH_FAILED`

## Acceptance Criteria

Step 02 is complete when:

- A merchant can publish their current draft.
- Publishing creates an immutable snapshot row.
- Publishing updates `storefronts.published_snapshot_id`.
- Publishing marks workspace status as `live`.
- A merchant can load the latest published snapshot.
- A merchant can view publish history.
- A merchant can unpublish the store.
- Unpublishing does not delete draft or publish history.
- Publish fails with clear validation errors when config is invalid.

## Suggested Implementation Order

1. Add `storefront_publish_snapshots` migration.
2. Add publish validation service.
3. Add public slug generation helper.
4. Implement `POST /workspaces/{workspaceId}/storefront/publish`.
5. Implement `GET /workspaces/{workspaceId}/storefront/published`.
6. Implement `GET /workspaces/{workspaceId}/storefront/publish-history`.
7. Implement `GET /workspaces/{workspaceId}/storefront/publish-history/{snapshotId}`.
8. Implement `POST /workspaces/{workspaceId}/storefront/unpublish`.
9. Add tests for publish, unpublish, ownership, validation, and history.

## What Comes Next

Step 03 adds the product catalog APIs so storefronts can show real backend-owned
products instead of local placeholder product data.
