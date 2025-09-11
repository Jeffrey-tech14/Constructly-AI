// src/services/geminiService.ts
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
  suggestedCategory?: string;
  notes?: string;
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
You are a construction quantity surveyor expert. Analyze the provided project data and extract **only real, individual construction materials**.

STRICT INSTRUCTIONS:

1. Extract **only physical construction materials**, including:
   - Cement, Sand, Ballast, Water, Blocks, Bricks, Stone
   - Reinforcement steel, Structural steel, Formwork
   - Paints, Tiles, Flooring, Ceiling, Coatings, Varnish, Polish
   - Doors, Door frames, Windows, Window frames, Glazing, Hinges, Locks
   - Nails, Screws, Fasteners, Miscellaneous consumables

2. **Ignore** anything that is not a direct material: preliminaries, professional fees, labor, permits, services, legal items, overheads.

3. **Skip combined items** (like "Concrete", "Mortar", or anything that represents a mixture). Only include the individual base materials if they are explicitly listed elsewhere.

4. **Merge duplicates**:
   - If the same material appears with slightly different spellings (e.g., "Ceoemnt" vs "Cement"), treat them as the same item.
   - Sum up their **quantities** and **amounts**.
   - Always use the **rate provided in the BOQ** (do not invent or recalculate rates).
   - Recalculate **amount = quantity × rate** only when consolidating.

5. For each material, provide these fields:
   - itemNo: string (unique identifier)
   - description: string
   - unit: string
   - quantity: number
   - rate: number
   - amount: number
   - category: string (auto-generate, e.g., substructure, superstructure, masonry, finishes, doors, windows, miscellaneous)
   - element: string (e.g., cement, reinforcement, masonry, door, window, finish)
   - calculatedFrom: string? (optional, if amount was derived from qty × rate)
   - isHeader: boolean (true if this is a section header in the BOQ)
   - isProvision: boolean? (optional, if provisional)
   - confidence: number? (AI certainty score 0–1)
   - suggestedCategory: string? (optional refined category if unsure)

6. **Return STRICT JSON only** in the format below, with no explanations, notes, or extra text:

{
  "materials": [
    {
      "itemNo": "string",
      "description": "string",
      "unit": "string",
      "quantity": number,
      "rate": number,
      "amount": number,
      "category": "string",
      "element": "string",
      "calculatedFrom": "string?",
      "isHeader": boolean,
      "isProvision": boolean?,
      "confidence": number?,
      "suggestedCategory": "string?"
    }
  ]
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
