
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export interface Material {
  id: string;
  name: string;
  unit: string;
  base_price: number;
  created_at: string;
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
      
      // Calculate costs based on volume and other factors
      const materialsCost = volume * 1500000; // 150,000 KSh per m3 (stored in cents)
      const laborCost = materialsCost * 0.25; // 25% of materials
      const equipmentCost = params.selected_equipment.length * 1000000 * Math.ceil(volume / 10); // Equipment cost per day (stored in cents)
      const transportCost = params.distance_km * 50000; // 5,000 KSh per km (stored in cents)
      const servicesCost = params.selected_services.length * 500000; // 50,000 KSh per service (stored in cents)
      
      const subtotal = materialsCost + laborCost + equipmentCost + transportCost + servicesCost;
      
      // Get profit margin from profile, default to 10%
      const overallProfitMargin = (profile.overall_profit_margin as number) || 10;
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
          materials: [
            {
              name: 'Concrete',
              quantity: Math.ceil(volume * 0.5),
              unit_price: 250000, // 25,000 KSh in cents
              total_price: materialsCost * 0.4,
              profit_margin: 15
            },
            {
              name: 'Steel',
              quantity: Math.ceil(volume * 0.1),
              unit_price: 1200000, // 120,000 KSh in cents
              total_price: materialsCost * 0.3,
              profit_margin: 15
            },
            {
              name: 'Bricks',
              quantity: Math.ceil(perimeter * 100),
              unit_price: 1500, // 15 KSh in cents
              total_price: materialsCost * 0.3,
              profit_margin: 15
            }
          ],
          equipment: params.selected_equipment.map(id => ({
            name: `Equipment ${id}`,
            days: Math.ceil(volume / 10),
            daily_rate: 5000000, // 100,000 KSh in cents
            total_cost: 5000000 * Math.ceil(volume / 10)
          })),
          services: params.selected_services.map(id => ({
            name: `Service ${id}`,
            price: 2000000 // 50,000 KSh in cents
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
