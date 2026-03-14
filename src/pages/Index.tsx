// src/pages/Index.tsx
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useTheme } from "@/contexts/ThemeContext";
import { supabase } from "@/integrations/supabase/client";
import Hero from "@/components/Hero";
import TrustedCompaniesMarquee from "@/components/sections/TrustedCompaniesMarquee";
import WhoItsForSection from "@/components/sections/WhoItsForSection";
import TestimonialsSection from "@/components/sections/TestimonialsSection";
import PricingSection from "@/components/sections/PricingSection";    
import PublicLayout from "@/components/PublicLayout";

const Index = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [demoOpen, setDemoOpen] = useState(false);

  // Smooth scroll helper
  const scrollTo = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  return (
    <PublicLayout>
      <style>{`
        .video-container {
          position: relative;
          padding-bottom: 56.25%;
          height: 0;
          overflow: hidden;
          border-radius: 0.75rem;
          border: 1px solid #e5e7eb;
        }
        .video-container video {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          object-fit: contain;
          background-color: #000;
        }

        @media (max-width: 640px) {
          html {
            font-size: 15px;
          }
        }
      `}</style>

      {/* Hero Section */}
      <Hero scrollTo={scrollTo} demoOpen={demoOpen} setDemoOpen={setDemoOpen} />

      {/* Trusted Companies Marquee */}
      <TrustedCompaniesMarquee />

      {/* Who It's For Section */}
      <WhoItsForSection scrollTo={scrollTo} />

      {/* Testimonials Section */}
      <TestimonialsSection />

      {/* Pricing Section */}
      <PricingSection />
    </PublicLayout>
  );
};

export default Index;
