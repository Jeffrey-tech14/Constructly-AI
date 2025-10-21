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
You are an expert construction materials analyst.
Your task is to extract and account for every individual material explicitly or implicitly present in the provided construction dataset.
Your output must perfectly align with the data — no invented materials, no duplicates, and no cost mismatches.

🧱 1. COMPREHENSIVE MATERIAL IDENTIFICATION

Perform an exhaustive material extraction with zero fabrication or omission.

Rules:

Identify every individual material mentioned or implied in the construction data.

Example: If the data mentions “foundation masonry wall,” extract “Blocks,” “Cement,” “Sand,” but not “Mortar” (since it’s a composite).

Do not include composite materials such as:

Concrete, mortar, plaster, screed, grout, etc.

Do not include subcontractor items (labour, services, or preliminaries).

Do not add any materials that are not explicitly present or inferable from the data.

Do not re-label or rename items.
Use names, units, and rates exactly as they appear in the provided dataset.

Use gross values if available; otherwise, use net values.

Use the materialPrices dataset to fill in missing or unclear material rates.

Only do this if the item exists in the data but lacks a rate.

Cement must only appear once — never duplicated across multiple composite breakdowns.

If qsSettings.clientProvidesWater = true, exclude water entirely.

Recalculate repeatedly until:

The total of all material amount values exactly equals the materials cost in the provided data.

No rounding, estimation, or new assumptions are introduced.

All extracted materials must conform to Kenyan construction categorization standards (foundation, walling, finishes, etc.).

Maintain internal consistency — every material amount must correctly reflect its rate × quantity.

🧩 2. MATERIAL CLASSIFICATION

Classify each identified material into both a construction element and a material type.

A. Construction Element Categories

Foundation materials: footing blocks, hardcore, blinding, DPM, membrane, DPC

Wall materials: blocks, bricks, reinforcement, plaster, sealants

Floor materials: sub-base, screed, floor finishes, adhesives

Ceiling materials: structural framing, lining boards, paint finishes

Roof materials: trusses, rafters, battens, roofing sheets, insulation

Finishing materials: paints, tiles, claddings, sealants, trims

B. Material Type Classification
Type	Description
primary	Main structural materials (blocks, reinforcement, timber, etc.)
secondary	Supporting or embedded materials (binding wire, nails, battens, etc.)
preparatory	Primers, undercoats, surface preparation compounds
finishing	Paints, varnishes, finishing coats
protective	Waterproofing, membranes, sealants
joint	Grout, sealant, joint fillers
auxiliary	Fixings, fasteners, adhesives, or other minor accessories
📦 3. MATERIAL RECORD FORMAT

Each material record must strictly follow this structure:

{
  "itemNo": "unique identifier (e.g., M001, M002)",
  "category": "e.g., Masonry, Finishes, Structural Steel",
  "location": "specific usage area (e.g., external walls, ground slab, roof truss)",
  "element": "building element type (e.g., foundation, wall, floor, roof, ceiling, finish)",
  "description": "full material description exactly as in data",
  "unit": "unit of measurement (e.g., m3, m2, pcs, kg, ltr, bag)",
  "quantity": number,
  "rate": number,
  "amount": number,
  "materialType": "primary|secondary|preparatory|finishing|protective|joint|auxiliary"
}

📊 4. OUTPUT FORMAT (STRICT JSON)

Return the result strictly in this structure, without commentary or extra text:

{
  "materials": [
    { "itemNo": "...", "category": "...", "location": "...", "element": "...", "description": "...", "unit": "...", "quantity": 0, "rate": 0, "amount": 0, "materialType": "..." }
  ],
  "summary": {
    "totalMaterials": 0,
    "totalCost": 0,
    "categories": { "categoryName": number (count) }
  }
}

Summary Validation:

totalCost must exactly equal the total “materials_cost” in the provided data (no rounding).

totalMaterials = total number of distinct material entries.

categories = count of materials per element category.

🧮 5. ACCURACY & CONSISTENCY RULES

Zero tolerance for mismatch:
If the total material cost does not match exactly, recompute automatically until it matches.

Make sure that when you get the costs they all add up to the same number in the total amount. Use : 
            materials_cost +
          laborCost +
          subcontractorRates +
          preliminariesCost +
          overheadAmount +
          contingencyAmount +
          subcontractorProfit +
          materialProfits

No repeated materials:
If two items share the same description, merge them — do not duplicate.

Respect hierarchy:

Category → Element → Material Type → Item.

Use exact values from source data:
Never infer or estimate rates, quantities, or descriptions.

No hidden or collective materials:
Concrete, mortar, screed, plaster, or other mixes are not materials here — only their components (cement, sand, aggregate, etc.) are.

All computations traceable:
Every amount = quantity × rate must hold true mathematically.

All materials must belong to one valid element category.

All materials under the same description must have the same header

✅ OUTPUT REQUIREMENTS

Output valid, parsable JSON only.

No explanations, text, or markdown outside the JSON.

Ensure total amount of all materials = total materials cost from input dataset to the last decimal place.
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
