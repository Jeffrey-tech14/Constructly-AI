// src/utils/advancedMaterialExtractor.ts
import { BOQSection, BOQItem } from "@/types/boq";
import {
  geminiService,
  GeminiMaterialResponse,
} from "@/services/geminiService";

export interface CategorizedMaterial {
  itemNo: string;
  category: string;
  element: string;
  description: string;
  unit: string;
  quantity: number;
  rate: number;
  amount: number;
  source: string;
  location?: string;
  confidence?: number;
}

export interface MaterialSchedule {
  substructure: CategorizedMaterial[];
  superstructure: CategorizedMaterial[];
  masonry: CategorizedMaterial[];
  finishes: CategorizedMaterial[];
  openings: CategorizedMaterial[];
  miscellaneous: CategorizedMaterial[];
}

export class AdvancedMaterialExtractor {
  private static itemCounter = 1;

  static async extractWithGemini(quote: any): Promise<MaterialSchedule> {
    try {
      // Try Gemini first
      const geminiAnalysis = await geminiService.analyzeMaterials(quote);
      return this.convertGeminiToSchedule(geminiAnalysis);
    } catch (error) {
      console.warn(
        "Gemini analysis failed, falling back to local extraction:",
        error
      );
      return this.extractLocally(quote);
    }
  }

  private static convertGeminiToSchedule(
    analysis: GeminiMaterialResponse
  ): MaterialSchedule {
    const schedule: MaterialSchedule = {
      substructure: [],
      superstructure: [],
      masonry: [],
      finishes: [],
      openings: [],
      miscellaneous: [],
    };

    analysis.materials.forEach((material, index) => {
      const categorizedMaterial: CategorizedMaterial = {
        itemNo: `M${(this.itemCounter++).toString().padStart(3, "0")}`,
        category: material.category,
        element: this.extractElement(material.description),
        description: material.description,
        unit: material.unit,
        quantity: material.quantity,
        rate: material.rate,
        amount: material.amount,
        source: "gemini",
        confidence: material.confidence,
      };

      schedule[material.category as keyof MaterialSchedule]?.push(
        categorizedMaterial
      );
    });

    return schedule;
  }

  static extractLocally(quote: any): MaterialSchedule {
    const materials: CategorizedMaterial[] = [];

    // Extract from all sources
    if (quote.concrete_materials) {
      materials.push(
        ...this.extractConcreteMaterials(quote.concrete_materials)
      );
    }

    if (quote.rebar_calculations) {
      materials.push(...this.extractRebarMaterials(quote.rebar_calculations));
    }

    if (quote.rooms) {
      materials.push(...this.extractMasonryMaterials(quote.rooms));
    }

    if (quote.boqData) {
      materials.push(...this.extractBOQMaterials(quote.boqData));
    }

    return this.categorizeAndSchedule(materials);
  }

  private static extractConcreteMaterials(
    concreteMaterials: any[]
  ): CategorizedMaterial[] {
    return concreteMaterials
      .filter(
        (item) =>
          item.name &&
          item.quantity > 0 &&
          !item.name.toLowerCase().includes("total") && // Exclude totals
          !item.name.toLowerCase().includes("grand total")
      )
      .map((item) => ({
        itemNo: `C${(this.itemCounter++).toString().padStart(3, "0")}`,
        category: this.determineCategory(item.name),
        element: "concrete",
        description: item.name,
        unit: this.determineUnit(item.name),
        quantity: item.quantity,
        rate: item.unit_price || 0,
        amount: item.total_price || 0,
        source: "concrete",
        location: this.extractLocation(item.name),
      }));
  }
  private static extractRebarMaterials(
    rebarCalculations: any[]
  ): CategorizedMaterial[] {
    return rebarCalculations.map((calc) => ({
      itemNo: `R${(this.itemCounter++).toString().padStart(3, "0")}`,
      category: calc.category || "superstructure",
      element: "reinforcement",
      description: `Reinforcement Steel ${calc.primaryBarSize}`,
      unit: "Kg",
      quantity: calc.totalWeightKg || 0,
      rate: calc.pricePerM || 0,
      amount: calc.totalPrice || 0,
      source: "rebar",
      location: `Element ${calc.number}`,
    }));
  }

  private static extractMasonryMaterials(rooms: any[]): CategorizedMaterial[] {
    const materials: CategorizedMaterial[] = [];

    rooms.forEach((room) => {
      // Cement
      if (room.cementBags && parseFloat(room.cementBags) > 0) {
        materials.push({
          itemNo: `M${(this.itemCounter++).toString().padStart(3, "0")}`,
          category: "masonry",
          element: "masonry",
          description: `Cement - ${room.room_name}`,
          unit: "Bags",
          quantity: parseFloat(room.cementBags),
          rate: room.cementCost / parseFloat(room.cementBags) || 0,
          amount: room.cementCost || 0,
          source: "masonry",
          location: room.room_name,
        });
      }

      // Sand
      if (room.sandVolume && parseFloat(room.sandVolume) > 0) {
        materials.push({
          itemNo: `M${(this.itemCounter++).toString().padStart(3, "0")}`,
          category: "masonry",
          element: "masonry",
          description: `Sand - ${room.room_name}`,
          unit: "m³",
          quantity: parseFloat(room.sandVolume),
          rate: room.sandCost / parseFloat(room.sandVolume) || 0,
          amount: room.sandCost || 0,
          source: "masonry",
          location: room.room_name,
        });
      }

      // Blocks
      if (room.blocks && room.blocks > 0) {
        materials.push({
          itemNo: `M${(this.itemCounter++).toString().padStart(3, "0")}`,
          category: "masonry",
          element: "masonry",
          description: `${room.blockType} - ${room.room_name}`,
          unit: "No.",
          quantity: room.blocks,
          rate: room.blockCost / room.blocks || 0,
          amount: room.blockCost || 0,
          source: "masonry",
          location: room.room_name,
        });
      }

      // Doors and Windows
      ["doors", "windows"].forEach((type) => {
        if (room[type]) {
          room[type].forEach((item: any) => {
            // Only add the main item (door/window)
            materials.push({
              itemNo: `M${(this.itemCounter++).toString().padStart(3, "0")}`,
              category: "openings",
              element: type === "doors" ? "door" : "window",
              description: `${item.type || item.glass} ${type.slice(0, -1)} - ${
                room.room_name
              }`,
              unit: "No.",
              quantity: item.count || 1,
              rate: item.price || 0,
              amount: (item.price || 0) * (item.count || 1),
              source: "openings",
              location: room.room_name,
            });

            // Only add frame if it's a separate cost item
            if (item.frame?.price && item.frame.price > 0) {
              materials.push({
                itemNo: `M${(this.itemCounter++).toString().padStart(3, "0")}`,
                category: "openings",
                element: `${type.slice(0, -1)}-frame`,
                description: `${item.frame.type} Frame - ${room.room_name}`,
                unit: "No.",
                quantity: item.count || 1,
                rate: item.frame.price,
                amount: item.frame.price * (item.count || 1),
                source: "openings",
                location: room.room_name,
              });
            }
          });
        }
      });
    });

    return materials;
  }

  public static extractBOQMaterials(
    boqData: BOQSection[]
  ): CategorizedMaterial[] {
    const materials: CategorizedMaterial[] = [];

    boqData.forEach((section) => {
      section.items.forEach((item) => {
        if (item.isHeader) return;

        materials.push({
          itemNo: item.itemNo,
          category: item.category || this.determineCategory(item.description),
          element: item.element || "general",
          description: item.description,
          unit: item.unit,
          quantity: item.quantity,
          rate: item.rate,
          amount: item.amount,
          source: "boq",
          location: section.title,
        });
      });
    });

    return materials;
  }

  private static categorizeAndSchedule(
    materials: CategorizedMaterial[]
  ): MaterialSchedule {
    const schedule: MaterialSchedule = {
      substructure: [],
      superstructure: [],
      masonry: [],
      finishes: [],
      openings: [],
      miscellaneous: [],
    };

    materials.forEach((material) => {
      const category =
        this.determineCategory(material.description) ||
        material.category ||
        "miscellaneous";
      schedule[category as keyof MaterialSchedule]?.push(material);
    });

    return schedule;
  }

  private static determineCategory(description: string): string {
    const descLower = description.toLowerCase();
    const categories = {
      substructure: [
        "foundation",
        "excavation",
        "footing",
        "base",
        "subgrade",
        "hardcore",
        "dpm",
        "anti-termite",
        "blinding",
      ],
      superstructure: [
        "beam",
        "column",
        "slab",
        "frame",
        "structural",
        "reinforcement",
        "rebar",
        "steel",
        "concrete",
      ],
      masonry: [
        "block",
        "brick",
        "stone",
        "wall",
        "partition",
        "masonry",
        "mortar",
        "plaster",
        "render",
      ],
      finishes: [
        "paint",
        "tile",
        "flooring",
        "ceiling",
        "finish",
        "coating",
        "varnish",
        "polish",
      ],
      openings: [
        "door",
        "window",
        "frame",
        "glazing",
        "ironmongery",
        "lock",
        "hinge",
        "handle",
        "ventilator",
      ],
    };

    for (const [category, keywords] of Object.entries(categories)) {
      if (keywords.some((keyword) => descLower.includes(keyword))) {
        return category;
      }
    }

    return "miscellaneous";
  }

  private static determineUnit(description: string): string {
    const descLower = description.toLowerCase();
    if (descLower.includes("cement")) return "Bags";
    if (descLower.includes("sand")) return "m³";
    if (descLower.includes("ballast")) return "m³";
    if (descLower.includes("formwork")) return "m²";
    if (descLower.includes("block") || descLower.includes("brick"))
      return "No.";
    if (descLower.includes("steel") || descLower.includes("rebar")) return "Kg";
    if (descLower.includes("door") || descLower.includes("window"))
      return "No.";
    return "Unit";
  }

  private static extractLocation(name: string): string {
    const match = name.match(/\((.*?)\)/);
    return match ? match[1] : "General";
  }

  private static extractElement(description: string): string {
    if (description.includes("Cement")) return "concrete";
    if (description.includes("Sand")) return "concrete";
    if (description.includes("Ballast")) return "concrete";
    if (description.includes("Formwork")) return "formwork";
    if (description.includes("Steel") || description.includes("Rebar"))
      return "reinforcement";
    if (description.includes("Block") || description.includes("Brick"))
      return "masonry";
    if (description.includes("Door")) return "door";
    if (description.includes("Window")) return "window";
    return "general";
  }

  static async exportMaterialSchedule(
    quote: any,
    useGemini: boolean = true
  ): Promise<MaterialSchedule> {
    return useGemini
      ? await this.extractWithGemini(quote)
      : this.extractLocally(quote);
  }
}
// Add to src/utils/advancedMaterialExtractor.ts
export const extractMaterialsFromBOQ = (
  boqData: BOQSection[]
): MaterialSchedule => {
  const mockQuote = {
    boqData: boqData,
    concrete_materials: [],
    rebar_calculations: [],
    rooms: [],
  };

  return AdvancedMaterialExtractor.extractLocally(mockQuote);
};
