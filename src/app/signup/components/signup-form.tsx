"use client";

import Link from "next/link";
import { useMemo, useState, type FormEvent } from "react";
import { toast } from "sonner";
import { registerBusinessAction } from "@/actions/auth";
import { SignupVerifyModal } from "@/app/signup/components/signup-verify-modal";
import {
  SME_WORKSPACE_STORAGE_KEY,
  type StoredWorkspace,
} from "@/lib/workspace-id";

function passwordScore(pw: string): number {
  if (!pw) return 0;
  let score = 0;
  if (pw.length >= 8) score++;
  if (pw.length >= 12) score++;
  if (/[A-Z]/.test(pw) && /[a-z]/.test(pw)) score++;
  if (/\d/.test(pw) || /[^A-Za-z0-9]/.test(pw)) score++;
  return Math.min(4, Math.max(1, score));
}

function strengthLabel(score: number): string {
  if (score <= 1) return "Weak";
  if (score === 2) return "Moderate";
  if (score === 3) return "Strong";
  return "Excellent";
}

export function SignupForm() {
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [verifyModal, setVerifyModal] = useState<{
    email: string;
    businessId: string;
    message: string;
  } | null>(null);
  const score = useMemo(() => passwordScore(password), [password]);
  const filled = password ? score : 0;

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const fd = new FormData(form);
    const fullName = String(fd.get("name") ?? "").trim();
    const email = String(fd.get("email") ?? "").trim();
    const businessName = String(fd.get("businessName") ?? "").trim();
    const description = String(fd.get("description") ?? "").trim();

    setIsSubmitting(true);
    const result = await registerBusinessAction({
      email,
      password,
      fullName,
      businessName,
      description,
    });
    setIsSubmitting(false);

    if (!result.ok) {
      toast.error(result.errorMessage);
      return;
    }

    const { businessId, userId, publicLink, message } = result.data;
    const payload: StoredWorkspace = {
      workspaceId: businessId,
      name: fullName,
      email,
      businessName,
      createdAt: Date.now(),
      userId,
      publicLink,
    };
    try {
      localStorage.setItem(SME_WORKSPACE_STORAGE_KEY, JSON.stringify(payload));
    } catch {
      /* workspace panel may fall back to placeholders */
    }
    setVerifyModal({ email, businessId, message });
  }

  return (
    <div className="flex min-h-screen flex-col lg:flex-row">
      <div className="flex flex-1 flex-col justify-center px-5 py-12 sm:px-10 lg:max-w-[58%] lg:px-16 lg:py-16 xl:px-24">
        <header className="mb-10">
          <p className="font-sans text-xs font-semibold uppercase tracking-[0.22em] text-primary-blue/55">
            SME Operations
          </p>
          <h1 className="mt-3 font-serif text-[clamp(2rem,4.5vw,3.25rem)] font-light leading-[1.1] tracking-tight text-primary-blue">
            Begin with a clearer queue.
          </h1>
          <p className="mt-4 max-w-md font-sans text-[15px] leading-relaxed text-muted-foreground sm:text-base">
            Join merchants who turn WhatsApp noise into organised orders—fewer
            missed chats, one calm place to see what needs fulfilling next.
          </p>
        </header>

        <form className="max-w-md space-y-6" onSubmit={handleSubmit}>
          <div>
            <label
              htmlFor="signup-name"
              className="mb-2 block font-sans text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground"
            >
              Full name
            </label>
            <input
              id="signup-name"
              name="name"
              type="text"
              autoComplete="name"
              required
              placeholder="Thandi Mokoena"
              className="w-full border border-primary-blue/15 bg-white px-4 py-3 font-sans text-sm text-foreground outline-none transition-shadow placeholder:text-muted-foreground/50 focus-visible:border-primary-blue/35 focus-visible:ring-2 focus-visible:ring-primary-blue/20"
            />
          </div>

          <div>
            <label
              htmlFor="signup-business-name"
              className="mb-2 block font-sans text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground"
            >
              Business name
            </label>
            <input
              id="signup-business-name"
              name="businessName"
              type="text"
              autoComplete="organization"
              required
              placeholder="Acme Coffee Shop"
              className="w-full border border-primary-blue/15 bg-white px-4 py-3 font-sans text-sm text-foreground outline-none transition-shadow placeholder:text-muted-foreground/50 focus-visible:border-primary-blue/35 focus-visible:ring-2 focus-visible:ring-primary-blue/20"
            />
          </div>

          <div>
            <label
              htmlFor="signup-email"
              className="mb-2 block font-sans text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground"
            >
              Business email
            </label>
            <input
              id="signup-email"
              name="email"
              type="email"
              autoComplete="email"
              required
              placeholder="you@yourshop.co.za"
              className="w-full border border-primary-blue/15 bg-white px-4 py-3 font-sans text-sm text-foreground outline-none transition-shadow placeholder:text-muted-foreground/50 focus-visible:border-primary-blue/35 focus-visible:ring-2 focus-visible:ring-primary-blue/20"
            />
          </div>

          <div>
            <label
              htmlFor="signup-description"
              className="mb-2 block font-sans text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground"
            >
              Short description
            </label>
            <textarea
              id="signup-description"
              name="description"
              required
              rows={3}
              placeholder="What you sell and what makes your shop stand out"
              className="w-full resize-y border border-primary-blue/15 bg-white px-4 py-3 font-sans text-sm text-foreground outline-none transition-shadow placeholder:text-muted-foreground/50 focus-visible:border-primary-blue/35 focus-visible:ring-2 focus-visible:ring-primary-blue/20"
            />
          </div>

          <div>
            <div className="mb-2 flex flex-wrap items-baseline justify-between gap-2">
              <label
                htmlFor="signup-password"
                className="font-sans text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground"
              >
                Password
              </label>
              {password ? (
                <span className="font-sans text-[10px] font-semibold uppercase tracking-[0.16em] text-primary-blue/70">
                  Strength: {strengthLabel(filled)}
                </span>
              ) : null}
            </div>
            <input
              id="signup-password"
              name="password"
              type="password"
              autoComplete="new-password"
              required
              minLength={8}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Create a secure password"
              className="w-full border border-primary-blue/15 bg-white px-4 py-3 font-sans text-sm text-foreground outline-none transition-shadow placeholder:text-muted-foreground/50 focus-visible:border-primary-blue/35 focus-visible:ring-2 focus-visible:ring-primary-blue/20"
            />
            <div
              className="mt-2 flex gap-1.5"
              role="status"
              aria-live="polite"
              aria-label="Password strength"
            >
              {[0, 1, 2, 3].map((i) => (
                <span
                  key={i}
                  className={`h-1 flex-1 rounded-full transition-colors ${
                    i < filled
                      ? "bg-primary-blue/70"
                      : "bg-primary-blue/[0.12]"
                  }`}
                />
              ))}
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-primary-blue px-6 py-3.5 font-sans text-sm font-semibold text-white transition-colors hover:bg-primary-blue/90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-blue disabled:pointer-events-none disabled:opacity-60"
          >
            {isSubmitting ? "Creating account…" : "Create account"}
          </button>
        </form>

        <p className="mt-6 font-sans text-sm text-muted-foreground">
          Already have an account?{" "}
          <Link
            href="/signin"
            className="font-medium text-primary-blue underline decoration-primary-blue/30 underline-offset-4 transition-colors hover:decoration-primary-blue"
          >
            Sign in
          </Link>
        </p>

        <p className="mt-8 font-sans text-sm text-muted-foreground">
          Prefer updates only for now?{" "}
          <Link
            href="/#get-started"
            className="font-medium text-primary-blue underline decoration-primary-blue/30 underline-offset-4 transition-colors hover:decoration-primary-blue"
          >
            Join the mailing list
          </Link>
        </p>

        <aside
          className="mt-10 border border-primary-blue/12 bg-blue-gray/40 p-4 sm:p-5"
          aria-label="Early access"
        >
          <div className="flex gap-3">
            <span
              className="flex h-9 w-9 shrink-0 items-center justify-center border border-primary-blue/20 bg-white font-serif text-lg font-light text-primary-blue"
              aria-hidden
            >
              i
            </span>
            <p className="font-sans text-[11px] font-medium uppercase leading-relaxed tracking-[0.14em] text-primary-blue/80 sm:text-xs">
              Early access onboarding. No credit card to reserve your place.
              We will email you when your workspace is ready—pricing and plans
              are shared with waitlist members first.
            </p>
          </div>
        </aside>
      </div>

      <aside
        className="relative flex flex-1 flex-col justify-between overflow-hidden bg-gradient-to-br from-blue-gray via-blue-gray to-primary-blue/[0.08] px-6 py-12 sm:px-10 lg:min-h-screen lg:max-w-[42%] lg:px-12 lg:py-16"
        aria-label="Why merchants choose calm operations"
      >
        <div className="pointer-events-none absolute inset-0" aria-hidden>
          <div className="absolute -right-8 top-1/4 h-64 w-64 rotate-12 rounded-3xl border border-primary-blue/[0.07] bg-white/30 shadow-sm" />
          <div className="absolute bottom-1/3 left-4 h-48 w-72 -rotate-6 rounded-3xl border border-primary-blue/[0.06] bg-primary-blue/[0.04]" />
          <div className="absolute right-12 top-12 h-32 w-40 rotate-[18deg] rounded-2xl bg-white/25" />
        </div>

        <div className="relative z-10 mx-auto w-full max-w-sm rounded-lg border border-white/60 bg-white/90 p-5 shadow-lg backdrop-blur-sm">
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-full border border-primary-blue/15 bg-blue-gray/50 text-primary-blue">
              <svg
                viewBox="0 0 24 24"
                className="h-5 w-5"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                aria-hidden
              >
                <path d="M4 10h16v10H4zM9 10V7a3 3 0 016 0v3" />
              </svg>
            </span>
            <p className="font-sans text-[10px] font-semibold uppercase tracking-[0.2em] text-primary-blue/75">
              Verified order capture
            </p>
          </div>
        </div>

        <blockquote className="relative z-10 mx-auto mt-12 max-w-sm lg:mt-0">
          <p className="font-serif text-xl font-light italic leading-snug text-primary-blue sm:text-2xl">
            &ldquo;The win is not more software—it is the quiet moment when you
            see every order in one list, and nothing slips through the
            chat.&rdquo;
          </p>
          <footer className="mt-8 flex items-center gap-3">
            <span
              className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-primary-blue/20 bg-primary-blue font-sans text-xs font-semibold text-white"
              aria-hidden
            >
              LM
            </span>
            <div>
              <p className="font-sans text-xs font-semibold uppercase tracking-[0.16em] text-primary-blue">
                Lindiwe Maseko
              </p>
              <p className="mt-0.5 font-sans text-[10px] font-medium uppercase tracking-[0.18em] text-muted-foreground">
                General store owner, Johannesburg
              </p>
            </div>
          </footer>
        </blockquote>

        <Link
          href="/"
          className="relative z-10 mt-10 font-sans text-sm font-medium text-primary-blue/80 underline decoration-primary-blue/25 underline-offset-4 transition-colors hover:text-primary-blue lg:mt-0"
        >
          ← Back to homepage
        </Link>
      </aside>

      <SignupVerifyModal
        open={verifyModal !== null}
        email={verifyModal?.email ?? ""}
        businessId={verifyModal?.businessId ?? ""}
        message={verifyModal?.message ?? ""}
        onClose={() => setVerifyModal(null)}
      />
    </div>
  );
}
