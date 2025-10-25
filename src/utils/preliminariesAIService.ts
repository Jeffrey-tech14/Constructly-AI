// utils/preliminariesAIService.ts
import { GoogleGenerativeAI } from "@google/generative-ai";

const getEnv = (key: string) => {
  if (typeof process !== "undefined" && process.env?.[key]) {
    return process.env[key];
  }
  if (typeof import.meta !== "undefined" && import.meta.env?.[key]) {
    return import.meta.env[key];
  }
  return undefined;
};

const genAI = new GoogleGenerativeAI(getEnv("VITE_GEMINI_API_KEY"));

export interface PrelimSection {
  title: string;
  items: PrelimItem[];
}

export interface PrelimItem {
  itemNo: string;
  description: string;
  amount: number;
  isHeader?: boolean;
  source: "ai" | "user";
}

export const generatePreliminariesWithGemini = async (
  quoteData: any
): Promise<PrelimSection[]> => {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    const prompt = `
You are a construction estimation expert. Based on the following project data, generate appropriate preliminary costs based on the data. 

PROJECT DATA:
${JSON.stringify(quoteData, null, 2)}

Please generate preliminary sections and items with these guidelines:
1. Use professional construction terminology
2. Follow Kenyan construction standards
3. Base the preliminaries only on the data provided
4. DO NOT ADD ANYTHING THAT IS NOT IN THE DATA PROVIDED!
5. Include transport costs, equipment, services and other similar data
6. If linked to a trade (e.g. “Mixer for concrete works”) → skip it. Only include general (e.g. “Site generator”)
7. Do not include labor costs, overheads, contingency, or profit margins
8. Structure the response as sections with items, each item having an item number, description, and amount
9. Return ONLY valid JSON in this exact format:
{
  "sections": [
    {
      "title": "Section Name",
      "items": [
        {
          "itemNo": "P1",
          "description": "Item description",
          "amount": 50000,
          "source": "ai"
        }
      ]
    }
  ]
}

Ensure the response is pure JSON without any markdown formatting or additional text.
`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    console.log(response);

    // Clean the response to extract only JSON
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error("No JSON found in AI response");
    }

    const cleanJson = jsonMatch[0]
      .replace(/```json/g, "")
      .replace(/```/g, "")
      .trim();

    const data = JSON.parse(cleanJson);

    if (!data.sections || !Array.isArray(data.sections)) {
      throw new Error("Invalid response format from AI");
    }

    return data.sections;
  } catch (error) {
    console.error("Gemini AI preliminaries generation failed:", error);
    throw new Error(
      `AI generation failed: ${
        error instanceof Error ? error.message : "Unknown error"
      }`
    );
  }
};
