// src/services/geminiService.ts
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
  getEnv = (key: string) => {
    if (typeof process !== "undefined" && process.env?.[key]) {
      return process.env[key];
    }
    if (typeof import.meta !== "undefined" && import.meta.env?.[key]) {
      return import.meta.env[key];
    }
    return undefined;
  };

  private apiKey = this.getEnv("VITE_GEMINI_API_KEY");
  private baseUrl =
    "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-pro:generateContent";

  async analyzeMaterials(quoteData: any): Promise<GeminiMaterialResponse> {
    if (!this.apiKey) {
      throw new Error("Gemini API key not set");
    }

    const prompt = this.createAnalysisPrompt(quoteData);

    try {
      const response = await fetch(`${this.baseUrl}?key=${this.apiKey}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  text: prompt,
                },
              ],
            },
          ],
        }),
      });

      if (!response.ok) {
        throw new Error(`Gemini API error: ${response.statusText}`);
      }

      const data = await response.json();
      return this.parseGeminiResponse(data);
    } catch (error) {
      console.error("Gemini analysis failed:", error);
      throw error;
    }
  }

  private createAnalysisPrompt(quoteData: any): string {
    return `
You are an expert construction materials analyst. Analyze the provided construction data with these STRICT INSTRUCTIONS:

1. COMPREHENSIVE MATERIAL IDENTIFICATION:
   - Identify ALL materials (explicit and implicit) in the construction data
   - Ignore collective materials such as concrete, mortar etc.
   - Do not add any materials that are not in the provided data, only identify from the provided data
   - Ignore subcontractors in the data provided

2. MATERIAL CATEGORIES & RELATIONSHIPS:
   A. Building Elements:
      - Foundation materials (footings, slabs, beds, membranes)
      - Wall materials (internal, external, partitions)
      - Floor materials (base, finishing, treatments)
      - Ceiling materials (structure, finishing)
      - Roof materials (structure, covering, insulation)
      - Finishing materials (paintings, tiles, claddings)

   B. Material Properties:
      - Primary materials (main structural/functional materials)
      - Secondary materials (supporting materials)
      - Preparatory materials (primers, undercoats, etc.)
      - Finishing materials (paints, varnishes, etc.)
      - Protective materials (sealants, membranes)
      - Joint materials (grout, sealants)
      - Auxiliary materials (fixings, adhesives)
      - Use the data in materialPrices to get the prices of the materials you are not sure of or cannot find in the related boq data
      - Do not add any materials that are not in the provided data, only identify from the provided data
      - Use the gross values, if none are found for an item use the net values
      - Do not include materials that are a combination of other materials eg concrete, mortar, etc.
      - If clientProviesWater under qsSettings is not true, do not include water in the materials, ignore it
      - Pay special attention to cement so as to not repeat it or include combined materials
      - Use values as they are, do not refactor, edit or create your own

3. For EACH material identified, provide:
   {
     "itemNo": "string (unique identifier)",
     "category": "string (e.g., Concrete, Masonry, Finishes)",
     "location": "string (specific usage location)",
     "element": "string (building element type)",
     "description": "string (detailed description)",
     "unit": "string",
     "quantity": number,
     "rate": number,
     "amount": number,
     "materialType": "primary|secondary|preparatory|finishing|protective|joint|auxiliary",
   }

4. Return STRICT JSON only with this structure:
{
  "materials": [ (array of material objects as defined above) ],
  "summary": {
    "totalMaterials": number,
    "totalCost": number,
    "categories": { "categoryName": number (count) }
  }
}

PROJECT DATA:
${JSON.stringify(quoteData, null, 2)}
`;
  }

  private parseGeminiResponse(response: any): GeminiMaterialResponse {
    try {
      const text = response.candidates[0].content.parts[0].text;
      const jsonMatch =
        text.match(/```json\n([\s\S]*?)\n```/) || text.match(/{[\s\S]*}/);

      if (jsonMatch) {
        const jsonStr = jsonMatch[1] || jsonMatch[0];
        return JSON.parse(jsonStr);
      }

      throw new Error("No valid JSON found in Gemini response");
    } catch (error) {
      console.error("Failed to parse Gemini response:", error);
      throw new Error("Invalid response format from Gemini");
    }
  }
}

export const geminiService = new GeminiService();
