import type {
  AiStorefrontSectionCopyFields,
  AiStorefrontSectionCopyResult,
  AiStorefrontTemplateCopyResult,
} from "@/types/ai";
import type { StorefrontConfig, StorefrontSection } from "@/types/storefront";

/**
 * Merge full-template AI draft into the storefront config.
 * Keeps images, hrefs, ids, theme, and layout; only rewrites merchant-facing text.
 */
export function applyAiStorefrontCopy(
  config: StorefrontConfig,
  draft: AiStorefrontTemplateCopyResult,
): StorefrontConfig {
  let promoIndex = 0;

  const sections: StorefrontSection[] = config.sections.map((section) => {
    switch (section.type) {
      case "hero":
        return {
          ...section,
          heading: draft.heroHeading,
          subheading: draft.heroSubheading,
          primaryCta: section.primaryCta
            ? { ...section.primaryCta, label: draft.heroPrimaryCtaLabel }
            : section.primaryCta,
          secondaryCta: section.secondaryCta
            ? { ...section.secondaryCta, label: draft.heroSecondaryCtaLabel }
            : section.secondaryCta,
        };
      case "featuredProducts":
        return { ...section, title: draft.featuredTitle };
      case "promoBanner": {
        const promo = draft.promos[Math.min(promoIndex, 1)];
        promoIndex += 1;
        return {
          ...section,
          title: promo.title,
          description: promo.description,
          buttonLabel: promo.buttonLabel,
        };
      }
      case "features":
        return {
          ...section,
          items: section.items.map((item, i) => {
            const next = draft.features[i];
            if (!next) return item;
            return {
              ...item,
              title: next.title,
              description: next.description,
            };
          }),
        };
      case "contactCta":
        return {
          ...section,
          title: draft.contactCtaTitle,
          body: draft.contactCtaBody,
          buttonLabel: draft.contactCtaButtonLabel,
        };
      default:
        return section;
    }
  });

  return {
    ...config,
    shopName: draft.shopName || config.shopName,
    tagline: draft.tagline,
    heroHeading: draft.heroHeading,
    heroSubheading: draft.heroSubheading,
    heroPrimaryCta: {
      ...config.heroPrimaryCta,
      label: draft.heroPrimaryCtaLabel,
    },
    heroSecondaryCta: {
      ...config.heroSecondaryCta,
      label: draft.heroSecondaryCtaLabel,
    },
    featuredTitle: draft.featuredTitle,
    promos: [
      {
        ...config.promos[0],
        title: draft.promos[0].title,
        description: draft.promos[0].description,
        buttonLabel: draft.promos[0].buttonLabel,
      },
      {
        ...config.promos[1],
        title: draft.promos[1].title,
        description: draft.promos[1].description,
        buttonLabel: draft.promos[1].buttonLabel,
      },
    ],
    features: [
      {
        ...config.features[0],
        title: draft.features[0].title,
        description: draft.features[0].description,
      },
      {
        ...config.features[1],
        title: draft.features[1].title,
        description: draft.features[1].description,
      },
      {
        ...config.features[2],
        title: draft.features[2].title,
        description: draft.features[2].description,
      },
    ],
    footerBlurb: draft.footerBlurb,
    sections,
  };
}

function str(
  fields: AiStorefrontSectionCopyFields,
  key: keyof AiStorefrontSectionCopyFields,
  fallback: string,
): string {
  const value = fields[key];
  return typeof value === "string" && value.trim() ? value.trim() : fallback;
}

/**
 * Apply a single-section AI rewrite. Preserves images, hrefs, icons, layout.
 */
export function applyAiStorefrontSectionCopy(
  section: StorefrontSection,
  draft: AiStorefrontSectionCopyResult,
): StorefrontSection {
  const f = draft.fields;
  const items = Array.isArray(f.items) ? f.items : [];

  switch (section.type) {
    case "hero":
      return {
        ...section,
        heading: str(f, "heading", section.heading),
        subheading: str(f, "subheading", section.subheading),
        primaryCta: section.primaryCta
          ? {
              ...section.primaryCta,
              label: str(f, "primaryCtaLabel", section.primaryCta.label),
            }
          : section.primaryCta,
        secondaryCta: section.secondaryCta
          ? {
              ...section.secondaryCta,
              label: str(f, "secondaryCtaLabel", section.secondaryCta.label),
            }
          : section.secondaryCta,
      };
    case "featuredProducts":
      return {
        ...section,
        title: str(f, "title", section.title),
        viewAll: section.viewAll
          ? {
              ...section.viewAll,
              label: str(f, "viewAllLabel", section.viewAll.label),
            }
          : section.viewAll,
      };
    case "promoBanner":
      return {
        ...section,
        title: str(f, "title", section.title),
        description: str(f, "description", section.description),
        buttonLabel: str(f, "buttonLabel", section.buttonLabel),
      };
    case "textImage":
      return {
        ...section,
        eyebrow: str(f, "eyebrow", section.eyebrow),
        title: str(f, "title", section.title),
        body: str(f, "body", section.body),
        cta: {
          ...section.cta,
          label: str(f, "ctaLabel", section.cta.label),
        },
      };
    case "features":
      return {
        ...section,
        title: str(f, "title", section.title),
        items: section.items.map((item, i) => {
          const next = items[i];
          if (!next) return item;
          return {
            ...item,
            title:
              typeof next.title === "string" && next.title.trim()
                ? next.title.trim()
                : item.title,
            description:
              typeof next.description === "string" && next.description.trim()
                ? next.description.trim()
                : item.description,
          };
        }),
      };
    case "faq":
      return {
        ...section,
        title: str(f, "title", section.title),
        items: section.items.map((item, i) => {
          const next = items[i];
          if (!next) return item;
          return {
            ...item,
            question:
              typeof next.question === "string" && next.question.trim()
                ? next.question.trim()
                : item.question,
            answer:
              typeof next.answer === "string" && next.answer.trim()
                ? next.answer.trim()
                : item.answer,
          };
        }),
      };
    case "contactCta":
      return {
        ...section,
        title: str(f, "title", section.title),
        body: str(f, "body", section.body),
        buttonLabel: str(f, "buttonLabel", section.buttonLabel),
      };
    case "contact":
      return {
        ...section,
        eyebrow: str(f, "eyebrow", section.eyebrow),
        title: str(f, "title", section.title),
        body: str(f, "body", section.body),
        hours: str(f, "hours", section.hours),
        note: str(f, "note", section.note),
        whatsappLabel: str(f, "whatsappLabel", section.whatsappLabel),
        formTitle: str(f, "formTitle", section.formTitle),
        submitLabel: str(f, "submitLabel", section.submitLabel),
        successMessage: str(f, "successMessage", section.successMessage),
      };
    case "testimonials":
      return {
        ...section,
        title: str(f, "title", section.title),
        items: section.items.map((item, i) => {
          const next = items[i];
          if (!next) return item;
          const nameFromAuthor =
            typeof next.author === "string" && next.author.trim()
              ? next.author.trim()
              : null;
          return {
            ...item,
            quote:
              typeof next.quote === "string" && next.quote.trim()
                ? next.quote.trim()
                : item.quote,
            name:
              typeof next.name === "string" && next.name.trim()
                ? next.name.trim()
                : (nameFromAuthor ?? item.name),
            role:
              typeof next.role === "string" && next.role.trim()
                ? next.role.trim()
                : item.role,
          };
        }),
      };
    case "newsletter":
      return {
        ...section,
        title: str(f, "title", section.title),
        body: str(f, "body", section.body),
        placeholder: str(f, "placeholder", section.placeholder),
        buttonLabel: str(f, "buttonLabel", section.buttonLabel),
        successMessage: str(f, "successMessage", section.successMessage),
      };
    case "shopByCategory":
      return {
        ...section,
        title: str(f, "title", section.title),
        viewAll: {
          ...section.viewAll,
          label: str(f, "viewAllLabel", section.viewAll.label),
        },
      };
    case "newArrivals":
      return {
        ...section,
        title: str(f, "title", section.title),
        eyebrow: str(f, "eyebrow", section.eyebrow),
        viewAll: section.viewAll
          ? {
              ...section.viewAll,
              label: str(f, "viewAllLabel", section.viewAll.label),
            }
          : section.viewAll,
      };
    case "sale":
      return {
        ...section,
        eyebrow: str(f, "eyebrow", section.eyebrow),
        title: str(f, "title", section.title),
        description: str(f, "description", section.description),
        viewAll: section.viewAll
          ? {
              ...section.viewAll,
              label: str(f, "viewAllLabel", section.viewAll.label),
            }
          : section.viewAll,
      };
    case "instagramGallery":
      return {
        ...section,
        title: str(f, "title", section.title),
        handle: str(f, "handle", section.handle),
      };
    default:
      return section;
  }
}

export function sectionSupportsAiCopy(type: StorefrontSection["type"]): boolean {
  switch (type) {
    case "hero":
    case "featuredProducts":
    case "promoBanner":
    case "textImage":
    case "features":
    case "faq":
    case "contactCta":
    case "contact":
    case "testimonials":
    case "newsletter":
    case "shopByCategory":
    case "newArrivals":
    case "sale":
    case "instagramGallery":
      return true;
    default:
      return false;
  }
}
