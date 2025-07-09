
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

export const useUserSettings = () => {
  const { user, profile } = useAuth();
  const [equipmentTypes, setEquipmentTypes] = useState<EquipmentType[]>([]);
  const [additionalServices, setAdditionalServices] = useState<AdditionalService[]>([]);
  const [equipmentRates, setEquipmentRates] = useState<UserEquipmentRate[]>([]);
  const [transportRates, setTransportRates] = useState<UserTransportRate[]>([]);
  const [serviceRates, setServiceRates] = useState<UserServiceRate[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchEquipmentTypes = useCallback(async () => {
    try {
      const { data } = await supabase
        .from('equipment_types')
        .select('*')
        .order('name');
      
      if (data && data.length > 0) {
        setEquipmentTypes(data);
      } else {
        // Fallback to mock data if no data in database
        const mockEquipment: EquipmentType[] = [
          { id: '1', name: 'Excavator', daily_rate: 15000000, description: 'Heavy duty excavator' },
          { id: '2', name: 'Concrete Mixer', daily_rate: 8000000, description: 'Portable concrete mixer' },
          { id: '3', name: 'Crane', daily_rate: 25000000, description: 'Mobile crane' },
          { id: '4', name: 'Bulldozer', daily_rate: 20000000, description: 'Track bulldozer' }
        ];
        setEquipmentTypes(mockEquipment);
      }
    } catch (error) {
      console.error('Error fetching equipment types:', error);
      // Fallback to mock data
      const mockEquipment: EquipmentType[] = [
        { id: '1', name: 'Excavator', daily_rate: 15000000, description: 'Heavy duty excavator' },
        { id: '2', name: 'Concrete Mixer', daily_rate: 8000000, description: 'Portable concrete mixer' },
        { id: '3', name: 'Crane', daily_rate: 25000000, description: 'Mobile crane' },
        { id: '4', name: 'Bulldozer', daily_rate: 20000000, description: 'Track bulldozer' }
      ];
      setEquipmentTypes(mockEquipment);
    }
  }, []);

  const fetchAdditionalServices = useCallback(async () => {
    try {
      const { data } = await supabase
        .from('additional_services')
        .select('*')
        .order('name');
      
      if (data && data.length > 0) {
        setAdditionalServices(data);
      } else {
        // Fallback to mock data
        const mockServices: AdditionalService[] = [
          { id: '1', name: 'Site Survey', default_price: 5000000, description: 'Professional site survey', category: 'Planning' },
          { id: '2', name: 'Soil Testing', default_price: 3000000, description: 'Soil composition analysis', category: 'Testing' },
          { id: '3', name: 'Architectural Design', default_price: 15000000, description: 'Complete architectural design', category: 'Design' },
          { id: '4', name: 'Structural Engineering', default_price: 10000000, description: 'Structural engineering services', category: 'Engineering' },
          { id: '5', name: 'Electrical Installation', default_price: 8000000, description: 'Complete electrical installation', category: 'Installation' },
          { id: '6', name: 'Plumbing Installation', default_price: 6000000, description: 'Complete plumbing installation', category: 'Installation' }
        ];
        setAdditionalServices(mockServices);
      }
    } catch (error) {
      console.error('Error fetching additional services:', error);
      // Fallback to mock data
      const mockServices: AdditionalService[] = [
        { id: '1', name: 'Site Survey', default_price: 5000000, description: 'Professional site survey', category: 'Planning' },
        { id: '2', name: 'Soil Testing', default_price: 3000000, description: 'Soil composition analysis', category: 'Testing' },
        { id: '3', name: 'Architectural Design', default_price: 15000000, description: 'Complete architectural design', category: 'Design' },
        { id: '4', name: 'Structural Engineering', default_price: 10000000, description: 'Structural engineering services', category: 'Engineering' },
        { id: '5', name: 'Electrical Installation', default_price: 8000000, description: 'Complete electrical installation', category: 'Installation' },
        { id: '6', name: 'Plumbing Installation', default_price: 6000000, description: 'Complete plumbing installation', category: 'Installation' }
      ];
      setAdditionalServices(mockServices);
    }
  }, []);

  const fetchUserRates = useCallback(async () => {
    if (!user) return;

    try {
      // Fetch user equipment rates
      const { data: equipmentData } = await supabase
        .from('user_equipment_rates')
        .select('*')
        .eq('user_id', user.id);
      
      setEquipmentRates(equipmentData || []);

      // Fetch user transport rates
      const { data: transportData } = await supabase
        .from('user_transport_rates')
        .select('*')
        .eq('user_id', user.id);
      
      setTransportRates(transportData || []);

      // Fetch user service rates
      const { data: serviceData } = await supabase
        .from('user_service_rates')
        .select('*')
        .eq('user_id', user.id);
      
      setServiceRates(serviceData || []);
    } catch (error) {
      console.error('Error fetching user rates:', error);
    }
  }, [user?.id]);

  const updateEquipmentRate = async (equipmentTypeId: string, rate: number) => {
    if (!user) return { error: 'User not authenticated' };

    try {
      const rateInCents = Math.round(rate * 100);
      
      const { error } = await supabase
        .from('user_equipment_rates')
        .upsert({
          user_id: user.id,
          equipment_type_id: equipmentTypeId,
          daily_rate: rateInCents
        });

      if (!error) {
        await fetchUserRates();
      }

      return { error };
    } catch (error) {
      console.error('Error updating equipment rate:', error);
      return { error };
    }
  };

  const updateTransportRate = async (region: string, costPerKm: number, baseCost: number) => {
    if (!user) return { error: 'User not authenticated' };

    try {
      const costPerKmInCents = Math.round(costPerKm * 100);
      const baseCostInCents = Math.round(baseCost * 100);
      
      const { error } = await supabase
        .from('user_transport_rates')
        .upsert({
          user_id: user.id,
          region,
          cost_per_km: costPerKmInCents,
          base_cost: baseCostInCents
        });

      if (!error) {
        await fetchUserRates();
      }

      return { error };
    } catch (error) {
      console.error('Error updating transport rate:', error);
      return { error };
    }
  };

  const updateServiceRate = async (serviceId: string, price: number) => {
    if (!user) return { error: 'User not authenticated' };

    try {
      const priceInCents = Math.round(price * 100);
      
      const { error } = await supabase
        .from('user_service_rates')
        .upsert({
          user_id: user.id,
          service_id: serviceId,
          price: priceInCents
        });

      if (!error) {
        await fetchUserRates();
      }

      return { error };
    } catch (error) {
      console.error('Error updating service rate:', error);
      return { error };
    }
  };

  const updateOverallProfitMargin = async (margin: number) => {
    if (!user) return { error: 'User not authenticated' };

    try {
      const { error } = await supabase
        .from('profiles')
        .update({ overall_profit_margin: margin })
        .eq('id', user.id);

      return { error };
    } catch (error) {
      console.error('Error updating overall profit margin:', error);
      return { error };
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      if (!user) return;
      
      setLoading(true);
      await Promise.all([
        fetchEquipmentTypes(),
        fetchAdditionalServices(),
        fetchUserRates()
      ]);
      setLoading(false);
    };
    
    fetchData();
  }, [fetchEquipmentTypes, fetchAdditionalServices, fetchUserRates]);

  return {
    equipmentTypes,
    additionalServices,
    equipmentRates,
    transportRates,
    serviceRates,
    loading,
    updateEquipmentRate,
    updateTransportRate,
    updateServiceRate,
    updateOverallProfitMargin
  };
};
