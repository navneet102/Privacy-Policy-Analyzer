import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

if (!process.env.GEMINI_API_KEY) {
  throw new Error("GEMINI_API_KEY is not defined in the environment variables.");
}
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

const analysisSchema = {
  type: "OBJECT",
  properties: {
    ranking: {
      type: "STRING",
      description: "A short phrase ranking the policy (e.g., 'Good', 'Fair', 'Poor', 'Excellent - User-Focused')."
    },
    summary: {
      type: "STRING",
      description: "A brief, easy-to-understand summary of the key aspects of the policy (2-4 sentences)."
    },
    worryingClauses: {
      type: "ARRAY",
      description: "An array of strings, each describing a specific clause that might be unfavorable or concerning from a privacy perspective. Empty array if none.",
      items: { type: "STRING" }
    },
    positiveAspects: {
      type: "ARRAY",
      description: "An array of strings, each describing a specific clause that is positive or user-friendly. Empty array if none.",
      items: { type: "STRING" }
    },
  },
  required: ["ranking", "summary", "worryingClauses", "positiveAspects"]
};

const parseGeminiResponse = (responseText) => {
  let jsonStr = responseText.trim();
  const fenceRegex = /^```(\w*)?\s*\n?(.*?)\n?\s*```$/s;
  const match = jsonStr.match(fenceRegex);
  if (match && match[2]) {
    jsonStr = match[2].trim();
  }

  try {
    const parsed = JSON.parse(jsonStr);
    // Basic validation of the parsed structure
    if (
      typeof parsed.ranking === 'string' &&
      typeof parsed.summary === 'string' &&
      Array.isArray(parsed.worryingClauses) &&
      Array.isArray(parsed.positiveAspects)
    ) {
      return parsed;
    } else {
      console.error("Parsed JSON does not match expected PolicyAnalysisResult structure:", parsed);
      throw new Error("AI response format is incorrect. The returned data structure is not as expected.");
    }
  } catch (e) {
    console.error("Failed to parse JSON response from AI:", e, "\nRaw response:", responseText);
    throw new Error("Failed to understand AI's response. It wasn't in the expected JSON format.");
  }
};

export const analyzePolicyWithGemini = async (serviceName, policyText) => {
  const model = "gemini-2.5-flash";

  const systemInstruction = `You are an expert AI legal assistant specializing in analyzing privacy policies and terms of service. Your goal is to provide a clear, concise, and actionable summary for an average user based on the provided text. You must respond with a JSON object that adheres to the provided schema.`;

  const userPrompt = `Please analyze the following privacy policy for the service named "${serviceName}".

  Policy Text:
  ---
  ${policyText}
  ---

  Based on the text, provide an analysis covering the overall ranking, a summary, any worrying clauses, and any positive aspects.`;

  try {
    const response = await ai.models.generateContent({
      model: model,
      contents: userPrompt,
      config: {
        systemInstruction: systemInstruction,
        responseMimeType: "application/json",
        responseSchema: analysisSchema,
        temperature: 0.3,
      },
    });

    const responseText = response.text;
    if (!responseText) {
      throw new Error("Received an empty response from the AI.");
    }
    return parseGeminiResponse(responseText);

  } catch (error) {
    console.error("Error calling Gemini API:", error);
    if (error.message && error.message.includes("API key not valid")) {
      throw new Error("Invalid Gemini API Key. Please check your API_KEY environment variable.");
    }
    throw new Error(`Failed to communicate with AI service: ${error.message || 'Unknown error'}`);
  }
};