# Step 03D: Merchant Out-Of-Stock Email

Companion to Step 03C hard stock. When a product hits **0** available units, email
the **workspace owner** once. Customers are not notified.

## Goals

- One merchant email when quantity goes from `> 0` → `0`.
- Idempotent per sold-out episode via `products.out_of_stock_notified_at`.
- Clear the flag when stock goes back above 0 so the next sell-out can notify again.
- Never fail payment / PATCH if email send fails.

## Triggers

| Event | Behavior |
|-------|----------|
| Paid order stock decrement reaches 0 | Claim + async email |
| Merchant `PATCH` product sets `quantityAvailable` to 0 (from > 0) | Same |
| Restock / PATCH quantity `> 0` | Clear `out_of_stock_notified_at` |

Do **not** email on cart `INSUFFICIENT_STOCK` while already at 0.

## Database

| Column | Notes |
|--------|--------|
| `products.out_of_stock_notified_at` | Nullable timestamp. Set atomically when claiming send. Null = may notify. |

## Implementation (backend — done)

- `OutOfStockMailer` — atomic claim + after-commit send
- `EmailService.sendOutOfStockEmail` — subject `Out of stock: {title}`
- CTA link: `{frontendUrl}/dashboard/{workspaceId}?section=products`
- Hooks in `InventoryService` and `ProductService`
- SES + `@Async`; log and skip if no merchant email

## Acceptance

- Last unit sold → paid → stock 0 → owner receives one email.
- Duplicate verify / second attempt → no second email.
- Restock to 5, sell to 0 again → email again.
- Email failure does not roll back payment.
- No merchant email configured → log, skip.

## Out of scope

- Customer “back in stock” waitlist
- Low-stock threshold (e.g. ≤ 2) — can follow later
- SMS / WhatsApp digests
