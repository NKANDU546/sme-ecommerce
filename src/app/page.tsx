import { GetStartedSection } from "@/components/landing/get-started-section";

import { MerchantPhilosophySection } from "@/components/landing/merchant-philosophy-section";
import HeroSection from "@/components/landing/hero-section";
import HowItWorksSection from "@/components/landing/how-it-works-section";
export default function Home() {
  return (
    <div className="flex min-h-full flex-col bg-background font-sans text-foreground">
      <main className="flex-1">
        <HeroSection />
        <HowItWorksSection />
        <MerchantPhilosophySection />
        <GetStartedSection />
      </main>
    </div>
  );
}
