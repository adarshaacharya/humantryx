import { HeroSection } from "@/modules/landing/hero-section";
import { FeaturesSection } from "@/modules/landing/features-section";
import { AISection } from "@/modules/landing/ai-section";
import { BenefitsSection } from "@/modules/landing/benefits-section";
import { CTASection } from "@/modules/landing/cta-section";
import { Navigation } from "@/modules/landing/navigation";

export default function Home() {
  return (
    <div className="bg-background min-h-screen">
      <Navigation />
      <main>
        <HeroSection />
        <FeaturesSection />
        <AISection />
        <BenefitsSection />
        <CTASection />
      </main>
    </div>
  );
}
