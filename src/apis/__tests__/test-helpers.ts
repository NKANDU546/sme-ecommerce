import type { Cart, Order } from "@/types/cart";

export const STORE_SLUG = "demo-store";
export const CART_ID = "cart_123";
export const ITEM_ID = "item_456";
export const ORDER_ID = "order_789";
export const PRODUCT_ID = "product_abc";

export function mockCart(overrides: Partial<Cart> = {}): Cart {
  return {
    id: CART_ID,
    workspaceId: "ws_1",
    customerSessionId: "session_1",
    status: "active",
    currency: "ZAR",
    items: [
      {
        id: ITEM_ID,
        cartId: CART_ID,
        productId: PRODUCT_ID,
        quantity: 2,
        unitPriceAmount: 15000,
        currency: "ZAR",
        createdAt: "2026-07-29T10:00:00Z",
        updatedAt: "2026-07-29T10:00:00Z",
      },
    ],
    subtotalAmount: 30000,
    totalAmount: 30000,
    createdAt: "2026-07-29T10:00:00Z",
    updatedAt: "2026-07-29T10:00:00Z",
    ...overrides,
  };
}

export function mockOrder(overrides: Partial<Order> = {}): Order {
  return {
    id: ORDER_ID,
    workspaceId: "ws_1",
    cartId: CART_ID,
    orderNumber: "ORD-1001",
    customerName: "Ada Lovelace",
    customerEmail: "ada@example.com",
    customerPhone: "+27000000000",
    shippingAddress: {
      line1: "123 Main Road",
      line2: "",
      city: "Cape Town",
      province: "Western Cape",
      postalCode: "8001",
      country: "ZA",
    },
    subtotalAmount: 30000,
    shippingAmount: 0,
    totalAmount: 30000,
    currency: "ZAR",
    status: "pending_payment",
    paymentStatus: "unpaid",
    items: [
      {
        id: "oi_1",
        orderId: ORDER_ID,
        productId: PRODUCT_ID,
        title: "Linen Shirt",
        sku: "LS-001",
        quantity: 2,
        unitPriceAmount: 15000,
        totalAmount: 30000,
        currency: "ZAR",
      },
    ],
    createdAt: "2026-07-29T10:05:00Z",
    updatedAt: "2026-07-29T10:05:00Z",
    ...overrides,
  };
}

export function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

export function successEnvelope<T>(data: T) {
  return { success: true, data, error: null };
}

export function errorEnvelope(code: string, message: string) {
  return { success: false, data: null, error: { code, message } };
}
