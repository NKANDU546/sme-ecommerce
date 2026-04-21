import type { Metadata } from "next";
import { SigninForm } from "@/app/signin/components/signin-form";
import StickyNavbar from "@/components/landing/sticky-navbar";

export const metadata: Metadata = {
  title: "Sign in | SME Operations",
  description:
    "Sign in to SME Operations—manage WhatsApp orders and your merchant workspace.",
};

export default function SigninPage() {
  return (
    <main className="min-h-screen bg-background font-sans text-foreground">
      <StickyNavbar variant="surface" />
      <SigninForm />
    </main>
  );
}
