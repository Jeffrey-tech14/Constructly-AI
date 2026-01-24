// © 2025 Jeff. All rights reserved.
// Unauthorized copying, distribution, or modification of this file is strictly prohibited.

import React from "react";
import NavbarSection from "@/components/sections/NavbarSection";
import CTABanner from "@/components/sections/CTABanner";
import PageFooter from "@/components/PageFooter";

interface PublicLayoutProps {
  children: React.ReactNode;
}

const PublicLayout: React.FC<PublicLayoutProps> = ({ children }) => {
  // Since no scrolling, pass dummy scrollTo
  const scrollTo = (sectionId: string) => {
    // No-op for now
  };

  const setDemoOpen = (open: boolean) => {
    // No-op
  };

  return (
    <div className="min-h-screen">
      <NavbarSection scrollTo={scrollTo} setDemoOpen={setDemoOpen} />
      {children}
      <CTABanner scrollTo={scrollTo} />
      <PageFooter scrollTo={scrollTo} />
    </div>
  );
};

export default PublicLayout;
