import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export interface EquipmentType {
  id: string;
  name: string;
  daily_rate: number;
  description?: string;
}

export interface AdditionalService {
  id: string;
  name: string;
  default_price: number;
  description?: string;
  category?: string;
}

export interface UserEquipmentRate {
  id: string;
  equipment_type_id: string;
  daily_rate: number;
}

export interface UserTransportRate {
  id: string;
  region: string;
  cost_per_km: number;
  base_cost: number;
}

export interface UserServiceRate {
  id: string;
  service_id: string;
  price: number;
}

export interface UserSubcontractorRate {
  id: string;
  service_id: string;
  price: number;
}

export interface UserMaterialPrice {
  id: string;
  material_id: string;
  price: number;
}

export const useUserSettings = () => {
  const { user } = useAuth();
  const [equipmentTypes, setEquipmentTypes] = useState<EquipmentType[]>([]);
  const [additionalServices, setAdditionalServices] = useState<AdditionalService[]>([]);
  const [equipmentRates, setEquipmentRates] = useState<UserEquipmentRate[]>([]);
  const [transportRates, setTransportRates] = useState<UserTransportRate[]>([]);
  const [serviceRates, setServiceRates] = useState<UserServiceRate[]>([]);
  const [subcontractorRates, setSubcontractorRates] = useState<UserSubcontractorRate[]>([]);
  const [materialPrices, setMaterialPrices] = useState<UserMaterialPrice[]>([]);
  const [loading, setLoading] = useState(false);
  const { profile } = useAuth();

  const fetchEquipmentTypes = useCallback(async () => {
    try {
      const { data } = await supabase.from('equipment_types').select('*').order('name');
      if (data) setEquipmentTypes(data);
    } catch (err) {
      console.error('Error fetching equipment types:', err);
    }
  }, []);

  const fetchAdditionalServices = useCallback(async () => {
    try {
      const { data } = await supabase.from('additional_services').select('*').order('name');
      if (data) setAdditionalServices(data);
    } catch (err) {
      console.error('Error fetching additional services:', err);
    }
  }, []);

  const fetchSubcontractors = useCallback(async () => {
    try {
      const { data } = await supabase.from('subcontractor_prices').select('*').order('name');
      if (data) setSubcontractorRates(data);
    } catch (err) {
      console.error('Error fetching subcontractors:', err);
    }
  }, []);

  const fetchUserRates = useCallback(async () => {
    if (!user) return;
    try {
      const [
        { data: equipmentData },
        { data: transportData },
        { data: serviceData },
        { data: subcontractorData },
        { data: materialData }
      ] = await Promise.all([
        supabase.from('user_equipment_rates').select('*').eq('user_id', user.id),
        supabase.from('user_transport_rates').select('*').eq('user_id', user.id),
        supabase.from('user_service_rates').select('*').eq('user_id', user.id),
        supabase.from('user_subcontractor_rates').select('*').eq('user_id', user.id),
        supabase.from('user_material_prices').select('*').eq('user_id', user.id)
      ]);

      setEquipmentRates(equipmentData || []);
      setTransportRates(transportData || []);
      setServiceRates(serviceData || []);
      setSubcontractorRates(subcontractorData || []);
      setMaterialPrices(materialData || []);
    } catch (err) {
      console.error('Error fetching user rates:', err);
    }
  }, [user?.id]);

  const updateEquipmentRate = async (equipmentTypeId: string, rate: number) => {
    if (!user) return { error: 'User not authenticated' };
    try {
      const { error } = await supabase.from('user_equipment_rates').upsert({
        user_id: user.id,
        equipment_type_id: equipmentTypeId,
        daily_rate: rate
      }, {
        onConflict: 'user_id,equipment_type_id'
      });
      if (!error) await fetchUserRates();
      return { error };
    } catch (err) {
      console.error('Error updating equipment rate:', err);
      return { error: err };
    }
  };

  const updateTransportRate = async (region: string, costPerKm: number, baseCost: number) => {
    if (!user) return { error: 'User not authenticated' };
    try {
      const { error } = await supabase.from('user_transport_rates').upsert({
        user_id: user.id,
        region,
        cost_per_km: costPerKm,
        base_cost: baseCost
      }, {
        onConflict: 'user_id,region'
      });
      if (!error) await fetchUserRates();
      return { error };
    } catch (err) {
      console.error('Error updating transport rate:', err);
      return { error: err };
    }
  };

  const updateServiceRate = async (serviceId: string, price: number) => {
    if (!user) return { error: 'User not authenticated' };
    try {
      const { error } = await supabase.from('user_service_rates').upsert({
        user_id: user.id,
        service_id: serviceId,
        price
      }, {
        onConflict: 'user_id,service_id'
      });
      if (!error) await fetchUserRates();
      return { error };
    } catch (err) {
      console.error('Error updating service rate:', err);
      return { error: err };
    }
  };

  const updateSubcontractorRate = async (serviceId: string, price: number) => {
    if (!user) return { error: 'User not authenticated' };
    try {
      const { error } = await supabase.from('user_subcontractor_rates').upsert({
        user_id: user.id,
        service_id: serviceId,
        price
      }, {
        onConflict: 'user_id,service_id'
      });
      if (!error) await fetchUserRates();
      return { error };
    } catch (err) {
      console.error('Error updating subcontractor rate:', err);
      return { error: err };
    }
  };

  const updateMaterialPrice = async (materialId: string, price: number) => {
    if (!user) return { error: 'User not authenticated' };
    try {
      const region = profile.location;
      const { error } = await supabase.from('user_material_prices').upsert({
        user_id: user.id,
        material_id: materialId,
        region,
        price
      }, {
        onConflict: 'user_id,material_id, region'
      });
      if (!error) await fetchUserRates();
      return { error };
    } catch (err) {
      console.error('Error updating material price:', err);
      return { error: err };
    }
  };

  const updateOverallProfitMargin = async (margin: number) => {
    if (!user) return { error: 'User not authenticated' };
    try {
      const { error } = await supabase.from('profiles').upsert({
        id: user.id,
        overall_profit_margin: margin
      }, {
        onConflict: 'id'
      });
      return { error };
    } catch (err) {
      console.error('Error updating overall profit margin:', err);
      return { error: err };
    }
  };

  useEffect(() => {
    if (!user) return;
    setLoading(true);
    Promise.allSettled([
      fetchEquipmentTypes(),
      fetchAdditionalServices(),
      fetchSubcontractors(),
      fetchUserRates()
    ]).finally(() => setLoading(false));
  }, [fetchEquipmentTypes, fetchAdditionalServices, fetchSubcontractors, fetchUserRates]);

  return {
    equipmentTypes,
    additionalServices,
    equipmentRates,
    transportRates,
    serviceRates,
    subcontractorRates,
    materialPrices,
    loading,
    updateEquipmentRate,
    updateTransportRate,
    updateServiceRate,
    updateSubcontractorRate,
    updateMaterialPrice,
    updateOverallProfitMargin
  };
};
