
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export interface EquipmentType {
  id: string;
  name: string;
  daily_rate: number;
  description?: string;
  unit: string;
  created_at: string;
}

export interface UserEquipmentRate {
  id: string;
  equipment_type_id: string;
  daily_rate: number;
  user_id: string;
  created_at: string;
  updated_at: string;
}

export interface UserTransportRate {
  id: string;
  region: string;
  cost_per_km: number;
  base_cost: number;
  user_id: string;
  created_at: string;
  updated_at: string;
}

export interface AdditionalService {
  id: string;
  name: string;
  default_price: number;
  description?: string;
  category: string;
  unit: string;
  created_at: string;
}

export interface UserServiceRate {
  id: string;
  service_id: string;
  price: number;
  user_id: string;
  created_at: string;
  updated_at: string;
}

export const useUserSettings = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [equipmentTypes, setEquipmentTypes] = useState<EquipmentType[]>([]);
  const [equipmentRates, setEquipmentRates] = useState<UserEquipmentRate[]>([]);
  const [transportRates, setTransportRates] = useState<UserTransportRate[]>([]);
  const [additionalServices, setAdditionalServices] = useState<AdditionalService[]>([]);
  const [serviceRates, setServiceRates] = useState<UserServiceRate[]>([]);

  const fetchSettings = async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      
      // Fetch equipment types
      const { data: equipment, error: equipmentError } = await supabase
        .from('equipment_types')
        .select('*')
        .order('name');

      if (equipmentError) {
        console.error('Error fetching equipment types:', equipmentError);
      } else {
        setEquipmentTypes(equipment || []);
      }

      // Fetch user equipment rates
      const { data: userEquipment, error: userEquipmentError } = await supabase
        .from('user_equipment_rates')
        .select('*')
        .eq('user_id', user.id);

      if (userEquipmentError) {
        console.error('Error fetching user equipment rates:', userEquipmentError);
      } else {
        setEquipmentRates(userEquipment || []);
      }

      // Fetch user transport rates
      const { data: transport, error: transportError } = await supabase
        .from('user_transport_rates')
        .select('*')
        .eq('user_id', user.id)
        .order('region');

      if (transportError) {
        console.error('Error fetching transport rates:', transportError);
      } else {
        setTransportRates(transport || []);
      }

      // Fetch additional services
      const { data: services, error: servicesError } = await supabase
        .from('additional_services')
        .select('*')
        .order('category', { ascending: true })
        .order('name', { ascending: true });

      if (servicesError) {
        console.error('Error fetching additional services:', servicesError);
      } else {
        setAdditionalServices(services || []);
      }

      // Fetch user service rates
      const { data: userServices, error: userServicesError } = await supabase
        .from('user_service_rates')
        .select('*')
        .eq('user_id', user.id);

      if (userServicesError) {
        console.error('Error fetching user service rates:', userServicesError);
      } else {
        setServiceRates(userServices || []);
      }
      
    } catch (error) {
      console.error('Error fetching user settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateEquipmentRate = async (equipmentTypeId: string, dailyRate: number) => {
    if (!user) return { error: new Error('User not authenticated') };
    
    try {
      // Check if rate exists, update or insert
      const existingRate = equipmentRates.find(r => r.equipment_type_id === equipmentTypeId);
      
      if (existingRate) {
        const { error } = await supabase
          .from('user_equipment_rates')
          .update({ daily_rate: dailyRate * 100 }) // Convert to cents
          .eq('id', existingRate.id);

        if (!error) {
          setEquipmentRates(prev => prev.map(rate => 
            rate.id === existingRate.id 
              ? { ...rate, daily_rate: dailyRate * 100 }
              : rate
          ));
        }
        
        return { error };
      } else {
        const { data, error } = await supabase
          .from('user_equipment_rates')
          .insert([{
            user_id: user.id,
            equipment_type_id: equipmentTypeId,
            daily_rate: dailyRate * 100
          }])
          .select()
          .single();

        if (!error && data) {
          setEquipmentRates(prev => [...prev, data]);
        }
        
        return { error };
      }
    } catch (error) {
      return { error };
    }
  };

  const updateTransportRate = async (region: string, costPerKm: number, baseCost: number) => {
    if (!user) return { error: new Error('User not authenticated') };
    
    try {
      const existingRate = transportRates.find(r => r.region === region);
      
      if (existingRate) {
        const { error } = await supabase
          .from('user_transport_rates')
          .update({ 
            cost_per_km: costPerKm * 100, 
            base_cost: baseCost * 100 
          })
          .eq('id', existingRate.id);

        if (!error) {
          setTransportRates(prev => prev.map(rate => 
            rate.id === existingRate.id 
              ? { ...rate, cost_per_km: costPerKm * 100, base_cost: baseCost * 100 }
              : rate
          ));
        }
        
        return { error };
      } else {
        const { data, error } = await supabase
          .from('user_transport_rates')
          .insert([{
            user_id: user.id,
            region,
            cost_per_km: costPerKm * 100,
            base_cost: baseCost * 100
          }])
          .select()
          .single();

        if (!error && data) {
          setTransportRates(prev => [...prev, data]);
        }
        
        return { error };
      }
    } catch (error) {
      return { error };
    }
  };

  const updateServiceRate = async (serviceId: string, price: number) => {
    if (!user) return { error: new Error('User not authenticated') };
    
    try {
      const existingRate = serviceRates.find(r => r.service_id === serviceId);
      
      if (existingRate) {
        const { error } = await supabase
          .from('user_service_rates')
          .update({ price: price * 100 })
          .eq('id', existingRate.id);

        if (!error) {
          setServiceRates(prev => prev.map(rate => 
            rate.id === existingRate.id 
              ? { ...rate, price: price * 100 }
              : rate
          ));
        }
        
        return { error };
      } else {
        const { data, error } = await supabase
          .from('user_service_rates')
          .insert([{
            user_id: user.id,
            service_id: serviceId,
            price: price * 100
          }])
          .select()
          .single();

        if (!error && data) {
          setServiceRates(prev => [...prev, data]);
        }
        
        return { error };
      }
    } catch (error) {
      return { error };
    }
  };

  const updateOverallProfitMargin = async (margin: number) => {
    if (!user) return { error: new Error('User not authenticated') };
    
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ overall_profit_margin: margin })
        .eq('id', user.id);
      
      return { error };
    } catch (error) {
      return { error };
    }
  };

  useEffect(() => {
    fetchSettings();
  }, [user]);

  return {
    loading,
    equipmentTypes,
    equipmentRates,
    transportRates,
    additionalServices,
    serviceRates,
    updateEquipmentRate,
    updateTransportRate,
    updateServiceRate,
    updateOverallProfitMargin,
    refetch: fetchSettings
  };
};
