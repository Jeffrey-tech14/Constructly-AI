import { getEnv } from "@/utils/envConfig";

// New hierarchical structure for material schedule
export interface MaterialScheduleItem {
  item_id: string | number;
  type: "item" | "subheader" | "note";
  description: string;
  quantity: number | null;
  unit: string | null;
  specification: string | null;
  unit_rate: number | null;
  total_cost: number | null;
  calculated: boolean;
}

export interface MaterialScheduleSection {
  section_id: string | number;
  name: string;
  items: MaterialScheduleItem[];
}

export interface ProjectInfo {
  title: string;
  document_type: string;
  prepared_by: string | null;
  currency: string;
}

export interface MaterialScheduleSummary {
  sub_total: number;
  contingency_percentage: number | null;
  contingency_amount: number | null;
  grand_total: number;
}

export interface GeminiMaterialResponse {
  project: ProjectInfo;
  sections: MaterialScheduleSection[];
  summary: MaterialScheduleSummary;
}
class GeminiService {
  private apiKey = getEnv("VITE_GEMINI_API_KEY");
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
You are a deterministic construction materials schedule generator.
Your output is a hierarchical 8-column material schedule table.
You do not explain.
You do not speculate.
You do not improvise.

Your output is machine-validated.
Any deviation causes total rejection.

══════════════════════════════════════════════
MATERIAL SCHEDULE STRUCTURE
══════════════════════════════════════════════

Create a professional 8-column material schedule table:

COLUMNS:
1. Item No (sequential numbering)
2. Description (detailed material description)
3. Specification (material spec, grade, size, etc.)
4. Unit (of measurement: m, m2, m3, kg, no., etc.)
5. Quantity (numerical amount)
6. Unit Rate (cost per unit)
7. Total Cost (quantity × unit_rate)
8. Remarks (notes, calculated flag)

ORGANIZATION:
- Group related materials into logical sections
- Create section headers for major categories
- Include subheaders for material groupings
- Include any project notes
- Do not include combined items eg concrete, then also include its components, only include the components in the schedule
- Do not include concrete, motar, plaster, or any other combined items, always prefere the breakdown of materials

══════════════════════════════════════════════
DATA PROCESSING RULES
══════════════════════════════════════════════

PHASE 1 — EXTRACTION
- Extract ALL materials from provided quote data
- Do NOT fabricate materials
- Do NOT include labour, subcontractors, preliminaries, services
- Use EXACT descriptions, units, quantities, and rates from data
- Use gross values when available, otherwise net values

PHASE 2 — DEDUPLICATION
- If two materials have EXACT same description → MERGE
- Sum quantities mathematically
- Keep rate unchanged
- Verify: amount = quantity × rate (NO rounding)

PHASE 3 — ORGANIZATION
- Group materials by construction element:
  * Foundation works
  * Structural concrete
  * Masonry/Walls
  * Roofing
  * Finishes & Coatings
  * Plumbing
  * Electrical
  * Other
- Create clear section hierarchy
- Add professional section headers

PHASE 4 — COST RECONCILIATION (ZERO TOLERANCE)
1. For EVERY item:
   total_cost === quantity × unit_rate (NO rounding)

2. sum(all total_costs) MUST equal summary.sub_total
   TO THE LAST DECIMAL PLACE

3. Calculate contingency if applicable:
   contingency_amount = sub_total × contingency_percentage

4. grand_total = sub_total + contingency_amount

══════════════════════════════════════════════
STRICT OUTPUT SCHEMA (NON-NEGOTIABLE)
══════════════════════════════════════════════

Return ONLY valid JSON matching this structure EXACTLY.

NO extra fields. NO missing fields. NO markdown. NO comments.
The first character MUST be '{' and last character MUST be '}'

{
  "project": {
    "title": "string",
    "document_type": "string",
    "prepared_by": "string | null",
    "currency": "string"
  },

  "sections": [
    {
      "section_id": "string | number",
      "name": "string",
      "items": [
        {
          "item_id": "string | number",
          "type": "item | subheader | note",
          "description": "string",
          "quantity": "number | null",
          "unit": "string | null",
          "specification": "string | null",
          "unit_rate": "number | null",
          "total_cost": "number | null",
          "calculated": "boolean"
        }
      ]
    }
  ],

  "summary": {
    "sub_total": "number",
    "contingency_percentage": "number | null",
    "contingency_amount": "number | null",
    "grand_total": "number"
  }
}


NOTE: 
- type field must be: "item" (material), "subheader" (section header), or "note" (remarks)
- For subheaders and notes, quantity, unit, specification, unit_rate, total_cost must be null
- For items, all cost fields must have values
- calculated flag indicates if total_cost is computed (not manual entry)

══════════════════════════════════════════════
FINAL VALIDATION (MANDATORY)
══════════════════════════════════════════════

Before returning, verify:
- ALL items have correct type ∈ {item, subheader, note}
- For type "item": all quantity, unit, unit_rate, total_cost are non-null numbers
- For type "subheader" or "note": all are null
- EVERY item with type="item": total_cost === quantity × unit_rate
- sum(items where type="item".total_cost) === summary.sub_total
- contingency_amount === sub_total × (contingency_percentage / 100)
- grand_total === sub_total + contingency_amount
- NO duplicate descriptions (exact match)
- ALL sections have valid section_id and items array

If ANY check fails → recompute until ALL pass.

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
