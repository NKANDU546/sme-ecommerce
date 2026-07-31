import {
  STOREFRONT_DEFAULT_MEDIA,
  withDefaultImageUrl,
} from "@/lib/storefront-default-media";
import { upgradeStorefrontConfig } from "@/lib/storefront-storage";
import type { StorefrontConfig, StorefrontSection } from "@/types/storefront";

describe("withDefaultImageUrl", () => {
  it("keeps a real URL and fills blanks", () => {
    expect(withDefaultImageUrl("https://cdn.example/a.jpg", "fallback")).toBe(
      "https://cdn.example/a.jpg",
    );
    expect(withDefaultImageUrl("  ", STOREFRONT_DEFAULT_MEDIA.hero)).toBe(
      STOREFRONT_DEFAULT_MEDIA.hero,
    );
    expect(withDefaultImageUrl(null, STOREFRONT_DEFAULT_MEDIA.hero)).toBe(
      STOREFRONT_DEFAULT_MEDIA.hero,
    );
  });
});

describe("upgradeStorefrontConfig default media", () => {
  it("fills empty hero image on draft normalize", () => {
    const upgraded = upgradeStorefrontConfig({
      sections: [
        {
          id: "home-hero",
          type: "hero",
          imageUrl: "",
          heading: "Welcome to our store",
          subheading: "",
          primaryCta: { label: "Shop collection", href: "@shop" },
          secondaryCta: { label: "Learn more", href: "#" },
        },
      ],
    } as StorefrontConfig);

    const hero = upgraded.sections.find(
      (s): s is Extract<StorefrontSection, { type: "hero" }> =>
        s.type === "hero",
    );
    expect(hero?.imageUrl).toBe(STOREFRONT_DEFAULT_MEDIA.hero);
  });
});
