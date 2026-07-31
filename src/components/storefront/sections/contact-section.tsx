"use client";

import { type FormEvent, useState } from "react";
import { motion } from "framer-motion";
import type {
  StorefrontConfig,
  StorefrontContactSection,
} from "@/types/storefront";

type ContactSectionProps = {
  section: StorefrontContactSection;
  config: StorefrontConfig;
};

function whatsappUrlFromConfig(config: StorefrontConfig): string {
  const digits = config.whatsappNumber?.replace(/\D/g, "") ?? "";
  return digits ? `https://wa.me/${digits}` : "";
}

export function ContactSection({ section, config }: ContactSectionProps) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const whatsappHref =
    section.whatsappHref.trim() || whatsappUrlFromConfig(config);
  const emailAddress = section.email.trim();
  const hours = section.hours.trim();
  const note = section.note.trim();
  const eyebrow = section.eyebrow.trim();

  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    const nextName = name.trim();
    const nextEmail = email.trim();
    const nextMessage = message.trim();
    if (!nextName) {
      setError("Please enter your name.");
      return;
    }
    if (!nextEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(nextEmail)) {
      setError("Enter a valid email address.");
      return;
    }
    if (!nextMessage) {
      setError("Please write a short message.");
      return;
    }
    setError(null);
    setSubmitted(true);
  }

  return (
    <section
      className="px-4 py-14 sm:px-8 sm:py-20 @sm/storefront:px-8 @sm/storefront:py-20"
      aria-labelledby={`${section.id}-heading`}
    >
      <div className="mx-auto grid max-w-6xl gap-12 md:grid-cols-2 md:gap-16 md:items-start @md/storefront:grid-cols-2 @md/storefront:gap-16 @md/storefront:items-start">
        <div>
          {eyebrow ? (
            <p className="font-sans text-[11px] font-semibold uppercase tracking-[0.2em] text-[color:var(--sf-accent-text-55)]">
              {eyebrow}
            </p>
          ) : null}
          <h2
            id={`${section.id}-heading`}
            className={`font-serif text-3xl font-light text-[color:var(--sf-accent)] sm:text-4xl @sm/storefront:text-4xl ${
              eyebrow ? "mt-3" : ""
            }`}
          >
            {section.title}
          </h2>
          {section.body.trim() ? (
            <p className="mt-4 max-w-md font-sans text-sm leading-relaxed text-[color:var(--sf-accent-text-70)] sm:text-base @sm/storefront:text-base">
              {section.body}
            </p>
          ) : null}

          <ul className="mt-10 space-y-6">
            {whatsappHref ? (
              <li>
                <p className="font-sans text-[11px] font-semibold uppercase tracking-[0.16em] text-[color:var(--sf-accent-text-45)]">
                  WhatsApp
                </p>
                <a
                  href={whatsappHref}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-2 inline-flex items-center gap-2 font-sans text-sm font-semibold text-[color:var(--sf-accent)] underline decoration-[color:var(--sf-accent-border-25)] underline-offset-4 transition-colors hover:decoration-[color:var(--sf-accent)]"
                >
                  <svg
                    viewBox="0 0 24 24"
                    aria-hidden
                    className="h-4 w-4 fill-current"
                  >
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.435 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 6.045L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                  </svg>
                  {section.whatsappLabel.trim() || "Chat on WhatsApp"}
                </a>
              </li>
            ) : null}
            {emailAddress ? (
              <li>
                <p className="font-sans text-[11px] font-semibold uppercase tracking-[0.16em] text-[color:var(--sf-accent-text-45)]">
                  Email
                </p>
                <a
                  href={`mailto:${emailAddress}`}
                  className="mt-2 inline-block font-sans text-sm font-semibold text-[color:var(--sf-accent)] underline decoration-[color:var(--sf-accent-border-25)] underline-offset-4 transition-colors hover:decoration-[color:var(--sf-accent)]"
                >
                  {emailAddress}
                </a>
              </li>
            ) : null}
            {hours ? (
              <li>
                <p className="font-sans text-[11px] font-semibold uppercase tracking-[0.16em] text-[color:var(--sf-accent-text-45)]">
                  Hours
                </p>
                <p className="mt-2 font-sans text-sm text-[color:var(--sf-accent-text-70)]">
                  {hours}
                </p>
              </li>
            ) : null}
            {note ? (
              <li>
                <p className="font-sans text-xs leading-relaxed text-[color:var(--sf-accent-text-55)]">
                  {note}
                </p>
              </li>
            ) : null}
          </ul>
        </div>

        <div className="border border-[color:var(--sf-accent-border-10)] bg-[color:var(--sf-nav-hover-wash)] p-6 sm:p-8 @sm/storefront:p-8">
          <h3 className="font-serif text-2xl font-light text-[color:var(--sf-accent)] md:text-[1.75rem]">
            {section.formTitle}
          </h3>

          {submitted ? (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, ease: "easeOut" }}
              className="mt-8"
              role="status"
            >
              <p className="font-serif text-xl font-light text-[color:var(--sf-accent)]">
                Message sent
              </p>
              <p className="mt-2 font-sans text-sm leading-relaxed text-[color:var(--sf-accent-text-70)]">
                {section.successMessage}
              </p>
            </motion.div>
          ) : (
            <form onSubmit={handleSubmit} className="mt-6 space-y-4" noValidate>
              <div>
                <label
                  htmlFor={`${section.id}-name`}
                  className="mb-1.5 block font-sans text-[11px] font-semibold uppercase tracking-[0.14em] text-[color:var(--sf-accent-text-55)]"
                >
                  Name
                </label>
                <input
                  id={`${section.id}-name`}
                  type="text"
                  autoComplete="name"
                  value={name}
                  onChange={(e) => {
                    setName(e.target.value);
                    if (error) setError(null);
                  }}
                  className="w-full border-0 bg-white px-4 py-3 font-sans text-sm text-[color:var(--sf-accent)] outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--sf-accent)]/20"
                />
              </div>
              <div>
                <label
                  htmlFor={`${section.id}-email`}
                  className="mb-1.5 block font-sans text-[11px] font-semibold uppercase tracking-[0.14em] text-[color:var(--sf-accent-text-55)]"
                >
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
                  className="w-full border-0 bg-white px-4 py-3 font-sans text-sm text-[color:var(--sf-accent)] outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--sf-accent)]/20"
                />
              </div>
              <div>
                <label
                  htmlFor={`${section.id}-message`}
                  className="mb-1.5 block font-sans text-[11px] font-semibold uppercase tracking-[0.14em] text-[color:var(--sf-accent-text-55)]"
                >
                  Message
                </label>
                <textarea
                  id={`${section.id}-message`}
                  rows={5}
                  value={message}
                  onChange={(e) => {
                    setMessage(e.target.value);
                    if (error) setError(null);
                  }}
                  className="w-full resize-y border-0 bg-white px-4 py-3 font-sans text-sm text-[color:var(--sf-accent)] outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--sf-accent)]/20"
                />
              </div>
              {error ? (
                <p className="font-sans text-xs text-red-700" role="alert">
                  {error}
                </p>
              ) : (
                <p className="font-sans text-xs text-[color:var(--sf-accent-text-45)]">
                  Form preview only — messages are not emailed yet.
                </p>
              )}
              <button
                type="submit"
                className="w-full bg-[color:var(--sf-accent)] px-6 py-3.5 font-sans text-sm font-semibold text-white transition-opacity hover:opacity-90 sm:w-auto @sm/storefront:w-auto"
              >
                {section.submitLabel}
              </button>
            </form>
          )}
        </div>
      </div>
    </section>
  );
}
