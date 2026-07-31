import {
  buildShopHref,
  isStorefrontNavLinkActive,
  parseShopCollection,
  resolveStorefrontHref,
} from "@/lib/preview-shop-href";

describe("shop collection hrefs", () => {
  it("builds filtered shop URLs", () => {
    expect(buildShopHref("/s/demo")).toBe("/s/demo/shop");
    expect(buildShopHref("/s/demo", { collection: "sale" })).toBe(
      "/s/demo/shop?collection=sale",
    );
    expect(
      buildShopHref("/s/demo", {
        collection: "new",
        category: "bags",
        q: "leather",
      }),
    ).toBe("/s/demo/shop?collection=new&category=bags&q=leather");
  });

  it("resolves magic shop hrefs", () => {
    expect(
      resolveStorefrontHref({ label: "Sale", href: "@shop/sale" }, "/s/demo"),
    ).toBe("/s/demo/shop?collection=sale");
    expect(
      resolveStorefrontHref(
        { label: "Bags", href: "@shop/category:bags" },
        "/s/demo",
      ),
    ).toBe("/s/demo/shop?category=bags");
    expect(
      resolveStorefrontHref({ label: "New", href: "@shop/new" }, "/s/demo"),
    ).toBe("/s/demo/shop?collection=new");
  });

  it("parses collection query", () => {
    expect(parseShopCollection("sale")).toBe("sale");
    expect(parseShopCollection("new")).toBe("new");
    expect(parseShopCollection(null)).toBe("all");
  });
});

describe("isStorefrontNavLinkActive", () => {
  const shop = "/preview/ws/shop";
  const sale = "/preview/ws/shop?collection=sale";
  const neu = "/preview/ws/shop?collection=new";

  it("activates only Sale when collection=sale", () => {
    expect(isStorefrontNavLinkActive(shop, shop, "collection=sale")).toBe(
      false,
    );
    expect(isStorefrontNavLinkActive(neu, shop, "collection=sale")).toBe(
      false,
    );
    expect(isStorefrontNavLinkActive(sale, shop, "collection=sale")).toBe(
      true,
    );
  });

  it("activates only Shop on plain /shop", () => {
    expect(isStorefrontNavLinkActive(shop, shop, "")).toBe(true);
    expect(isStorefrontNavLinkActive(sale, shop, "")).toBe(false);
    expect(isStorefrontNavLinkActive(neu, shop, "")).toBe(false);
  });

  it("activates Shop on product detail, not Sale/New", () => {
    const pdp = "/preview/ws/shop/leather-bag";
    expect(isStorefrontNavLinkActive(shop, pdp, "")).toBe(true);
    expect(isStorefrontNavLinkActive(sale, pdp, "")).toBe(false);
    expect(isStorefrontNavLinkActive(neu, pdp, "")).toBe(false);
  });
});
