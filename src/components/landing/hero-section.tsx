"use client";

import Image from "next/image";
import Link from "next/link";
import StickyNavbar from "./sticky-navbar";

const HERO_TITLE = "SME Operations Automation System";
const HERO_HIGHLIGHT = "WhatsApp orders, captured and organised.";
const HERO_LEDE =
  "Missed orders when WhatsApp blows up? We organise and track them—you keep WhatsApp.";

function HeroActions({ className }: { className?: string }) {
  return (
    <nav className={className} aria-label="Primary actions">
      <Link
        href="/signup"
        className="group inline-flex items-center justify-center gap-2  bg-gradient-to-r from-blue-gray to-blue-gray/80 px-6 py-3 font-semibold text-[#0C0928] shadow-lg transition-all hover:shadow-xl hover:brightness-105"
      >
        Get started
      </Link>
      <button
        type="button"
        onClick={() =>
          document.getElementById("problem")?.scrollIntoView({
            behavior: "smooth",
          })
        }
        className="inline-flex items-center justify-center  border border-white/20 bg-white/10 px-6 py-3 font-semibold text-white backdrop-blur-md transition-colors hover:bg-white/20"
      >
        Learn more
      </button>
    </nav>
  );
}

export default function HeroSection() {
  return (
    <div className="w-full bg-primary-blue font-sans">
      <StickyNavbar scrollToSection={() => {}} />

      {/* Mobile — solid blue-primary, no hero image */}
      <section
        className="flex min-h-screen flex-col bg-blue-primary md:hidden"
        aria-label="Hero"
      >
        <div className="flex flex-1 flex-col justify-center px-5 pb-10 pt-8">
          <div aria-labelledby="hero-heading">
            <h1
              id="hero-heading"
              className="mb-3 text-3xl font-bold leading-tight text-white"
            >
              {HERO_TITLE}
            </h1>
            <p className="mb-4 text-lg font-medium text-secondary">
              {HERO_HIGHLIGHT}
            </p>
            <p className="mb-6 text-base leading-relaxed text-white/90">
              {HERO_LEDE}
            </p>
            <HeroActions className="flex flex-col gap-3 pt-2" />
          </div>
        </div>
      </section>

      {/* Desktop */}
      <main
        className="relative hidden min-h-screen overflow-hidden bg-primary-blue md:block"
        id="home"
        role="main"
      >
        <div className="relative z-10 flex h-full min-h-screen flex-row">
          <section
            className="flex h-full w-[55%] flex-col p-8 pr-8"
            aria-labelledby="hero-heading-desktop"
          >
            <div className="flex flex-1 flex-col justify-center pt-20">
              <h1
                id="hero-heading-desktop"
                className="mb-3 text-4xl font-bold leading-tight text-white md:text-5xl lg:text-6xl xl:text-6xl"
              >
                {HERO_TITLE}
              </h1>
              <p className="mb-4 text-xl font-medium text-secondary lg:text-2xl">
                {HERO_HIGHLIGHT}
              </p>
              <p className="mb-8 max-w-xl text-lg leading-relaxed text-white/90">
                {HERO_LEDE}
              </p>
              <HeroActions className="flex flex-wrap gap-3" />
            </div>
          </section>
          <aside
            className="relative z-50 h-full min-h-screen w-[45%]"
            aria-label="Hero visual"
          >
            <div
              className="absolute inset-0"
              style={{
                borderBottomLeftRadius: "100%",
                overflow: "hidden",
              }}
            >
              <Image
                src="/assets/hero-section.png"
                alt="Merchant managing customer orders"
                fill
                className="object-cover"
                style={{ objectPosition: "center" }}
                sizes="45vw"
                priority
              />
              <div className="pointer-events-none absolute inset-0 bg-[#0C0928]/30" />
            </div>
          </aside>
        </div>
      </main>
    </div>
  );
}
