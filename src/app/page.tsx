import { HeroSection } from "@/modules/landing/hero-section";
import { FeaturesSection } from "@/modules/landing/features-section";
import { AISection } from "@/modules/landing/ai-section";
import { StatsSection } from "@/modules/landing/stats-section";
import { CTASection } from "@/modules/landing/cta-section";
import { Navigation } from "@/modules/landing/navigation";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 dark:from-slate-950 dark:via-slate-900 dark:to-slate-800">
      <Navigation />
      <main>
        <HeroSection />
        <FeaturesSection />
        <AISection />
        <StatsSection />
        <CTASection />
      </main>
    </div>
  );
}
