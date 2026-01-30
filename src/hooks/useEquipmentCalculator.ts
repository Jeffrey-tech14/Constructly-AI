// © 2025 Jeff. All rights reserved.
// Unauthorized copying, distribution, or modification of this file is strictly prohibited.

import { useCallback } from "react";

export interface EquipmentItem {
  equipment_type_id: string | number;
  name: string;
  desc?: string;
  usage_quantity: number;
  usage_unit: string;
  rate_per_unit: number;
  total_cost: number;
}

export const useEquipmentCalculator = (
  quoteData: any,
  setQuoteData: (updater: (prev: any) => any) => void,
) => {
  // Add equipment item
  const addEquipment = useCallback(
    (equipment: any, isCustom: boolean = false) => {
      setQuoteData((prev: any) => ({
        ...prev,
        equipment: [
          ...prev.equipment,
          {
            equipment_type_id: equipment.id,
            name: equipment.name || equipment.equipment_name,
            desc: equipment.description,
            usage_quantity: 1,
            usage_unit:
              equipment?.usage_unit || isCustom
                ? equipment.daily_rate
                  ? "day"
                  : "unit"
                : "day",
            rate_per_unit: equipment.rate_per_unit || equipment.daily_rate || 0,
            total_cost: equipment.rate_per_unit || equipment.daily_rate || 0,
          },
        ],
      }));
    },
    [setQuoteData],
  );

  // Remove equipment item
  const removeEquipment = useCallback(
    (equipmentTypeId: string | number) => {
      setQuoteData((prev: any) => ({
        ...prev,
        equipment: prev.equipment.filter(
          (eq: EquipmentItem) => eq.equipment_type_id !== equipmentTypeId,
        ),
      }));
    },
    [setQuoteData],
  );

  // Update quantity
  const updateQuantity = useCallback(
    (equipmentTypeId: string | number, quantity: number) => {
      setQuoteData((prev: any) => ({
        ...prev,
        equipment: prev.equipment.map((eq: EquipmentItem) =>
          eq.equipment_type_id === equipmentTypeId
            ? {
                ...eq,
                usage_quantity: quantity,
                total_cost: quantity * (eq.rate_per_unit || 0),
              }
            : eq,
        ),
      }));
    },
    [setQuoteData],
  );

  // Update usage unit
  const updateUnit = useCallback(
    (equipmentTypeId: string | number, unit: string) => {
      setQuoteData((prev: any) => ({
        ...prev,
        equipment: prev.equipment.map((eq: EquipmentItem) =>
          eq.equipment_type_id === equipmentTypeId
            ? { ...eq, usage_unit: unit }
            : eq,
        ),
      }));
    },
    [setQuoteData],
  );

  // Update rate per unit
  const updateRate = useCallback(
    (equipmentTypeId: string | number, rate: number) => {
      setQuoteData((prev: any) => ({
        ...prev,
        equipment: prev.equipment.map((eq: EquipmentItem) =>
          eq.equipment_type_id === equipmentTypeId
            ? {
                ...eq,
                rate_per_unit: rate,
                total_cost: (eq.usage_quantity || 1) * rate,
              }
            : eq,
        ),
      }));
    },
    [setQuoteData],
  );

  // Update equipment name (for custom equipment)
  const updateName = useCallback(
    (equipmentTypeId: string | number, name: string) => {
      setQuoteData((prev: any) => ({
        ...prev,
        equipment: prev.equipment.map((eq: EquipmentItem) =>
          eq.equipment_type_id === equipmentTypeId ? { ...eq, name } : eq,
        ),
      }));
    },
    [setQuoteData],
  );

  // Get equipment item by ID
  const getEquipmentItem = useCallback(
    (equipmentTypeId: string | number): EquipmentItem | undefined => {
      return quoteData.equipment?.find(
        (eq: EquipmentItem) => eq.equipment_type_id === equipmentTypeId,
      );
    },
    [quoteData.equipment],
  );

  // Check if equipment is selected
  const isEquipmentSelected = useCallback(
    (equipmentTypeId: string | number): boolean => {
      return quoteData.equipment?.some(
        (eq: EquipmentItem) => eq.equipment_type_id === equipmentTypeId,
      );
    },
    [quoteData.equipment],
  );

  // Calculate total equipment cost
  const calculateTotalEquipmentCost = useCallback((): number => {
    return (
      quoteData.equipment?.reduce(
        (total: number, eq: EquipmentItem) => total + (eq.total_cost || 0),
        0,
      ) || 0
    );
  }, [quoteData.equipment]);

  return {
    equipment: quoteData.equipment || [],
    addEquipment,
    removeEquipment,
    updateQuantity,
    updateUnit,
    updateRate,
    updateName,
    getEquipmentItem,
    isEquipmentSelected,
    calculateTotalEquipmentCost,
  };
};

export default useEquipmentCalculator;
