# Backend: multi-template storefront picker

Frontend now ships a **template gallery** (preview + choose) using a local
catalog and `POST /workspaces/{id}/storefront/draft/reset`.

This doc lists what the backend should add so the picker is API-driven and
multi-template safe.

## Already used by the frontend

| API | Use |
|-----|-----|
| `GET …/storefront/draft` | Load draft (auto-create still OK) |
| `POST …/storefront/draft/reset` | Apply chosen `{ templateId, templateVersion }` |
| `PUT …/storefront/draft` | Autosave after customization |

`classic-boutique` v1 + default config (aligned with
`src/data/default-storefront.json`) must keep working.

## Required next (backend)

### 1. Template catalog API

`GET /storefront-templates` (auth optional or merchant-scoped)

Return available templates for the picker:

```json
{
  "success": true,
  "data": [
    {
      "id": "classic-boutique",
      "name": "Classic Boutique",
      "description": "Editorial homepage with hero, products, promos…",
      "vibe": "Editorial retail",
      "status": "available",
      "latestVersion": 1,
      "previewImageUrl": "https://…",
      "supportedThemeIds": ["blue", "red"]
    }
  ]
}
```

Frontend will replace `STOREFRONT_TEMPLATE_CATALOG` with this response.

### 2. Versioned default configs

Keep / finish:

- `storefront_templates`
- `storefront_template_versions.default_config` (JSON)

`POST …/draft/reset` must load **that** version’s `default_config`, not a
hardcoded blob only in code.

### 3. Setup / onboarding flag (recommended)

Today the FE uses `localStorage` to know if the merchant already chose a
template. Prefer a durable field, e.g. on draft or workspace:

- `templateSetupCompletedAt` (nullable timestamp), or
- `onboarding.templateChosen: boolean`

Expose on `GET …/draft` so the picker gate works across devices.

### 4. New templates (when ready)

For each new template (`minimal-catalogue`, `bold-retail`, …):

1. Insert template + version row with `default_config` (hero default images,
   sections, copy).
2. Set `status: available`.
3. Frontend adds a renderer in `StorefrontTemplateView` for that `templateId`.

Without a FE renderer, keep `status: coming_soon` so the catalog can list it.

### 5. Validation

On reset / update draft:

- Reject unknown `templateId` / version
- Reject themes not in `supportedThemeIds`
- Do **not** delete catalogue products when resetting layout

## Out of scope for backend (FE owns)

- Live preview UI of the seed before apply
- Editor after choose
- Local “coming soon” cards until catalog API exists

## Acceptance

- [ ] `GET /storefront-templates` lists Classic Boutique as available
- [ ] Reset with `classic-boutique` / v1 returns seed matching published demos
      (e.g. bridge-labs-style layout)
- [ ] Reset with a second available template returns its own seed
- [ ] Draft payload includes setup-completed (or equivalent)
- [ ] Products / media rows unchanged after template reset
