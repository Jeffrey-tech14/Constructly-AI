// © 2025 Jeff. All rights reserved.
// Unauthorized copying, distribution, or modification of this file is strictly prohibited.

import PublicLayout from "@/components/PublicLayout";
import FeaturesSection from "@/components/sections/FeaturesSection";

const Features = () => {
  const scrollTo = (id: string) => {
    // Dummy function
  };

  return (
    <PublicLayout>
      <FeaturesSection scrollTo={scrollTo} />
    </PublicLayout>
  );
};

export default Features;