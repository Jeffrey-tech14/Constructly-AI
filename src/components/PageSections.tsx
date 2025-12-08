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
  // ✅ Removed 'navigate' – each section handles routing internally if needed
}

export const PageSections = ({ 
  tiers, 
  tiersLoading, 
  tiersError 
}: PageSectionsProps) => {
  return (
    <>
      <WhoItsForSection />
      <HowItWorks />
      <FeaturesSection />
      <PricingSection
        tiers={tiers}
        tiersLoading={tiersLoading}
        tiersError={tiersError}
        // ⚠️ If PricingSection still uses 'navigate' as a prop, 
        //    refactor it to use 'useNavigate()' internally as well.
      />
      <PaymentOptionsSection />
      <TestimonialsSection />
      <FaqSection />
      <CTABanner /> {/* ✅ No props needed */}
    </>
  );
};