import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useDynamicPricing } from '@/hooks/useDynamicPricing';
import { useUserSettings } from '@/hooks/useUserSettings';
import { EquipmentType } from '@/hooks/useUserSettings';
import { AdditionalService } from '@/hooks/useUserSettings';
import { UserEquipmentRate } from '@/hooks/useUserSettings';
import { UserServiceRate } from '@/hooks/useUserSettings';
import { UserSubcontractorRate } from '@/hooks/useUserSettings';
import { UserMaterialPrice } from '@/hooks/useUserSettings';
import { UserTransportRate } from '@/hooks/useUserSettings';


  
    
export interface Material {
  id: string;
  name: string;
  unit: string;
  base_price: number;
  category: string;
}

export interface QuoteCalculation {
  rooms: Array<{
    name: string;
    length: string;
    width: string;
    height: string;
    doors: string;
    windows: string;
  }>;
  clientName: string;
  clientEmail:string;
  projectName: string;
  house_type: string;
  location: string;
  customSpecs:string;
  foundation_length: number;
  foundation_width: number;
  foundation_depth: number;
  mortar_ratio: string;
  concrete_mix_ratio: string;
  plaster_thickness: number;
  rebar_percentage: number;
  include_wastage: boolean;
  wastage_percentage: number;
  selected_equipment: string[];
  selected_services: string[];
  distance_km: number;
  contract_type: 'full_contract' | 'labor_only';
  region: string;
  show_profit_to_client: boolean;

  labor_percentage: number;
  overhead_percentage: number;
  profit_percentage: number;
  contingency_percentage: number;
  permit_cost: number;
}

export interface CalculationResult {
  total_wall_area: number;
  total_concrete_volume: number;
  total_formwork_area: number;
  total_rebar_weight: number;
  total_plaster_volume: number;
  materials_cost: number;
  labor_cost: number;
  equipment_cost: number;
  transport_cost: number;
  services_cost: number;
  permit_cost: number;
  contingency_amount: number;
  subtotal: number;
  overhead_amount: number;
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
    labor: Array<{
      type: string;
      percentage: number;
      cost: number;
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
    concrete: Array<{
      name: string;
      quantity: number;
      unit_price: number;
      total_price: number;
      profit_margin: number;
    }>;
    formwork: Array<{
      name: string;
      quantity: number;
      unit_price: number;
      total_price: number;
      profit_margin: number;
    }>;
    rebar: Array<{
      name: string;
      quantity: number;
      unit_price: number;
      total_price: number;
      profit_margin: number;
    }>;
    plaster: Array<{
      name: string;
      quantity: number;
      unit_price: number;
      total_price: number;
      profit_margin: number;
    }>;
     painting: Array<{
      name: string;
      quantity: number;
      unit_price: number;
      total_price: number;
      profit_margin: number;
    }>;
     ceiling: Array<{
      name: string;
      quantity: number;
      unit_price: number;
      total_price: number;
      profit_margin: number;
    }>;
  };
}

export const useQuoteCalculations = () => {
  const { user, profile } = useAuth();
  const [services, setServices] = useState<any[]>([]);
  const [materials, setMaterials] = useState<Material[]>([]);
  const [loading, setLoading] = useState(false);
  const [equipmentRates, setEquipmentRates] = useState<UserEquipmentRate[]>([]);
  const [transportRates, setTransportRates] = useState<UserTransportRate[]>([]);
  const [serviceRates, setServiceRates] = useState<UserServiceRate[]>([]);

  const fetchMaterials = useCallback(async () => {
  // Fetch base material prices
  const { data: baseMaterials, error: baseError } = await supabase
    .from('material_base_prices')
    .select('*');

  // Fetch user-specific overrides for materials in their region
  const { data: overrides, error: overrideError } = await supabase
    .from('user_material_prices')
    .select('material_id, region, custom_price')
    .eq('user_id', profile.id);

  if (baseError) console.error('Base materials error:', baseError);
  if (overrideError) console.error('Overrides error:', overrideError);

  // Merge base and user overrides
  const merged = baseMaterials.map((material) => {
    const userRegion = profile?.location || 'Nairobi'; // fallback region
    const userRate = overrides?.find(
      o => o.material_id === material.id && o.region === userRegion
    );
    const price = userRate ? userRate.custom_price : material.base_price ?? 0;

    return {
      ...material,
      price,
      source: userRate ? 'user' : (material.base_price != null ? 'base' : 'none')
    };
  });

  setMaterials(merged);
}, [profile.id, profile.location]);

 const fetchEquipment = useCallback(async () => {
    // Fetch base equipment types
    const { data: baseEquipment, error: baseError } = await supabase
      .from('equipment_types')
      .select('*');

    // Fetch user-specific overrides for equipment rates
    const { data: overrides, error: overrideError } = await supabase
      .from('user_equipment_rates')
      .select('equipment_type_id, daily_rate')
      .eq('user_id', profile.id);

    if (baseError) console.error('Base equipment error:', baseError);
    if (overrideError) console.error('Overrides error:', overrideError);

    // Merge base and user overrides
    const merged = baseEquipment.map((equipment) => {
      const userRate = overrides?.find(o => o.equipment_type_id === equipment.id);
      const rate = userRate ? userRate.daily_rate : equipment.daily_rate ?? 0;

      return {
        ...equipment,
        daily_rate: rate,
        source: userRate ? 'user' : (equipment.daily_rate != null ? 'base' : 'none')
      };
    });

    setEquipmentRates(merged);
  }, [profile.id]);

  const fetchTransportRates = useCallback(async () => {
  // Fetch base transport rates for all regions
  const { data: baseRates, error: baseError } = await supabase
    .from('transport_rates')
    .select('*');

  // Fetch user-specific overrides for transport rates
  const { data: overrides, error: overrideError } = await supabase
    .from('user_transport_rates')
    .select('region, cost_per_km, base_cost')
    .eq('user_id', profile.id);

  if (baseError) console.error('Base transport rates error:', baseError);
  if (overrideError) console.error('Overrides error:', overrideError);

  // Merge base and override rates
  
  const allRegions = ['Nairobi', 'Mombasa', 'Kisumu', 'Nakuru', 'Eldoret', 'Thika', 'Machakos'];

  const merged = allRegions.map(region => {
    const base = baseRates.find(r => r.region.toLowerCase() === region.toLowerCase());
    const userRate = overrides?.find(o => o.region.toLowerCase() === region.toLowerCase());

    return {
      id: profile.id,
      region,
      cost_per_km: userRate?.cost_per_km ?? base?.cost_per_km ?? 50,
      base_cost: userRate?.base_cost ?? base?.base_cost ?? 500,
      source: userRate ? 'user' : (base ? 'base' : 'default')
    };
  });


  setTransportRates(merged);
}, [profile.id]);


  const fetchAdditionalServices = useCallback(async () => {
    const { data: baseServices, error: baseError } = await supabase
      .from('subcontractor_prices')
      .select('*');
                    
    const { data: overrides, error: overrideError } = await supabase
      .from('user_subcontractor_rates')
      .select('service_id, price')
      .eq('user_id', profile.id);
                  
    if (baseError) console.error('Base rates error:', baseError);
    if (overrideError) console.error('Overrides error:', overrideError);
                    
    const merged = baseServices.map((service) => {
      const userRate = overrides?.find(o => o.service_id === service.id);
      const rate = userRate
      ? Number(userRate.price) 
      : (service.price != null ? Number(service.price) : 0); 
      
      return {
        ...service,
        price: rate,
        unit: service.unit ?? "unit",
        source: userRate ? 'user' : (service.price != null ? 'base' : 'none')
      };
    });
                      
    setServices(merged);
    
  },[]);

  useEffect(() => {
    if (user && profile !== null) {
      fetchMaterials();
      fetchAdditionalServices();
      fetchEquipment();
      fetchTransportRates();
    }
  }, [fetchMaterials]);

  const calculateQuote = async (params: QuoteCalculation): Promise<CalculationResult> => {
    if (!user || !profile) throw new Error('User not authenticated');
    setLoading(true);

    try {
      const {
        rooms,
        include_wastage,
        wastage_percentage,
        selected_equipment,
        selected_services,
        distance_km,
        show_profit_to_client,
        labor_percentage,
        overhead_percentage,
        profit_percentage,
        contingency_percentage,
        permit_cost,
        plaster_thickness,
        rebar_percentage
      } = params;

      const wastageFactor = include_wastage ? 1 + parseFloat(wastage_percentage.toString()) / 100 : 1;
      const defaultProfitMargin = parseFloat(profit_percentage.toString()) || 10;

      // Step 1: Calculate Total Wall Area
      const getTotalWallArea = (): number => {
        let totalWallArea = 0;

        rooms.forEach(room => {
          const l = parseFloat(room.length) || 0;
          const w = parseFloat(room.width) || 0;
          const h = parseFloat(room.height) || 0;
          const doors = parseInt(room.doors) || 0;
          const windows = parseInt(room.windows) || 0;

          const perimeter = 2 * (l + w);
          const grossWallArea = perimeter * h;
          const openingArea = (doors * 1.89) + (windows * 1.44); // avg sizes
          const netWallArea = grossWallArea - openingArea;

          totalWallArea += netWallArea;
        });

        return totalWallArea;
      };

      const wallArea = getTotalWallArea();

      // Step 2: Estimate Materials (Bricks, Cement, Sand)
      const estimateMaterials = () => {
        const brickMat = materials.find(m => m.name.toLowerCase() === 'bricks');
        const cementMat = materials.find(m => m.name.toLowerCase() === 'cement');
        const sandMat = materials.find(m => m.name.toLowerCase() === 'sand');

        const BRICKS_PER_SQM = 50;
        const CEMENT_PER_SQM = 0.03;
        const SAND_PER_SQM = 0.07;

        const bricksRequired = Math.round(BRICKS_PER_SQM * wallArea * wastageFactor);
        const cementRequired = Math.round((CEMENT_PER_SQM * wallArea * wastageFactor) * 50); // bags to kg
        const sandRequired = parseFloat((SAND_PER_SQM * wallArea * wastageFactor).toFixed(2));

        const brickCost = brickMat ? bricksRequired * brickMat.base_price : 0;
        const cementCost = cementMat ? cementRequired * cementMat.base_price : 0;
        const sandCost = sandMat ? sandRequired * sandMat.base_price : 0;

        return {
          materials: [
            {
              name: 'Bricks',
              quantity: bricksRequired,
              unit_price: brickMat?.base_price || 0,
              total_price: brickCost,
              profit_margin: defaultProfitMargin
            },
            {
              name: 'Cement',
              quantity: cementRequired,
              unit_price: cementMat?.base_price || 0,
              total_price: cementCost,
              profit_margin: defaultProfitMargin
            },
            {
              name: 'Sand',
              quantity: sandRequired,
              unit_price: sandMat?.base_price || 0,
              total_price: sandCost,
              profit_margin: defaultProfitMargin
            }
          ],
          totalMaterialCost: brickCost + cementCost + sandCost
        };
      };

      const { materials: materialBreakdown, totalMaterialCost } = estimateMaterials();

      // Step 3: Foundation Concrete Volume
      const foundationVolume = params.foundation_length * params.foundation_width * params.foundation_depth;
      const [cRatio, sRatio, bRatio] = params.concrete_mix_ratio.split(':').map(Number);
      const totalParts = cRatio + sRatio + bRatio;

      const cementPerCubicMeter = cRatio / totalParts;
      const sandPerCubicMeter = sRatio / totalParts;
      const ballastPerCubicMeter = bRatio / totalParts;

      const cementMat = materials.find(m => m.name.toLowerCase() === 'cement');
      const sandMat = materials.find(m => m.name.toLowerCase() === 'sand');
      const ballastMat = materials.find(m => m.name.toLowerCase() === 'ballast');

      const cementRequired = parseFloat((foundationVolume * cementPerCubicMeter).toFixed(2));
      const sandRequired = parseFloat((foundationVolume * sandPerCubicMeter).toFixed(2));
      const ballastRequired = parseFloat((foundationVolume * ballastPerCubicMeter).toFixed(2));

      const cementCost = cementMat ? cementRequired * cementMat.base_price : 0;
      const sandCost = sandMat ? sandRequired * sandMat.base_price : 0;
      const ballastCost = ballastMat ? ballastRequired * ballastMat.base_price : 0;

      const totalConcreteCost = cementCost + sandCost + ballastCost;

      const concreteBreakdown = [
        {
          name: 'Cement (Foundation)',
          quantity: cementRequired,
          unit_price: cementMat?.base_price || 0,
          total_price: cementCost,
          profit_margin: defaultProfitMargin
        },
        {
          name: 'Sand (Foundation)',
          quantity: sandRequired,
          unit_price: sandMat?.base_price || 0,
          total_price: sandCost,
          profit_margin: defaultProfitMargin
        },
        {
          name: 'Ballast (Foundation)',
          quantity: ballastRequired,
          unit_price: ballastMat?.base_price || 0,
          total_price: ballastCost,
          profit_margin: defaultProfitMargin
        }
      ];

      // Step 4: Formwork Area
      const formworkArea = wallArea + (params.foundation_length * params.foundation_width);
      const formworkMat = materials.find(m => m.name.toLowerCase() === 'formwork');
      const formworkCost = formworkArea * (formworkMat?.base_price || 0);

      const formworkBreakdown = [
        {
          name: 'Formwork',
          quantity: formworkArea,
          unit_price: formworkMat?.base_price || 0,
          total_price: formworkCost,
          profit_margin: defaultProfitMargin
        }
      ];

      // Step 5: Rebar (Steel Reinforcement)
      const rebarDensity = 7850; // kg/m³
      const rebarVolume = foundationVolume * (rebar_percentage / 100);
      const rebarWeight = (rebarVolume * rebarDensity) / 1000;
      const rebarMat = materials.find(m => m.name.toLowerCase() === 'rebar');
      const rebarCost = rebarMat ? rebarWeight * rebarMat.base_price : 0;

      const rebarBreakdown = [
        {
          name: 'Rebar',
          quantity: rebarWeight,
          unit_price: rebarMat?.base_price || 0,
          total_price: rebarCost,
          profit_margin: defaultProfitMargin
        }
      ];

      // Step 6: Plastering
      const plasterThickness = plaster_thickness || 0.012; // meters
      const plasterVolume = wallArea * plasterThickness;
      const plasterCementPerM3 = 0.25; // bags per m³
      const plasterSandPerM3 = 1.2; // m³ per m³ plaster

      const plasterCementRequired = plasterCementPerM3 * plasterVolume * 50; // bags to kg
      const plasterSandRequired = plasterSandPerM3 * plasterVolume;

      const plasterCementMat = materials.find(m => m.name.toLowerCase() === 'cement');
      const plasterSandMat = materials.find(m => m.name.toLowerCase() === 'sand');

      const plasterCementCost = plasterCementMat ? plasterCementRequired * plasterCementMat.base_price : 0;
      const plasterSandCost = plasterSandMat ? plasterSandRequired * plasterSandMat.base_price : 0;

      const totalPlasterCost = plasterCementCost + plasterSandCost;

      const plasterBreakdown = [
        {
          name: 'Cement (Plaster)',
          quantity: plasterCementRequired,
          unit_price: plasterCementMat?.base_price || 0,
          total_price: plasterCementCost,
          profit_margin: defaultProfitMargin
        },
        {
          name: 'Sand (Plaster)',
          quantity: plasterSandRequired,
          unit_price: plasterSandMat?.base_price || 0,
          total_price: plasterSandCost,
          profit_margin: defaultProfitMargin
        }
      ];

      // Step 7: Labor Cost
      const laborCost = totalMaterialCost * (labor_percentage / 100);

      // Step 8: Equipment Cost
      const equipmentCost = selected_equipment.reduce((total, id) => {
        const item = materials.find(m => m.id === id && m.category === 'equipment');
        if (!item) return total;
        const days = Math.ceil(wallArea / 10); // example logic
        return total + (item.base_price * days);
      }, 0);

      // Step 8.5: Painting
      const paintingMat = materials.find(m => m.name.toLowerCase() === 'paint');
      const paintCoveragePerLiter = 10; // m² per liter (example)
      const coats = 2; // number of coats

      const totalPaintArea = wallArea * coats;
      const paintRequired = parseFloat((totalPaintArea / paintCoveragePerLiter).toFixed(2));

      const paintCost = paintingMat ? paintRequired * paintingMat.base_price : 0;

      const paintingBreakdown = [
        {
          name: 'Paint',
          quantity: paintRequired,
          unit_price: paintingMat?.base_price || 0,
          total_price: paintCost,
          profit_margin: defaultProfitMargin
        }
      ];

      // Step 8.6: Ceiling
      const ceilingMat = materials.find(m => m.name.toLowerCase() === 'ceiling board');
      const ceilingArea = rooms.reduce((total, room) => {
        const l = parseFloat(room.length) || 0;
        const w = parseFloat(room.width) || 0;
        return total + (l * w);
      }, 0);

      const ceilingCost = ceilingMat ? ceilingArea * ceilingMat.base_price : 0;

      const ceilingBreakdown = [
        {
          name: 'Ceiling Board',
          quantity: ceilingArea,
          unit_price: ceilingMat?.base_price || 0,
          total_price: ceilingCost,
          profit_margin: defaultProfitMargin
        }
      ];

      // Step 8.6: Ceiling
      const flooringMat = materials.find(m => m.name.toLowerCase() === 'ceiling board');
      const flooringArea = rooms.reduce((total, room) => {
        const l = parseFloat(room.length) || 0;
        const w = parseFloat(room.width) || 0;
        return total + (l * w);
      }, 0);

      const flooringCost = flooringMat ? flooringArea * flooringMat.base_price : 0;

      const flooringBreakdown = [
        {
          name: 'Ceiling Board',
          quantity: flooringArea,
          unit_price: flooringMat?.base_price || 0,
          total_price: flooringCost,
          profit_margin: defaultProfitMargin
        }
      ];

      // Step 9: Transport Cost
      const region = profile?.location || 'Nairobi';

      // Find the rate for the user’s current region
      const rateForRegion = transportRates.find(r => r.region === region);
      const defaultTransportRate = { cost_per_km: 50, base_cost: 500 };

      if (!rateForRegion) {
        console.warn(`No transport rate for ${region}. Using defaults.`);
      }

      const costPerKm = rateForRegion?.cost_per_km ?? defaultTransportRate.cost_per_km;
      const baseCost = rateForRegion?.base_cost ?? defaultTransportRate.base_cost;
      const transportCost = distance_km * costPerKm + baseCost;


      if (!rateForRegion) {
        console.error('No transport rate found for region:', region);
      const transportCost = distance_km * defaultTransportRate.cost_per_km + defaultTransportRate.base_cost;
        return;
      }

      // Step 10: Services Cost
      const servicesCost = selected_services.reduce((total, id) => {
        const item = materials.find(m => m.id === id && m.category === 'service');
        if (!item) return total;
        return total + item.base_price;
      }, 0);

      // Step 11: Permit Cost
      const permitCost = permit_cost || 0;

      // Step 12: Subtotal before extras
      const subtotalBeforeExtras = totalMaterialCost + laborCost + equipmentCost + transportCost + servicesCost + totalConcreteCost + formworkCost + rebarCost + totalPlasterCost + paintCost + ceilingCost;

      // Step 13: Overhead
      const overheadAmount = subtotalBeforeExtras * (parseFloat(overhead_percentage.toString()) || 10) / 100;

      // Step 14: Contingency
      const contingencyAmount = subtotalBeforeExtras * (parseFloat(contingency_percentage.toString()) || 5) / 100;

      // Step 15: Profit Margin
      const subtotalWithExtras = subtotalBeforeExtras + overheadAmount + contingencyAmount + permitCost;
      const profitAmount = show_profit_to_client ? subtotalWithExtras * (defaultProfitMargin / 100) : 0;

      const totalAmount = subtotalWithExtras + profitAmount;

      return {
        total_wall_area: wallArea,
        total_concrete_volume: foundationVolume,
        total_formwork_area: formworkArea,
        total_rebar_weight: rebarWeight,
        total_plaster_volume: plasterVolume,

        materials_cost: totalMaterialCost,
        labor_cost: laborCost,
        equipment_cost: equipmentCost,
        transport_cost: transportCost,
        services_cost: servicesCost,

        permit_cost: permitCost,
        contingency_amount: contingencyAmount,
        subtotal: subtotalBeforeExtras,
        overhead_amount: overheadAmount,
        profit_amount: profitAmount,
        total_amount: totalAmount,

        detailed_breakdown: {
          materials: materialBreakdown,
          labor: [{ type: 'calculated', percentage: labor_percentage, cost: laborCost }],
          equipment: selected_equipment.map(id => {
            const item = materials.find(m => m.id === id && m.category === 'equipment');
            const days = Math.ceil(wallArea / 10);
            const dailyRate = item?.base_price || 0;
            return {
              name: item?.name || `Equipment ${id}`,
              days,
              daily_rate: dailyRate,
              total_cost: dailyRate * days
            };
          }),
          services: selected_services.map(id => {
            const item = materials.find(m => m.id === id && m.category === 'service');
            return {
              name: item?.name || `Service ${id}`,
              price: item?.base_price || 0
            };
          }),
          concrete: concreteBreakdown,
          formwork: formworkBreakdown,
          rebar: rebarBreakdown,
          plaster: plasterBreakdown,
          painting: paintingBreakdown,   // 🖌️ Add painting
          ceiling: ceilingBreakdown  
        }
      };

    } finally {
      setLoading(false);
    }
  };

  

  return {
    materials,
    loading,
    calculateQuote
  };
};