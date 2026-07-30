import {
  addCartItem,
  createCart,
  getCart,
  removeCartItem,
  updateCartItem,
} from "@/apis/carts";
import {
  CART_ID,
  ITEM_ID,
  PRODUCT_ID,
  STORE_SLUG,
  errorEnvelope,
  jsonResponse,
  mockCart,
  successEnvelope,
} from "@/apis/__tests__/test-helpers";

describe("carts API", () => {
  const fetchMock = jest.fn<Promise<Response>, [RequestInfo | URL, RequestInit?]>();

  beforeEach(() => {
    fetchMock.mockReset();
    global.fetch = fetchMock as unknown as typeof fetch;
  });

  describe("createCart", () => {
    it("POSTs to the public carts endpoint and returns the cart", async () => {
      const cart = mockCart({ items: [], subtotalAmount: 0, totalAmount: 0 });
      fetchMock.mockResolvedValueOnce(jsonResponse(successEnvelope(cart)));

      const result = await createCart(STORE_SLUG);

      expect(result).toEqual({ ok: true, data: cart });
      expect(fetchMock).toHaveBeenCalledTimes(1);
      const [url, init] = fetchMock.mock.calls[0];
      expect(String(url)).toContain(
        `/public/storefronts/${STORE_SLUG}/carts`,
      );
      expect(init?.method).toBe("POST");
    });

    it("returns networkFailure when fetch throws", async () => {
      fetchMock.mockRejectedValueOnce(new Error("offline"));

      const result = await createCart(STORE_SLUG);

      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.status).toBe(0);
        expect(result.errorMessage).toMatch(/could not create a cart/i);
      }
    });

    it("returns API error when success is false", async () => {
      fetchMock.mockResolvedValueOnce(
        jsonResponse(errorEnvelope("CART_NOT_FOUND", "Cart missing"), 404),
      );

      const result = await createCart(STORE_SLUG);

      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.errorCode).toBe("CART_NOT_FOUND");
        expect(result.errorMessage).toBe("Cart missing");
      }
    });
  });

  describe("getCart", () => {
    it("GETs cart by id with backend totals", async () => {
      const cart = mockCart();
      fetchMock.mockResolvedValueOnce(jsonResponse(successEnvelope(cart)));

      const result = await getCart(STORE_SLUG, CART_ID);

      expect(result).toEqual({ ok: true, data: cart });
      const [url, init] = fetchMock.mock.calls[0];
      expect(String(url)).toContain(
        `/public/storefronts/${STORE_SLUG}/carts/${CART_ID}`,
      );
      expect(init?.method).toBeUndefined();
      expect(init?.cache).toBe("no-store");
    });

    it("returns networkFailure when fetch throws", async () => {
      fetchMock.mockRejectedValueOnce(new Error("offline"));

      const result = await getCart(STORE_SLUG, CART_ID);

      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.errorMessage).toMatch(/could not load your cart/i);
      }
    });
  });

  describe("addCartItem", () => {
    it("POSTs productId and quantity, never trusting frontend price", async () => {
      const cart = mockCart();
      fetchMock.mockResolvedValueOnce(jsonResponse(successEnvelope(cart)));

      const body = { productId: PRODUCT_ID, quantity: 2 };
      const result = await addCartItem(STORE_SLUG, CART_ID, body);

      expect(result).toEqual({ ok: true, data: cart });
      const [url, init] = fetchMock.mock.calls[0];
      expect(String(url)).toContain(
        `/public/storefronts/${STORE_SLUG}/carts/${CART_ID}/items`,
      );
      expect(init?.method).toBe("POST");
      expect(init?.body).toBe(JSON.stringify(body));
      expect(JSON.parse(String(init?.body))).not.toHaveProperty("unitPriceAmount");
      expect(JSON.parse(String(init?.body))).not.toHaveProperty("priceLabel");
    });

    it("surfaces PRODUCT_NOT_AVAILABLE from the API", async () => {
      fetchMock.mockResolvedValueOnce(
        jsonResponse(
          errorEnvelope("PRODUCT_NOT_AVAILABLE", "Product is not active"),
          400,
        ),
      );

      const result = await addCartItem(STORE_SLUG, CART_ID, {
        productId: PRODUCT_ID,
        quantity: 1,
      });

      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.errorCode).toBe("PRODUCT_NOT_AVAILABLE");
      }
    });

    it("surfaces INVALID_QUANTITY from the API", async () => {
      fetchMock.mockResolvedValueOnce(
        jsonResponse(
          errorEnvelope("INVALID_QUANTITY", "Quantity must be at least 1"),
          400,
        ),
      );

      const result = await addCartItem(STORE_SLUG, CART_ID, {
        productId: PRODUCT_ID,
        quantity: 0,
      });

      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.errorCode).toBe("INVALID_QUANTITY");
      }
    });
  });

  describe("updateCartItem", () => {
    it("PATCHes quantity for a cart item", async () => {
      const cart = mockCart();
      cart.items[0].quantity = 3;
      cart.subtotalAmount = 45000;
      cart.totalAmount = 45000;
      fetchMock.mockResolvedValueOnce(jsonResponse(successEnvelope(cart)));

      const result = await updateCartItem(STORE_SLUG, CART_ID, ITEM_ID, {
        quantity: 3,
      });

      expect(result).toEqual({ ok: true, data: cart });
      const [url, init] = fetchMock.mock.calls[0];
      expect(String(url)).toContain(
        `/public/storefronts/${STORE_SLUG}/carts/${CART_ID}/items/${ITEM_ID}`,
      );
      expect(init?.method).toBe("PATCH");
      expect(init?.body).toBe(JSON.stringify({ quantity: 3 }));
    });

    it("surfaces CART_ITEM_NOT_FOUND", async () => {
      fetchMock.mockResolvedValueOnce(
        jsonResponse(
          errorEnvelope("CART_ITEM_NOT_FOUND", "Item not in cart"),
          404,
        ),
      );

      const result = await updateCartItem(STORE_SLUG, CART_ID, "missing", {
        quantity: 1,
      });

      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.errorCode).toBe("CART_ITEM_NOT_FOUND");
      }
    });
  });

  describe("removeCartItem", () => {
    it("DELETEs a cart item and returns the updated cart", async () => {
      const cart = mockCart({ items: [], subtotalAmount: 0, totalAmount: 0 });
      fetchMock.mockResolvedValueOnce(jsonResponse(successEnvelope(cart)));

      const result = await removeCartItem(STORE_SLUG, CART_ID, ITEM_ID);

      expect(result).toEqual({ ok: true, data: cart });
      const [url, init] = fetchMock.mock.calls[0];
      expect(String(url)).toContain(
        `/public/storefronts/${STORE_SLUG}/carts/${CART_ID}/items/${ITEM_ID}`,
      );
      expect(init?.method).toBe("DELETE");
    });
  });

  describe("backend totals contract", () => {
    it("uses backend subtotal/total and ignores any frontend price labels", async () => {
      const cart = mockCart({
        subtotalAmount: 30000,
        totalAmount: 30000,
      });
      fetchMock.mockResolvedValueOnce(jsonResponse(successEnvelope(cart)));

      const result = await getCart(STORE_SLUG, CART_ID);

      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.data.subtotalAmount).toBe(30000);
        expect(result.data.totalAmount).toBe(30000);
        expect(result.data.items[0].unitPriceAmount).toBe(15000);
        expect(result.data.items[0]).not.toHaveProperty("priceLabel");
      }
    });

    it("keeps line unit price independent of quantity changes in the response", async () => {
      const cart = mockCart();
      cart.items[0].quantity = 5;
      cart.subtotalAmount = 75000;
      cart.totalAmount = 75000;
      fetchMock.mockResolvedValueOnce(jsonResponse(successEnvelope(cart)));

      const result = await updateCartItem(STORE_SLUG, CART_ID, ITEM_ID, {
        quantity: 5,
      });

      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.data.items[0].unitPriceAmount).toBe(15000);
        expect(result.data.subtotalAmount).toBe(
          result.data.items[0].unitPriceAmount * result.data.items[0].quantity,
        );
        expect(result.data.totalAmount).toBe(result.data.subtotalAmount);
      }
    });
  });
});
