import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

if (!process.env.GEMINI_API_KEY) {
  throw new Error("GEMINI_API_KEY is not defined in the environment variables.");
}
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

// Define the rubric for evaluation
const rubricSchema = {
  type: "OBJECT",
  properties: {
    dataCollection: {
      type: "OBJECT",
      properties: {
        status: { type: "STRING", enum: ["Good", "Neutral", "Bad"], description: "Does the policy limit data collection to only what is necessary?" },
        quote: { type: "STRING", description: "Exact quote from the policy to justify the status." }
      },
      required: ["status", "quote"]
    },
    dataSelling: {
      type: "OBJECT",
      properties: {
        status: { type: "STRING", enum: ["Good", "Neutral", "Bad"], description: "Do they explicitly state they do NOT sell data? (Good if they don't, Bad if they do)" },
        quote: { type: "STRING", description: "Exact quote from the policy." }
      },
      required: ["status", "quote"]
    },
    dataRetention: {
      type: "OBJECT",
      properties: {
        status: { type: "STRING", enum: ["Good", "Neutral", "Bad"], description: "Is there a clear timeline or process for deleting user data?" },
        quote: { type: "STRING", description: "Exact quote from the policy." }
      },
      required: ["status", "quote"]
    },
    userRights: {
      type: "OBJECT",
      properties: {
        status: { type: "STRING", enum: ["Good", "Neutral", "Bad"], description: "Are users easily able to access, export, or delete their data?" },
        quote: { type: "STRING", description: "Exact quote from the policy." }
      },
      required: ["status", "quote"]
    },
    security: {
      type: "OBJECT",
      properties: {
        status: { type: "STRING", enum: ["Good", "Neutral", "Bad"], description: "Do they mention encryption or standard security practices to protect data?" },
        quote: { type: "STRING", description: "Exact quote from the policy." }
      },
      required: ["status", "quote"]
    },
    generalSummary: {
      type: "STRING",
      description: "A brief, 2-3 sentence overall summary of the policy."
    },
    additionalWorryingClauses: {
      type: "ARRAY",
      items: { type: "STRING" },
      description: "List at least 2 specific concerning clauses or vague language found in the policy outside of the main rubric."
    },
    additionalPositiveAspects: {
      type: "ARRAY",
      items: { type: "STRING" },
      description: "List at least 1 positive aspect found in the policy outside of the main rubric."
    }
  },
  required: ["dataCollection", "dataSelling", "dataRetention", "userRights", "security", "generalSummary", "additionalWorryingClauses", "additionalPositiveAspects"]
};

const parseGeminiResponse = (responseText) => {
  let jsonStr = responseText.trim();
  const fenceRegex = /^```(\w*)?\s*\n?(.*?)\n?\s*```$/s;
  const match = jsonStr.match(fenceRegex);
  if (match && match[2]) {
    jsonStr = match[2].trim();
  }
  return JSON.parse(jsonStr);
};

// Deterministic scoring function
const calculateScoreAndFormat = (rubricData) => {
  let score = 50; // Start at baseline
  const worryingClauses = [];
  const positiveAspects = [];
  const rubricDetails = [];

  const evaluateCategory = (name, data, pointsMap) => {
    if (!data) return;
    
    if (data.status === "Good") {
      score += pointsMap.good;
      positiveAspects.push(`${name}: "${data.quote}"`);
    } else if (data.status === "Bad") {
      score -= pointsMap.bad;
      worryingClauses.push(`${name}: "${data.quote}"`);
    }
    
    rubricDetails.push({
      category: name,
      status: data.status,
      quote: data.quote
    });
  };

  // Weightings for different factors
  evaluateCategory("Data Collection", rubricData.dataCollection, { good: 10, bad: 15 });
  evaluateCategory("Data Selling", rubricData.dataSelling, { good: 15, bad: 25 });
  evaluateCategory("Data Retention", rubricData.dataRetention, { good: 10, bad: 10 });
  evaluateCategory("User Rights", rubricData.userRights, { good: 15, bad: 10 });
  evaluateCategory("Security", rubricData.security, { good: 10, bad: 10 });

  // Clamp score
  score = Math.max(0, Math.min(100, score));

  // Add the additional clauses
  if (rubricData.additionalWorryingClauses) {
    worryingClauses.push(...rubricData.additionalWorryingClauses);
  }
  if (rubricData.additionalPositiveAspects) {
    positiveAspects.push(...rubricData.additionalPositiveAspects);
  }

  // Clamp score again just in case
  score = Math.max(0, Math.min(100, score));

  // Determine Ranking
  let ranking = "";
  if (score >= 80) ranking = "Excellent - Highly User-Focused";
  else if (score >= 60) ranking = "Good - Standard Privacy Controls";
  else if (score >= 40) ranking = "Fair - Mixed Privacy Controls";
  else if (score >= 20) ranking = "Poor - Concerning Data Practices";
  else ranking = "Critical - Needs Immediate Attention";

  return {
    ranking,
    score, // Include raw score for UI
    summary: rubricData.generalSummary,
    worryingClauses,
    positiveAspects,
    rubricDetails
  };
};

export const analyzePolicyWithGemini = async (serviceName, policyText) => {
  const model = "gemini-3.6-flash";

  const systemInstruction = `You are a HIGHLY CRITICAL AI legal assistant specializing in analyzing privacy policies. Your goal is to actively find hidden caveats, broad data collection rights, vague language, and anti-privacy practices. Evaluate the provided policy against the required rubric, defaulting to "Bad" or "Neutral" unless they explicitly protect the user. For each category, you MUST provide a status (Good, Neutral, or Bad) and an exact quote. You MUST also provide at least 2 additional worrying clauses and at least 1 additional positive aspect. Respond strictly in JSON matching the schema.`;

  const userPrompt = `Please analyze the privacy policy for "${serviceName}".
  
  Policy Text:
  ---
  ${policyText}
  ---`;

  try {
    const response = await ai.models.generateContent({
      model: model,
      contents: userPrompt,
      config: {
        systemInstruction: systemInstruction,
        responseMimeType: "application/json",
        responseSchema: rubricSchema,
        temperature: 0.1, // Low temperature for more deterministic/grounded answers
      },
    });

    const responseText = response.text;
    if (!responseText) throw new Error("Received an empty response from the AI.");
    
    const rubricData = parseGeminiResponse(responseText);
    return calculateScoreAndFormat(rubricData);

  } catch (error) {
    console.error("Error calling Gemini API:", error);
    if (error.message && error.message.includes("API key not valid")) {
      throw new Error("Invalid Gemini API Key. Please check your API_KEY environment variable.");
    }
    throw new Error(`Failed to communicate with AI service: ${error.message || 'Unknown error'}`);
  }
};