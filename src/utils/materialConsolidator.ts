// © 2025 Jeff. All rights reserved.
// Unauthorized copying, distribution, or modification of this file is strictly prohibited.

import { CategorizedMaterial } from "./advancedMaterialExtractor";
import { WorkItem, WorkItemMaterial } from "@/services/geminiService";

export interface ConsolidatedMaterial {
  itemNo: string;
  description: string;
  unit: string;
  quantity: number;
  rate: number;
  amount: number;
  locations: string[];
  category: string;
}

export interface WorkItemForConsolidation {
  workNumber: string;
  workDescription: string;
  workQuantity: number;
  workUnit: string;
  materials: WorkItemMaterial[];
  subtotal: number;
}

export class MaterialConsolidator {
  static consolidateToWorkItems(
    workItems: WorkItem[],
  ): WorkItemForConsolidation[] {
    return workItems.map((workItem, index) => ({
      workNumber: `WI-${String(index + 1).padStart(3, "0")}`,
      workDescription: workItem.workDescription,
      workQuantity: workItem.workQuantity,
      workUnit: workItem.workUnit,
      materials: this.consolidateMaterialsForWorkItem(workItem.materials || []),
      subtotal: workItem.subtotal || 0,
    }));
  }

  private static consolidateMaterialsForWorkItem(
    materials: WorkItemMaterial[],
  ): WorkItemMaterial[] {
    const materialMap = new Map<string, WorkItemMaterial>();

    materials.forEach((material) => {
      const key = `${this.cleanDescription(material.description)}_${
        material.unit
      }`.toLowerCase();

      if (materialMap.has(key)) {
        const existing = materialMap.get(key)!;
        existing.quantity += material.quantity;
        existing.amount += material.amount;
        if (existing.quantity > 0) {
          existing.rate = existing.amount / existing.quantity;
        }
      } else {
        materialMap.set(key, {
          ...material,
          description: this.cleanDescription(material.description),
        });
      }
    });

    return Array.from(materialMap.values());
  }

  static consolidateAllMaterials(
    materials: CategorizedMaterial[],
  ): ConsolidatedMaterial[] {
    const materialMap = new Map<string, ConsolidatedMaterial>();
    materials.forEach((material) => {
      if (material.materialBreakdown) {
        material.materialBreakdown.forEach((breakdown) => {
          const key = `${this.cleanDescription(breakdown.material)}_${
            breakdown.unit
          }_${breakdown.category}`.toLowerCase();
          if (materialMap.has(key)) {
            const existing = materialMap.get(key)!;
            existing.quantity += material.quantity * breakdown.ratio;
            existing.amount +=
              material.rate * breakdown.ratio * material.quantity;
            if (
              material.location &&
              !existing.locations.includes(material.location)
            ) {
              existing.locations.push(material.location);
            }
            if (existing.quantity > 0) {
              existing.rate = existing.amount / existing.quantity;
            }
          } else {
            materialMap.set(key, {
              itemNo: material.itemNo,
              description: this.cleanDescription(breakdown.material),
              unit: breakdown.unit,
              quantity: material.quantity * breakdown.ratio,
              rate: material.rate * breakdown.ratio,
              amount: material.rate * breakdown.ratio * material.quantity,
              locations: material.location ? [material.location] : [],
              category: material.category,
            });
          }
        });
        return;
      }
      const key = `${this.cleanDescription(material.description)}_${
        material.unit
      }_${material.category}`.toLowerCase();
      if (materialMap.has(key)) {
        const existing = materialMap.get(key)!;
        existing.quantity += material.quantity;
        existing.amount += material.amount;
        if (
          material.location &&
          !existing.locations.includes(material.location)
        ) {
          existing.locations.push(material.location);
        }
        if (existing.quantity > 0) {
          existing.rate = existing.amount / existing.quantity;
        }
      } else {
        materialMap.set(key, {
          itemNo: material.itemNo,
          description: this.cleanDescription(material.description),
          unit: material.unit,
          quantity: material.quantity,
          rate: material.rate,
          amount: material.amount,
          locations: material.location ? [material.location] : [],
          category: material.category,
        });
      }
    });
    return Array.from(materialMap.values()).map((material, index) => ({
      ...material,
      itemNo: this.generateItemNumber(index),
      description: this.generateConsolidatedDescription(material),
    }));
  }

  private static cleanDescription(description: string): string {
    return description.trim();
  }

  private static generateConsolidatedDescription(
    material: ConsolidatedMaterial,
  ): string {
    return material.description;
  }

  private static generateItemNumber(index: number): string {
    const numbers = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    return numbers[index] || `Z${index - 35}`;
  }
}
