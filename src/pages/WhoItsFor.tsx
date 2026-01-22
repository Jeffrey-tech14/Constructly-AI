// © 2025 Jeff. All rights reserved.
// Unauthorized copying, distribution, or modification of this file is strictly prohibited.

import PublicLayout from "@/components/PublicLayout";
import WhoItsForSection from "@/components/sections/WhoItsForSection";

const WhoItsFor = () => {
  const scrollTo = (id: string) => {
    // Dummy function since no scrolling
  };

  return (
    <PublicLayout>
      <WhoItsForSection scrollTo={scrollTo} />
    </PublicLayout>
  );
};

export default WhoItsFor;