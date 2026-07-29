import { networkFailure, parseApiEnvelope } from "@/apis/api-result";
import {
  errorEnvelope,
  jsonResponse,
  successEnvelope,
} from "@/apis/__tests__/test-helpers";

describe("parseApiEnvelope", () => {
  it("returns ok data on success", async () => {
    const res = jsonResponse(successEnvelope({ id: "1" }));
    const parsed = await parseApiEnvelope<{ id: string }>(
      res,
      "Fallback message",
    );

    expect(parsed).toEqual({ ok: true, data: { id: "1" } });
  });

  it("returns API error message and code on failure", async () => {
    const res = jsonResponse(
      errorEnvelope("CART_NOT_FOUND", "Cart was not found"),
      404,
    );
    const parsed = await parseApiEnvelope(res, "Fallback message");

    expect(parsed.ok).toBe(false);
    if (!parsed.ok) {
      expect(parsed.errorCode).toBe("CART_NOT_FOUND");
      expect(parsed.errorMessage).toBe("Cart was not found");
      expect(parsed.status).toBe(404);
    }
  });

  it("uses fallback when success is false without error message", async () => {
    const res = jsonResponse({ success: false, data: null, error: null }, 500);
    const parsed = await parseApiEnvelope(res, "Fallback message");

    expect(parsed.ok).toBe(false);
    if (!parsed.ok) {
      expect(parsed.errorMessage).toMatch(/request failed \(500\)/i);
    }
  });

  it("handles invalid JSON bodies", async () => {
    const res = new Response("not-json", { status: 200 });
    const parsed = await parseApiEnvelope(res, "Fallback message");

    expect(parsed.ok).toBe(false);
    if (!parsed.ok) {
      expect(parsed.errorMessage).toMatch(/unexpected response/i);
    }
  });

  it("allows null data when allowNullData is set", async () => {
    const res = jsonResponse({ success: true, data: null, error: null });
    const parsed = await parseApiEnvelope(res, "Fallback", {
      allowNullData: true,
    });

    expect(parsed).toEqual({ ok: true, data: null });
  });
});

describe("networkFailure", () => {
  it("returns a typed failure with status 0", () => {
    expect(networkFailure("offline")).toEqual({
      ok: false,
      errorMessage: "offline",
      status: 0,
    });
  });
});
