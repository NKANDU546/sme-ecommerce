# Step 12: Custom Domains (And Platform Subdomains)

Let merchants serve their live storefront on a branded hostname instead of only
`/s/{storeSlug}` on the platform origin.

Depends on Steps 02 (publish), 05 (public storefront), and 06 (checkout /
callback URLs). Do **not** start before launch hardening (Step 08) is green for
the path-based public site.

## Status

**Not started** — docs / schema sketch only. `/s/{storeSlug}` remains the
canonical live URL until this step ships.

## Product intent

| Level | Example | Who owns DNS / TLS | Ship first? |
|-------|---------|--------------------|-------------|
| **0** (today) | `app.example.com/s/my-shop` | Platform | Done |
| **A** Platform subdomain | `my-shop.stores.example.com` | Platform | **MVP** |
| **B** Custom domain | `www.mybrand.co.za` | Merchant DNS + platform TLS | After A |

Level A is enough for “my store has its own URL.” Level B is the pro upgrade
(bring your own domain).

## Goals

After this step:

- Merchant can see and copy their **platform subdomain** (Level A).
- Merchant can **add / verify / remove** a custom hostname (Level B).
- Customers hitting a verified hostname see the same published storefront as
  `/s/{storeSlug}` (home, shop, PDP, cart, checkout, order track).
- Absolute links (emails, Paystack return URLs, Open Graph) prefer the
  **primary public origin** when a verified domain exists.
- Path-based `/s/{storeSlug}` keeps working forever (redirect optional later).

## Non-goals (this step)

- Selling domains / registrar integration.
- Multi-domain load balancing / geo.
- Apex-only setups that need ALIAS/ANAME provider-specific magic without docs
  (document CNAME on `www` + optional apex redirect as the supported path).
- Merchant-uploaded TLS certificates.
- Changing `storeSlug` resolution rules for public APIs (still slug-keyed).

---

## Resolution model

```text
Request Host
    → lookup custom_domains (verified) OR platform subdomain map
    → workspace_id + storeSlug
    → serve same published snapshot as GET /public/storefronts/{storeSlug}
```

Public **API** paths stay slug-based:

```http
GET /api/v1/public/storefronts/{storeSlug}
```

The **browser origin** may be:

- `https://app.example.com/s/{storeSlug}/…` (Level 0)
- `https://{storeSlug}.stores.example.com/…` (Level A — path without `/s/{slug}`)
- `https://www.mybrand.co.za/…` (Level B — path without `/s/{slug}`)

Frontend must derive `storeSlug` from:

1. Path (`/s/{storeSlug}/…`) on the platform app host, **or**
2. Host lookup (middleware / edge) that injects slug into the request
   (header / rewrite) on subdomain and custom-domain hosts.

### Suggested rewrite (Level A / B)

On hosts that are **not** the main app origin:

| Browser URL | Internal rewrite |
|-------------|------------------|
| `/` | `/s/{storeSlug}` |
| `/shop` | `/s/{storeSlug}/shop` |
| `/shop/{product}` | `/s/{storeSlug}/shop/{product}` |
| `/cart` | `/s/{storeSlug}/cart` |
| `/orders/track` | `/s/{storeSlug}/orders/track` |
| … | same mapping |

Dashboard, sign-in, preview stay on the main app host only.

---

## Data model

Expand the planned `custom_domains` table (see also `storefront-backend-plan.md`).

### `custom_domains`

| Column | Notes |
| --- | --- |
| `id` | PK |
| `workspace_id` | FK, unique active domain per workspace (v1: **one** custom domain) |
| `hostname` | Unique, lowercase, no scheme/path (`www.mybrand.co.za`) |
| `kind` | `platform_subdomain` \| `custom` |
| `status` | `pending` \| `verifying` \| `active` \| `failed` \| `disabled` |
| `is_primary` | Bool — used for emails / Paystack return / canonical |
| `verification_method` | `dns_txt` \| `cname` (custom); `platform` for Level A |
| `verification_token` | Random token for TXT record (custom only) |
| `verified_at` | Nullable timestamp |
| `last_check_at` | Nullable — last DNS / TLS poll |
| `last_error` | Nullable short message for merchant UI |
| `tls_status` | `none` \| `pending` \| `active` \| `failed` (Level B) |
| `created_at` / `updated_at` | Timestamps |

### Platform subdomain (Level A)

No merchant DNS. On publish (or workspace create), ensure a row:

- `hostname` = `{storeSlug}.{PLATFORM_STORES_ZONE}` e.g. `my-shop.stores.example.com`
- `kind` = `platform_subdomain`
- `status` = `active`
- `verification_method` = `platform`

Wildcard DNS + wildcard TLS on `*.stores.example.com` is an **ops** concern,
not per-merchant rows beyond the mapping.

### Constraints

- Hostname unique across all workspaces.
- Reject reserved / platform hostnames (`app.`, `api.`, `www.` of platform, etc.).
- Normalize: lowercase, strip trailing `.`, reject ports and paths.
- v1: at most **one** `kind=custom` per workspace; platform subdomain always exists
  when store is live.

### Optional workspace fields

| Field | Notes |
| --- | --- |
| `primary_public_origin` | Cached `https://{hostname}` of primary active domain (denormalized OK) |

Or compute from `custom_domains` where `is_primary` and `status=active`.

---

## Merchant APIs

Auth: JWT + workspace owner (same as other workspace routes).

Base: `/api/v1/workspaces/{workspaceId}/domains`

### List

```http
GET /workspaces/{workspaceId}/domains
```

```json
{
  "domains": [
    {
      "id": "…",
      "hostname": "my-shop.stores.example.com",
      "kind": "platform_subdomain",
      "status": "active",
      "isPrimary": true,
      "publicOrigin": "https://my-shop.stores.example.com",
      "pathStyle": "root"
    },
    {
      "id": "…",
      "hostname": "www.mybrand.co.za",
      "kind": "custom",
      "status": "pending",
      "isPrimary": false,
      "verificationMethod": "dns_txt",
      "verificationToken": "sme-verify-abc123",
      "dnsInstructions": {
        "txtName": "_sme-verify.www.mybrand.co.za",
        "txtValue": "sme-verify-abc123",
        "cnameName": "www",
        "cnameTarget": "stores.example.com"
      },
      "tlsStatus": "none",
      "lastError": null
    }
  ],
  "legacyPathUrl": "https://app.example.com/s/my-shop"
}
```

### Add custom domain

```http
POST /workspaces/{workspaceId}/domains
Content-Type: application/json

{ "hostname": "www.mybrand.co.za" }
```

- Creates `pending` row + verification token.
- Returns DNS instructions (TXT + CNAME target).
- `400` if invalid hostname / reserved / already taken /
  workspace already has a custom domain.

### Verify (poll)

```http
POST /workspaces/{workspaceId}/domains/{domainId}/verify
```

Backend checks TXT (and optionally CNAME). On success:

- `status` → `active` (or `verifying` until TLS ready)
- Trigger TLS provisioning for hostname
- Optionally set `is_primary=true` if first custom active domain

Failures stay `pending`/`failed` with `lastError` (safe message).

### Set primary

```http
POST /workspaces/{workspaceId}/domains/{domainId}/primary
```

Only `active` domains. Updates email / checkout return base URL.

### Remove

```http
DELETE /workspaces/{workspaceId}/domains/{domainId}
```

- Cannot delete the platform subdomain row.
- Removing primary custom domain falls back primary to platform subdomain.
- Deprovision TLS / edge hostname when provider supports it.

### Public resolve (edge / FE middleware helper)

```http
GET /public/domains/resolve?host=www.mybrand.co.za
```

No auth. Response:

```json
{
  "storeSlug": "my-shop",
  "workspaceId": "…",
  "status": "active"
}
```

`404` if unknown / not active. Cache aggressively (short TTL + purge on domain
change).

---

## Verification & TLS (Level B)

### DNS (merchant)

Document clearly in UI:

1. Add **TXT** `_sme-verify.{hostname}` = `{verificationToken}` (ownership).
2. Add **CNAME** `{hostname}` → `{PLATFORM_CNAME_TARGET}` (e.g. `stores.example.com`
   or provider-specific target like `cname.vercel-dns.com`).

Prefer **www** hostnames. Apex (`mybrand.co.za`) only if the DNS provider
supports ALIAS/ANAME to the same target — otherwise instruct redirect apex → www
at the registrar.

### TLS

Pick **one** hosting path and document it in ops (do not invent dual stacks):

| Hosting | Approach |
|---------|----------|
| Vercel | Domains API: add domain to project; wait until `verified` + cert ready |
| Cloudflare for SaaS | Custom hostnames + SSL for SaaS |
| Netlify | Domain alias API + DNS config |
| Self-hosted | Cert-manager + Ingress per hostname (heavier) |

Backend `verify` + a small worker/cron should poll provider until `tls_status=active`,
then flip domain `status=active` for traffic.

### Security

- Rate-limit add/verify per workspace.
- Never accept arbitrary redirect targets.
- Only serve **published** storefronts on custom hosts (same as Step 05).
- If workspace unpublished / suspended → custom host shows the same offline page
  as `/s/{slug}`.

---

## Checkout, Paystack, and emails

When building absolute customer URLs, use:

```text
primaryPublicOrigin = https://{primary active hostname}
```

Fallback: `https://{APP_ORIGIN}/s/{storeSlug}`.

Must update:

- Paystack `callback_url` / success return to cart or order confirmation
- Order confirmation + out-of-stock merchant emails that link to the store
- Order track deep links
- `canonical` / Open Graph `url` on public pages (FE)

Webhooks stay on the **API** host (unchanged). Only browser-facing URLs switch.

Cart cookies / localStorage: scope by origin. A customer on custom domain has a
**separate** cart from `/s/{slug}` on the app host — acceptable for v1. Optional
later: redirect app-host `/s/{slug}` → primary custom origin (301) when primary
is custom.

---

## Frontend requirements

### Dashboard — Domains (or Storefront → Domains)

New panel (Settings / Storefront):

1. Show **legacy path URL** and **platform subdomain** with copy button.
2. Form: “Add custom domain” → show DNS steps + “I’ve added the records” → Verify.
3. Status badges: pending / verifying / active / failed + `lastError`.
4. Set as primary (when active).
5. Remove custom domain (confirm modal).

Only for published (or publish-ready) workspaces; disable with hint if no
`storeSlug` / not live.

### Public routing

1. Middleware / edge: if `Host` ≠ app origin → `GET /public/domains/resolve` →
   rewrite to `/s/{storeSlug}/…`.
2. `basePath` for chrome links on custom hosts = `""` (root), not `/s/{slug}`.
3. Keep preview on `/preview/{workspaceId}` only (never on custom domain).

### Config

Env examples:

```text
NEXT_PUBLIC_APP_ORIGIN=https://app.example.com
NEXT_PUBLIC_STORES_ZONE=stores.example.com
```

---

## Backend / ops checklist

- [ ] Table + migrations for `custom_domains`
- [ ] CRUD + verify + primary + resolve endpoints
- [ ] Platform subdomain row created/updated when `storeSlug` is set / changes
- [ ] Hostname validation + reserved list
- [ ] DNS check implementation (TXT ± CNAME)
- [ ] TLS / edge hostname provisioning hook (chosen provider)
- [ ] Primary origin used in checkout return + customer emails
- [ ] Cache + invalidate resolve-by-host
- [ ] Wildcard DNS + cert for `*.stores.example.com` (Level A)
- [ ] Runbook: failed verification, stuck TLS, remove domain

---

## Phased delivery

### 12A — Platform subdomains (MVP)

- Wildcard zone + TLS
- Mapping `storeSlug` → `{slug}.{zone}`
- Middleware rewrite
- Dashboard copy URL (no custom DNS UI yet)
- Primary origin = platform subdomain (or keep path URL until B)

### 12B — Custom domains

- Add / verify / remove UI + APIs
- DNS instructions + poll
- TLS provisioning
- Primary switch + checkout/email URLs
- Optional 301 from `/s/{slug}` → primary custom origin

Ship **12A** first if ops wildcard is ready; otherwise ship **12B-only** behind
the main app host is **not** recommended (customers expect a clean hostname).

---

## Acceptance

### 12A

- [ ] Live store reachable at `https://{storeSlug}.{STORES_ZONE}/` with same
      content as `/s/{storeSlug}`
- [ ] Shop / PDP / cart / checkout / track work on subdomain paths
- [ ] Dashboard shows copyable subdomain URL
- [ ] Unpublished store is not publicly browsable on subdomain

### 12B

- [ ] Merchant can add `www` hostname and see TXT + CNAME instructions
- [ ] Verify succeeds after correct DNS; fails clearly otherwise
- [ ] HTTPS works once `tls_status=active`
- [ ] Setting primary updates Paystack return / confirmation links
- [ ] Removing custom domain restores platform subdomain as primary
- [ ] Unknown host → 404 (not another merchant’s store)

## Out of scope

- Domain purchase / WHOIS
- Multiple custom domains per workspace
- Email sending from merchant domain (`@mybrand.co.za`)
- CSS / theme upload
- Changing public API to be host-keyed instead of slug-keyed

## Send order

1. Decide hosting provider for custom hostnames (Vercel / Cloudflare / other).
2. Ops: wildcard `*.stores.example.com` (12A).
3. Backend: table + resolve + merchant domain APIs.
4. Frontend: middleware rewrite + Domains panel.
5. Wire primary origin into checkout + emails.
6. 12B verify + TLS automation.

## Related

- Schema sketch: `custom_domains` in `docs/storefront-backend-plan.md`
- Deferred mentions: Steps 01, 02, 05, 08, 11
- Public slug APIs: Step 05
- Launch checklist: Step 08 (path-based live site must work first)
