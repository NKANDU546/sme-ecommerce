# Step 06: Cart, Checkout, Orders, And Payments

This step turns the public storefront into a transactional store. It is split
into two sub-steps to allow independent delivery.

---

## Step 06A: Cart And Checkout (Current Priority)

This sub-step adds anonymous carts, server-side totals, checkout order creation,
and order confirmation. Payment is intentionally excluded here — merchants
can collect payment manually (bank transfer, WhatsApp) while Step 06B is
being built.

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

- Payment provider integration.
- Payment table.
- Merchant Paystack keys.
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

### Implementation Status — Complete

Step 06A is fully implemented and compiles clean.

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

## Step 06B: Payments (Later)

This sub-step adds Paystack payment integration. It builds on the orders
created in Step 06A.

### Goal

After Step 06B the backend should be able to:

- Accept a Paystack secret key per merchant workspace.
- Initialize a payment for an existing order.
- Verify payment via a Paystack webhook.
- Mark the order as paid after confirmed payment.

### Payment Architecture

Each merchant configures their own Paystack account. The merchant copies
their Paystack secret key and public key into the dashboard Settings page.
The backend stores these keys per workspace and uses them when initializing
payments for that store's orders. Money goes directly to the merchant's
linked bank account via Paystack.

Future improvement: migrate to Paystack Connect or Subaccounts so merchants
can connect their account with one click instead of copying keys manually.

### Scope

#### Included In 06B

- Merchant Paystack key settings (stored per workspace).
- Payment table.
- Payment initialization API.
- Paystack webhook endpoint.
- Dashboard Settings page for payment keys.

#### Not Included In 06B

- Refunds.
- Paystack Connect / OAuth flow.
- Paystack Subaccounts.
- Multi-provider support.

### Database Changes

#### `payments`

| Column | Type | Notes |
| --- | --- | --- |
| `id` | UUID/string | Primary key |
| `order_id` | UUID/string | FK to `orders.id` |
| `provider` | string | Example `paystack` |
| `provider_reference` | string | Unique provider reference |
| `amount` | integer | Minor units |
| `currency` | string | Example `ZAR` |
| `status` | string | `initialized`, `paid`, `failed`, `refunded` |
| `raw_response` | JSON nullable | Provider response |
| `created_at` | timestamp | Created date |
| `updated_at` | timestamp | Updated date |

#### Update `workspaces`

| Column | Type | Notes |
| --- | --- | --- |
| `paystack_secret_key` | string nullable | Encrypted at rest |
| `paystack_public_key` | string nullable | Safe to expose to frontend |

### Payment APIs

#### Initialize Payment

```http
POST /public/storefronts/{storeSlug}/checkout/{orderId}/pay
```

Uses the workspace Paystack keys to create a payment with Paystack.
Returns the Paystack authorization URL for redirect.

#### Payment Webhook

```http
POST /payments/paystack/webhook
```

Receives Paystack event. Must verify the HMAC signature using the workspace
secret key before updating payment and order status.

### Payment Rules

- Order must exist and have status `pending_payment` before payment can be initialized.
- Set payment status to `initialized` after provider initialization.
- Mark order as `paid` and payment as `paid` only after verified webhook.
- Store raw provider response for debugging.
- Never expose the merchant Paystack secret key to the public API or frontend.

### Error Codes

- `PAYMENT_INITIALIZATION_FAILED`
- `PAYMENT_WEBHOOK_INVALID`
- `PAYMENT_KEYS_NOT_CONFIGURED`

### Acceptance Criteria

Step 06B is complete when:

- Merchants can save Paystack keys in their dashboard settings.
- Payment initialization redirects the customer to Paystack.
- Paystack webhook verifies the signature and marks the order paid.
- Order confirmation reflects updated payment status after payment.

### Suggested Implementation Order

1. Add Paystack key fields to `workspaces`.
2. Add `payments` migration.
3. Add Dashboard Settings page for payment keys.
4. Implement payment initialization API using workspace Paystack keys.
5. Implement Paystack webhook with HMAC signature verification.
6. Add tests for signature verification, initialized/paid status transitions.

---

## What Comes Next

Step 07 adds the merchant orders dashboard so merchants can view, manage,
and fulfil incoming orders.
