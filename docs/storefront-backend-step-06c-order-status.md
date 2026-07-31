# Step 06C: Customer Order Status Lookup

Companion to Step 06A/06B. Customers re-check an order by **order number + email**.
Merchants advance fulfilment status. **No carrier / tracking numbers** in this step.

## Goals

- Public lookup: order number + email → same order confirmation payload.
- Merchant updates order status after payment: `processing`, `fulfilled`, `cancelled`.
- Generic 404 on failed lookup (do not reveal whether email or number was wrong).

## Public lookup

```http
POST /public/storefronts/{storeSlug}/orders/lookup
Content-Type: application/json
```

```json
{
  "orderNumber": "ORD-1001",
  "email": "customer@example.com"
}
```

### Rules

- Storefront must be published / live for that slug.
- Match `order_number` (trim; case-insensitive) and `customer_email` (trim; case-insensitive).
- On success: return the same camelCase `Order` shape as `GET …/orders/{orderId}`.
- On miss: `404` with a generic message, e.g. `"We couldn’t find an order with those details."`
- Rate-limit this endpoint (abuse / enumeration).

### Success response

```json
{
  "success": true,
  "data": {
    "id": "…",
    "orderNumber": "ORD-1001",
    "status": "processing",
    "paymentStatus": "paid",
    "customerEmail": "customer@example.com",
    "items": [],
    "shippingAddress": {}
  }
}
```

## Merchant status update

```http
PATCH /workspaces/{workspaceId}/orders/{orderId}
Authorization: Bearer {merchantJwt}
Content-Type: application/json
```

```json
{
  "status": "processing"
}
```

Allowed `status` values for this endpoint: `processing` | `fulfilled` | `cancelled`.

### Allowed transitions

| From | To |
|------|-----|
| `paid` | `processing`, `cancelled` |
| `processing` | `fulfilled`, `cancelled` |

- Payment webhook / verify already sets order `status` (and `paymentStatus`) to `paid`.
- Reject other transitions with `400` / `VALIDATION_ERROR`.
- Return updated order object.

## Frontend routes (this repo)

| Route | Purpose |
|-------|---------|
| `/s/{storeSlug}/orders/track` | Track order form + status view (**built, not linked in nav/footer yet**) |
| `/s/{storeSlug}/order/{orderId}` | Post-checkout confirmation (existing) |

## Out of scope

- Shipping carriers, tracking IDs, labels, ETAs
- Status-change emails (can follow later)
- Guest account / full order history
