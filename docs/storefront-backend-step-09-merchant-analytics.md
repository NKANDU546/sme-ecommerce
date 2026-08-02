# Step 09: Merchant Analytics APIs

Dashboard KPIs and charts for workspace owners. Depends on Steps 03 (products /
inventory) and 06 (orders / paid payments).

## Status

**Backend: in place** under `/api/v1/workspaces/{workspaceId}/analytics`.

Auth: JWT + workspace owner check (same as other merchant workspace routes).

## Money units

Analytics money fields are **major currency units** (e.g. `12500.00` ZAR),
**not** integer cents like catalog / order DTOs. Frontend must not divide by 100
when rendering these values.

## Date range

| Query | Meaning |
|-------|---------|
| `from` | Inclusive start (`YYYY-MM-DD` or ISO datetime — match backend) |
| `to` | Inclusive end |
| *(omitted)* | Default: last **30 days** |

Invalid ranges → `400` with `INVALID_ANALYTICS_QUERY`.

## Order metric rules

- Orders in range use `createdAt`.
- **Revenue / paid order counts / AOV** only include rows with
  `paymentStatus = PAID`.
- Catalog stock KPIs (`productsPublished`, `lowStockCount`, `outOfStockCount`)
  are a **current snapshot**, not filtered by `from`/`to`.
- `lowStockCount` = products with `quantityAvailable` in **1..5**.

---

## 1. Summary

```http
GET /workspaces/{workspaceId}/analytics/summary?from=&to=
Authorization: Bearer {merchantJwt}
```

### Response `data`

```json
{
  "revenuePaid": 12500.00,
  "ordersCount": 48,
  "ordersPaidCount": 41,
  "averageOrderValue": 304.88,
  "productsPublished": 22,
  "lowStockCount": 5,
  "outOfStockCount": 2,
  "currency": "ZAR",
  "from": "2026-07-01",
  "to": "2026-07-31"
}
```

| Field | Notes |
|-------|--------|
| `revenuePaid` | Sum of paid order `totalAmount` (major units) |
| `ordersCount` | All orders with `createdAt` in range |
| `ordersPaidCount` | Subset with `paymentStatus=PAID` |
| `averageOrderValue` | `revenuePaid / ordersPaidCount` (0 if no paid orders) |
| `productsPublished` | Current published product count |
| `lowStockCount` | qty 1–5 |
| `outOfStockCount` | qty 0 |
| `currency` | Workspace / store currency |

---

## 2. Timeseries

```http
GET /workspaces/{workspaceId}/analytics/timeseries?from=&to=&grain=day
Authorization: Bearer {merchantJwt}
```

| Query | Notes |
|-------|--------|
| `grain` | v1: `day` only (zeros filled for missing days in range) |

### Response `data`

```json
{
  "grain": "day",
  "from": "2026-07-01",
  "to": "2026-07-03",
  "currency": "ZAR",
  "points": [
    { "date": "2026-07-01", "revenue": 1200.00, "orders": 4 },
    { "date": "2026-07-02", "revenue": 0, "orders": 0 },
    { "date": "2026-07-03", "revenue": 800.00, "orders": 3 }
  ]
}
```

`revenue` / `orders` per point = **paid** orders only (`paymentStatus=PAID`).

---

## 3. Breakdowns

```http
GET /workspaces/{workspaceId}/analytics/breakdowns?from=&to=
Authorization: Bearer {merchantJwt}
```

### Response `data`

```json
{
  "from": "2026-07-01",
  "to": "2026-07-31",
  "currency": "ZAR",
  "ordersByStatus": [
    { "key": "paid", "count": 20 },
    { "key": "processing", "count": 8 }
  ],
  "ordersByPaymentStatus": [
    { "key": "paid", "count": 28 },
    { "key": "unpaid", "count": 5 }
  ],
  "topProducts": [
    {
      "productId": "…",
      "title": "Linen Dress",
      "unitsSold": 12,
      "revenue": 3600.00
    }
  ],
  "revenueByCategory": [
    {
      "categoryId": "…",
      "name": "Apparel",
      "revenue": 5000.00
    }
  ]
}
```

| Block | Rules |
|-------|--------|
| `ordersByStatus` | All orders in range by fulfilment `status` |
| `ordersByPaymentStatus` | All orders in range by `paymentStatus` |
| `topProducts` | From paid order line items; `revenue` major units |
| `revenueByCategory` | Paid revenue rolled up by product category |

---

## Error codes

| Code | When |
|------|------|
| `UNAUTHORIZED` / `FORBIDDEN` | Missing JWT or not workspace owner |
| `INVALID_ANALYTICS_QUERY` | Bad / inverted `from`–`to`, unsupported `grain`, etc. |
| `WORKSPACE_NOT_FOUND` | Unknown workspace |

---

## Frontend (this repo)

| Piece | Purpose |
|-------|---------|
| `src/types/analytics.ts` | Response types (major-unit money) |
| `src/apis/analytics.ts` | Client for summary / timeseries / breakdowns |
| `src/hooks/use-analytics.ts` | React Query hooks for dashboard + analytics sections |
| `src/components/dashboard/analytics-panel.tsx` | KPIs, revenue line, donuts, top products / categories |

UI: **Dashboard** = overview (KPIs + revenue + stock); **Analytics** = full breakdowns.

## Frontend extras (no new backend required)

| Feature | How |
|---------|-----|
| Previous-period % on KPIs | Second `summary` call for the prior window of equal length |
| Custom `from` / `to` | Date inputs + 7d/30d/90d presets |
| `grain=week\|month` chart | Fetch daily timeseries; aggregate client-side |
| Stock alerts list | `listProducts` (qty 0 / 1–5) + summary counts |

## Out of scope (still needs backend if desired)

- Native `grain=week\|month` zeros-fill on the server
- Dedicated `GET …/analytics/inventory` (product list already covers alerts)
- Server-returned `previousRevenue` / comparison fields
- Funnel / traffic / sessions / CSV exports
- Public / non-owner access
