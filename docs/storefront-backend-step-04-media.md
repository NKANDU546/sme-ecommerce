# Step 04: Media Uploads

This step adds backend-owned image and file handling for storefront and product
assets.

## Goal

Allow merchants to upload and reuse images from the backend instead of pasting
external image URLs into the storefront editor.

After this step, the backend should be able to:

- Create signed upload URLs.
- Store uploaded media metadata.
- Return a media library by workspace.
- Connect media assets to storefront config and products.
- Delete or detach media safely.

## Scope

### Included

- Media asset table.
- Signed upload URL API.
- Media registration API.
- Media library list API.
- Delete API.
- Product image relation update.

### Not Included Yet

- Image editing/cropping.
- CDN cache invalidation.
- Video uploads.
- Advanced image transformations.

## Storage Provider

Use the provider chosen by the backend team, for example:

- Azure Blob Storage
- AWS S3
- Cloudflare R2
- Google Cloud Storage

The app database should not store the binary file. It should store metadata and
the storage key/URL.

## Database Changes

### `media_assets`

| Column | Type | Notes |
| --- | --- | --- |
| `id` | UUID/string | Primary key |
| `workspace_id` | UUID/string | FK to `workspaces.id` |
| `uploaded_by_user_id` | UUID/string | FK to `users.id` |
| `url` | string | Public/CDN URL |
| `storage_key` | string | Object storage path/key |
| `original_filename` | string nullable | Original file name |
| `mime_type` | string | Example `image/jpeg` |
| `size_bytes` | integer | File size |
| `width` | integer nullable | Image width |
| `height` | integer nullable | Image height |
| `status` | string | `pending`, `ready`, `deleted` |
| `created_at` | timestamp | Created date |
| `updated_at` | timestamp | Updated date |

### Update `products`

Add or switch to:

| Column | Type | Notes |
| --- | --- | --- |
| `main_image_id` | UUID/string nullable | FK to `media_assets.id` |

Keep `image_url` temporarily for migration/backwards compatibility.

### Update `product_images`

Use media IDs for gallery images.

| Column | Type | Notes |
| --- | --- | --- |
| `id` | UUID/string | Primary key |
| `product_id` | UUID/string | FK to `products.id` |
| `media_id` | UUID/string | FK to `media_assets.id` |
| `sort_order` | integer | Gallery order |
| `created_at` | timestamp | Created date |

## APIs For Step 04

All APIs in this step require merchant authentication and workspace ownership.

### Create Upload URL

```http
POST /workspaces/{workspaceId}/media/upload-url
```

Example request:

```json
{
  "filename": "hero.jpg",
  "mimeType": "image/jpeg",
  "sizeBytes": 512000
}
```

Example response:

```json
{
  "success": true,
  "data": {
    "mediaId": "media_123",
    "uploadUrl": "https://storage.example.com/signed-url",
    "storageKey": "workspaces/workspace_123/media/media_123/hero.jpg",
    "expiresAt": "2026-05-22T08:15:00.000Z"
  }
}
```

The backend can create the `media_assets` row with `status = pending` here.

### Confirm Upload

```http
POST /workspaces/{workspaceId}/media/{mediaId}/confirm
```

After the frontend uploads to object storage, call this endpoint so the backend
can mark the media as ready.

Example request:

```json
{
  "width": 1600,
  "height": 900
}
```

### List Media

```http
GET /workspaces/{workspaceId}/media
```

Supported query params:

- `type=image`
- `page`
- `limit`

### Get Media

```http
GET /workspaces/{workspaceId}/media/{mediaId}
```

### Delete Media

```http
DELETE /workspaces/{workspaceId}/media/{mediaId}
```

Recommended behavior: soft delete first by setting `status = deleted`.

## Using Media In Storefront Config

The current frontend config stores image URLs directly, for example:

- `heroBackgroundImageUrl`
- Section `imageUrl`
- Product placeholder `imageUrl`

For the first backend version, the API can continue returning URLs so the current
frontend keeps rendering.

Recommended long-term shape:

```json
{
  "image": {
    "mediaId": "media_123",
    "url": "https://cdn.example.com/hero.jpg",
    "alt": "Store hero image"
  }
}
```

Do not force the frontend migration in this step. First make media available,
then gradually update config fields to store media references.

## Validation Rules

Validate:

- Logged-in user owns the workspace.
- File size is under the allowed limit.
- MIME type is allowed.
- Only image types are allowed in version one.
- Media belongs to the workspace before it can be used by a product/storefront.
- Deleted media cannot be attached to new records.

Recommended allowed MIME types:

- `image/jpeg`
- `image/png`
- `image/webp`

## Error Codes

- `MEDIA_NOT_FOUND`
- `INVALID_MEDIA_TYPE`
- `MEDIA_TOO_LARGE`
- `UPLOAD_URL_FAILED`
- `MEDIA_NOT_READY`
- `MEDIA_ALREADY_DELETED`

## Acceptance Criteria

Step 04 is complete when:

- A merchant can request a signed upload URL.
- A pending media record is created.
- A merchant can confirm an upload.
- A merchant can list workspace media.
- A merchant can delete media.
- Products can reference media as the main image.
- Product gallery images can reference media assets.
- Workspace ownership is enforced for all media operations.

## Suggested Implementation Order

1. Choose object storage provider and bucket/container structure.
2. Add `media_assets` migration.
3. Add or update `product_images` migration.
4. Implement signed upload URL generation.
5. Implement upload confirmation.
6. Implement media list/get/delete APIs.
7. Update product create/update to accept `mainImageId`.
8. Add tests for ownership, file validation, confirm, list, and delete.

## What Comes Next

Step 05 exposes published storefront and product data to public customer routes.
