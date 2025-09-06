// src/services/geminiService.ts
export interface GeminiMaterialAnalysis {
  category: string;
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

  private apiKey = this.getEnv("GEMINI_API_KEY");
  private baseUrl =
    "https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent";

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
    You are a construction quantity surveyor expert. Analyze this construction project data and extract all materials with their quantities, rates, and amounts.

    PROJECT DATA:
    ${JSON.stringify(quoteData, null, 2)}

    INSTRUCTIONS:
    1. Extract ALL materials from concrete, rebar, masonry, openings, and any other sections
    2. Categorize materials into: substructure, superstructure, masonry, finishes, openings, miscellaneous
    3. For each material, provide: description, unit, quantity, rate, amount
    4. Calculate rates from quantity/amount if rate is missing
    5. Group identical materials across different sections
    6. Return in JSON format with this structure:
    {
      "materials": [
        {
          "category": "string",
          "description": "string",
          "unit": "string",
          "quantity": number,
          "rate": number,
          "amount": number,
          "confidence": number,
          "suggestedCategory": "string?",
          "notes": "string?"
        }
      ],
      "summary": {
        "totalMaterials": number,
        "totalCost": number,
        "categories": {"category": number}
      }
    }

    CATEGORY GUIDELINES:
    - substructure: foundations, excavations, footings, subgrade, hardcore, DPM, anti-termite
    - superstructure: beams, columns, slabs, frames, reinforcement, rebar, structural steel
    - masonry: blocks, bricks, stones, walls, partitions, mortar, plaster, render
    - finishes: paint, tiles, flooring, ceiling, coatings, varnish, polish
    - openings: doors, windows, frames, glazing, ironmongery, locks, hinges
    - miscellaneous: everything else

    Be precise and accurate. If uncertain about categorization, provide confidence < 0.8 and suggest alternative.
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
