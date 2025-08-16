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

  const updateMaterialPrice = async (materialId: string, customPrice: number, region: string) => {
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

  // Get effective price (user custom or base price with regional multiplier)
  const getEffectiveMaterialPrice = (materialId: string, region: string) => {
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
    updateLaborRate,
    updateServicePrice,
    updateEquipmentRate,
    getEffectiveMaterialPrice
  };
};