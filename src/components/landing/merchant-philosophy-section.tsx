export function MerchantPhilosophySection() {
  return (
    <section
      id="philosophy"
      className="scroll-mt-24  bg-blue-gray py-16 text-foreground sm:py-20 lg:px-20 lg:py-24"
      aria-labelledby="philosophy-heading"
    >
      <div className="mx-auto max-w-[98%] px-5 sm:px-8 lg:max-w-none lg:px-0">
        {/* Section label — same pattern as How it works */}
        <div className="mb-6 flex items-center gap-3 lg:mb-10">
          <span
            className="block h-px w-6 shrink-0 bg-foreground/40"
            aria-hidden
          />
          <p className="text-[13px] font-light uppercase tracking-[0.28em] text-muted-foreground lg:text-base lg:tracking-[0.25em]">
            Philosophy
          </p>
        </div>

        <div className="grid gap-12 lg:grid-cols-2 lg:gap-14 lg:items-start">
          {/* Left: headline + body */}
          <div className="flex min-w-0 flex-col">
            <h2
              id="philosophy-heading"
              className="font-serif font-light leading-[1.12] tracking-tight text-primary-blue [font-size:clamp(2.95rem,12.25vw,4rem)] lg:leading-[1.08] lg:[font-size:clamp(2.4rem,4.5vw,3.25rem)]"
            >
              Refining the merchant&apos;s{" "}
              <em className="italic">path</em>
            </h2>
            <p className="mt-6 max-w-xl text-base leading-relaxed text-muted-foreground sm:text-lg">
              At SME Operations, we believe the tools you use should respect the
              way you already sell—especially when that means WhatsApp. Our
              workspace removes digital clutter so orders become clear lists:
              fewer missed chats, less spreadsheet juggling, and room to focus
              on customers instead of inbox archaeology.
            </p>

            
          </div>

          {/* Right: quote on primary-blue */}
          <aside
            className="min-w-0  border border-white/10 bg-primary-blue p-8 sm:p-10 lg:pt-12 lg:pb-10 xl:pt-16 xl:pb-12"
            aria-label="Principle"
          >
            <figure>
              <blockquote className="font-serif text-xl font-light italic leading-relaxed text-white sm:text-2xl">
                &ldquo;High volume is not the enemy—lost context is. Orders only
                matter when you can see them, track them, and fulfil them without
                leaving the channel your customers trust.&rdquo;
              </blockquote>
              <figcaption className="mt-6 font-sans text-xs font-medium uppercase tracking-[0.2em] text-white/70">
                — Product principles, SME Operations
              </figcaption>
            </figure>
          </aside>
        </div>
      </div>
    </section>
  );
}
