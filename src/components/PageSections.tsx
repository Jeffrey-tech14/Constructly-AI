// src/components/PageSections.tsx
import WhoItsForSection from "./sections/WhoItsForSection";
import HowItWorks from "./sections/HowItWorks";
import FeaturesSection from "./sections/FeaturesSection";
import PricingSection from "./sections/PricingSection";
import PaymentOptionsSection from "./sections/PaymentOptionsSection";
import TestimonialsSection from "./sections/TestimonialsSection";
import FaqSection from "./sections/FaqSection";
import CTABanner from "./sections/CTABanner";

interface PageSectionsProps {
  tiers?: any[];
  tiersLoading?: boolean;
  tiersError?: string | null;
  scrollTo: (id: string) => void; // ✅ Required for scroll functionality
}

export const PageSections = ({ 
  tiers, 
  tiersLoading, 
  tiersError,
  scrollTo // ✅ Destructured
}: PageSectionsProps) => {
  return (
    <>
      {/* ✅ Pass scrollTo to WhoItsForSection so its buttons work */}
      <WhoItsForSection scrollTo={scrollTo} />
      
      {/* HowItWorks is a scroll target (id="how-it-works"), no prop needed */}
      <HowItWorks />
      
      {/* ✅ Pass scrollTo to FeaturesSection for its buttons */}
      <FeaturesSection scrollTo={scrollTo} />
      
      <PricingSection
        tiers={tiers}
        tiersLoading={tiersLoading}
        tiersError={tiersError}
      />
      
      <PaymentOptionsSection />
      <TestimonialsSection />
      
      {/* FaqSection should have id="faq" — assumed correct */}
      <FaqSection />
    </>
  );
};

export default PageSections;