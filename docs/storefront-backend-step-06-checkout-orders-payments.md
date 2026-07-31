# Step 06: Cart, Checkout, Orders, And Payments

This step turns the public storefront into a transactional store. It is split
into two sub-steps that can ship in sequence (or in parallel once 06A APIs exist):

- **06A** — Cart, checkout, orders (no card charge yet).
- **06B** — Paystack **Subaccounts**: merchant payout setup in our dashboard +
  customer card/mobile-money payment.

---

## Step 06A: Cart And Checkout

This sub-step adds anonymous carts, server-side totals, checkout order creation,
and order confirmation. Online payment is Step 06B; until then orders stay
`pending_payment` / `unpaid` (manual collection is fine for testing).

### Goal

After Step 06A the backend should be able to:

- Create anonymous carts.
- Add, update, and remove cart items.
- Calculate totals from backend product prices.
- Create an order from checkout details.
- Return an order confirmation.
- Orders start with status `pending_payment` and payment status `unpaid`.

### Scope

#### Included In 06A

- Cart tables.
- Order tables.
- Public cart APIs.
- Public checkout API.
- Public order confirmation API.
- Frontend cart migrated from browser memory to backend cart APIs.

#### Not Included In 06A

- Payment provider integration (see 06B Subaccounts).
- Payment table.
- Refunds.
- Inventory reservations.
- Shipping carrier integrations.
- Multi-currency.

### Database Changes

#### `carts`

| Column | Type | Notes |
| --- | --- | --- |
| `id` | UUID/string | Primary key |
| `workspace_id` | UUID/string | FK to `workspaces.id` |
| `customer_session_id` | string | Anonymous customer session ID |
| `status` | string | `active`, `converted`, `abandoned` |
| `currency` | string | Example `ZAR` |
| `created_at` | timestamp | Created date |
| `updated_at` | timestamp | Updated date |

#### `cart_items`

| Column | Type | Notes |
| --- | --- | --- |
| `id` | UUID/string | Primary key |
| `cart_id` | UUID/string | FK to `carts.id` |
| `product_id` | UUID/string | FK to `products.id` |
| `quantity` | integer | Quantity |
| `unit_price_amount` | integer | Snapshot price in minor units |
| `currency` | string | Snapshot currency |
| `created_at` | timestamp | Created date |
| `updated_at` | timestamp | Updated date |

#### `orders`

| Column | Type | Notes |
| --- | --- | --- |
| `id` | UUID/string | Primary key |
| `workspace_id` | UUID/string | FK to `workspaces.id` |
| `cart_id` | UUID/string nullable | FK to `carts.id` |
| `order_number` | string | Unique readable reference |
| `customer_name` | string | Customer name |
| `customer_email` | string nullable | Optional |
| `customer_phone` | string | Customer phone or WhatsApp number |
| `shipping_address` | JSON | Address fields |
| `subtotal_amount` | integer | Minor units |
| `shipping_amount` | integer | Minor units (zero for 06A) |
| `total_amount` | integer | Minor units |
| `currency` | string | Example `ZAR` |
| `status` | string | `pending_payment`, `paid`, `processing`, `fulfilled`, `cancelled` |
| `payment_status` | string | `unpaid`, `initialized`, `paid`, `failed`, `refunded` |
| `created_at` | timestamp | Created date |
| `updated_at` | timestamp | Updated date |

#### `order_items`

| Column | Type | Notes |
| --- | --- | --- |
| `id` | UUID/string | Primary key |
| `order_id` | UUID/string | FK to `orders.id` |
| `product_id` | UUID/string nullable | FK to `products.id` |
| `title` | string | Snapshot title |
| `sku` | string | Snapshot SKU |
| `quantity` | integer | Quantity |
| `unit_price_amount` | integer | Snapshot unit price |
| `total_amount` | integer | Line total |
| `currency` | string | Snapshot currency |

### Public Cart APIs

No merchant authentication required.

#### Create Cart

```http
POST /public/storefronts/{storeSlug}/carts
```

Creates an anonymous cart for a live store.

#### Get Cart

```http
GET /public/storefronts/{storeSlug}/carts/{cartId}
```

Returns cart lines and totals calculated on the backend.

#### Add Cart Item

```http
POST /public/storefronts/{storeSlug}/carts/{cartId}/items
```

Example request:

```json
{
  "productId": "product_123",
  "quantity": 1
}
```

#### Update Cart Item

```http
PATCH /public/storefronts/{storeSlug}/carts/{cartId}/items/{itemId}
```

Example request:

```json
{
  "quantity": 2
}
```

#### Remove Cart Item

```http
DELETE /public/storefronts/{storeSlug}/carts/{cartId}/items/{itemId}
```

### Checkout API

#### Create Checkout Order

```http
POST /public/storefronts/{storeSlug}/checkout
```

Creates an order from the cart. Order status starts as `pending_payment`,
payment status starts as `unpaid`.

No payment provider is called in Step 06A. Merchants collect payment
manually and update order status from the merchant dashboard.

Example request:

```json
{
  "cartId": "cart_123",
  "customer": {
    "name": "Customer Name",
    "email": "customer@example.com",
    "phone": "+27000000000"
  },
  "shippingAddress": {
    "line1": "123 Main Road",
    "line2": "",
    "city": "Cape Town",
    "province": "Western Cape",
    "postalCode": "8001",
    "country": "ZA"
  }
}
```

#### Get Order Confirmation

```http
GET /public/storefronts/{storeSlug}/orders/{orderId}
```

Returns safe confirmation data for the customer after checkout.

### Calculation Rules

- Totals must be calculated on the backend.
- Never trust frontend price labels.
- Cart item unit prices snapshot the product price when the item is added.
- Order item prices snapshot the cart/product prices when the order is created.
- Shipping amount is `0` in Step 06A.

### Error Codes

- `CART_NOT_FOUND`
- `CART_ITEM_NOT_FOUND`
- `CART_EMPTY`
- `PRODUCT_NOT_AVAILABLE`
- `INVALID_QUANTITY`
- `CHECKOUT_VALIDATION_ERROR`
- `ORDER_NOT_FOUND`

### Acceptance Criteria

Step 06A is complete when:

- Customers can create a cart for a live store.
- Customers can add active products to cart.
- Customers can update and remove cart items.
- Backend returns cart totals (never the frontend price label).
- Customers can create an order from a cart.
- Order items snapshot product title, SKU, and price.
- Customers can view order confirmation by order ID.
- Orders start with status `pending_payment` and payment status `unpaid`.
- Frontend cart is backed by backend cart APIs, not browser memory.

### Suggested Implementation Order

1. Add `carts` and `cart_items` migrations.
2. Add `orders` and `order_items` migrations.
3. Implement cart create/get/items APIs.
4. Implement backend total calculation.
5. Implement checkout order creation.
6. Implement order confirmation API.
7. Add tests for totals, active product validation, and order snapshots.
8. Migrate frontend cart from memory to backend cart APIs.

### Frontend migration (public store)

Public `/s/{storeSlug}` cart is API-backed:

- `ApiCartProvider` creates/loads cart via `POST/GET …/carts`
- Add / update / remove call public cart item APIs; totals come from the backend
- `/s/{slug}/cart` — cart + checkout form → `POST …/checkout`
- `/s/{slug}/order/{orderId}` — confirmation via `GET …/orders/{orderId}`
- Merchant `/preview/{workspaceId}` cart stays browser-local for draft UX

### Implementation Status — Backend Complete / FE Public Wired

Step 06A backend is fully implemented and compiles clean. Public storefront FE
uses backend cart/checkout APIs (see Frontend migration above).

#### Entities And Enums

- `CartStatus` — `ACTIVE`, `CONVERTED`, `ABANDONED`.
- `OrderStatus` — `PENDING_PAYMENT`, `PAID`, `PROCESSING`, `FULFILLED`, `CANCELLED`.
- `PaymentStatus` — `UNPAID`, `INITIALIZED`, `PAID`, `FAILED`, `REFUNDED`.
- `Cart` — anonymous cart per workspace.
- `CartItem` — snapshots product price at add time, never trusts frontend.
- `Order` — created at checkout, starts `PENDING_PAYMENT` / `UNPAID`.
- `OrderItem` — snapshots title, SKU, and price.

#### Repositories

- `CartRepository`, `CartItemRepository`, `OrderRepository`.
- `ProductRepository.findByWorkspaceIdAndIdAndStatus` — only lets `ACTIVE` products be added to cart.

#### Services

- `CartService` — create cart, get cart (with backend totals), add/update/remove items.
- `CheckoutService` — converts cart to order (snapshots all prices), returns order confirmation.

#### Controller

`PublicCartController` under `/api/v1/public/storefronts/{storeSlug}/`:

| Method | Path | Description |
| --- | --- | --- |
| POST | `/carts` | Create anonymous cart |
| GET | `/carts/{cartId}` | Get cart with backend totals |
| POST | `/carts/{cartId}/items` | Add item to cart |
| PATCH | `/carts/{cartId}/items/{itemId}` | Update item quantity |
| DELETE | `/carts/{cartId}/items/{itemId}` | Remove item from cart |
| POST | `/checkout` | Create order from cart |
| GET | `/orders/{orderId}` | Get order confirmation |

#### Error Codes

`CART_NOT_FOUND`, `CART_ITEM_NOT_FOUND`, `CART_EMPTY`, `PRODUCT_NOT_AVAILABLE`,
`INVALID_QUANTITY`, `CHECKOUT_VALIDATION_ERROR`, `ORDER_NOT_FOUND`.

#### Tests

`CartTotalsTest` — 6 pure unit tests covering line totals, subtotals, price
snapshot independence, zero shipping, and order total formula.

---

## Step 06B: Payments (Paystack Subaccounts)

This sub-step adds card/mobile-money checkout via Paystack. It builds on the
orders created in Step 06A.

**Primary model: platform Paystack account + Subaccounts per merchant.**
Merchants do **not** copy secret keys from paystack.com. They enter bank
details in **our** dashboard; we create/manage a Paystack subaccount via API.

### Goal

After Step 06B the backend should be able to:

- Let a merchant connect payout banking details from the SME dashboard.
- Create/update a Paystack **subaccount** for that workspace via API.
- Initialize a payment for an existing order (using the **platform** Paystack
  secret key + the merchant's `subaccount_code`).
- Optionally keep a platform fee (percentage or flat) via split / `percentage_charge`.
- Verify payment via a Paystack webhook (platform webhook secret).
- Mark the order as paid after confirmed payment.

### How Paystack Subaccounts Work

```text
┌─────────────────────┐         ┌──────────────────────┐
│  SME platform       │  API    │  Paystack (1 master  │
│  (our backend)      │────────▶│   integration)       │
│  secret key (env)   │         │                      │
└─────────┬───────────┘         │  Subaccount A (shop) │
          │                     │  Subaccount B (shop) │
          │ create subaccount   └──────────┬───────────┘
          │ bank + business name           │
          ▼                                │ settlement
   Merchant fills form                     ▼
   in OUR Settings                   Merchant bank account
```

1. **Platform** has one Paystack business account (keys in env / secrets manager).
2. Merchant opens **Settings → Payments** in our dashboard and submits:
   - Business / shop name
   - Bank code (from Paystack List Banks)
   - Account number
   - Optional contact email / phone
3. Backend calls Paystack `POST /subaccount` with the **platform** secret key.
4. Paystack returns `subaccount_code` (e.g. `ACCT_xxxxx`). We store it on the workspace.
5. Customer checks out → we create an order (06A) → `POST …/pay` calls Paystack
   `transaction/initialize` with:
   - Platform secret key
   - Amount, email, reference (= our payment/order id)
   - `subaccount: ACCT_xxxxx` so settlement goes to the merchant
   - Optional platform fee (`percentage_charge` on the subaccount, or
     `transaction_charge` / Transaction Splits if we take a cut)
6. Customer pays on Paystack (redirect or Popup).
7. Paystack sends `charge.success` to **our** webhook URL.
8. We verify signature with the **platform** webhook secret, then mark
   payment + order as paid.

Merchant UX: stay inside SME Settings. They never paste API keys.
They may still complete Paystack KYC / bank verification for that subaccount
when Paystack requires it (country-dependent) — but onboarding is driven by us.

Docs: [Split payments / subaccounts](https://paystack.com/docs/payments/split-payments/),
[Subaccount API](https://paystack.com/docs/api/subaccount/).

### Scope

#### Included In 06B

- Platform Paystack keys in env (not per merchant).
- Workspace payment / payout settings (bank details + stored `subaccount_code`).
- Create / update Paystack subaccount from dashboard APIs.
- Payment table.
- Payment initialization API (with `subaccount`).
- Single Paystack webhook endpoint (platform).
- Dashboard Settings → Payments UI (bank form, status: connected / needs bank).

#### Not Included In 06B

- Refunds (can follow).
- Per-merchant Paystack secret keys (explicitly rejected for this product).
- Multi-provider support (Stripe, etc.).
- Full OAuth “Paystack Connect” if unavailable in target markets — Subaccounts cover the same merchant payout need.

### Database Changes

#### `payments`

| Column | Type | Notes |
| --- | --- | --- |
| `id` | UUID/string | Primary key |
| `order_id` | UUID/string | FK to `orders.id` |
| `workspace_id` | UUID/string | FK (for webhook routing / audit) |
| `provider` | string | `paystack` |
| `provider_reference` | string | Our unique reference sent to Paystack |
| `provider_access_code` | string nullable | Paystack access code if using Popup |
| `amount` | integer | Minor units |
| `currency` | string | Example `ZAR` / `NGN` / `GHS` |
| `status` | string | `initialized`, `paid`, `failed`, `abandoned` |
| `raw_response` | JSON nullable | Provider response |
| `created_at` | timestamp | Created date |
| `updated_at` | timestamp | Updated date |

#### Update `workspaces` (or `workspace_payment_settings`)

| Column | Type | Notes |
| --- | --- | --- |
| `paystack_subaccount_code` | string nullable | From Paystack create/update subaccount |
| `payout_business_name` | string nullable | Shown to Paystack |
| `payout_bank_code` | string nullable | Paystack bank code |
| `payout_account_number` | string nullable | Bank account number |
| `payout_account_name` | string nullable | Verified name from Paystack resolve (optional) |
| `paystack_subaccount_status` | string | `not_connected`, `pending`, `active`, `failed` |
| `platform_fee_percent` | decimal nullable | Optional override; else global default |

**Do not store** merchant `paystack_secret_key`. Platform keys live in env only:
`PAYSTACK_SECRET_KEY`, `PAYSTACK_PUBLIC_KEY`, `PAYSTACK_WEBHOOK_SECRET`.

### Merchant Payment Settings APIs

```http
GET  /workspaces/{workspaceId}/payments/settings
PUT  /workspaces/{workspaceId}/payments/settings
POST /workspaces/{workspaceId}/payments/connect   # create/update Paystack subaccount
GET  /payments/paystack/banks?country=…            # proxy List Banks (auth)
```

`PUT` saves draft bank fields. `POST …/connect` calls Paystack create or update
subaccount and persists `paystack_subaccount_code` + status.

### Customer Payment APIs

#### Initialize Payment

```http
POST /public/storefronts/{storeSlug}/checkout/{orderId}/pay
```

Requires workspace `paystack_subaccount_status = active` (or equivalent).
Uses platform secret key + workspace `subaccount_code`.
Returns authorization URL and/or access code for Popup.

#### Payment Webhook

```http
POST /payments/paystack/webhook
```

Verify HMAC with **platform** webhook secret. Match `data.reference` to
`payments.provider_reference`. Mark payment + order paid on `charge.success`.

### Payment Rules

- Order must exist and have status `pending_payment` before payment init.
- Refuse pay if merchant has no active subaccount (`PAYMENT_NOT_CONFIGURED`).
- Set payment status to `initialized` after Paystack initialize succeeds.
- Mark order `paid` / payment `paid` only after verified webhook (or verified
  `transaction/verify` as a backup).
- Never expose platform or any Paystack secret to the frontend (public key only).
- Idempotent webhook handling (same reference paid twice → no double apply).

### Error Codes

- `PAYMENT_INITIALIZATION_FAILED`
- `PAYMENT_WEBHOOK_INVALID`
- `PAYMENT_NOT_CONFIGURED`
- `PAYSTACK_SUBACCOUNT_FAILED`
- `INVALID_BANK_ACCOUNT`

### Acceptance Criteria

Step 06B is complete when:

- Merchant connects payout bank details in Settings without leaving SME for API keys.
- Backend creates a Paystack subaccount and stores the code on the workspace.
- Customer payment init uses platform keys + merchant subaccount.
- Webhook marks the order paid; confirmation page reflects paid status.
- Workspace without subaccount cannot accept online payment (clear UI + API error).

### Suggested Implementation Order

1. Platform Paystack env + webhook route skeleton.
2. Workspace payout settings + List Banks proxy.
3. Create/update Subaccount on connect.
4. `payments` migration + initialize payment with `subaccount`.
5. Webhook verification + order paid transition (idempotent).
6. Dashboard Settings → Payments UI.
7. Public checkout “Pay with Paystack” button after order create.
8. Tests: subaccount connect, init with subaccount, webhook signature, idempotency.

### Frontend (SME app)

- **Settings → Payments**: bank form, save, Connect with Paystack (`…/payments/connect`)
- **Order confirmation** (`/s/{slug}/order/{id}`): **Pay with Paystack** →
  `POST …/checkout/{orderId}/pay` → redirect to `authorizationUrl`
- Confirmation page polls until `paymentStatus === paid` after return from Paystack

---

## What Comes Next

### Merchant Orders Dashboard (frontend wired)

The SME dashboard **Orders** section calls:

```http
GET /api/v1/workspaces/{workspaceId}/orders
GET /api/v1/workspaces/{workspaceId}/orders/{orderId}
```

Auth: merchant JWT. Return camelCase order objects (same shape as public order
confirmation), newest first. List may be a bare array or `{ "items": [...] }`.

If this endpoint is not implemented yet on the backend, the Orders panel will
show the API error until it ships.

### Customer thank-you + Paystack callback

After Paystack success, customers return to:

`/s/{storeSlug}/order/{orderId}?reference=...`

Pay init accepts optional body `{ "callbackUrl": "..." }` so Paystack redirects
back to that thank-you page (business name, order number, email message).

### Email

Confirmation copy tells the customer an email **will be sent** when
`customerEmail` is present. **Sending that email is a backend responsibility**
(after `charge.success` / order paid) — not handled by the Next.js app.

---

Step 07 (broader) may still add WhatsApp order flows on top of this list.

### Step 06C — Customer order status

See [`storefront-backend-step-06c-order-status.md`](./storefront-backend-step-06c-order-status.md):

- `POST /public/storefronts/{storeSlug}/orders/lookup` (order number + email)
- `PATCH /workspaces/{workspaceId}/orders/{orderId}` (`processing` | `fulfilled` | `cancelled`)
- No carrier shipping tracking in this step
