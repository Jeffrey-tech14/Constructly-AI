// src/utils/advancedMaterialExtractor.ts
import { BOQSection } from "@/types/boq";
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

export type MaterialSchedule = CategorizedMaterial[];

export class AdvancedMaterialExtractor {
  private static itemCounter = 1;

  // --- Public API ---
  static async extractWithGemini(quote: any): Promise<MaterialSchedule> {
    try {
      const geminiAnalysis = await geminiService.analyzeMaterials(quote);
      return this.convertGeminiToMaterials(geminiAnalysis);
    } catch (error) {
      console.warn(
        "Gemini analysis failed, falling back to local extraction:",
        error
      );
      return this.extractLocally(quote);
    }
  }

  static extractLocally(quote: any): MaterialSchedule {
    let allMaterials: CategorizedMaterial[] = [];

    if (quote.boqData) {
      allMaterials.push(...this.extractBOQMaterials(quote.boqData));
    }

    if (quote.concrete_materials) {
      allMaterials.push(
        ...this.extractConcreteMaterials(quote.concrete_materials)
      );
    }

    if (quote.rebar_calculations) {
      allMaterials.push(
        ...this.extractRebarMaterials(quote.rebar_calculations)
      );
    }

    if (quote.rooms) {
      allMaterials.push(...this.extractRoomMaterials(quote.rooms));
    }

    return allMaterials;
  }

  // --- Gemini Conversion ---
  private static convertGeminiToMaterials(
    analysis: GeminiMaterialResponse
  ): MaterialSchedule {
    return analysis.materials.map((mat) => ({
      itemNo: `M${(this.itemCounter++).toString().padStart(3, "0")}`,
      category: mat.category || this.autoCategory(mat.description),
      element: mat.element || this.autoElement(mat.description),
      description: mat.description,
      unit: mat.unit || "Unit",
      quantity: mat.quantity || 0,
      rate: mat.rate || 0,
      amount: mat.amount || 0,
      source: "gemini",
      location: mat.location,
      confidence: mat.confidence,
    }));
  }

  // --- Local Extraction Helpers ---
  private static extractBOQMaterials(boqData: BOQSection[]): MaterialSchedule {
    const materials: CategorizedMaterial[] = [];

    boqData.forEach((section) => {
      section.items.forEach((item) => {
        if (item.isHeader) return; // skip headers

        materials.push({
          itemNo:
            item.itemNo ||
            `M${(this.itemCounter++).toString().padStart(3, "0")}`,
          category: item.category || this.autoCategory(item.description),
          element: item.element || this.autoElement(item.description),
          description: item.description,
          unit: item.unit || "Unit",
          quantity: item.quantity || 0,
          rate: item.rate || 0,
          amount: item.amount || 0,
          source: "boq",
          location: section.title,
        });
      });
    });

    return materials;
  }

  private static extractConcreteMaterials(
    concreteMaterials: any[]
  ): MaterialSchedule {
    return concreteMaterials.map((item) => ({
      itemNo: `C${(this.itemCounter++).toString().padStart(3, "0")}`,
      category: this.autoCategory(item.name),
      element: "concrete",
      description: item.name,
      unit: this.autoUnit(item.name),
      quantity: item.quantity || 0,
      rate: item.unit_price || 0,
      amount: item.total_price || 0,
      source: "concrete",
      location: item.location || "General",
    }));
  }

  private static extractRebarMaterials(rebars: any[]): MaterialSchedule {
    return rebars.map((r) => ({
      itemNo: `R${(this.itemCounter++).toString().padStart(3, "0")}`,
      category: r.category || "superstructure",
      element: "reinforcement",
      description: r.description || `Reinforcement ${r.primaryBarSize || ""}`,
      unit: r.unit || "Kg",
      quantity: r.quantity || r.totalWeightKg || 0,
      rate: r.rate || r.pricePerM || 0,
      amount: r.amount || r.totalPrice || 0,
      source: "rebar",
      location: r.location || "General",
    }));
  }

  private static extractRoomMaterials(rooms: any[]): MaterialSchedule {
    const materials: CategorizedMaterial[] = [];
    rooms.forEach((room) => {
      if (room.cementBags) {
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
      if (room.sandVolume) {
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
      if (room.blocks) {
        materials.push({
          itemNo: `M${(this.itemCounter++).toString().padStart(3, "0")}`,
          category: "masonry",
          element: "masonry",
          description: `${room.blockType || "Block"} - ${room.room_name}`,
          unit: "No.",
          quantity: room.blocks,
          rate: room.blockCost / room.blocks || 0,
          amount: room.blockCost || 0,
          source: "masonry",
          location: room.room_name,
        });
      }

      ["doors", "windows"].forEach((type) => {
        if (room[type]) {
          room[type].forEach((item: any) => {
            // main item
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

            // frame if exists
            if (item.frame?.price) {
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

  // --- Auto Categorization & Element Detection ---
  private static autoCategory(description: string): string {
    const d = description.toLowerCase();
    if (/foundation|footing|substructure|blinding/.test(d))
      return "substructure";
    if (/beam|column|slab|frame|structural/.test(d)) return "superstructure";
    if (/block|brick|wall|masonry|mortar/.test(d)) return "masonry";
    if (/paint|tile|floor|ceiling|finish/.test(d)) return "finishes";
    if (/door|window|frame|glazing|lock|hinge|handle/.test(d))
      return "openings";
    return "miscellaneous";
  }

  private static autoElement(description: string): string {
    const d = description.toLowerCase();
    if (/cement|sand|ballast/.test(d)) return "concrete";
    if (/steel|rebar/.test(d)) return "reinforcement";
    if (/block|brick|masonry/.test(d)) return "masonry";
    if (/door/.test(d)) return "door";
    if (/window/.test(d)) return "window";
    if (/frame/.test(d)) return "frame";
    if (/paint|tile|finish/.test(d)) return "finish";
    return "general";
  }

  private static autoUnit(description: string): string {
    const d = description.toLowerCase();
    if (/cement/.test(d)) return "Bags";
    if (/sand|ballast/.test(d)) return "m³";
    if (/block|brick/.test(d)) return "No.";
    if (/steel|rebar/.test(d)) return "Kg";
    if (/door|window|frame/.test(d)) return "No.";
    return "Unit";
  }
}
