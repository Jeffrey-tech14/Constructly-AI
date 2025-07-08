
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export interface Material {
  id: string;
  name: string;
  category_id: string;
  unit: string;
  base_price: number;
  usage_per_m3: number;
}

export interface QuoteCalculation {
  length: number;
  width: number;
  height: number;
  region: string;
  distance_km: number;
  contract_type: 'full_contract' | 'labor_only';
  selected_equipment: string[];
  selected_services: string[];
}

export interface CalculationResult {
  volume: number;
  materials_cost: number;
  labor_cost: number;
  equipment_cost: number;
  transport_cost: number;
  services_cost: number;
  subtotal: number;
  profit_amount: number;
  total_amount: number;
  detailed_breakdown: {
    materials: Array<{
      name: string;
      quantity: number;
      unit_price: number;
      total_price: number;
      profit_margin: number;
    }>;
    equipment: Array<{
      name: string;
      days: number;
      daily_rate: number;
      total_cost: number;
    }>;
    services: Array<{
      name: string;
      price: number;
    }>;
  };
}

export const useQuoteCalculations = () => {
  const { user, profile } = useAuth();
  const [materials, setMaterials] = useState<Material[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchMaterials = async () => {
    const { data } = await supabase
      .from('materials')
      .select('*')
      .order('name');
    
    setMaterials(data || []);
  };

  const calculateQuote = async (params: QuoteCalculation): Promise<CalculationResult> => {
    if (!user || !profile) throw new Error('User not authenticated');
    
    setLoading(true);
    
    try {
      const volume = params.length * params.width * params.height;
      const perimeter = 2 * (params.length + params.width);
      
      // Fetch user settings
      const [
        { data: profitMargins },
        { data: equipmentRates },
        { data: transportRates },
        { data: serviceRates },
        { data: laborSettings },
        { data: regionalPricing }
      ] = await Promise.all([
        supabase.from('user_profit_margins').select('*, material_categories(name)').eq('user_id', user.id),
        supabase.from('user_equipment_rates').select('*, equipment_types(name)').eq('user_id', user.id),
        supabase.from('user_transport_rates').select('*').eq('user_id', user.id).eq('region', params.region),
        supabase.from('user_service_rates').select('*, additional_services(name)').eq('user_id', user.id),
        supabase.from('labor_settings').select('*').eq('user_id', user.id).single(),
        supabase.from('regional_pricing').select('*').eq('region_name', params.region).single()
      ]);

      const regionalMultiplier = regionalPricing?.multiplier || 1.0;
      
      // Calculate materials cost
      let materialsCost = 0;
      const materialsBreakdown = [];
      
      for (const material of materials) {
        let quantity = 0;
        
        // Calculate quantity based on material type
        if (material.usage_per_m3) {
          // Volume-based materials (concrete, steel, etc.)
          if (material.name.toLowerCase().includes('concrete') || 
              material.name.toLowerCase().includes('cement') ||
              material.name.toLowerCase().includes('sand') ||
              material.name.toLowerCase().includes('ballast') ||
              material.name.toLowerCase().includes('steel') ||
              material.name.toLowerCase().includes('bricks')) {
            quantity = volume * material.usage_per_m3;
          }
          // Perimeter-based materials (plumbing, electrical)
          else if (material.name.toLowerCase().includes('pipe') ||
                   material.name.toLowerCase().includes('cable') ||
                   material.name.toLowerCase().includes('conduit') ||
                   material.name.toLowerCase().includes('fitting')) {
            quantity = perimeter * material.usage_per_m3;
          }
        }
        
        if (quantity > 0) {
          const profitMargin = profitMargins?.find(p => p.category_id === material.category_id)?.profit_percentage || 15;
          const basePrice = material.base_price * regionalMultiplier;
          const unitPriceWithProfit = basePrice * (1 + profitMargin / 100);
          const totalPrice = quantity * unitPriceWithProfit;
          
          materialsCost += totalPrice;
          materialsBreakdown.push({
            name: material.name,
            quantity: Math.ceil(quantity),
            unit_price: unitPriceWithProfit,
            total_price: totalPrice,
            profit_margin: profitMargin
          });
        }
      }

      // Calculate labor cost (percentage of materials)
      const laborPercentage = laborSettings?.labor_percentage_of_materials || 25;
      const laborCost = (materialsCost * laborPercentage) / 100;

      // Calculate equipment cost
      let equipmentCost = 0;
      const equipmentBreakdown = [];
      
      for (const equipmentId of params.selected_equipment) {
        const equipment = equipmentRates?.find(e => e.equipment_type_id === equipmentId);
        if (equipment) {
          const days = Math.ceil(volume / 10); // Estimate days based on volume
          const totalCost = equipment.daily_rate * days;
          
          equipmentCost += totalCost;
          equipmentBreakdown.push({
            name: equipment.equipment_types?.name || 'Equipment',
            days,
            daily_rate: equipment.daily_rate,
            total_cost: totalCost
          });
        }
      }

      // Calculate transport cost
      let transportCost = 0;
      const transportRate = transportRates?.[0];
      if (transportRate && params.contract_type === 'full_contract') {
        transportCost = transportRate.base_cost + (transportRate.cost_per_km * params.distance_km);
      }

      // Calculate additional services cost
      let servicesCost = 0;
      const servicesBreakdown = [];
      
      for (const serviceId of params.selected_services) {
        const service = serviceRates?.find(s => s.service_id === serviceId);
        if (service) {
          servicesCost += service.price;
          servicesBreakdown.push({
            name: service.additional_services?.name || 'Service',
            price: service.price
          });
        }
      }

      // Calculate subtotal and profit
      const subtotal = materialsCost + laborCost + equipmentCost + transportCost + servicesCost;
      const overallProfitMargin = profile.overall_profit_margin || 10;
      const profitAmount = (subtotal * overallProfitMargin) / 100;
      const totalAmount = subtotal + profitAmount;

      return {
        volume,
        materials_cost: materialsCost,
        labor_cost: laborCost,
        equipment_cost: equipmentCost,
        transport_cost: transportCost,
        services_cost: servicesCost,
        subtotal,
        profit_amount: profitAmount,
        total_amount: totalAmount,
        detailed_breakdown: {
          materials: materialsBreakdown,
          equipment: equipmentBreakdown,
          services: servicesBreakdown
        }
      };
      
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMaterials();
  }, []);

  return {
    materials,
    loading,
    calculateQuote
  };
};
