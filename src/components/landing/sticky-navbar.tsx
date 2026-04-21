"use client";

import { AnimatePresence, motion } from "framer-motion";
import Link from "next/link";
import { useEffect, useState } from "react";

const NAV_LINKS = [
  { id: "how-it-works", label: "How it works" },
  { id: "solution", label: "Solution" },
  { id: "use-cases", label: "Use cases" },
  { id: "pricing", label: "Pricing" },
  { id: "features", label: "Features" },
] as const;

const overlayTransition = { duration: 0.22, ease: [0.32, 0.72, 0, 1] as const };
const sidebarTransition = { type: "tween" as const, duration: 0.3, ease: [0.32, 0.72, 0, 1] as const };

type StickyNavbarProps = {
  scrollToSection?: (sectionId: string) => void;
};

function MenuIcon({ open }: { open: boolean }) {
  return (
    <svg
      className="h-6 w-6"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      aria-hidden
    >
      {open ? (
        <path d="M18 6L6 18M6 6l12 12" />
      ) : (
        <>
          <path d="M4 6h16M4 12h16M4 18h16" />
        </>
      )}
    </svg>
  );
}

export default function StickyNavbar({ scrollToSection }: StickyNavbarProps) {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    if (!menuOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setMenuOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [menuOpen]);

  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [menuOpen]);

  const go = (id: string) => {
    scrollToSection?.(id);
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
    setMenuOpen(false);
  };

  return (
    <>
      <AnimatePresence>
        {menuOpen ? (
          <>
            <motion.button
              key="nav-backdrop"
              type="button"
              className="fixed inset-0 z-40 bg-black/50 md:hidden"
              aria-label="Close menu"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={overlayTransition}
              onClick={() => setMenuOpen(false)}
            />
            <motion.aside
              key="nav-sidebar"
              id="mobile-nav-menu"
              role="dialog"
              aria-modal="true"
              aria-label="Site menu"
              className="fixed inset-y-0 right-0 z-50 flex min-h-screen w-[min(100%,20rem)] max-w-[85vw] flex-col bg-primary-blue shadow-2xl md:hidden"
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={sidebarTransition}
            >
              <div className="flex min-h-0 flex-1 flex-col overflow-y-auto px-5 pb-10 pt-5">
                <div className="mb-8 flex items-center justify-between border-b border-white/15 pb-4">
                  <span className="text-sm font-semibold tracking-wide text-white/70">
                    Menu
                  </span>
                  <button
                    type="button"
                    className=" p-2 text-white ring-1 ring-white/20 transition-colors hover:bg-white/10"
                    aria-label="Close menu"
                    onClick={() => setMenuOpen(false)}
                  >
                    <MenuIcon open />
                  </button>
                </div>
                <nav className="flex flex-col gap-1" aria-label="Mobile">
                  {NAV_LINKS.map(({ id, label }, i) => (
                    <motion.button
                      key={id}
                      type="button"
                      initial={{ opacity: 0, x: 12 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{
                        delay: 0.05 + i * 0.04,
                        duration: 0.22,
                        ease: [0.32, 0.72, 0, 1],
                      }}
                      onClick={() => go(id)}
                      className=" px-3 py-3.5 text-left text-base text-white/90 transition-colors hover:bg-white/10 hover:text-white"
                    >
                      {label}
                    </motion.button>
                  ))}
                </nav>
              </div>
            </motion.aside>
          </>
        ) : null}
      </AnimatePresence>

      <nav
        className={`relative sticky top-0 z-50 w-full border-b transition-colors ${
          scrolled || menuOpen
            ? "border-white/10 bg-primary-blue/95 backdrop-blur-md"
            : "border-transparent bg-transparent"
        }`}
        aria-label="Main navigation"
      >
        <div className="mx-auto flex max-w-[98%] items-center justify-between gap-3 px-4 py-3 sm:px-6 sm:py-4 md:px-8">
          <button
            type="button"
            onClick={() => go("home")}
            className="min-w-0 shrink text-left text-sm font-semibold tracking-tight text-white sm:text-base md:text-lg"
          >
            <span className="truncate sm:inline">SME Operations</span>
          </button>

          <div className="hidden min-w-0 flex-1 items-center justify-center gap-4 md:flex md:gap-6 lg:gap-8">
            {NAV_LINKS.map(({ id, label }) => (
              <button
                key={id}
                type="button"
                onClick={() => go(id)}
                className="whitespace-nowrap text-sm text-white/90 transition-colors hover:text-white"
              >
                {label}
              </button>
            ))}
          </div>

          <div className="flex shrink-0 items-center gap-2 sm:gap-3">
            <Link
              href="#get-started"
              onClick={() => setMenuOpen(false)}
              className="inline-flex  bg-white/10 px-3 py-2 text-xs font-medium text-white ring-1 ring-white/20 transition-colors hover:bg-white/15 sm:px-4 sm:text-sm"
            >
              Get started
            </Link>

            <button
              type="button"
              className=" p-2 text-white ring-1 ring-white/20 transition-colors hover:bg-white/10 md:hidden"
              aria-expanded={menuOpen}
              aria-controls="mobile-nav-menu"
              aria-label={menuOpen ? "Close menu" : "Open menu"}
              onClick={() => setMenuOpen((o) => !o)}
            >
              <MenuIcon open={menuOpen} />
            </button>
          </div>
        </div>
      </nav>
    </>
  );
}
