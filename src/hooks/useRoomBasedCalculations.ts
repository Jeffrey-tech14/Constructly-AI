import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useDynamicPricing } from './useDynamicPricing';

export interface RoomType {
  id: string;
  name: string;
  calculation_method: 'volume' | 'area';
  description?: string;
}

export interface RoomMaterialRequirement {
  id: string;
  room_type_id: string;
  material_id: string;
  quantity_per_unit: number;
}

export interface Room {
  id: string;
  room_type_id: string;
  name: string;
  length: number;
  width: number;
  height?: number;
  quantity: number;
}

export interface MaterialCalculation {
  material_id: string;
  material_name: string;
  unit: string;
  quantity: number;
  unit_price: number;
  total_price: number;
  room_breakdown: Array<{
    room_name: string;
    quantity: number;
    room_volume_or_area: number;
  }>;
}

export interface PlumbingCalculation {
  fixtures_count: number;
  pipe_length: number;
  material_cost: number;
  labor_cost: number;
  total_cost: number;
}

export interface ElectricalCalculation {
  outlets_count: number;
  switches_count: number;
  fixtures_count: number;
  wire_length: number;
  material_cost: number;
  labor_cost: number;
  total_cost: number;
}

export interface QuoteCalculationResult {
  rooms: Room[];
  total_volume: number;
  total_area: number;
  material_calculations: MaterialCalculation[];
  plumbing: PlumbingCalculation;
  electrical: ElectricalCalculation;
  materials_cost: number;
  labor_cost: number;
  equipment_cost: number;
  transport_cost: number;
  services_cost: number;
  subtotal: number;
  profit_amount: number;
  total_amount: number;
}

export const useRoomBasedCalculations = () => {
  const { user, profile } = useAuth();
  const { getEffectiveMaterialPrice } = useDynamicPricing();
  const [roomTypes, setRoomTypes] = useState<RoomType[]>([]);
  const [roomMaterialRequirements, setRoomMaterialRequirements] = useState<RoomMaterialRequirement[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchRoomTypes = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('room_types')
        .select('*')
        .order('name');
      
      if (error) throw error;
      setRoomTypes((data || []).map(item => ({
        ...item,
        calculation_method: item.calculation_method as 'volume' | 'area'
      })));
    } catch (error) {
      console.error('Error fetching room types:', error);
    }
  }, []);

  const fetchRoomMaterialRequirements = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('room_material_requirements')
        .select(`
          *,
          material_base_prices(name, unit)
        `);
      
      if (error) throw error;
      setRoomMaterialRequirements(data || []);
    } catch (error) {
      console.error('Error fetching room material requirements:', error);
    }
  }, []);

  const calculateRoomBasedQuote = useCallback(async (
    rooms: Room[],
    distance_km: number = 0,
    selected_equipment: string[] = [],
    selected_services: string[] = []
  ): Promise<QuoteCalculationResult> => {
    if (!user || !profile) throw new Error('User not authenticated');
    
    const userRegion = profile.location || 'Nairobi';
    const overallProfitMargin = (profile.overall_profit_margin as number) || 10;

    // Calculate total volume and area
    const totalVolume = rooms.reduce((sum, room) => {
      const roomType = roomTypes.find(rt => rt.id === room.room_type_id);
      if (roomType?.calculation_method === 'volume') {
        return sum + (room.length * room.width * (room.height || 3) * room.quantity);
      }
      return sum;
    }, 0);

    const totalArea = rooms.reduce((sum, room) => {
      const roomType = roomTypes.find(rt => rt.id === room.room_type_id);
      if (roomType?.calculation_method === 'area') {
        return sum + (room.length * room.width * room.quantity);
      }
      // For volume rooms, also calculate floor area
      return sum + (room.length * room.width * room.quantity);
    }, 0);

    // Calculate material requirements
    const materialCalculations: MaterialCalculation[] = [];
    const materialMap = new Map<string, MaterialCalculation>();

    for (const room of rooms) {
      const roomType = roomTypes.find(rt => rt.id === room.room_type_id);
      if (!roomType) continue;

      const roomVolume = roomType.calculation_method === 'volume' 
        ? room.length * room.width * (room.height || 3)
        : room.length * room.width;

      const roomUnit = roomType.calculation_method === 'volume' ? roomVolume : room.length * room.width;
      
      const requirements = roomMaterialRequirements.filter(req => req.room_type_id === room.room_type_id);
      
      for (const requirement of requirements) {
        const materialKey = requirement.material_id;
        const materialQuantity = requirement.quantity_per_unit * roomUnit * room.quantity;
        const unitPrice = getEffectiveMaterialPrice(requirement.material_id, userRegion);
        
        if (materialMap.has(materialKey)) {
          const existing = materialMap.get(materialKey)!;
          existing.quantity += materialQuantity;
          existing.total_price = existing.quantity * existing.unit_price;
          existing.room_breakdown.push({
            room_name: room.name,
            quantity: materialQuantity,
            room_volume_or_area: roomUnit
          });
        } else {
          // Get material info from material_base_prices
          const { data: materialInfo } = await supabase
            .from('material_base_prices')
            .select('name, unit')
            .eq('id', requirement.material_id)
            .single();

          if (materialInfo) {
            materialMap.set(materialKey, {
              material_id: requirement.material_id,
              material_name: materialInfo.name,
              unit: materialInfo.unit,
              quantity: materialQuantity,
              unit_price: unitPrice,
              total_price: materialQuantity * unitPrice,
              room_breakdown: [{
                room_name: room.name,
                quantity: materialQuantity,
                room_volume_or_area: roomUnit
              }]
            });
          }
        }
      }
    }

    materialCalculations.push(...materialMap.values());

    // Calculate plumbing requirements
    const bathroomCount = rooms.filter(r => {
      const roomType = roomTypes.find(rt => rt.id === r.room_type_id);
      return roomType?.name.toLowerCase().includes('bathroom');
    }).reduce((sum, room) => sum + room.quantity, 0);

    const kitchenCount = rooms.filter(r => {
      const roomType = roomTypes.find(rt => rt.id === r.room_type_id);
      return roomType?.name.toLowerCase().includes('kitchen');
    }).reduce((sum, room) => sum + room.quantity, 0);

    const plumbingFixtures = bathroomCount * 3 + kitchenCount * 2; // 3 fixtures per bathroom, 2 per kitchen
    const plumbingPipeLength = totalArea * 0.5; // 0.5m pipe per m2 of floor area
    const plumbingMaterialCost = (plumbingFixtures * 1500000) + (plumbingPipeLength * 100000); // 15,000 per fixture, 1,000 per meter pipe (in cents)
    const plumbingLaborCost = plumbingMaterialCost * 0.4; // 40% of material cost

    const plumbing: PlumbingCalculation = {
      fixtures_count: plumbingFixtures,
      pipe_length: plumbingPipeLength,
      material_cost: plumbingMaterialCost,
      labor_cost: plumbingLaborCost,
      total_cost: plumbingMaterialCost + plumbingLaborCost
    };

    // Calculate electrical requirements
    const totalRoomCount = rooms.reduce((sum, room) => sum + room.quantity, 0);
    const electricalOutlets = totalRoomCount * 4; // 4 outlets per room
    const electricalSwitches = totalRoomCount * 2; // 2 switches per room
    const electricalFixtures = totalRoomCount * 2; // 2 light fixtures per room
    const electricalWireLength = totalArea * 0.8; // 0.8m wire per m2 of floor area
    const electricalMaterialCost = (electricalOutlets * 50000) + (electricalSwitches * 30000) + (electricalFixtures * 200000) + (electricalWireLength * 15000); // in cents
    const electricalLaborCost = electricalMaterialCost * 0.5; // 50% of material cost

    const electrical: ElectricalCalculation = {
      outlets_count: electricalOutlets,
      switches_count: electricalSwitches,
      fixtures_count: electricalFixtures,
      wire_length: electricalWireLength,
      material_cost: electricalMaterialCost,
      labor_cost: electricalLaborCost,
      total_cost: electricalMaterialCost + electricalLaborCost
    };

    // Calculate totals
    const materialsCost = materialCalculations.reduce((sum, calc) => sum + calc.total_price, 0) + plumbing.material_cost + electrical.material_cost;
    const laborCost = materialsCost * 0.25 + plumbing.labor_cost + electrical.labor_cost; // 25% of materials for general labor
    const equipmentCost = selected_equipment.length * 10000000 * Math.ceil(totalVolume / 50); // 100,000 per equipment per day (in cents)
    const transportCost = distance_km * 500000; // 5,000 per km (in cents)
    const servicesCost = selected_services.length * 5000000; // 50,000 per service (in cents)

    const subtotal = materialsCost + laborCost + equipmentCost + transportCost + servicesCost;
    const profitAmount = (subtotal * overallProfitMargin);
    const totalAmount = subtotal + profitAmount;

    return {
      rooms,
      total_volume: totalVolume,
      total_area: totalArea,
      material_calculations: materialCalculations,
      plumbing,
      electrical,
      materials_cost: materialsCost,
      labor_cost: laborCost,
      equipment_cost: equipmentCost,
      transport_cost: transportCost,
      services_cost: servicesCost,
      subtotal,
      profit_amount: profitAmount,
      total_amount: totalAmount
    };
  }, [user, profile, roomTypes, roomMaterialRequirements, getEffectiveMaterialPrice]);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      await Promise.all([
        fetchRoomTypes(),
        fetchRoomMaterialRequirements()
      ]);
      setLoading(false);
    };
    
    fetchData();
  }, [fetchRoomTypes, fetchRoomMaterialRequirements]);

  return {
    roomTypes,
    roomMaterialRequirements,
    loading,
    calculateRoomBasedQuote
  };
};