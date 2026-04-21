import type { ReactNode } from "react";

const pillars: {
  number: string;
  title: string;
  description: string;
  icon: ReactNode;
}[] = [
  {
    number: "01",
    title: "Register your business",
    description:
      "Share who you are, what you sell, and the WhatsApp number that takes orders—so every inbound message can map cleanly to your shop.",
    icon: <IconBuilding />,
  },
  {
    number: "02",
    title: "Generate your site",
    description:
      "We build your storefront or order hub from your catalog, pricing, and fulfilment basics—ready for customers to browse or place orders.",
    icon: <IconLayout />,
  },
  {
    number: "03",
    title: "Shape your brand",
    description:
      "Add your logo, colours, and tone so the experience feels like you—not a faceless template—across the touchpoints customers see.",
    icon: <IconPalette />,
  },
  {
    number: "04",
    title: "Go live on WhatsApp",
    description:
      "Connect WhatsApp, turn on capture, and track orders in one workspace alongside the chats you already run every day.",
    icon: <IconMessage />,
  },
];

export default function HowItWorksSection() {
  return (
    <section
      id="how-it-works"
      className="scroll-mt-24 bg-background px-5 pt-16 pb-16 text-foreground lg:px-20 lg:pt-[120px] lg:pb-[130px]"
      aria-labelledby="how-it-works-heading"
    >
      {/* ── Label ── */}
      <div className="mb-6 flex items-center gap-3 lg:mb-10">
        <span
          className="block h-px w-6 shrink-0 bg-foreground/40"
          aria-hidden
        />
        <p className="text-[13px] font-light uppercase tracking-[0.28em] text-muted-foreground lg:text-base lg:tracking-[0.25em]">
          How it works
        </p>
      </div>

      {/* ── Heading + copy + image: mobile column / desktop row ── */}
      <div className="mb-14 flex flex-col gap-8 lg:mb-16 lg:flex-row lg:items-start lg:gap-16">
        <h2
          id="how-it-works-heading"
          className="w-full max-w-full shrink-0 font-serif font-light leading-[1.12] tracking-tight text-primary-blue [font-size:clamp(2.95rem,12.25vw,4rem)] lg:w-[45%] lg:leading-[1.08] lg:[font-size:clamp(2.4rem,4.5vw,4.8rem)]"
        >
          WhatsApp stays.{" "}
          <em className="italic">Orders, organised.</em>
        </h2>

        <div className="flex min-w-0 flex-1 flex-col gap-8 lg:gap-5 lg:pt-36 xl:pt-40">
          {/* Optional body + image — uncomment when assets/copy are ready */}
        </div>
      </div>

      {/* ── Four pillars ── */}
      <div className="grid grid-cols-1 gap-0 border-t border-primary-blue/15 pt-10 lg:grid-cols-4 lg:gap-8 lg:pt-8">
        {pillars.map(({ number, title, description, icon }) => (
          <div
            key={number}
            className="border-b border-border py-8 last:border-b-0 lg:border-b-0 lg:border-r lg:border-border lg:py-0 lg:pr-8 last:lg:border-r-0"
          >
            <div className="mb-3 flex items-center gap-3">
              <span
                className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-primary-blue/25 text-primary-blue"
                aria-hidden
              >
                {icon}
              </span>
              <p className="text-lg tracking-[0.2em] text-secondary/90">
                {number}
              </p>
            </div>
            <p className="mb-2 font-serif text-xl font-medium text-primary-blue">
              {title}
            </p>
            <p className="text-base leading-relaxed text-muted-foreground">
              {description}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}

function IconBuilding() {
  return (
    <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M4 21V8l8-5 8 5v13M9 21v-6h6v6"
        stroke="currentColor"
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function IconLayout() {
  return (
    <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M4 5h16v14H4V5Zm4 4h8M8 13h8"
        stroke="currentColor"
        strokeWidth={1.5}
        strokeLinecap="round"
      />
    </svg>
  );
}

function IconPalette() {
  return (
    <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M12 3a7 7 0 1 0 7 7c0 1.5-1 2-2 2h-2v2a2 2 0 0 1-2 2 7 7 0 0 0-7-7Z"
        stroke="currentColor"
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="7.5" cy="11.5" r="1" fill="currentColor" />
      <circle cx="10.5" cy="8.5" r="1" fill="currentColor" />
      <circle cx="15.5" cy="8.5" r="1" fill="currentColor" />
    </svg>
  );
}

function IconMessage() {
  return (
    <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5Z"
        stroke="currentColor"
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
