"use client";

import { type FormEvent, useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import type {
  StorefrontInstagramGallerySection,
  StorefrontNewsletterSection,
  StorefrontTestimonial,
  StorefrontTestimonialsSection,
} from "@/types/storefront";

const TESTIMONIALS_PER_PAGE = 3;

function TestimonialCard({ item }: { item: StorefrontTestimonial }) {
  return (
    <blockquote className="rounded-xl border border-[color:var(--sf-accent-border-10)] bg-white p-6 shadow-sm">
      <p className="font-serif text-lg font-light leading-relaxed text-[color:var(--sf-accent)]">
        “{item.quote}”
      </p>
      <footer className="mt-5 flex items-center gap-3">
        <div className="h-10 w-10 overflow-hidden rounded-full border border-[color:var(--sf-accent-border-10)] bg-[color:var(--sf-hero-placeholder)]">
          {item.imageUrl.trim() ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={item.imageUrl}
              alt=""
              className="h-full w-full object-cover"
            />
          ) : null}
        </div>
        <div>
          <p className="font-sans text-sm font-semibold text-[color:var(--sf-accent)]">
            {item.name}
          </p>
          {item.role.trim() ? (
            <p className="font-sans text-xs text-[color:var(--sf-accent-text-55)]">
              {item.role}
            </p>
          ) : null}
        </div>
      </footer>
    </blockquote>
  );
}

export function TestimonialsSection({
  section,
}: {
  section: StorefrontTestimonialsSection;
}) {
  const items = section.items;
  const useCarousel = items.length > TESTIMONIALS_PER_PAGE;
  const pageCount = Math.max(
    1,
    Math.ceil(items.length / TESTIMONIALS_PER_PAGE),
  );
  const [page, setPage] = useState(0);

  useEffect(() => {
    setPage(0);
  }, [items.length]);

  const visible = useCarousel
    ? items.slice(
        page * TESTIMONIALS_PER_PAGE,
        page * TESTIMONIALS_PER_PAGE + TESTIMONIALS_PER_PAGE,
      )
    : items;

  function goPrev() {
    setPage((current) => (current === 0 ? pageCount - 1 : current - 1));
  }

  function goNext() {
    setPage((current) => (current === pageCount - 1 ? 0 : current + 1));
  }

  return (
    <section
      className="bg-[color:var(--sf-values-section-bg)] px-4 py-14 sm:px-8 sm:py-20"
      aria-labelledby={`${section.id}-heading`}
    >
      <div className="mx-auto max-w-[100%]">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <h2
            id={`${section.id}-heading`}
            className="font-serif text-2xl font-light text-[color:var(--sf-accent)] sm:text-3xl"
          >
            {section.title}
          </h2>
          {useCarousel ? (
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={goPrev}
                className="flex h-9 w-9 items-center justify-center rounded-full border border-[color:var(--sf-accent-border-10)] bg-white font-sans text-sm text-[color:var(--sf-accent)] transition-colors hover:bg-white/80"
                aria-label="Previous testimonials"
              >
                ←
              </button>
              <button
                type="button"
                onClick={goNext}
                className="flex h-9 w-9 items-center justify-center rounded-full border border-[color:var(--sf-accent-border-10)] bg-white font-sans text-sm text-[color:var(--sf-accent)] transition-colors hover:bg-white/80"
                aria-label="Next testimonials"
              >
                →
              </button>
            </div>
          ) : null}
        </div>

        <div className="mt-10">
          {useCarousel ? (
            <AnimatePresence mode="wait" initial={false}>
              <motion.div
                key={page}
                initial={{ opacity: 0, x: 24 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -24 }}
                transition={{ duration: 0.28, ease: "easeOut" }}
                className="grid gap-6 md:grid-cols-3"
              >
                {visible.map((item, i) => (
                  <TestimonialCard
                    key={`${item.name}-${page}-${i}`}
                    item={item}
                  />
                ))}
              </motion.div>
            </AnimatePresence>
          ) : (
            <div className="grid gap-6 md:grid-cols-3">
              {visible.map((item, i) => (
                <TestimonialCard key={`${item.name}-${i}`} item={item} />
              ))}
            </div>
          )}
        </div>

        {useCarousel ? (
          <div
            className="mt-8 flex items-center justify-center gap-2"
            role="tablist"
            aria-label="Testimonial pages"
          >
            {Array.from({ length: pageCount }, (_, i) => (
              <button
                key={i}
                type="button"
                role="tab"
                aria-selected={i === page}
                aria-label={`Show testimonials page ${i + 1}`}
                onClick={() => setPage(i)}
                className={`h-2 rounded-full transition-all ${
                  i === page
                    ? "w-6 bg-[color:var(--sf-accent)]"
                    : "w-2 bg-[color:var(--sf-accent)]/25 hover:bg-[color:var(--sf-accent)]/45"
                }`}
              />
            ))}
          </div>
        ) : null}
      </div>
    </section>
  );
}

export function InstagramGallerySection({
  section,
}: {
  section: StorefrontInstagramGallerySection;
}) {
  return (
    <section
      className="px-4 py-14 sm:px-8 sm:py-20"
      aria-labelledby={`${section.id}-heading`}
    >
      <div className="mx-auto max-w-[100%]">
        <div className="mb-8 flex flex-wrap items-end justify-between gap-3">
          <h2
            id={`${section.id}-heading`}
            className="font-serif text-2xl font-light text-[color:var(--sf-accent)] sm:text-3xl"
          >
            {section.title}
          </h2>
          <p className="font-sans text-sm font-semibold text-[color:var(--sf-accent-text-55)]">
            {section.handle}
          </p>
        </div>
        <div className="grid grid-cols-2 gap-3 md:grid-cols-4 md:gap-4">
          {section.images.map((item, i) => {
            const media = (
              <div className="aspect-square overflow-hidden rounded-xl border border-[color:var(--sf-accent-border-10)] bg-[color:var(--sf-hero-placeholder)]">
                {item.imageUrl.trim() ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={item.imageUrl}
                    alt=""
                    className="h-full w-full object-cover transition-transform duration-500 hover:scale-[1.03]"
                  />
                ) : (
                  <div className="flex h-full items-center justify-center font-sans text-xs text-[color:var(--sf-accent-text-45)]">
                    Upload image
                  </div>
                )}
              </div>
            );
            return item.href.trim() && item.href !== "#" ? (
              <a key={`${item.imageUrl}-${i}`} href={item.href}>
                {media}
              </a>
            ) : (
              <div key={`${item.imageUrl}-${i}`}>{media}</div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

export function NewsletterSection({
  section,
}: {
  section: StorefrontNewsletterSection;
}) {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    const value = email.trim();
    if (!value) {
      setError("Please enter your email.");
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
      setError("Enter a valid email address.");
      return;
    }
    setError(null);
    setSubmitted(true);
  }

  return (
    <section
      className="relative overflow-hidden px-4 py-16 sm:px-8 sm:py-24"
      aria-labelledby={`${section.id}-heading`}
    >
      <div className="absolute inset-0 bg-[color:var(--sf-accent)]" />
      <div className="absolute inset-0 bg-gradient-to-br from-white/10 via-transparent to-black/25" />

      <div className="relative mx-auto max-w-3xl text-center">
        <p className="font-sans text-[11px] font-semibold uppercase tracking-[0.22em] text-white/65">
          Newsletter
        </p>
        <h2
          id={`${section.id}-heading`}
          className="mt-4 font-serif text-4xl font-light text-white sm:text-5xl"
        >
          {section.title}
        </h2>
        <p className="mx-auto mt-4 max-w-xl font-sans text-sm leading-relaxed text-white/75 sm:text-base">
          {section.body}
        </p>

        {submitted ? (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, ease: "easeOut" }}
            className="mx-auto mt-10 max-w-md border border-white/20 bg-white/10 px-6 py-5 backdrop-blur-sm"
            role="status"
          >
            <p className="font-serif text-2xl font-light text-white">
              You&apos;re in
            </p>
            <p className="mt-2 font-sans text-sm text-white/80">
              {section.successMessage}
            </p>
          </motion.div>
        ) : (
          <form
            onSubmit={handleSubmit}
            className="mx-auto mt-10 max-w-xl"
            noValidate
          >
            <div className="flex flex-col gap-3 sm:flex-row sm:items-stretch sm:gap-0 sm:border sm:border-white/25 sm:bg-white/10 sm:p-1.5 sm:backdrop-blur-sm">
              <label className="sr-only" htmlFor={`${section.id}-email`}>
                Email
              </label>
              <input
                id={`${section.id}-email`}
                type="email"
                autoComplete="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (error) setError(null);
                }}
                placeholder={section.placeholder}
                aria-invalid={Boolean(error)}
                aria-describedby={
                  error ? `${section.id}-error` : `${section.id}-hint`
                }
                className="min-w-0 flex-1 border border-white/25 bg-white/10 px-4 py-3.5 font-sans text-sm text-white outline-none placeholder:text-white/45 focus-visible:ring-2 focus-visible:ring-white/40 sm:border-0 sm:bg-transparent sm:focus-visible:ring-0"
              />
              <button
                type="submit"
                className="bg-white px-6 py-3.5 font-sans text-sm font-semibold text-[color:var(--sf-accent)] transition-opacity hover:opacity-90"
              >
                {section.buttonLabel}
              </button>
            </div>
            {error ? (
              <p
                id={`${section.id}-error`}
                className="mt-3 font-sans text-xs text-white"
                role="alert"
              >
                {error}
              </p>
            ) : (
              <p
                id={`${section.id}-hint`}
                className="mt-3 font-sans text-xs text-white/55"
              >
                No spam. Unsubscribe anytime.
              </p>
            )}
          </form>
        )}
      </div>
    </section>
  );
}
