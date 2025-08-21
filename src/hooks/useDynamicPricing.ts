import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useLocation } from 'react-router-dom';

export interface MaterialBasePrice {
  id: string;
  name: string;
  unit: string;
  price: number;
  category: string;
  description?: string;
}

export interface UserMaterialPrice {
  id: string;
  material_id: string;
  price: number;
  region: string;
}

export interface UserLaborOverride {
  id: string;
  labor_type_id: string;
  custom_rate: number;
  region: string;
}

export interface UserServiceOverride {
  id: string;
  service_id: string;
  custom_price: number;
  region: string;
}

export interface UserEquipmentOverride {
  id: string;
  equipment_id: string;
  custom_rate: number;
  region: string;
}

export interface RegionalMultiplier {
  id: string;
  region: string;
  multiplier: number;
}

// types/materials.ts (optional)

export type RebarVariant = {
  size: string;
  diameter_mm: number;
  unit_weight_kg_per_m: number;
  price_kes_per_m: number;
};

export type BlockVariant = {
  id: number;
  name: string;
  dimensions_m: { length: number; height: number; thickness: number };
  unit: string;
  price_kes: number;
};

export type DoorVariant = {
  type: string;
  sizes_m: string[];
  frame_options: string[];
  price_kes: Record<string, number>; // keyed by size label
};

export type WindowVariant = {
  glass_type: string;
  sizes_m: string[];
  frame_options: string[];
  price_kes: Record<string, number>;
};

export type MaterialBase = {
  id: string;
  name: string;
  unit?: string;
  price?: number;       // used by “simple” materials
  type?: any[];         // variant array for complex materials
};

export type UserMaterialOverride = {
  material_id: string;
  user_id: string;
  region: string;
  price?: number;       // for simple materials
  type?: any[];         // for complex materials (mirrors base.type with edits)
};


export const useDynamicPricing = () => {
  const { user, profile } = useAuth();
  const [materialBasePrices, setMaterialBasePrices] = useState<MaterialBasePrice[]>([]);
  const [userMaterialPrices, setUserMaterialPrices] = useState<UserMaterialPrice[]>([]);
  const [userLaborOverrides, setUserLaborOverrides] = useState<UserLaborOverride[]>([]);
  const location = useLocation();
  const [userServiceOverrides, setUserServiceOverrides] = useState<UserServiceOverride[]>([]);
  const [userEquipmentOverrides, setUserEquipmentOverrides] = useState<UserEquipmentOverride[]>([]);
  const [regionalMultipliers, setRegionalMultipliers] = useState<RegionalMultiplier[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchMaterialBasePrices = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('material_base_prices')
        .select('*')
        .order('name');
      
      if (error) throw error;
      setMaterialBasePrices(data || []);
    } catch (error) {
      console.error('Error fetching material base prices:', error);
    }
  }, []);

  const fetchRegionalMultipliers = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('regional_multipliers')
        .select('*')
        .order('region');
      
      if (error) throw error;
      setRegionalMultipliers(data || []);
    } catch (error) {
      console.error('Error fetching regional multipliers:', error);
    }
  }, []);

  const fetchUserOverrides = useCallback(async () => {
    if (!user) return;

    try {
      const userRegion = profile?.location || 'Nairobi';
      
      // Fetch all user override tables
      const [materialData, laborData, serviceData, equipmentData] = await Promise.all([
        supabase
          .from('user_material_prices')
          .select('*')
          .eq('user_id', user.id)
          .eq('region', userRegion),
        supabase
          .from('user_labor_overrides')
          .select('*')
          .eq('user_id', user.id)
          .eq('region', userRegion),
        supabase
          .from('user_service_overrides')
          .select('*')
          .eq('user_id', user.id)
          .eq('region', userRegion),
        supabase
          .from('user_equipment_overrides')
          .select('*')
          .eq('user_id', user.id)
          .eq('region', userRegion)
      ]);

      setUserMaterialPrices(materialData.data || []);
      setUserLaborOverrides(laborData.data || []);
      setUserServiceOverrides(serviceData.data || []);
      setUserEquipmentOverrides(equipmentData.data || []);
    } catch (error) {
      console.error('Error fetching user overrides:', error);
    }
  }, [user?.id, profile?.location]);

  const updateMaterialPrice = async (type: string, materialId: string, region:string, newData: any, index?: number) => {
    if (!user) return { error: 'User not authenticated' };

    try {

      const { data } = await supabase
      .from("material_base_prices")
      .select("type")
      .eq("id", materialId)
      .single();

    let updatedType = data.type;

    // Update correct item inside array
    console.log("Before update:", updatedType[index]);
    console.log("Incoming newData:", newData);

    if (Array.isArray(updatedType) && typeof index === "number") {
      const item = updatedType[index];

      if (typeof newData === "number") {
        // simple case → update just the price_kes value
        updatedType[index] = {
          ...item,
          price_kes: newData
        };
      } else if (typeof newData === "object" && newData !== null) {
        // nested case (doors/windows)
        updatedType[index] = {
          ...item,
          ...newData,
          price_kes: {
            ...item.price_kes,
            ...newData.price_kes
          }
        };
      }
    }
      const { error } = await supabase
        .from('user_material_prices')
        .upsert({
          material_id: materialId,
          user_id: user.id,
          region,
          price: 0,
          type: updatedType 
        },{
          onConflict: 'user_id, material_id,region'
        });

      if (!error) {
        await fetchUserOverrides();
      }

      return { error };
    } catch (error) {
      console.error('Error updating material price:', error);
      return { error };
    }
  };

  // utils/pricing.ts

function pickPriceFromVariant(
  variant: any,
  opts: { priceField?: "price_kes" | "price_kes_per_m"; sizeKey?: string }
): number {
  const { priceField, sizeKey } = opts || {};

  // Rebar: price_kes_per_m (number)
  if (priceField === "price_kes_per_m" && typeof variant?.price_kes_per_m === "number") {
    return variant.price_kes_per_m;
  }

  // Blocks/Bricks: price_kes (number)
  if (priceField === "price_kes" && typeof variant?.price_kes === "number") {
    return variant.price_kes;
  }

  // Doors/Windows: price_kes is an object keyed by size
  if (priceField === "price_kes" && sizeKey && variant?.price_kes && typeof variant.price_kes === "object") {
    const v = variant.price_kes[sizeKey];
    return typeof v === "number" ? v : 0;
  }

  return 0;
}


  const updateLaborRate = async (laborTypeId: string, customRate: number, region: string) => {
    if (!user) return { error: 'User not authenticated' };

    try {
      const rateInCents = Math.round(customRate );
      
      const { error } = await supabase
        .from('user_labor_overrides')
        .upsert({
          user_id: user.id,
          labor_type_id: laborTypeId,
          custom_rate: rateInCents,
          region
        });

      if (!error) {
        await fetchUserOverrides();
      }

      return { error };
    } catch (error) {
      console.error('Error updating labor rate:', error);
      return { error };
    }
  };

  const updateServicePrice = async (serviceId: string, customPrice: number, region: string) => {
    if (!user) return { error: 'User not authenticated' };

    try {
      const priceInCents = Math.round(customPrice );
      
      const { error } = await supabase
        .from('user_service_overrides')
        .upsert({
          user_id: user.id,
          service_id: serviceId,
          custom_price: priceInCents,
          region
        });

      if (!error) {
        await fetchUserOverrides();
      }

      return { error };
    } catch (error) {
      console.error('Error updating service price:', error);
      return { error };
    }
  };

  const updateEquipmentRate = async (equipmentId: string, customRate: number, region: string) => {
    if (!user) return { error: 'User not authenticated' };

    try {
      const rateInCents = Math.round(customRate);
      
      const { error } = await supabase
        .from('user_equipment_overrides')
        .upsert({
          user_id: user.id,
          equipment_id: equipmentId,
          custom_rate: rateInCents,
          region
        });

      if (!error) {
        await fetchUserOverrides();
      }

      return { error };
    } catch (error) {
      console.error('Error updating equipment rate:', error);
      return { error };
    }
  };

   const updateMaterialPriceSingle = async (materialId: string, customPrice: number, region: string) => {
    if (!user) return { error: 'User not authenticated' };

    try {
      const priceInCents = Math.round(customPrice );
      
      const { error } = await supabase
        .from('user_material_prices')
        .upsert({
          user_id: user.id,
          material_id: materialId,
          price: priceInCents,
          region
        },{
          onConflict: 'user_id, material_id,region'
        });

      if (!error) {
        await fetchUserOverrides();
      }

      return { error };
    } catch (error) {
      console.error('Error updating material price:', error);
      return { error };
    }
  };

const getEffectiveMaterialPrice = (
  materialId: string,
  region: string,
  userOverride: any,
  materialBasePrices: any[],
  regionalMultipliers: { region: string; multiplier: number }[]
) => {
  const baseMaterial = materialBasePrices.find(m => m.id === materialId);
  if (!baseMaterial) return null;

  const multiplier =
    regionalMultipliers.find(r => r.region === region)?.multiplier || 1;

  // 1️⃣ If user override exists → trust it fully
  if (userOverride) {
    return userOverride; // full object, including type array
  }

  // 2️⃣ Clone baseMaterial and apply multiplier
  const cloned = JSON.parse(JSON.stringify(baseMaterial));

  if (Array.isArray(cloned.type)) {
    cloned.type = cloned.type.map(item => {
      const updated = { ...item };
      if (typeof updated.price_kes === "number") {
        updated.price_kes = updated.price_kes * multiplier;
      }
      if (typeof updated.price_kes_per_m === "number") {
        updated.price_kes_per_m = updated.price_kes_per_m * multiplier;
      }
      if (updated.price_kes && typeof updated.price_kes === "object") {
        updated.price_kes = Object.fromEntries(
          Object.entries(updated.price_kes).map(([size, price]) => [
            size,
            (price as number) * multiplier,
          ])
        );
      }
      return updated;
    });
  } else if (typeof cloned.price_kes === "number") {
    cloned.price_kes = cloned.price_kes * multiplier;
  }

  return cloned;
};

const getEffectiveMaterialPriceSingle = (materialId: string, region: string) => {
    const userOverride = userMaterialPrices.find(
      p => p.material_id === materialId && p.region === region
    );
    
    if (userOverride) {
      return userOverride.price;
    }

    const basePrice = materialBasePrices.find(m => m.id === materialId)?.price || 0;
    const multiplier = regionalMultipliers.find(r => r.region === region)?.multiplier || 1;
    
    return (basePrice * multiplier);
  };

  useEffect(() => {
    const fetchData = async () => {
      if (!user) return;
      
      setLoading(true);
      await Promise.all([
        fetchMaterialBasePrices(),
        fetchRegionalMultipliers(),
        fetchUserOverrides()
      ]);
      setLoading(false);
    };
    
    fetchData();
    
  }, [user,profile, location.key]);

  return {
    materialBasePrices,
    userMaterialPrices,
    userLaborOverrides,
    userServiceOverrides,
    userEquipmentOverrides,
    regionalMultipliers,
    loading,
    updateMaterialPrice,
    updateMaterialPriceSingle,
    updateLaborRate,
    updateServicePrice,
    updateEquipmentRate,
    getEffectiveMaterialPrice,
    getEffectiveMaterialPriceSingle
  };
};