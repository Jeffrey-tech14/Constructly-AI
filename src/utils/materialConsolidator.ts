// src/utils/materialConsolidator.ts
import { CategorizedMaterial } from "./advancedMaterialExtractor";

export interface ConsolidatedMaterial {
  itemNo: string;
  description: string;
  unit: string;
  quantity: number;
  rate: number;
  amount: number;
  locations: string[];
}

export class MaterialConsolidator {
  static consolidateAllMaterials(
    materials: CategorizedMaterial[]
  ): ConsolidatedMaterial[] {
    const materialMap = new Map<string, ConsolidatedMaterial>();

    materials.forEach((material) => {
      // Create a more specific key to avoid over-consolidation
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

        // Update rate to weighted average
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
    return description
      .replace(/\([^)]*\)/g, "")
      .replace(/\s*-\s*[^-]*$/g, "")
      .replace(/\s+/g, " ")
      .trim();
  }

  private static generateConsolidatedDescription(
    material: ConsolidatedMaterial
  ): string {
    const baseDescription = material.description;
    if (material.locations.length > 0) {
      const locationInfo =
        material.locations.length > 3
          ? `${material.locations.slice(0, 3).join(", ")} +${
              material.locations.length - 3
            } more`
          : material.locations.join(", ");
      return `${baseDescription} (${locationInfo})`;
    }
    return baseDescription;
  }

  private static generateItemNumber(index: number): string {
    const numbers = "123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    return numbers[index] || `Z${index - 35}`;
  }
}
