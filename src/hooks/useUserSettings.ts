
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

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

export const useUserSettings = () => {
  const [equipmentTypes, setEquipmentTypes] = useState<EquipmentType[]>([]);
  const [additionalServices, setAdditionalServices] = useState<AdditionalService[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchEquipmentTypes = async () => {
    try {
      // Since equipment_types table doesn't exist, let's provide mock data
      // or fetch from an existing table that might contain this data
      const mockEquipment: EquipmentType[] = [
        { id: '1', name: 'Excavator', daily_rate: 15000000, description: 'Heavy duty excavator' },
        { id: '2', name: 'Concrete Mixer', daily_rate: 8000000, description: 'Portable concrete mixer' },
        { id: '3', name: 'Crane', daily_rate: 25000000, description: 'Mobile crane' },
        { id: '4', name: 'Bulldozer', daily_rate: 20000000, description: 'Track bulldozer' }
      ];
      
      setEquipmentTypes(mockEquipment);
    } catch (error) {
      console.error('Error fetching equipment types:', error);
      setEquipmentTypes([]);
    }
  };

  const fetchAdditionalServices = async () => {
    try {
      // Since additional_services table doesn't exist, let's provide mock data
      const mockServices: AdditionalService[] = [
        { id: '1', name: 'Site Survey', default_price: 5000000, description: 'Professional site survey', category: 'Planning' },
        { id: '2', name: 'Soil Testing', default_price: 3000000, description: 'Soil composition analysis', category: 'Testing' },
        { id: '3', name: 'Architectural Design', default_price: 15000000, description: 'Complete architectural design', category: 'Design' },
        { id: '4', name: 'Structural Engineering', default_price: 10000000, description: 'Structural engineering services', category: 'Engineering' },
        { id: '5', name: 'Electrical Installation', default_price: 8000000, description: 'Complete electrical installation', category: 'Installation' },
        { id: '6', name: 'Plumbing Installation', default_price: 6000000, description: 'Complete plumbing installation', category: 'Installation' }
      ];
      
      setAdditionalServices(mockServices);
    } catch (error) {
      console.error('Error fetching additional services:', error);
      setAdditionalServices([]);
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      await Promise.all([
        fetchEquipmentTypes(),
        fetchAdditionalServices()
      ]);
      setLoading(false);
    };
    
    fetchData();
  }, []);

  return {
    equipmentTypes,
    additionalServices,
    loading
  };
};
