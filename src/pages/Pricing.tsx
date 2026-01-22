// © 2025 Jeff. All rights reserved.
// Unauthorized copying, distribution, or modification of this file is strictly prohibited.

import { useEffect, useState } from "react";
import PublicLayout from "@/components/PublicLayout";
import PricingSection from "@/components/sections/PricingSection";
import { supabase } from "@/integrations/supabase/client";

const Pricing = () => {
  const [tiers, setTiers] = useState([]);
  const [tiersLoading, setTiersLoading] = useState(true);
  const [tiersError, setTiersError] = useState(null);

  useEffect(() => {
    let cancelled = false;
    const fetchTiers = async () => {
      setTiersLoading(true);
      setTiersError(null);
      const { data, error } = await supabase
        .from("tiers")
        .select("*")
        .order("id", { ascending: true });

      if (!cancelled) {
        if (error) {
          setTiersError(error.message);
        } else {
          setTiers(data || []);
        }
        setTiersLoading(false);
      }
    };

    fetchTiers();

    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <PublicLayout>
      <PricingSection
        tiers={tiers}
        tiersLoading={tiersLoading}
        tiersError={tiersError}
      />
    </PublicLayout>
  );
};

export default Pricing;