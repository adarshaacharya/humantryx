import { HeroSection } from "@/components/landing/hero-section";
import { FeaturesSection } from "@/components/landing/features-section";
import { AISection } from "@/components/landing/ai-section";
import { StatsSection } from "@/components/landing/stats-section";
import { CTASection } from "@/components/landing/cta-section";
import { Navigation } from "@/components/landing/navigation";

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
