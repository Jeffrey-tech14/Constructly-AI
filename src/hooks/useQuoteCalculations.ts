import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { RegionalMultiplier, useDynamicPricing } from '@/hooks/useDynamicPricing';
import { useUserSettings } from '@/hooks/useUserSettings';
import { EquipmentType } from '@/hooks/useUserSettings';
import { AdditionalService } from '@/hooks/useUserSettings';
import { UserEquipmentRate } from '@/hooks/useUserSettings';
import { UserServiceRate } from '@/hooks/useUserSettings';
import { UserSubcontractorRate } from '@/hooks/useUserSettings';
import { UserMaterialPrice } from '@/hooks/useUserSettings';
import { UserTransportRate } from '@/hooks/useUserSettings';
import { useLocation } from 'react-router-dom';
import { Sun } from 'lucide-react';
    
export interface Material {
  id: string;
  name: string;
  unit: string;
  region: string;
  price: number;
  category: string;
}

export interface EquipmentItem {
  name: string;
  daily_rate: number;
  days: number;
  total_cost: number;
  equipment_type_id: string;
};

export interface Percentage {
  labour: number;
  rebar: number;
  wastage: number;
  overhead: number;
  profit: number;
  contingency: number;
}

export interface Subcontractors {
  id: string;
  name : string;
  subcontractor_payment_plan: string;
  price: number;
  days: number;
  total: number;
}

export interface Addons {
  name: string;
  price: number;
}

export interface QuoteCalculation {
  rooms: Array<{
    room_name: string;
    length: string;
    width: string;
    height: string;
    doors: string;
    windows: string;
  }>;
  id: string;
  user_id: string;
  title: string;
  client_name: string;
  client_email: string;
  contractor_name?: string;
  company_name?: string;
  house_type: string;
  location: string;
  subcontractors: Subcontractors[];
  custom_specs:string;
  floors: number;
  status: string;
  foundation_length: number;
  foundation_width: number;
  foundation_depth: number;
  mortar_ratio: string;
  concrete_mix_ratio: string;
  plaster_thickness: number;
  rebar_percentages: number;
  include_wastage: boolean;
  wastage_percentages: number;
  equipment: EquipmentItem[];
  services: AdditionalService[];
  distance_km: number;
  percentages: Percentage[];
  addons: Addons[];
  contract_type: 'full_contract' | 'labor_only';
  region: string;
  addons_cost: number;
  project_type: string;
  equipment_costs: number;
  additional_services_cost: number;
  transport_costs: number;
  show_profit_to_client: boolean;

  labor_percentages: number;
  overhead_percentages: number;
  profit_percentages: number;
  contingency_percentages: number;
  permit_cost: number;
}

export interface CalculationResult {
  rooms: Array<{
    room_name: string;
    length: string;
    width: string;
    height: string;
    doors: string;
    windows: string;
  }>;
  addons: Addons[];
  addons_cost: number;
  total_wall_area: number;
  total_concrete_volume: number;
  total_formwork_area: number;
  total_rebar_weight: number;
  total_plaster_volume: number;
  materials_cost: number;
  labor_cost: number;
  equipment_cost: number;
  transport_cost: number;
  selected_services_cost: number;
  distance_km: number;
  permit_cost: number;
  contingency_amount: number;
  subtotal: number;
  overhead_amount: number;
  profit_amount: number;
  total_amount: number;
  subcontractors: Subcontractors[];
    percentages: Percentage[]
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
     ceiling: Array<{
      name: string;
      quantity: number;
      unit_price: number;
      total_price: number;
      profit_margin: number;
    }>;
}

export type FullQuoteCalculation = QuoteCalculation & CalculationResult;

export const useQuoteCalculations = () => {
  const { user, profile } = useAuth();
  const [services, setServices] = useState<UserServiceRate[]>([]);
  const [materials, setMaterials] = useState<Material[]>([]);
  const [loading, setLoading] = useState(false);
  const [subContractors, setSubcontractors] = useState<Subcontractors[]>([]);
  const location = useLocation();
  const [equipmentRates, setEquipmentRates] = useState<UserEquipmentRate[]>([]);
  const [transportRates, setTransportRates] = useState<UserTransportRate[]>([]);
  const [regionalMultipliers] = useState<RegionalMultiplier[]>([]);

  const fetchMaterials = useCallback(async () => {
  const { data: baseMaterials, error: baseError } = await supabase
    .from('material_base_prices')
    .select('*');

  const { data: overrides, error: overrideError } = await supabase
    .from('user_material_prices')
    .select('material_id, region, price')
    .eq('user_id', profile.id);

  if (baseError) console.error('Base materials error:', baseError);
  if (overrideError) console.error('Overrides error:', overrideError);

  const merged = baseMaterials.map((material) => {
    const userRegion = profile?.location || 'Nairobi'; 
    const userRate = overrides?.find(
      o => o.material_id === material.id && o.region === userRegion
    );
    const price = userRate ? userRate.price : material.price ?? 0;
    
    const multiplier = regionalMultipliers.find(r => r.region === userRegion)?.multiplier || 1;
    const result = (price * multiplier)
    
    return {
      ...material,
      result,
      source: userRate ? 'user' : (material.price != null ? 'base' : 'none')
    };
  });

  setMaterials(merged);
}, [user, profile.location, location.key]);

  const fetchServices = useCallback(async () => {
  const { data: baseServices, error: baseError } = await supabase
    .from('additional_services')
    .select('*');

  const { data: overrides, error: overrideError } = await supabase
    .from('user_service_rates')
    .select('service_id, price')
    .eq('user_id', profile.id);

  if (baseError) console.error('Base services error:', baseError);
  if (overrideError) console.error('Overrides error:', overrideError);

  const merged = baseServices.map((service) => {
    const userRate = overrides?.find(
      o => o.service_id === service.id 
    );
    const price = userRate ? userRate.price : service.price ?? 0;

    return {
      ...service,
      price,
      source: userRate ? 'user' : (service.price != null ? 'base' : 'none')
    };
  });

  setServices(merged);
}, [user, profile, location.key]);

 const fetchRates = async () => {
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
  
        setSubcontractors(merged);
      };

 const fetchEquipment = useCallback(async () => {
    const { data: baseEquipment, error: baseError } = await supabase 
      .from('equipment_types')
      .select('*');

    const { data: overrides, error: overrideError } = await supabase
      .from('user_equipment_rates')
      .select('equipment_type_id, daily_rate')
      .eq('user_id', profile.id);

    if (baseError) console.error('Base equipment error:', baseError);
    if (overrideError) console.error('Overrides error:', overrideError);

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
  }, [user, location.key]);

  const fetchTransportRates = useCallback(async () => {
  const { data: baseRates, error: baseError } = await supabase
    .from('transport_rates')
    .select('*');

  const { data: overrides, error: overrideError } = await supabase
    .from('user_transport_rates')
    .select('region, cost_per_km, base_cost')
    .eq('user_id', profile.id);

  if (baseError) console.error('Base transport rates error:', baseError);
  if (overrideError) console.error('Overrides error:', overrideError);

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
}, [user, location.key]);

  useEffect(() => {
  if (user && profile !== null) {
    fetchMaterials();
    fetchServices();
    fetchEquipment();
    fetchTransportRates();
    fetchRates();
  }
  }, [user, profile, location.key]);

  const calculateQuote = async (params: QuoteCalculation): Promise<CalculationResult> => {
    if (!user || !profile) throw new Error('User not authenticated');
    setLoading(true);

    try {
      const {
        rooms,
        include_wastage,
        wastage_percentages,
        equipment,
        services,
        subcontractors,
        distance_km,
        addons,
        labor_percentages,
        overhead_percentages,
        profit_percentages,
        contingency_percentages,
        permit_cost,
        contract_type,
        plaster_thickness,
        rebar_percentages
      } = params;

      const wastageFactor = include_wastage ? 1 + parseFloat(wastage_percentages.toString()) / 100 : 1;
      const defaultProfitMargin = parseFloat(profit_percentages.toString()) || 5;

      const getTotalWallArea = (): number => {
        const DEFAULT_DOOR_AREA = 0.9 * 2.1; 
        const DEFAULT_WINDOW_AREA = 1.2 * 1.2;

        let totalWallArea = 0;

        rooms.forEach(room => {
          const l = parseFloat(room.length) || 0;
          const w = parseFloat(room.width) || 0;
          const h = parseFloat(room.height) || 0;
          const doors = parseInt(room.doors) || 0;
          const windows = parseInt(room.windows) || 0;

          if (l <= 0 || w <= 0 || h <= 0) return;

          const perimeter = 2 * (l + w);
          const grossWallArea = perimeter * h;
          const openingArea = (doors * DEFAULT_DOOR_AREA) + (windows * DEFAULT_WINDOW_AREA);
          const netWallArea = grossWallArea - openingArea;

          totalWallArea += netWallArea;
        });

        return Math.round(totalWallArea * 100) / 100; 
      };


      const wallArea = getTotalWallArea();

      const estimateMaterials = () => {
        const brickMat = materials.find(m => m.name.toLowerCase() === 'bricks');
        const cementMat = materials.find(m => m.name.toLowerCase() === 'cement');
        const sandMat = materials.find(m => m.name.toLowerCase() === 'sand');

        const BRICKS_PER_SQM = 50;
        const CEMENT_PER_SQM = 0.03;
        const SAND_PER_SQM = 0.07;

        const bricksRequired = Math.round(BRICKS_PER_SQM * wallArea * wastageFactor);
        const cementRequired = Math.round((CEMENT_PER_SQM * wallArea * wastageFactor) * 50); 
        const sandRequired = parseFloat((SAND_PER_SQM * wallArea * wastageFactor).toFixed(2));

        const brickCost = brickMat ? bricksRequired * brickMat.price : 0 ;
        const cementCost = cementMat ? cementRequired * cementMat.price : 0 ;
        const sandCost = sandMat ? sandRequired * sandMat.price : 0;
        
        const brickProfit = brickCost * defaultProfitMargin;
        const cementProfit = cementCost * defaultProfitMargin;
        const sandProfit = sandCost * defaultProfitMargin;

        return {
          materials: [
            {
              name: 'Bricks',
              quantity: bricksRequired,
              unit_price: brickMat?.price || 0,
              total_price: brickCost,
              profit_margin: defaultProfitMargin
            },
            {
              name: 'Cement',
              quantity: cementRequired,
              unit_price: cementMat?.price || 0,
              total_price: cementCost,
              profit_margin: defaultProfitMargin
            },
            {
              name: 'Sand',
              quantity: sandRequired,
              unit_price: sandMat?.price || 0,
              total_price: sandCost,
              profit_margin: defaultProfitMargin
            }
          ],
          totalMaterialCost: brickCost + cementCost + sandCost + brickProfit + cementProfit + sandProfit,
          profitMaterials: brickProfit + cementProfit + sandProfit
        };
      };

      const { materials: materialBreakdown, totalMaterialCost, profitMaterials } = estimateMaterials();

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

      const cementCost = cementMat ? cementRequired * cementMat.price : 0 ;
      const sandCost = sandMat ? sandRequired * sandMat.price : 0 ;
      const ballastCost = ballastMat ? ballastRequired * ballastMat.price : 0;

      const ballastProfit = ballastCost * defaultProfitMargin;
      const cementProfit = cementCost * defaultProfitMargin;
      const sandProfit = sandCost * defaultProfitMargin;

      const totalConcreteCost = cementCost + cementProfit + sandCost + sandProfit + ballastCost + ballastProfit;
      const totalFoundationProfit = ballastProfit + cementProfit + sandProfit;

      const concreteBreakdown = [
        {
          name: 'Cement (Foundation)',
          quantity: cementRequired,
          unit_price: cementMat?.price || 0,
          total_price: cementCost,
          profit_margin: defaultProfitMargin
        },
        {
          name: 'Sand (Foundation)',
          quantity: sandRequired,
          unit_price: sandMat?.price || 0,
          total_price: sandCost,
          profit_margin: defaultProfitMargin
        },
        {
          name: 'Ballast (Foundation)',
          quantity: ballastRequired,
          unit_price: ballastMat?.price || 0,
          total_price: ballastCost,
          profit_margin: defaultProfitMargin
        }
      ];

      const formworkArea = wallArea + (params.foundation_length * params.foundation_width);
      const formworkMat = materials.find(m => m.name.toLowerCase() === 'formwork');
      const formworkCost = formworkArea * (formworkMat?.price || 0) ;

      const formworkProfit = formworkCost * defaultProfitMargin

      const formworkBreakdown = [
        {
          name: 'Formwork',
          quantity: formworkArea,
          unit_price: formworkMat?.price || 0,
          total_price: formworkCost + formworkProfit,
          profit_margin: defaultProfitMargin
        }
      ];

      const rebarDensity = 7850; 
      const rebarVolume = foundationVolume * (rebar_percentages / 100);
      const rebarWeight = (rebarVolume * rebarDensity) / 1000;
      const rebarMat = materials.find(m => m.name.toLowerCase() === 'rebar');
      const rebarCost = rebarMat ? rebarWeight * rebarMat.price : 0 ;

      const rebarProfit = rebarCost * defaultProfitMargin;

      const rebarBreakdown = [
        {
          name: 'Rebar',
          quantity: rebarWeight,
          unit_price: rebarMat?.price || 0,
          total_price: rebarCost + rebarProfit,
          profit_margin: defaultProfitMargin
        }
      ];

      const plasterThickness = plaster_thickness || 0.012; 
      const plasterVolume = wallArea * plasterThickness;
      const plasterCementPerM3 = 0.25;
      const plasterSandPerM3 = 1.2; 

      const plasterCementRequired = plasterCementPerM3 * plasterVolume * 50;
      const plasterSandRequired = plasterSandPerM3 * plasterVolume;

      const plasterCementMat = materials.find(m => m.name.toLowerCase() === 'cement');
      const plasterSandMat = materials.find(m => m.name.toLowerCase() === 'sand');

      const plasterCementCost = plasterCementMat ? plasterCementRequired * plasterCementMat.price : 0;
      const plasterSandCost = plasterSandMat ? plasterSandRequired * plasterSandMat.price : 0;

      const plasterCementProfit = plasterCementCost * defaultProfitMargin;
      const plasterSandProfit = plasterSandCost * defaultProfitMargin;

      const totalPlasterCost = plasterCementCost + plasterSandCost + plasterCementProfit + plasterSandProfit;

      const plasterBreakdown = [
        {
          name: 'Cement (Plaster)',
          quantity: plasterCementRequired,
          unit_price: plasterCementMat?.price || 0,
          total_price: plasterCementCost + plasterCementProfit,
          profit_margin: defaultProfitMargin
        },
        {
          name: 'Sand (Plaster)',
          quantity: plasterSandRequired,
          unit_price: plasterSandMat?.price || 0,
          total_price: plasterSandCost + plasterSandProfit,
          profit_margin: defaultProfitMargin
        }
      ];

      const laborCost = totalMaterialCost * (labor_percentages / 100);

      const equipmentCost = equipment.reduce((total, item) => {
        return total + (item.daily_rate * item.days);
      }, 0);

      const ceilingMat = materials.find(m => m.name.toLowerCase() === 'ceiling board');
      const ceilingArea = rooms.reduce((total, room) => {
        const l = parseFloat(room.length) || 0;
        const w = parseFloat(room.width) || 0;
        return total + (l * w);
      }, 0);

      const ceilingCost = ceilingMat ? ceilingArea * ceilingMat.price : 0 ;
      const ceilingProfit = ceilingCost * defaultProfitMargin

      const ceilingBreakdown = [
        {
          name: 'Ceiling Board',
          quantity: ceilingArea,
          unit_price: ceilingMat?.price || 0,
          total_price: ceilingCost + ceilingProfit,
          profit_margin: defaultProfitMargin
        }
      ];

      const flooringMat = materials.find(m => m.name.toLowerCase() === 'floor');
      const flooringArea = rooms.reduce((total, room) => {
        const l = parseFloat(room.length) || 0;
        const w = parseFloat(room.width) || 0;
        return total + (l * w);
      }, 0);

      const flooringCost = flooringMat ? flooringArea * flooringMat.price : 0 ;
      const flooringProfit = flooringCost * defaultProfitMargin

      const flooringBreakdown = [
        {
          name: 'Floor',
          quantity: flooringArea,
          unit_price: flooringMat?.price || 0,
          total_price: flooringCost + flooringProfit,
          profit_margin: defaultProfitMargin
        }
      ];

      const percentages = [{
        labour: labor_percentages,
        rebar: rebar_percentages,
        wastage: wastage_percentages,
        overhead: overhead_percentages,
        profit: profit_percentages,
        contingency: contingency_percentages,
      }]

      const transportCost = (() => {
        const region = profile?.location || 'Nairobi';
        const rateForRegion = transportRates.find(r => r.region === region);
        const defaultTransportRate = { cost_per_km: 50, base_cost: 500 };

        if (!rateForRegion) {
          console.warn(`No transport rate for ${region}. Using defaults.`);
          return (distance_km * defaultTransportRate.cost_per_km) + defaultTransportRate.base_cost;
        }
        
        return (distance_km * rateForRegion.cost_per_km) + rateForRegion.base_cost;
      })();

      const selectedSubcontractors = subcontractors ?? [];

      let addonsPrices = 0;

      addons.forEach(addon => {
        addonsPrices += Number(addon.price) || 0;
      });


      const { updatedSubcontractors, subcontractorRates, subcontractorProfit } = (() => {
        let totalAll = 0;
        let profitSub = 0;

        const updated = selectedSubcontractors.map(sub => {
          let total = 100;

          if (sub.subcontractor_payment_plan?.toLowerCase() === "daily") {
            total = (Number(sub.price) || 10) * (Number(sub.days) || 0);
          } else if (sub.subcontractor_payment_plan?.toLowerCase() === "full") {
            total = Number(sub.total) || 0;
          }

          profitSub =  (total * profit_percentages);
          totalAll += total

          return {
            ...sub,
            total
          };
        });

        return { updatedSubcontractors: updated, subcontractorRates: totalAll, subcontractorProfit: profitSub };
      })();


      const servicesCost = services.reduce((total, s) => {
        return total + (s.price ?? 0);
      }, 0);

      const permitCost = permit_cost || 0;

      var subtotalBeforeExtras;
      if(contract_type === 'full_contract'){
        subtotalBeforeExtras = totalMaterialCost + transportCost + laborCost + equipmentCost + servicesCost + totalConcreteCost + formworkCost + rebarCost + totalPlasterCost + ceilingCost;
      }
      else{
        subtotalBeforeExtras = laborCost + equipmentCost + servicesCost + formworkCost + rebarCost + subcontractorRates ;
      }
      const overheadAmount = subtotalBeforeExtras * (parseFloat(overhead_percentages.toString()) || 0) / 100;

      const contingencyAmount = subtotalBeforeExtras * (parseFloat(contingency_percentages.toString()) || 0) / 100;

      const subtotalWithExtras = subtotalBeforeExtras + overheadAmount + contingencyAmount + permitCost + addonsPrices;

      const profitAmount = profitMaterials + flooringProfit + subcontractorProfit + ceilingProfit + plasterCementProfit + plasterSandProfit + totalFoundationProfit + formworkProfit + rebarProfit;

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
        selected_services_cost: servicesCost,
        distance_km: distance_km,

        permit_cost: permitCost,
        contingency_amount: contingencyAmount,
        subtotal: subtotalBeforeExtras,
        overhead_amount: overheadAmount,
        profit_amount: profitAmount,
        total_amount: totalAmount,

        subcontractors: updatedSubcontractors,

        rooms: rooms,
        addons_cost: addonsPrices,
        addons: addons,

          materials: materialBreakdown,
          percentages: percentages,
          labor: [{ type: 'calculated', percentage: labor_percentages, cost: laborCost }],
          equipment: equipment.map(item => {
            return {
              ...item,
              total_cost: item.daily_rate * item.days
            };
          }),

          services: services.map(s => ({
            id: s.id,
            name: s.name,
            price: s.price ?? 0
          })),

          concrete: concreteBreakdown,
          formwork: formworkBreakdown,
          rebar: rebarBreakdown,
          plaster: plasterBreakdown,
          ceiling: ceilingBreakdown  
      };

    } finally {
      setLoading(false);
    }
  };

  return {
    materials,
    equipmentRates,
    transportRates,
    services,
    loading,
    calculateQuote
  };
};