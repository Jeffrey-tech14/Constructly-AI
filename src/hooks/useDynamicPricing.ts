// © 2025 Jeff. All rights reserved.
// Unauthorized copying, distribution, or modification of this file is strictly prohibited.

import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useLocation } from "react-router-dom";
export interface MaterialBasePrice {
  id: string;
  name: string;
  unit: string;
  price: number;
  category: string;
  description?: string;
}
export interface UserMaterialPrice {
  id: string;
  material_id: string;
  price: number;
  region: string;
}
export interface UserLaborOverride {
  id: string;
  labor_type_id: string;
  custom_rate: number;
  region: string;
}
export interface UserServiceOverride {
  id: string;
  service_id: string;
  custom_price: number;
  region: string;
}
export interface UserEquipmentOverride {
  id: string;
  equipment_id: string;
  custom_rate: number;
  region: string;
}
export interface RegionalMultiplier {
  id: string;
  region: string;
  multiplier: number;
}
export type RebarVariant = {
  size: string;
  diameter_mm: number;
  unit_weight_kg_per_m: number;
  price_kes_per_kg: number;
};
export type BlockVariant = {
  id: number;
  name: string;
  dimensions_m: {
    length: number;
    height: number;
    thickness: number;
  };
  unit: string;
  price_kes: number;
};
export type DoorVariant = {
  type: string;
  sizes_m: string[];
  frame_options: string[];
  price_kes: Record<string, number>;
};
export type WindowVariant = {
  glass_type: string;
  sizes_m: string[];
  frame_options: string[];
  price_kes: Record<string, number>;
};
export type MaterialBase = {
  id: string;
  name: string;
  unit?: string;
  price?: number;
  type?: any[];
};
export type UserMaterialOverride = {
  material_id: string;
  user_id: string;
  region: string;
  price?: number;
  type?: any[];
};
export const useDynamicPricing = () => {
  const { user, profile } = useAuth();
  const [materialBasePrices, setMaterialBasePrices] = useState<
    MaterialBasePrice[]
  >([]);
  const [userMaterialPrices, setUserMaterialPrices] = useState<
    UserMaterialPrice[]
  >([]);
  const [userLaborOverrides, setUserLaborOverrides] = useState<
    UserLaborOverride[]
  >([]);
  const location = useLocation();
  const [userServiceOverrides, setUserServiceOverrides] = useState<
    UserServiceOverride[]
  >([]);
  const [userEquipmentOverrides, setUserEquipmentOverrides] = useState<
    UserEquipmentOverride[]
  >([]);
  const [regionalMultipliers, setRegionalMultipliers] = useState<
    RegionalMultiplier[]
  >([]);
  const [loading, setLoading] = useState(false);
  const fetchMaterialBasePrices = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from("material_base_prices")
        .select("*")
        .order("name");
      if (error) throw error;
      setMaterialBasePrices(data || []);
    } catch (error) {
      console.error("Error fetching material base prices:", error);
    }
  }, []);
  const fetchRegionalMultipliers = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from("regional_multipliers")
        .select("*")
        .order("region");
      if (error) throw error;
      setRegionalMultipliers(data || []);
    } catch (error) {
      console.error("Error fetching regional multipliers:", error);
    }
  }, []);
  const fetchUserOverrides = useCallback(async () => {
    if (!user) return;
    try {
      const userRegion = profile?.location || "Nairobi";
      const [materialData, laborData, serviceData, equipmentData] =
        await Promise.all([
          supabase
            .from("user_material_prices")
            .select("*")
            .eq("user_id", user.id)
            .eq("region", userRegion),
          supabase
            .from("user_labor_overrides")
            .select("*")
            .eq("user_id", user.id)
            .eq("region", userRegion),
          supabase
            .from("user_service_overrides")
            .select("*")
            .eq("user_id", user.id)
            .eq("region", userRegion),
          supabase
            .from("user_equipment_overrides")
            .select("*")
            .eq("user_id", user.id)
            .eq("region", userRegion),
        ]);
      setUserMaterialPrices(materialData.data || []);
      setUserLaborOverrides(laborData.data || []);
      setUserServiceOverrides(serviceData.data || []);
      setUserEquipmentOverrides(equipmentData.data || []);
    } catch (error) {
      console.error("Error fetching user overrides:", error);
    }
  }, [user?.id, profile?.location]);
  const updateMaterialPrice = async (
    materialName: string,
    materialId: string,
    region: string,
    newData: any,
    index?: number | string,
  ) => {
    if (!user) return { error: "User not authenticated" };
    try {
      const { data: userOverride } = await supabase
        .from("user_material_prices")
        .select("type")
        .eq("user_id", user.id)
        .eq("material_id", materialId)
        .eq("region", region)
        .single();
      let updatedType = userOverride?.type;
      if (!updatedType) {
        const { data: base } = await supabase
          .from("material_base_prices")
          .select("type")
          .eq("id", materialId)
          .single();
        updatedType = base?.type || [];
      } else {
        updatedType = JSON.parse(JSON.stringify(updatedType));
      }

      const indexStr = String(index || "");

      if (Array.isArray(updatedType)) {
        if (materialName === "Rebar" && typeof index === "number") {
          updatedType[index] = {
            ...updatedType[index],
            price_kes_per_kg: newData,
          };
        } else if (
          (materialName === "Bricks" || materialName.includes("Block")) &&
          typeof index === "number"
        ) {
          updatedType[index] = {
            ...updatedType[index],
            price_kes: newData,
          };
        } else if (
          (materialName === "Doors" ||
            materialName === "Windows" ||
            materialName === "Door Frames" ||
            materialName === "Window frames") &&
          typeof index === "string"
        ) {
          const [arrIdx, size] = index.split("-");
          const idxNum = parseInt(arrIdx, 10);
          if (!updatedType[idxNum]) {
            updatedType[idxNum] = {};
          }
          if (!updatedType[idxNum].price_kes) {
            updatedType[idxNum].price_kes = {};
          }
          updatedType[idxNum].price_kes[size] = newData;
        } else if (
          materialName === "Hoop Iron" &&
          indexStr.startsWith("hoop-iron-")
        ) {
          // Hoop Iron: hoop-iron-idx
          const idx = parseInt(indexStr.replace("hoop-iron-", ""), 10);
          updatedType[idx] = {
            ...updatedType[idx],
            price_kes: newData,
          };
        } else if (materialName === "Roof-Covering") {
          // Roof-Covering: roof-timber-roofIdx-timberIdx | roof-sheet-roofIdx-sheetIdx-size | roof-finish-roofIdx-catIdx-typeIdx | roof-accessory-roofIdx-accIdx | roof-roofIdx
          if (indexStr.startsWith("roof-timber-")) {
            const [, roofIdx, timberIdx] = indexStr.split("-");
            const rIdx = parseInt(roofIdx, 10);
            const tIdx = parseInt(timberIdx, 10);
            updatedType[rIdx].structuralTimber[tIdx].price_kes = newData;
          } else if (indexStr.startsWith("roof-sheet-")) {
            const parts = indexStr.split("-");
            const rIdx = parseInt(parts[2], 10);
            const sIdx = parseInt(parts[3], 10);
            const size = parts.slice(4).join("-");
            updatedType[rIdx].roofingSheets[sIdx].sizes[size].price_kes =
              newData;
          } else if (indexStr.startsWith("roof-finish-")) {
            const [, , roofIdx, catIdx, typeIdx] = indexStr.split("-");
            const rIdx = parseInt(roofIdx, 10);
            const cIdx = parseInt(catIdx, 10);
            const tIdx = parseInt(typeIdx, 10);
            updatedType[rIdx].roofingFinishing[cIdx].types[tIdx].price_kes =
              newData;
          } else if (indexStr.startsWith("roof-accessory-")) {
            const [, , roofIdx, accIdx] = indexStr.split("-");
            const rIdx = parseInt(roofIdx, 10);
            const aIdx = parseInt(accIdx, 10);
            updatedType[rIdx].accessories.items[aIdx].price_kes = newData;
          } else if (indexStr.startsWith("roof-")) {
            const roofIdx = parseInt(indexStr.replace("roof-", ""), 10);
            updatedType[roofIdx].price = newData;
          }
        }
      } else if (typeof updatedType === "object" && updatedType !== null) {
        // Handle object type materials
        if (
          materialName === "DPC" ||
          materialName === "Waterproof" ||
          materialName === "Polythene"
        ) {
          updatedType = {
            ...updatedType,
            [index]: newData,
          };
        } else if (materialName === "Ceiling") {
          // Ceiling: ceiling-materialKey
          if (indexStr.startsWith("ceiling-")) {
            const materialKey = indexStr.replace("ceiling-", "");
            const materials = updatedType.materials || updatedType;
            materials[materialKey].price = newData;
          }
        } else if (materialName === "Countertops") {
          // Countertops: countertop-materialKey
          if (indexStr.startsWith("countertop-")) {
            const materialKey = indexStr.replace("countertop-", "");
            const materials = updatedType.materials || updatedType;
            materials[materialKey].price = newData;
          }
        } else if (materialName === "Joinery") {
          // Joinery: joinery-materialKey
          if (indexStr.startsWith("joinery-")) {
            const materialKey = indexStr.replace("joinery-", "");
            const materials = updatedType.materials || updatedType;
            materials[materialKey] = newData;
          }
        } else if (materialName === "Paint") {
          // Paint: paint-materialKey
          if (indexStr.startsWith("paint-")) {
            const materialKey = indexStr.replace("paint-", "");
            const materials = updatedType.materials || updatedType;
            materials[materialKey] = newData;
          }
        } else if (materialName === "Glazing") {
          // Glazing: glazing-materialKey
          if (indexStr.startsWith("glazing-")) {
            const materialKey = indexStr.replace("glazing-", "");
            const materials = updatedType.materials || updatedType;
            materials[materialKey] = newData;
          }
        } else if (materialName === "Flooring") {
          // Flooring: flooring-{category}-{matIdx}-{typeIdx}-{tileSize} or flooring-{category}-{matIdx}-{typeIdx}
          if (indexStr.startsWith("flooring-")) {
            const parts = indexStr.replace("flooring-", "").split("-");
            const category = parts[0];
            const matIdx = parseInt(parts[1], 10);
            const typeIdx = parseInt(parts[2], 10);
            const tileSize = parts[3];

            if (tileSize) {
              // Tile size price
              updatedType[category][matIdx].type[typeIdx].tileTypes[tileSize] =
                newData;
            } else {
              // Simple price
              updatedType[category][matIdx].type[typeIdx].price_kes = newData;
            }
          }
        } else if (materialName === "Wall-Finishes") {
          // Wall-Finishes: wallfinish-{category}-{matIdx}-{typeIdx}-{tileSize} or wallfinish-{category}-{matIdx}-{typeIdx}
          if (indexStr.startsWith("wallfinish-")) {
            try {
              const parts = indexStr.replace("wallfinish-", "").split("-");
              const category = parts[0];
              const matIdx = parseInt(parts[1], 10);
              const typeIdx = parseInt(parts[2], 10);
              const tileSize = parts[3];

              if (!updatedType[category]) {
                console.error(`Category ${category} not found in updatedType`);
                return { error: `Category ${category} not found` };
              }

              if (tileSize) {
                // Tile size price
                if (!updatedType[category][matIdx].type[typeIdx].tileTypes) {
                  updatedType[category][matIdx].type[typeIdx].tileTypes = {};
                }
                updatedType[category][matIdx].type[typeIdx].tileTypes[
                  tileSize
                ] = newData;
              } else {
                // Simple price
                updatedType[category][matIdx].type[typeIdx].price_kes = newData;
              }
            } catch (err) {
              console.error("Error parsing Wall-Finishes index:", err);
              return { error: "Invalid index format for Wall-Finishes" };
            }
          }
        } else if (materialName === "Fixtures") {
          // Fixtures: {idx}-{quality}
          const dashIndex = indexStr.indexOf("-");
          if (dashIndex !== -1) {
            const idx = parseInt(indexStr.substring(0, dashIndex), 10);
            const quality = indexStr.substring(dashIndex + 1);
            if (!updatedType[idx]) updatedType[idx] = {};
            if (!updatedType[idx].price_kes_per_item)
              updatedType[idx].price_kes_per_item = {};
            updatedType[idx].price_kes_per_item[quality] = newData;
          }
        } else if (materialName === "Fasteners") {
          // Fasteners: {category}-{idx}
          const dashIndex = indexStr.lastIndexOf("-");
          if (dashIndex !== -1) {
            const category = indexStr.substring(0, dashIndex);
            const idx = parseInt(indexStr.substring(dashIndex + 1), 10);
            if (!updatedType[category]) updatedType[category] = [];
            if (!updatedType[category][idx]) updatedType[category][idx] = {};
            updatedType[category][idx].price = newData;
          }
        } else if (materialName === "BRC Mesh") {
          // BRC Mesh: {idx}
          const idx = parseInt(indexStr, 10);
          updatedType[idx] = {
            ...updatedType[idx],
            price_kes_per_sqm: newData,
          };
        } else if (materialName === "Pipes") {
          // Pipes: {idx}-{diameter}
          const dashIndex = indexStr.indexOf("-");
          if (dashIndex !== -1) {
            const idx = parseInt(indexStr.substring(0, dashIndex), 10);
            const diameter = indexStr.substring(dashIndex + 1);
            if (!updatedType[idx]) updatedType[idx] = {};
            if (!updatedType[idx].price_kes_per_meter)
              updatedType[idx].price_kes_per_meter = {};
            updatedType[idx].price_kes_per_meter[diameter] = newData;
          }
        } else if (materialName === "Cable") {
          // Cable: {idx}-{size}
          const dashIndex = indexStr.indexOf("-");
          if (dashIndex !== -1) {
            const idx = parseInt(indexStr.substring(0, dashIndex), 10);
            const size = indexStr.substring(dashIndex + 1);
            if (!updatedType[idx]) updatedType[idx] = {};
            if (!updatedType[idx].price_kes_per_meter)
              updatedType[idx].price_kes_per_meter = {};
            updatedType[idx].price_kes_per_meter[size] = newData;
          }
        } else if (materialName === "Lighting") {
          // Lighting: {idx}-{spec}
          const dashIndex = indexStr.indexOf("-");
          if (dashIndex !== -1) {
            const idx = parseInt(indexStr.substring(0, dashIndex), 10);
            const spec = indexStr.substring(dashIndex + 1);
            if (!updatedType[idx]) updatedType[idx] = {};
            if (!updatedType[idx].price_kes_per_unit)
              updatedType[idx].price_kes_per_unit = {};
            updatedType[idx].price_kes_per_unit[spec] = newData;
          }
        } else if (materialName === "Outlets") {
          // Outlets: {idx}-{rating}
          const dashIndex = indexStr.indexOf("-");
          if (dashIndex !== -1) {
            const idx = parseInt(indexStr.substring(0, dashIndex), 10);
            const rating = indexStr.substring(dashIndex + 1);
            if (!updatedType[idx]) updatedType[idx] = {};
            if (!updatedType[idx].price_kes_per_unit)
              updatedType[idx].price_kes_per_unit = {};
            updatedType[idx].price_kes_per_unit[rating] = newData;
          }
        } else if (
          materialName === "Timber" ||
          materialName === "Insulation" ||
          materialName === "UnderLayment"
        ) {
          // Timber/Insulation/UnderLayment: {idx}
          const idx = parseInt(indexStr, 10);
          updatedType[idx] = {
            ...updatedType[idx],
            price: newData,
          };
        } else if (materialName === "Accesories") {
          // Accessories: {category}-{idx}
          const dashIndex = indexStr.lastIndexOf("-");
          if (dashIndex !== -1) {
            const category = indexStr.substring(0, dashIndex);
            const idx = parseInt(indexStr.substring(dashIndex + 1), 10);
            if (!updatedType[category]) updatedType[category] = [];
            if (!updatedType[category][idx]) updatedType[category][idx] = {};
            updatedType[category][idx].price = newData;
          }
        }
      }

      const { error } = await supabase.from("user_material_prices").upsert(
        {
          material_id: materialId,
          user_id: user.id,
          name: materialName,
          region,
          price: 0,
          type: updatedType,
        },
        {
          onConflict: "user_id, material_id, region",
        },
      );
      if (!error) {
        await fetchUserOverrides();
      }
      return { error };
    } catch (error) {
      console.error("Error updating material price:", error);
      return { error };
    }
  };
  const updateLaborRate = async (
    laborTypeId: string,
    customRate: number,
    region: string,
  ) => {
    if (!user) return { error: "User not authenticated" };
    try {
      const rateInCents = Math.round(customRate);
      const { error } = await supabase.from("user_labor_overrides").upsert({
        user_id: user.id,
        labor_type_id: laborTypeId,
        custom_rate: rateInCents,
        region,
      });
      if (!error) {
        await fetchUserOverrides();
      }
      return { error };
    } catch (error) {
      console.error("Error updating labor rate:", error);
      return { error };
    }
  };
  const updateServicePrice = async (
    serviceId: string,
    customPrice: number,
    region: string,
  ) => {
    if (!user) return { error: "User not authenticated" };
    try {
      const priceInCents = Math.round(customPrice);
      const { error } = await supabase.from("user_service_overrides").upsert({
        user_id: user.id,
        service_id: serviceId,
        custom_price: priceInCents,
        region,
      });
      if (!error) {
        await fetchUserOverrides();
      }
      return { error };
    } catch (error) {
      console.error("Error updating service price:", error);
      return { error };
    }
  };
  const updateEquipmentRate = async (
    equipmentId: string,
    customRate: number,
    region: string,
  ) => {
    if (!user) return { error: "User not authenticated" };
    try {
      const rateInCents = Math.round(customRate);
      const { error } = await supabase.from("user_equipment_overrides").upsert({
        user_id: user.id,
        equipment_id: equipmentId,
        custom_rate: rateInCents,
        region,
      });
      if (!error) {
        await fetchUserOverrides();
      }
      return { error };
    } catch (error) {
      console.error("Error updating equipment rate:", error);
      return { error };
    }
  };
  const updateMaterialPriceSingle = async (
    materialId: string,
    materialName: string,
    customPrice: number,
    region: string,
  ) => {
    if (!user) return { error: "User not authenticated" };
    try {
      const priceInCents = Math.round(customPrice);
      const { error } = await supabase.from("user_material_prices").upsert(
        {
          user_id: user.id,
          material_id: materialId,
          name: materialName,
          price: priceInCents,
          region,
        },
        {
          onConflict: "user_id, material_id,region",
        },
      );
      if (!error) {
        await fetchUserOverrides();
      }
      return { error };
    } catch (error) {
      console.error("Error updating material price:", error);
      return { error };
    }
  };
  const getEffectiveMaterialPrice = (
    materialId: string,
    region: string,
    userOverride: any,
    materialBasePrices: any[],
    regionalMultipliers: {
      region: string;
      multiplier: number;
    }[],
  ) => {
    const baseMaterial = materialBasePrices.find((m) => m.id === materialId);
    if (!baseMaterial) return null;
    const multiplier =
      regionalMultipliers.find((r) => r.region === region)?.multiplier || 1;
    if (userOverride) {
      return userOverride;
    }
    const cloned = JSON.parse(JSON.stringify(baseMaterial));
    if (Array.isArray(cloned.type)) {
      cloned.type = cloned.type.map((item) => {
        const updated = { ...item };
        if (typeof updated.price_kes === "number") {
          updated.price_kes = updated.price_kes * multiplier;
        }
        if (typeof updated.price_kes_per_kg === "number") {
          updated.price_kes_per_kg = updated.price_kes_per_kg * multiplier;
        }
        if (updated.price_kes && typeof updated.price_kes === "object") {
          updated.price_kes = Object.fromEntries(
            Object.entries(updated.price_kes).map(([size, price]) => [
              size,
              (price as number) * multiplier,
            ]),
          );
        }
        return updated;
      });
    } else if (typeof cloned.price_kes === "number") {
      cloned.price_kes = cloned.price_kes * multiplier;
    }
    return cloned;
  };
  const getEffectiveMaterialPriceSingle = (
    materialId: string,
    region: string,
  ) => {
    const userOverride = userMaterialPrices.find(
      (p) => p.material_id === materialId && p.region === region,
    );
    if (userOverride) {
      return userOverride.price;
    }
    const basePrice =
      materialBasePrices.find((m) => m.id === materialId)?.price || 0;
    const multiplier =
      regionalMultipliers.find((r) => r.region === region)?.multiplier || 1;
    return basePrice * multiplier;
  };
  useEffect(() => {
    const fetchData = async () => {
      if (!user) return;
      setLoading(true);
      await Promise.all([
        fetchMaterialBasePrices(),
        fetchRegionalMultipliers(),
        fetchUserOverrides(),
      ]);
      setLoading(false);
    };
    fetchData();
  }, [user, profile]);
  return {
    materialBasePrices,
    userMaterialPrices,
    userLaborOverrides,
    userServiceOverrides,
    userEquipmentOverrides,
    regionalMultipliers,
    loading,
    updateMaterialPrice,
    updateMaterialPriceSingle,
    updateLaborRate,
    updateServicePrice,
    updateEquipmentRate,
    getEffectiveMaterialPrice,
    getEffectiveMaterialPriceSingle,
  };
};
