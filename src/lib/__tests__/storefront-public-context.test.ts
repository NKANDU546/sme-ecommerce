import { isPublicStorefrontContext } from "@/lib/storefront-public-context";

describe("isPublicStorefrontContext", () => {
  it("detects live /s/{slug} roots", () => {
    expect(isPublicStorefrontContext("/s/my-store")).toBe(true);
    expect(isPublicStorefrontContext("/s/my-store/")).toBe(true);
  });

  it("rejects preview and nested paths", () => {
    expect(isPublicStorefrontContext(undefined)).toBe(false);
    expect(isPublicStorefrontContext("/preview/ws-1")).toBe(false);
    expect(isPublicStorefrontContext("/s/my-store/shop")).toBe(false);
  });
});
