
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
    try {
      const { data } = await supabase
        .from('materials')
        .select('*')
        .order('name');
      
      setMaterials(data || []);
    } catch (error) {
      console.error('Error fetching materials:', error);
      setMaterials([]);
    }
  };

  const calculateQuote = async (params: QuoteCalculation): Promise<CalculationResult> => {
    if (!user || !profile) throw new Error('User not authenticated');
    
    setLoading(true);
    
    try {
      const volume = params.length * params.width * params.height;
      const perimeter = 2 * (params.length + params.width);
      
      // Mock calculation for now since we may not have all the database tables yet
      const mockMaterialsCost = volume * 15000; // 150 KSh per m3
      const mockLaborCost = mockMaterialsCost * 0.25; // 25% of materials
      const mockEquipmentCost = params.selected_equipment.length * 100000; // 1000 KSh per equipment per day
      const mockTransportCost = params.distance_km * 50; // 50 KSh per km
      const mockServicesCost = params.selected_services.length * 50000; // 500 KSh per service
      
      const subtotal = mockMaterialsCost + mockLaborCost + mockEquipmentCost + mockTransportCost + mockServicesCost;
      const overallProfitMargin = profile.overall_profit_margin || 10;
      const profitAmount = (subtotal * overallProfitMargin) / 100;
      const totalAmount = subtotal + profitAmount;

      return {
        volume,
        materials_cost: mockMaterialsCost,
        labor_cost: mockLaborCost,
        equipment_cost: mockEquipmentCost,
        transport_cost: mockTransportCost,
        services_cost: mockServicesCost,
        subtotal,
        profit_amount: profitAmount,
        total_amount: totalAmount,
        detailed_breakdown: {
          materials: [
            {
              name: 'Concrete',
              quantity: Math.ceil(volume * 0.5),
              unit_price: 25000,
              total_price: mockMaterialsCost * 0.4,
              profit_margin: 15
            },
            {
              name: 'Steel',
              quantity: Math.ceil(volume * 0.1),
              unit_price: 120000,
              total_price: mockMaterialsCost * 0.3,
              profit_margin: 15
            },
            {
              name: 'Bricks',
              quantity: Math.ceil(perimeter * 100),
              unit_price: 15,
              total_price: mockMaterialsCost * 0.3,
              profit_margin: 15
            }
          ],
          equipment: params.selected_equipment.map(id => ({
            name: `Equipment ${id}`,
            days: Math.ceil(volume / 10),
            daily_rate: 100000,
            total_cost: 100000 * Math.ceil(volume / 10)
          })),
          services: params.selected_services.map(id => ({
            name: `Service ${id}`,
            price: 50000
          }))
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
