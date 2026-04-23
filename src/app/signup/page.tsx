import type { Metadata } from "next";
import { SignupForm } from "@/app/signup/components/signup-form";
import StickyNavbar from "@/components/landing/sticky-navbar";

export const metadata: Metadata = {
  title: "Create account | SME Operations",
  description:
    "Start onboarding for SME Operations—WhatsApp-native order capture and calmer retail workflows.",
};

export default function SignupPage() {
  return (
    <main className="min-h-screen bg-background font-sans text-foreground">
      <StickyNavbar variant="surface" />
      <SignupForm />
    </main>
  );
}
