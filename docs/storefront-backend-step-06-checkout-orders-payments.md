# Step 06: Cart, Checkout, Orders, And Payments

This step turns the public storefront into a transactional store. It adds
customer carts, checkout, order creation, and payment tracking.

## Goal

Allow customers to add products to cart, complete checkout, and create real
orders for a live storefront.

After this step, the backend should be able to:

- Create anonymous carts.
- Add, update, and remove cart items.
- Calculate totals from backend product prices.
- Create an order from checkout details.
- Initialize a payment.
- Confirm payment through a provider webhook.
- Return an order confirmation.

## Scope

### Included

- Cart tables.
- Order tables.
- Payment table.
- Public cart APIs.
- Public checkout API.
- Payment initialization API.
- Payment webhook endpoint.

### Not Included Yet

- Inventory reservations.
- Refunds.
- Shipping carrier integrations.
- Merchant fulfilment dashboard.
- Multi-currency.

## Database Changes

### `carts`

| Column | Type | Notes |
| --- | --- | --- |
| `id` | UUID/string | Primary key |
| `workspace_id` | UUID/string | FK to `workspaces.id` |
| `customer_session_id` | string | Anonymous customer session ID |
| `status` | string | `active`, `converted`, `abandoned` |
| `currency` | string | Example `ZAR` |
| `created_at` | timestamp | Created date |
| `updated_at` | timestamp | Updated date |

### `cart_items`

| Column | Type | Notes |
| --- | --- | --- |
| `id` | UUID/string | Primary key |
| `cart_id` | UUID/string | FK to `carts.id` |
| `product_id` | UUID/string | FK to `products.id` |
| `quantity` | integer | Quantity |
| `unit_price_amount` | integer | Snapshot price |
| `currency` | string | Snapshot currency |
| `created_at` | timestamp | Created date |
| `updated_at` | timestamp | Updated date |

### `orders`

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
| `shipping_amount` | integer | Minor units |
| `total_amount` | integer | Minor units |
| `currency` | string | Example `ZAR` |
| `status` | string | `pending_payment`, `paid`, `processing`, `fulfilled`, `cancelled` |
| `payment_status` | string | `unpaid`, `initialized`, `paid`, `failed`, `refunded` |
| `created_at` | timestamp | Created date |
| `updated_at` | timestamp | Updated date |

### `order_items`

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

### `payments`

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

## Public Cart APIs

These APIs do not require merchant authentication.

### Create Cart

```http
POST /public/storefronts/{storeSlug}/carts
```

Creates an anonymous cart for a live store.

### Get Cart

```http
GET /public/storefronts/{storeSlug}/carts/{cartId}
```

Returns cart lines and totals.

### Add Cart Item

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

### Update Cart Item

```http
PATCH /public/storefronts/{storeSlug}/carts/{cartId}/items/{itemId}
```

Example request:

```json
{
  "quantity": 2
}
```

### Remove Cart Item

```http
DELETE /public/storefronts/{storeSlug}/carts/{cartId}/items/{itemId}
```

## Checkout APIs

### Create Checkout Order

```http
POST /public/storefronts/{storeSlug}/checkout
```

Creates an order from the cart.

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

### Initialize Payment

```http
POST /public/storefronts/{storeSlug}/checkout/{orderId}/pay
```

Creates a payment attempt with the provider and returns redirect/authorization
data.

### Payment Webhook

```http
POST /payments/paystack/webhook
```

The webhook must verify the provider signature before updating payment/order
state.

### Get Order Confirmation

```http
GET /public/storefronts/{storeSlug}/orders/{orderId}
```

Returns safe confirmation data for the customer.

## Calculation Rules

- Totals must be calculated on the backend.
- Never trust frontend price labels.
- Cart item unit prices should snapshot the product price when added.
- Order item prices should snapshot the cart/product prices when order is created.
- In version one, shipping can be `0` or a flat configured amount.

## Payment Rules

- Create the order before redirecting to payment.
- Set order status to `pending_payment` initially.
- Set payment status to `initialized` after provider initialization.
- Mark order as paid only after verified webhook or verified provider lookup.
- Store raw provider response for debugging.

## Error Codes

- `CART_NOT_FOUND`
- `CART_ITEM_NOT_FOUND`
- `CART_EMPTY`
- `PRODUCT_NOT_AVAILABLE`
- `INVALID_QUANTITY`
- `CHECKOUT_VALIDATION_ERROR`
- `ORDER_NOT_FOUND`
- `PAYMENT_INITIALIZATION_FAILED`
- `PAYMENT_WEBHOOK_INVALID`

## Acceptance Criteria

Step 06 is complete when:

- Customers can create a cart for a live store.
- Customers can add active products to cart.
- Customers can update/remove cart items.
- Backend returns cart totals.
- Customers can create an order from cart.
- Order items snapshot product data and prices.
- Payment initialization creates a payment record.
- Payment webhook can mark payment/order as paid.
- Customers can view order confirmation.

## Suggested Implementation Order

1. Add cart migrations.
2. Add order migrations.
3. Add payment migration.
4. Implement cart create/get/item APIs.
5. Implement backend total calculation.
6. Implement checkout order creation.
7. Integrate first payment provider.
8. Implement payment webhook verification.
9. Implement order confirmation API.
10. Add tests for totals, active product validation, order snapshots, and webhook handling.

## What Comes Next

Step 07 migrates the frontend from local browser storage to these backend APIs.
