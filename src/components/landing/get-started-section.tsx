export function GetStartedSection() {
  return (
    <section
      id="get-started"
      className="scroll-mt-24 border-t border-primary-blue/10 bg-blue-gray"
      aria-labelledby="get-started-heading"
    >
      <div className="relative mx-auto max-w-[1600px] overflow-x-hidden px-5 py-12 sm:px-10 sm:py-14 lg:px-20 lg:py-16">
        {/* Soft accent — smaller on mobile so it does not dominate the band */}
        <div
          className="pointer-events-none absolute bottom-0 right-0 h-16 w-24 rounded-tl-[100%] bg-primary-blue/[0.05] sm:h-36 sm:w-44 sm:bg-primary-blue/[0.06] md:h-48 md:w-64 md:-right-6 md:rounded-tl-[100%] lg:-right-4 lg:h-56 lg:w-80 xl:h-64 xl:w-96"
          aria-hidden
        />

        <div className="relative max-w-2xl text-left lg:max-w-3xl">
          <h2
            id="get-started-heading"
            className="font-serif text-[clamp(2rem,5vw,2.85rem)] font-light leading-[1.12] tracking-tight text-primary-blue"
          >
            Subscribe for updates
          </h2>
          <p className="mt-4 max-w-xl font-sans text-[15px] leading-relaxed text-muted-foreground sm:text-base">
            Onboarding opens soon. Leave your email for launch announcements
            and occasional product notes—we keep sends minimal.
          </p>

          <form
            id="newsletter"
            className="mt-6 flex w-full max-w-xl flex-col border border-primary-blue/25 bg-white sm:max-w-2xl sm:flex-row sm:items-stretch"
            action="#"
            method="post"
          >
            <label htmlFor="newsletter-email" className="sr-only">
              Email address
            </label>
            <input
              id="newsletter-email"
              name="email"
              type="email"
              required
              autoComplete="email"
              placeholder="Enter a valid email address"
              className="min-h-12 w-full flex-1 border-0 bg-transparent px-4 py-3 font-sans text-sm text-foreground outline-none placeholder:text-muted-foreground/60 focus-visible:z-10 focus-visible:ring-2 focus-visible:ring-primary-blue/25 focus-visible:ring-inset sm:border-r sm:border-primary-blue/25 sm:text-base"
            />
            <button
              type="submit"
              className="min-h-12 shrink-0 border-t border-primary-blue/25 bg-primary-blue px-6 py-3 font-sans text-xs font-semibold uppercase tracking-[0.2em] text-white transition-colors hover:bg-primary-blue/90 sm:border-t-0 sm:px-8 sm:text-[13px]"
            >
              Subscribe
            </button>
          </form>
        </div>
      </div>
    </section>
  );
}
