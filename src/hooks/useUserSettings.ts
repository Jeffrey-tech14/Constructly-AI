
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export interface MaterialCategory {
  id: string;
  name: string;
  description?: string;
}

export interface UserProfitMargin {
  id: string;
  category_id: string;
  profit_percentage: number;
  category_name?: string;
}

export interface EquipmentType {
  id: string;
  name: string;
  daily_rate: number;
  description?: string;
}

export interface UserEquipmentRate {
  id: string;
  equipment_type_id: string;
  daily_rate: number;
  equipment_name?: string;
}

export interface UserTransportRate {
  id: string;
  region: string;
  cost_per_km: number;
  base_cost: number;
}

export interface AdditionalService {
  id: string;
  name: string;
  default_price: number;
  description?: string;
  category: string;
}

export interface UserServiceRate {
  id: string;
  service_id: string;
  price: number;
  service_name?: string;
}

export interface LaborSetting {
  id: string;
  labor_percentage_of_materials: number;
}

export const useUserSettings = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [materialCategories, setMaterialCategories] = useState<MaterialCategory[]>([]);
  const [profitMargins, setProfitMargins] = useState<UserProfitMargin[]>([]);
  const [equipmentTypes, setEquipmentTypes] = useState<EquipmentType[]>([]);
  const [equipmentRates, setEquipmentRates] = useState<UserEquipmentRate[]>([]);
  const [transportRates, setTransportRates] = useState<UserTransportRate[]>([]);
  const [additionalServices, setAdditionalServices] = useState<AdditionalService[]>([]);
  const [serviceRates, setServiceRates] = useState<UserServiceRate[]>([]);
  const [laborSettings, setLaborSettings] = useState<LaborSetting | null>(null);

  const fetchSettings = async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      
      // Fetch material categories
      const { data: categories } = await supabase
        .from('material_categories')
        .select('*')
        .order('name');

      // Fetch user profit margins
      const { data: margins } = await supabase
        .from('user_profit_margins')
        .select(`
          *,
          material_categories!inner(name)
        `)
        .eq('user_id', user.id);

      // Fetch equipment types
      const { data: equipment } = await supabase
        .from('equipment_types')
        .select('*')
        .order('name');

      // Fetch user equipment rates
      const { data: userEquipment } = await supabase
        .from('user_equipment_rates')
        .select(`
          *,
          equipment_types!inner(name)
        `)
        .eq('user_id', user.id);

      // Fetch user transport rates
      const { data: transport } = await supabase
        .from('user_transport_rates')
        .select('*')
        .eq('user_id', user.id)
        .order('region');

      // Fetch additional services
      const { data: services } = await supabase
        .from('additional_services')
        .select('*')
        .order('category', { ascending: true })
        .order('name', { ascending: true });

      // Fetch user service rates
      const { data: userServices } = await supabase
        .from('user_service_rates')
        .select(`
          *,
          additional_services!inner(name)
        `)
        .eq('user_id', user.id);

      // Fetch labor settings
      const { data: labor } = await supabase
        .from('labor_settings')
        .select('*')
        .eq('user_id', user.id)
        .single();

      setMaterialCategories(categories || []);
      setProfitMargins((margins || []).map(m => ({
        ...m,
        category_name: m.material_categories?.name
      })));
      setEquipmentTypes(equipment || []);
      setEquipmentRates((userEquipment || []).map(e => ({
        ...e,
        equipment_name: e.equipment_types?.name
      })));
      setTransportRates(transport || []);
      setAdditionalServices(services || []);
      setServiceRates((userServices || []).map(s => ({
        ...s,
        service_name: s.additional_services?.name
      })));
      setLaborSettings(labor);
      
    } catch (error) {
      console.error('Error fetching user settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateProfitMargin = async (categoryId: string, percentage: number) => {
    if (!user) return;
    
    const { error } = await supabase
      .from('user_profit_margins')
      .update({ profit_percentage: percentage })
      .eq('user_id', user.id)
      .eq('category_id', categoryId);

    if (!error) {
      setProfitMargins(prev => prev.map(margin => 
        margin.category_id === categoryId 
          ? { ...margin, profit_percentage: percentage }
          : margin
      ));
    }
    
    return { error };
  };

  const updateEquipmentRate = async (equipmentTypeId: string, dailyRate: number) => {
    if (!user) return;
    
    const { error } = await supabase
      .from('user_equipment_rates')
      .update({ daily_rate: dailyRate })
      .eq('user_id', user.id)
      .eq('equipment_type_id', equipmentTypeId);

    if (!error) {
      setEquipmentRates(prev => prev.map(rate => 
        rate.equipment_type_id === equipmentTypeId 
          ? { ...rate, daily_rate: dailyRate }
          : rate
      ));
    }
    
    return { error };
  };

  const updateTransportRate = async (region: string, costPerKm: number, baseCost: number) => {
    if (!user) return;
    
    const { error } = await supabase
      .from('user_transport_rates')
      .update({ cost_per_km: costPerKm, base_cost: baseCost })
      .eq('user_id', user.id)
      .eq('region', region);

    if (!error) {
      setTransportRates(prev => prev.map(rate => 
        rate.region === region 
          ? { ...rate, cost_per_km: costPerKm, base_cost: baseCost }
          : rate
      ));
    }
    
    return { error };
  };

  const updateServiceRate = async (serviceId: string, price: number) => {
    if (!user) return;
    
    const { error } = await supabase
      .from('user_service_rates')
      .update({ price })
      .eq('user_id', user.id)
      .eq('service_id', serviceId);

    if (!error) {
      setServiceRates(prev => prev.map(rate => 
        rate.service_id === serviceId 
          ? { ...rate, price }
          : rate
      ));
    }
    
    return { error };
  };

  const updateLaborSettings = async (laborPercentage: number) => {
    if (!user) return;
    
    const { error } = await supabase
      .from('labor_settings')
      .update({ labor_percentage_of_materials: laborPercentage })
      .eq('user_id', user.id);

    if (!error && laborSettings) {
      setLaborSettings({ ...laborSettings, labor_percentage_of_materials: laborPercentage });
    }
    
    return { error };
  };

  const updateOverallProfitMargin = async (margin: number) => {
    if (!user) return;
    
    const { error } = await supabase
      .from('profiles')
      .update({ overall_profit_margin: margin })
      .eq('id', user.id);
    
    return { error };
  };

  useEffect(() => {
    fetchSettings();
  }, [user]);

  return {
    loading,
    materialCategories,
    profitMargins,
    equipmentTypes,
    equipmentRates,
    transportRates,
    additionalServices,
    serviceRates,
    laborSettings,
    updateProfitMargin,
    updateEquipmentRate,
    updateTransportRate,
    updateServiceRate,
    updateLaborSettings,
    updateOverallProfitMargin,
    refetch: fetchSettings
  };
};
