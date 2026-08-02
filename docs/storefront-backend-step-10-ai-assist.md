# Step 10: Merchant AI Assist (OpenAI)

Add **server-side** OpenAI helpers for merchants. AI drafts copy and explains
analytics; it never writes products/orders without an explicit merchant Accept,
and never touches payments or stock math.

## Status

**Backend: not started** — send this step after Step 09 analytics is stable.

Depends on:

- Step 03 — products / categories
- Step 09 — analytics summary / breakdowns (for explain)
- OpenAI API key in backend secrets (`OPENAI_API_KEY`)

## Goals (v1 — two endpoints)

1. **Product draft** — suggest title, summary, slug, category from sparse input.
2. **Analytics explain** — short natural-language insight from real KPI JSON.

## Non-goals (v1)

- Auto-create / auto-update products without merchant confirmation
- Public customer chatbot
- Vision / photo → listing (phase 2)
- Storefront section rewrite (phase 2)
- Embeddings / semantic search
- Using the model to compute revenue, stock, or payment status

## Architecture

```text
Dashboard (JWT) → SME Backend → OpenAI
                      │
                 - key never in browser
                 - owner-only workspace check
                 - rate limit per workspace
                 - optional audit row (prompt hash, latency, model)
```

| Rule | Detail |
|------|--------|
| Auth | Same as other merchant routes: JWT + workspace **owner** |
| Money / stock | Never ask the model to invent totals; explain endpoint receives **server-fetched** metrics only |
| Accept UX | FE shows draft fields; merchant edits then calls existing `POST/PATCH …/products` |
| Model | Prefer a cheap chat model (e.g. `gpt-4.1-mini` / `gpt-4o-mini`); pin model id in config |
| Timeout | Fail with `AI_TIMEOUT` if provider &gt; ~20s |
| PII | Do not send customer emails/phones/addresses to OpenAI in v1 |

## Envelope / errors

Standard API envelope. Extra codes:

| Code | HTTP | When |
|------|------|------|
| `AI_NOT_CONFIGURED` | 503 | Missing API key / feature flag off |
| `AI_RATE_LIMITED` | 429 | Workspace exceeded quota |
| `AI_PROVIDER_ERROR` | 502 | OpenAI error / malformed |
| `AI_TIMEOUT` | 504 | Provider too slow |
| `AI_INVALID_INPUT` | 400 | Empty / oversized prompt fields |
| `FORBIDDEN` | 403 | Not workspace owner |

Suggested limit v1: **30 AI calls / workspace / hour** (shared across both routes).

---

## 1. Product draft

```http
POST /workspaces/{workspaceId}/ai/product-draft
Authorization: Bearer {merchantJwt}
Content-Type: application/json
```

### Request

```json
{
  "titleHint": "Linen summer dress",
  "notes": "Natural fabric, sizes S-L, selling around 899 ZAR",
  "priceAmount": 89900,
  "currency": "ZAR",
  "categoryHint": "Dresses",
  "tone": "classic_boutique"
}
```

| Field | Required | Notes |
|-------|----------|--------|
| `titleHint` | yes* | Short product name or phrase (*or `notes` must be non-empty) |
| `notes` | no | Free text from merchant (WhatsApp paste OK, max ~2000 chars) |
| `priceAmount` | no | Minor units (same as product APIs) — for wording only |
| `currency` | no | Default workspace / `ZAR` |
| `categoryHint` | no | Free text; model may map to an existing category name |
| `tone` | no | `classic_boutique` \| `neutral` (default `classic_boutique`) |

Optional later: `imageMediaId` + Vision — **out of scope v1**.

### Server behaviour

1. Validate owner + input size.
2. Load workspace category names (for grounding suggestions).
3. Call OpenAI with a **strict JSON schema** system prompt.
4. Return draft only — **no DB write**.

### Response `data`

```json
{
  "title": "Linen Summer Dress",
  "slug": "linen-summer-dress",
  "summary": "Breathable linen for warm days—easy shape, soft hand-feel, made to wear often.",
  "suggestedCategoryName": "Dresses",
  "suggestedCategoryId": null,
  "skuSuggestion": "DRS-LINEN-001",
  "tone": "classic_boutique",
  "model": "gpt-4o-mini",
  "disclaimer": "Review before saving. AI can be wrong."
}
```

| Field | Notes |
|-------|--------|
| `title` / `summary` / `slug` | Always strings; slug URL-safe lowercase |
| `suggestedCategoryName` | Best-effort; may be null |
| `suggestedCategoryId` | Set only if name fuzzy-matches an existing workspace category |
| `skuSuggestion` | Optional hint; merchant may ignore |
| `model` | Actual model id used (observability) |

If OpenAI returns invalid JSON → `AI_PROVIDER_ERROR` (do not pass raw prose to FE as product fields).

### Frontend

- Product form modal: button **Generate with AI** → fill title/summary/slug fields.
- Merchant must still Save via existing create/update product APIs.

---

## 2. Analytics explain

```http
POST /workspaces/{workspaceId}/ai/analytics-explain
Authorization: Bearer {merchantJwt}
Content-Type: application/json
```

### Request

```json
{
  "from": "2026-07-01",
  "to": "2026-07-31"
}
```

| Field | Required | Notes |
|-------|----------|--------|
| `from` / `to` | no | Same rules as Step 09 (default last 30 days). Invalid → `INVALID_ANALYTICS_QUERY` |

**Do not** accept client-supplied KPI numbers. Backend must:

1. Call internal analytics services (`summary` + `breakdowns` for the range).
2. Optionally attach prior-window summary for % context (same length as FE).
3. Send **only that JSON** (+ short instruction) to OpenAI.
4. Ask for 3–6 bullet insights, no invented metrics.

### Response `data`

```json
{
  "from": "2026-07-01",
  "to": "2026-07-31",
  "headline": "Solid paid sales with two stock bottlenecks",
  "bullets": [
    "Paid revenue R30,920 across 18 paid orders (AOV ~R1,718).",
    "Top concentration: check top products — one SKU may dominate.",
    "Catalog: 1 low-stock and 2 sold-out items — restock before next push."
  ],
  "suggestedActions": [
    {
      "label": "Review sold-out products",
      "section": "inventory"
    },
    {
      "label": "Open orders",
      "section": "orders"
    }
  ],
  "model": "gpt-4o-mini",
  "disclaimer": "Based only on your analytics for this range. Not financial advice."
}
```

| Field | Notes |
|-------|--------|
| `headline` | ≤ ~120 chars |
| `bullets` | 3–6 strings; must stay consistent with provided metrics |
| `suggestedActions` | Optional; `section` ∈ dashboard nav ids the FE already has |
| Money in prose | Major units with currency symbol (match Step 09) |

If analytics range invalid → same as Step 09 (`INVALID_ANALYTICS_QUERY`), no OpenAI call.

### Frontend

- Analytics panel: **Explain this period** → show headline + bullets.
- Link `suggestedActions` to `/dashboard/{workspaceId}?section=…`.

---

## Prompt / safety checklist (backend)

- [ ] System prompt: “Only use numbers present in the JSON. If unknown, say you don’t know.”
- [ ] Cap output tokens (e.g. 400 product draft, 500 explain).
- [ ] Strip / reject request fields that look like card data.
- [ ] Feature flag `AI_ASSIST_ENABLED` (default off until key + limits set).
- [ ] Log: workspaceId, route, latencyMs, model, success/error code — **not** full customer PII.

## Acceptance

### Product draft

- [ ] Owner JWT → 200 + draft JSON; no product row created.
- [ ] Non-owner → 403.
- [ ] Empty body → `AI_INVALID_INPUT`.
- [ ] Feature off / no key → `AI_NOT_CONFIGURED`.
- [ ] FE can Apply draft into form and save via normal product API.

### Analytics explain

- [ ] Explain for last 30d returns bullets that reference real summary totals.
- [ ] Bad `from`/`to` → `INVALID_ANALYTICS_QUERY` without calling OpenAI.
- [ ] Rate limit after N calls → `AI_RATE_LIMITED`.

## Out of scope / phase 2

| Item | Notes |
|------|--------|
| Vision product from photo | `imageMediaId` + Vision |
| Storefront section rewrite | `POST …/ai/storefront-copy` |
| Order reply drafts | WhatsApp / email templates |
| Customer-facing chat | Needs tool-calling + hard status from APIs |
| Native `previousRevenue` on analytics | Optional; FE/backend can still compute prior window |

## Frontend follow-up (this repo)

After backend ships:

1. `src/apis/ai.ts` + types
2. Product form — Generate with AI
3. Analytics panel — Explain this period
4. Docs: mark this step **backend in place** when done

## Send to backend

Ship this file as **Step 10**. Implement product-draft first, then analytics-explain (reuses Step 09 services).
