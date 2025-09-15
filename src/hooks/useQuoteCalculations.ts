import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import {
  RegionalMultiplier,
  useDynamicPricing,
} from "@/hooks/useDynamicPricing";
import { useUserSettings } from "@/hooks/useUserSettings";
import { EquipmentType } from "@/hooks/useUserSettings";
import { AdditionalService } from "@/hooks/useUserSettings";
import { UserEquipmentRate } from "@/hooks/useUserSettings";
import { UserServiceRate } from "@/hooks/useUserSettings";
import { UserSubcontractorRate } from "@/hooks/useUserSettings";
import { UserMaterialPrice } from "@/hooks/useUserSettings";
import { UserTransportRate } from "@/hooks/useUserSettings";
import { useLocation } from "react-router-dom";
import { Sun } from "lucide-react";
import { calculateConcrete } from "./useConcreteCalculator";
import ConcreteCalculatorForm from "@/components/ConcreteCalculatorForm";

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
  total_cost: number;
  equipment_type_id: string;
}

export interface Percentage {
  labour: number;
  overhead: number;
  profit: number;
  contingency: number;
}

export interface Subcontractors {
  id: string;
  name: string;
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
    doors: any[];
    windows: any[];
    blockType: string;
    thickness: string;
    customBlock: {
      price: string;
      height: string;
      length: string;
      thickness: string;
    };
    roomArea: number;
    plasterArea: number;
    openings: number;
    netArea: number;
    blocks: number;
    mortar: number;
    plaster: string;
    blockCost: number;
    mortarCost: number;
    plasterCost: number;
    openingsCost: number;
    cementBags: number;
    cementCost: number;
    sandVolume: number;
    sandCost: number;
    stoneVolume: number;
    totalCost: number;
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
  custom_specs: string;
  floors: number;
  status: string;
  concrete_rows: [];
  rebar_rows: [];
  mortar_ratio: string;
  concrete_mix_ratio: string;
  plaster_thickness: number;
  include_wastage: boolean;
  equipment: EquipmentItem[];
  services: AdditionalService[];
  boqData: any[];
  distance_km: number;
  percentages: Percentage[];
  contract_type: "full_contract" | "labor_only";
  region: string;
  materials_cost: number;
  masonry_materials: any;
  concrete_materials: any[];
  rebar_calculations: any[];
  preliminaries: any[];
  total_wall_area: number;
  total_concrete_volume: number;
  total_formwork_area: number;
  total_rebar_weight: number;
  total_plaster_volume: number;
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
  labor_cost: number;
  subcontractors_profit: number;
  subcontractors_cost: number;
  material_profits: number;
  equipment_cost: number;
  transport_cost: number;
  selected_services_cost: number;
  distance_km: number;
  permit_cost: number;
  contract_type: string;
  contingency_amount: number;
  subtotal: number;
  overhead_amount: number;
  profit_amount: number;
  total_amount: number;
  materials_cost: number;
  preliminariesCost: number;
  regional_multiplier: number;
  subcontractors: Subcontractors[];
  percentages: Percentage[];
  labor: Array<{
    type: string;
    percentage: number;
    cost: number;
  }>;
  equipment: Array<{
    name: string;
    total_cost: number;
  }>;
  services: Array<{
    name: string;
    price: number;
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
      .from("material_base_prices")
      .select("*");

    const { data: overrides, error: overrideError } = await supabase
      .from("user_material_prices")
      .select("material_id, region, price")
      .eq("user_id", profile.id);

    if (baseError) console.error("Base materials error:", baseError);
    if (overrideError) console.error("Overrides error:", overrideError);

    const merged = baseMaterials.map((material) => {
      const userRegion = profile?.location || "Nairobi";
      const userRate = overrides?.find(
        (o) => o.material_id === material.id && o.region === userRegion
      );
      const price = userRate ? userRate.price : material.price ?? 0;

      const multiplier =
        regionalMultipliers.find((r) => r.region === userRegion)?.multiplier ||
        1;
      const result = price * multiplier;

      return {
        ...material,
        result,
        source: userRate ? "user" : material.price != null ? "base" : "none",
      };
    });

    setMaterials(merged);
  }, [user, profile.location, location.key]);

  const fetchServices = useCallback(async () => {
    const { data: baseServices, error: baseError } = await supabase
      .from("additional_services")
      .select("*");

    const { data: overrides, error: overrideError } = await supabase
      .from("user_service_rates")
      .select("service_id, price")
      .eq("user_id", profile.id);

    if (baseError) console.error("Base services error:", baseError);
    if (overrideError) console.error("Overrides error:", overrideError);

    const merged = baseServices.map((service) => {
      const userRate = overrides?.find((o) => o.service_id === service.id);
      const price = userRate ? userRate.price : service.price ?? 0;

      return {
        ...service,
        price,
        source: userRate ? "user" : service.price != null ? "base" : "none",
      };
    });

    setServices(merged);
  }, [user, profile, location.key]);

  const fetchRates = async () => {
    const { data: baseServices, error: baseError } = await supabase
      .from("subcontractor_prices")
      .select("*");

    const { data: overrides, error: overrideError } = await supabase
      .from("user_subcontractor_rates")
      .select("service_id, price")
      .eq("user_id", profile.id);

    if (baseError) console.error("Base rates error:", baseError);
    if (overrideError) console.error("Overrides error:", overrideError);

    const merged = baseServices.map((service) => {
      const userRate = overrides?.find((o) => o.service_id === service.id);
      const rate = userRate
        ? Number(userRate.price)
        : service.price != null
        ? Number(service.price)
        : 0;

      return {
        ...service,
        price: rate,
        unit: service.unit ?? "unit",
        source: userRate ? "user" : service.price != null ? "base" : "none",
      };
    });

    setSubcontractors(merged);
  };

  const fetchEquipment = useCallback(async () => {
    const { data: baseEquipment, error: baseError } = await supabase
      .from("equipment_types")
      .select("*");

    const { data: overrides, error: overrideError } = await supabase
      .from("user_equipment_rates")
      .select("equipment_type_id, total_cost")
      .eq("user_id", profile.id);

    if (baseError) console.error("Base equipment error:", baseError);
    if (overrideError) console.error("Overrides error:", overrideError);

    const merged = baseEquipment.map((equipment) => {
      const userRate = overrides?.find(
        (o) => o.equipment_type_id === equipment.id
      );
      const rate = userRate ? userRate.total_cost : equipment.total_cost ?? 0;

      return {
        ...equipment,
        total_cost: rate,
        source: userRate
          ? "user"
          : equipment.total_cost != null
          ? "base"
          : "none",
      };
    });

    setEquipmentRates(merged);
  }, [user, location.key]);

  const fetchTransportRates = useCallback(async () => {
    const { data: baseRates, error: baseError } = await supabase
      .from("transport_rates")
      .select("*");

    const { data: overrides, error: overrideError } = await supabase
      .from("user_transport_rates")
      .select("region, cost_per_km, base_cost")
      .eq("user_id", profile.id);

    if (baseError) console.error("Base transport rates error:", baseError);
    if (overrideError) console.error("Overrides error:", overrideError);

    const allRegions = [
      "Nairobi",
      "Mombasa",
      "Kisumu",
      "Nakuru",
      "Eldoret",
      "Thika",
      "Machakos",
    ];

    const merged = allRegions.map((region) => {
      const base = baseRates.find(
        (r) => r.region.toLowerCase() === region.toLowerCase()
      );
      const userRate = overrides?.find(
        (o) => o.region.toLowerCase() === region.toLowerCase()
      );

      return {
        id: profile.id,
        region,
        cost_per_km: userRate?.cost_per_km ?? base?.cost_per_km ?? 50,
        base_cost: userRate?.base_cost ?? base?.base_cost ?? 500,
        source: userRate ? "user" : base ? "base" : "default",
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

  const calculateQuote = async (
    params: QuoteCalculation
  ): Promise<CalculationResult> => {
    if (!user || !profile) throw new Error("User not authenticated");
    setLoading(true);

    try {
      const {
        include_wastage,
        boqData,
        equipment,
        services,
        subcontractors,
        distance_km,
        labor_percentages,
        overhead_percentages,
        profit_percentages,
        contingency_percentages,
        permit_cost,
        contract_type,
        preliminaries,
      } = params;

      const calculatePreliminariesTotal = (): number => {
        if (!Array.isArray(preliminaries)) return 10;

        return preliminaries.reduce((total, prelim) => {
          return (
            total +
            prelim.items.reduce((subTotal, item) => {
              if (item.isHeader) return subTotal; // skip headers
              return subTotal + (item.amount || 10);
            }, 10)
          );
        }, 0);
      };

      const calculateMaterialTotals = (): number => {
        let total = 0;

        // BOQ materials
        if (boqData) {
          boqData.forEach((section) => {
            section.items.forEach((item) => {
              if (!item.isHeader) {
                total += item.amount || 0;
              }
            });
          });
        }

        return total;
      };

      const materials_cost = calculateMaterialTotals();
      const preliminariesCost = calculatePreliminariesTotal();
      const defaultProfitMargin =
        parseFloat(profit_percentages.toString()) / 100;

      // ✅ Apply profit margin
      const materialProfits = materials_cost * defaultProfitMargin;

      const laborCost = Math.round(materials_cost * (labor_percentages / 100));

      const equipmentCost = equipment.reduce((total, item) => {
        return total + item.total_cost;
      }, 0);

      const percentages = [
        {
          labour: labor_percentages,
          overhead: overhead_percentages,
          profit: profit_percentages,
          contingency: contingency_percentages,
        },
      ];

      const transportCost = (() => {
        const region = profile?.location || "Nairobi";
        const rateForRegion = transportRates.find((r) => r.region === region);
        const defaultTransportRate = { cost_per_km: 50, base_cost: 500 };

        if (!rateForRegion) {
          console.warn(`No transport rate for ${region}. Using defaults.`);
          return (
            distance_km * defaultTransportRate.cost_per_km +
            defaultTransportRate.base_cost
          );
        }

        return (
          distance_km * rateForRegion.cost_per_km + rateForRegion.base_cost
        );
      })();

      const selectedSubcontractors = subcontractors ?? [];

      const { updatedSubcontractors, subcontractorRates, subcontractorProfit } =
        (() => {
          let totalAll = 0;
          let profitSub = 0;

          const updated = selectedSubcontractors.map((sub) => {
            let total = 0;

            if (sub.subcontractor_payment_plan?.toLowerCase() === "daily") {
              total = (Number(sub.price) || 10) * (Number(sub.days) || 0);
            } else if (
              sub.subcontractor_payment_plan?.toLowerCase() === "full"
            ) {
              total = Number(sub.total) || 0;
            }
            sub.total = total;

            profitSub = total * profit_percentages;
            totalAll += total;

            return {
              ...sub,
              total,
            };
          });

          return {
            updatedSubcontractors: updated,
            subcontractorRates: totalAll,
            subcontractorProfit: profitSub,
          };
        })();

      const servicesCost = services.reduce((total, s) => {
        return total + (s.price ?? 0);
      }, 0);

      const permitCost = permit_cost || 0;

      var subtotalBeforeExtras;
      if (contract_type === "full_contract") {
        subtotalBeforeExtras =
          materials_cost +
          transportCost +
          laborCost +
          equipmentCost +
          servicesCost +
          subcontractorRates +
          preliminariesCost;
      } else {
        subtotalBeforeExtras =
          laborCost +
          equipmentCost +
          servicesCost +
          preliminariesCost +
          subcontractorRates;
      }
      const overheadAmount =
        (subtotalBeforeExtras *
          (parseFloat(overhead_percentages.toString()) || 0)) /
        100;

      const contingencyAmount =
        (subtotalBeforeExtras *
          (parseFloat(contingency_percentages.toString()) || 0)) /
        100;

      const subtotalWithExtras =
        subtotalBeforeExtras + overheadAmount + contingencyAmount + permitCost;

      const profitAmount = Math.round(subcontractorProfit + materialProfits);

      const totalAmount = Math.round(subtotalWithExtras + profitAmount);

      // Add this to your useQuoteCalculations hook

      return {
        labor_cost: laborCost,
        equipment_cost: equipmentCost,
        transport_cost: transportCost,
        selected_services_cost: servicesCost,
        subcontractors_cost: subcontractorRates, // Add this
        subcontractors_profit: subcontractorProfit, // Add this
        material_profits: materialProfits, // Add this
        distance_km: distance_km,
        permit_cost: permitCost,
        contingency_amount: contingencyAmount,
        subtotal: subtotalBeforeExtras,
        overhead_amount: overheadAmount,
        profit_amount: profitAmount,
        total_amount: totalAmount,
        materials_cost: materials_cost,
        preliminariesCost: preliminariesCost,
        subcontractors: updatedSubcontractors,
        percentages: percentages,
        labor: [
          {
            type: "calculated",
            percentage: labor_percentages,
            cost: laborCost,
          },
        ],
        equipment: equipment.map((item) => {
          return {
            ...item,
            total_cost: item.total_cost,
          };
        }),
        services: services.map((s) => ({
          id: s.id,
          name: s.name,
          price: s.price ?? 0,
        })),
        // Add these new properties
        regional_multiplier:
          regionalMultipliers.find(
            (r) => r.region === (profile?.location || "Nairobi")
          )?.multiplier || 1,
        contract_type: contract_type,
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
    calculateQuote,
  };
};
