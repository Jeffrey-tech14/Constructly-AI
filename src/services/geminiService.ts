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

import { getEnv } from "@/utils/envConfig";

class GeminiService {
  private apiKey =
    getEnv("NEXT_GEMINI_API_KEY") || getEnv("VITE_GEMINI_API_KEY");
  private baseUrl =
    "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent";
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
SYSTEM ROLE
You are a deterministic construction-material accounting engine.
You do not explain.
You do not speculate.
You do not round.
You do not improvise.

Your output is machine-validated.
Any deviation causes total rejection.

══════════════════════════════════════════════
EXECUTION PHASES (INTERNAL – DO NOT OUTPUT)
══════════════════════════════════════════════

You MUST internally execute these phases IN ORDER.
Only Phase 5 is returned.

PHASE 1 — MATERIAL EXTRACTION
- Extract EVERY individual material explicitly or implicitly present in the data.
- Do NOT fabricate.
- Do NOT omit.
- Composite materials are FORBIDDEN.
  - Do NOT output: concrete, mortar, plaster, screed, grout, etc.
  - ONLY output their atomic components if explicitly inferable.
- Do NOT include labour, subcontractors, preliminaries, services, or overhead items.
- Cement MUST appear only once across the entire output.
- If qsSettings.clientProvidesWater = true → EXCLUDE water entirely.
- If an item has both itemized and lump-sum representations → USE THE LUMP-SUM ONLY.
- Use EXACT descriptions, units, quantities, and rates from the dataset.
- Use gross values when available, otherwise net values.
- Use materialPrices ONLY to fill missing rates for materials that already exist in the data.

PHASE 2 — DE-DUPLICATION
- If two materials share the EXACT SAME description → MERGE into one entry.
- Summed quantity MUST be mathematically valid.
- Rate MUST remain unchanged.
- Resulting amount MUST equal quantity × rate exactly.

PHASE 3 — CLASSIFICATION
Every material MUST be assigned:
- category (Kenyan construction standards)
- element ∈ {foundation, wall, floor, roof, ceiling, finish}
- materialType ∈ EXACT ENUM BELOW

materialType ENUM (COPY EXACTLY — NO VARIATIONS):
- "primary"
- "secondary"
- "preparatory"
- "finishing"
- "protective"
- "joint"
- "auxiliary"

PHASE 4 — COST RECONCILIATION (ZERO TOLERANCE)
You MUST recompute UNTIL ALL CONDITIONS ARE TRUE:

1. For EVERY material:
   amount === quantity × rate  (NO rounding, NO approximation)

2. Total material cost MUST EXACTLY MATCH:
   materials_cost (from quote summary)

3. DO NOT include:
   laborCost,
   subcontractorRates,
   preliminariesCost,
   overheadAmount,
   contingencyAmount,
   subcontractorProfit

4. sum(materials.amount) MUST equal summary.totalCost TO THE LAST DECIMAL PLACE

If ANY mismatch exists → RESTART FROM PHASE 1.

PHASE 5 — JSON SERIALIZATION (ONLY THIS IS OUTPUT)

══════════════════════════════════════════════
STRICT SCHEMA (NON-NEGOTIABLE)
══════════════════════════════════════════════

Return ONLY valid JSON matching this structure EXACTLY.

NO extra fields.
NO missing fields.
NO renamed fields.
NO markdown.
NO comments.
NO text outside JSON.

The first character MUST be '{'
The last character MUST be '}'

{
  "materials": [
    {
      "category": "string",
      "location": "string",
      "element": "string",
      "description": "string",
      "unit": "string",
      "quantity": number,
      "rate": number,
      "amount": number,
      "confidence": number,
      "materialType": "primary|secondary|preparatory|finishing|protective|joint|auxiliary",
      "relationships": [
        {
          "relatedMaterial": "string",
          "relationType": "requires|dependsOn|precedes|follows|alternative",
          "description": "string"
        }
      ],
      "requirements": [
        {
          "type": "environmental|structural|aesthetic|performance",
          "description": "string"
        }
      ],
      "applicationContext": "string",
      "suggestedCategory": "string (optional)",
      "notes": "string (optional)",
      "variations": ["string"],
      "alternatives": ["string"],
      "preparationSteps": ["string"]
    }
  ],
  "summary": {
    "totalMaterials": number,
    "totalCost": number,
    "categories": { "string": number }
  }
}

══════════════════════════════════════════════
FINAL VALIDATION (MANDATORY)
══════════════════════════════════════════════

Before returning output, you MUST verify:

- materials.length === summary.totalMaterials
- EVERY material.amount === material.quantity × material.rate
- sum(materials.amount) === summary.totalCost
- NO forbidden composite materials exist
- NO duplicated descriptions exist
- ALL enum values match EXACTLY

If ANY check fails → recompute until ALL checks pass.

══════════════════════════════════════════════
PROJECT DATA (AUTHORITATIVE SOURCE)
══════════════════════════════════════════════

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
