// services/boqAIService.ts
import { BOQItem, BOQSection } from "@/types/boq";
import { generateProfessionalBOQ } from "@/utils/boqMappers";
import { getEnv } from "@/utils/envConfig";

const GEMINI_API_URL =
  "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent";

export const generateBOQWithAI = async (
  quoteData: any,
): Promise<BOQSection[]> => {
  try {
    // Try AI generation first
    const aiBOQ = await callGeminiAPI(quoteData);

    if (aiBOQ && aiBOQ.length > 0 && isValidBOQ(aiBOQ)) {
      return aiBOQ;
    } else {
      throw new Error("AI returned invalid or empty BOQ");
    }
  } catch (error) {
    console.warn("AI generation failed, using enhanced local mappers:", error);
    // Fallback to enhanced local mappers
    return generateProfessionalBOQ(quoteData);
  }
};

const callGeminiAPI = async (quoteData: any): Promise<BOQSection[]> => {
  const apiKey = getEnv("NEXT_GEMINI_API_KEY") || getEnv("VITE_GEMINI_API_KEY");

  // If no API key, simulate AI failure to trigger fallback
  if (!apiKey) {
    console.warn("No Gemini API key configured");
    throw new Error("No Gemini API key configured");
  }

  const prompt = createAIPrompt(quoteData);

  try {
    const response = await fetch(`${GEMINI_API_URL}?key=${apiKey}`, {
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
      const errorText = await response.text();
      console.error("Gemini API response not OK:", response.status, errorText);
      throw new Error(
        `Gemini API error: ${response.status} ${response.statusText}`,
      );
    }

    const data = await response.json();

    // Handle different possible response structures
    const responseText = extractResponseText(data);
    if (!responseText) {
      throw new Error("No text content found in Gemini response");
    }

    // Extract JSON from the response
    return parseAIResponse(responseText);
  } catch (error) {
    console.error("Gemini API call failed:", error);
    throw new Error(
      `API call failed: ${
        error instanceof Error ? error.message : "Unknown error"
      }`,
    );
  }
};

const extractResponseText = (data: any): string => {
  // Try multiple possible response structures
  if (data.candidates && data.candidates.length > 0) {
    const candidate = data.candidates[0];
    if (
      candidate.content &&
      candidate.content.parts &&
      candidate.content.parts.length > 0
    ) {
      return candidate.content.parts[0].text || "";
    }
  }

  // Alternative structure
  if (data.contents && data.contents.length > 0) {
    const content = data.contents[0];
    if (content.parts && content.parts.length > 0) {
      return content.parts[0].text || "";
    }
  }

  // Direct text field
  if (data.text) {
    return data.text;
  }

  // Last resort: try to find any text in the response
  const jsonString = JSON.stringify(data);
  if (jsonString.includes('"text"')) {
    const textMatch = jsonString.match(/"text":"([^"]*)"/);
    if (textMatch) {
      return textMatch[1];
    }
  }

  return "";
};

const createAIPrompt = (quoteData: any): string => {
  return `ACT AS AN EXPERT QUANTITY SURVEYOR. Generate a professional Bill of Quantities in JSON format.

PROJECT DATA:
${JSON.stringify(quoteData, null, 2)}

STRICT REQUIREMENTS:
- Use ONLY the data provided - NO estimation or mock data
- Return VALID JSON array only, no other text
- Calculate amounts as quantity × rate
- Use professional construction terminology
- Follow Kenyan construction standards
- Skip all preliminaries class data from the json provided
- Make sure to use the correct units as they are in the data proided
- Do not include services, transport costs or other prject costs
- Do not include wastage percentages 
- If equipment is linked to a trade (e.g. “Mixer for concrete works”) → add it. Only skip general equipment (e.g. “Site generator”, "Water Pump")
- If items ARE NOT similar even by one attribute, do not merge them, keep them separate

OUTPUT FORMAT (STRICT JSON):
[
  {
    "title": "Section title",
    "items": [
      {
        "itemNo": "1.1",
        "description": "Item description",
        "unit": "m²",
        "quantity": 10,
        "rate": 1000,
        "amount": 10000,
        "category": "category",
        "element": "element",
        "isHeader": false
      }
    ]
  }
]

SECTIONS TO CONSIDER (only if data exists):
1. Substructure Works
2. Superstructure Works
3. Internal Finishes
4. Doors, Windows and Ironmongery
5. Finishes
6. Roofing Works
7. Electrical Installations
8. Plumbing and Drainage Installations
9. Services Installations
10. External Works
11. Wardrobes and Cabinets

Return ONLY the JSON array in the correct format.`;
};

const parseAIResponse = (responseText: string): BOQSection[] => {
  try {
    if (!responseText || typeof responseText !== "string") {
      throw new Error("Empty or invalid response from AI");
    }

    // Clean the response text
    let jsonString = responseText.trim();

    // Remove markdown code blocks
    jsonString = jsonString.replace(/```json\s*/g, "").replace(/```\s*/g, "");

    // Remove any non-JSON text before or after
    const jsonMatch = jsonString.match(/\[[\s\S]*\]/);
    if (jsonMatch) {
      jsonString = jsonMatch[0];
    }

    // Remove control characters and extra whitespace
    jsonString = jsonString
      .replace(/[\u0000-\u001F\u007F-\u009F]/g, "")
      .replace(/\s+/g, " ")
      .trim();

    if (!jsonString) {
      throw new Error("Empty JSON response from AI");
    }

    const parsed = JSON.parse(jsonString);

    if (Array.isArray(parsed)) {
      // Validate and clean the parsed data
      const cleanedSections = parsed.map((section, sectionIndex) => ({
        title: section.title || `Section ${sectionIndex + 1}`,
        items: (section.items || []).map((item: any, itemIndex: number) => {
          const quantity =
            typeof item.quantity === "number" ? item.quantity : 0;
          const rate = typeof item.rate === "number" ? item.rate : 0;
          const amount =
            typeof item.amount === "number" ? item.amount : quantity * rate;

          return {
            itemNo: item.itemNo || `${sectionIndex + 1}.${itemIndex + 1}`,
            description: item.description || "Unnamed item",
            unit: item.unit || "",
            quantity: quantity,
            rate: rate,
            amount: amount,
            category: item.category || "general",
            element: item.element || "unspecified",
            isHeader: Boolean(item.isHeader),
          };
        }),
      }));

      return cleanedSections;
    }

    throw new Error("AI response is not a JSON array");
  } catch (error) {
    console.error("Failed to parse AI response:", error);
    throw new Error(
      `Invalid AI response format: ${
        error instanceof Error ? error.message : "Unknown parsing error"
      }`,
    );
  }
};

const isValidBOQ = (sections: BOQSection[]): boolean => {
  if (!Array.isArray(sections) || sections.length === 0) {
    console.warn("BOQ validation failed: Not an array or empty");
    return false;
  }

  const isValid = sections.every((section) => {
    if (!section.title || typeof section.title !== "string") {
      console.warn("BOQ validation failed: Missing or invalid section title");
      return false;
    }

    if (!Array.isArray(section.items) || section.items.length === 0) {
      console.warn("BOQ validation failed: Missing or empty items array");
      return false;
    }

    return section.items.every((item) => {
      if (!item.description || typeof item.description !== "string") {
        console.warn(
          "BOQ validation failed: Missing or invalid item description",
        );
        return false;
      }

      if (item.isHeader) {
        return true; // Headers don't need quantity/rate
      }

      if (typeof item.quantity !== "number" || item.quantity < 0) {
        console.warn("BOQ validation failed: Missing or invalid quantity");
        return false;
      }

      if (typeof item.rate !== "number" || item.rate < 0) {
        console.warn("BOQ validation failed: Missing or invalid rate");
        return false;
      }

      return true;
    });
  });

  if (!isValid) {
    console.warn("BOQ validation failed overall");
  }

  return isValid;
};
