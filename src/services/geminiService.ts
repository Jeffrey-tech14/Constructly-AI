// © 2025 Jeff. All rights reserved.

import { supabase } from "@/integrations/supabase/client";

// Unauthorized copying, distribution, or modification of this file is strictly prohibited.
export interface MaterialRelationship {
  relatedMaterial: string;
  relationType:
    | "requires"
    | "dependsOn"
    | "precedes"
    | "follows"
    | "alternative";
  description: string;
}
export interface MaterialRequirement {
  type: "environmental" | "structural" | "aesthetic" | "performance";
  description: string;
}
export interface GeminiMaterialAnalysis {
  category: string;
  location: string;
  element: string;
  description: string;
  unit: string;
  quantity: number;
  rate: number;
  amount: number;
  confidence: number;
  materialType:
    | "primary"
    | "secondary"
    | "preparatory"
    | "finishing"
    | "protective"
    | "joint"
    | "auxiliary";
  relationships: MaterialRelationship[];
  requirements: MaterialRequirement[];
  applicationContext: string;
  suggestedCategory?: string;
  notes?: string;
  variations?: string[];
  alternatives?: string[];
  preparationSteps?: string[];
}
export interface GeminiMaterialResponse {
  materials: GeminiMaterialAnalysis[];
  summary: {
    totalMaterials: number;
    totalCost: number;
    categories: Record<string, number>;
  };
}
class GeminiService {
  async analyzeMaterials(quoteData: any) {
    try {
      const { data: materials, error } = await supabase.functions.invoke(
        "analyse-materials",
        {
          body: JSON.stringify({ quoteData }),
        }
      );
      if (error) {
        throw error;
      }

      return await JSON.parse(materials);
    } catch (error) {
      console.error("Gemini analysis failed:", error);
      throw error;
    }
  }
}

export const geminiService = new GeminiService();
