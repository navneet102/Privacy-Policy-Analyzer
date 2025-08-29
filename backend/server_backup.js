import express from "express";
import dotenv from "dotenv";
import cors from "cors";

import { chromium } from "playwright";

import { GoogleGenAI } from "@google/genai";

dotenv.config(}

// API Routes
app.post('/api/analyze', async (req, res) => {
  try {
    const { serviceName, policyText } = req.body;
    
    if (!serviceName || !policyText) {
      return res.status(400).json({ 
        message: 'Service name and policy text are required' 
      });
    }

    const result = await analyzePolicyWithGemini(serviceName, policyText);
    res.json(result);
  } catch (error) {
    console.error('Analysis error:', error);
    res.status(500).json({ 
      message: error.message || 'Failed to analyze policy' 
    });
  }
});

app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Server is running' });
});

app.listen(PORT, async () => {
  console.log(`Server running on port ${PORT}`)

  // Uncomment the following lines if you want to test the scraping functionality
  // const privacyPageText = await search();
  // if(privacyPageText){
  //   const policyText = await extractPrivacyPolicy(privacyPageText);
  //   console.log("Extracted policy:", policyText);
  // } else {
  //   console.log("No privacy page text was found.");
  // }
})w GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

const serv = "Prestige Cookers";

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
  origin: "http://localhost:5173",
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE"],
}));

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

const parseGeminiResponse = (responseText) => { 
  let jsonStr = responseText.trim();
  const fenceRegex = /^```(\w*)?\s*\n?(.*?)\n?\s*```$/s;
  const match = jsonStr.match(fenceRegex);
  if (match && match[2]) {
    jsonStr = match[2].trim();
  }

  try {
    const parsed = JSON.parse(jsonStr);
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

const analyzePolicyWithGemini = async (
  serviceName,
  policyText
) => {
  // if (!API_KEY) {
  //   throw new Error("Gemini API Key is not configured. Please set the API_KEY environment variable.");
  // }

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

// async function callAi() {
//   const response = await ai.models.generateContent({
//     model: "gemini-2.5-flash",
//     contents: "Describe in 100 words about taj mahal.",
//     config: {
//       thinkingConfig: {
//         thinkingBudget: 0,
//       }
//     }
//   });
//   console.log(response.text);
// }

async function extractPrivacyPolicy(privacyPageText) {
  const response = await ai.models.generateContent({
    model: "gemini-2.0-flash",
    contents: `From the following text of a webpage, please identify and extract the complete and full text of the "Privacy Policy," "Terms of Service," "Terms and Conditions," and any other similar legal or usage terms. Combine all these sections into a single response, and do not include any other parts of the document.
              Full Text:
              ${privacyPageText}`, 
    config: {
      thinkingConfig: {
        thinkingBudget: 0,
      }
    }
  });
  return response.text;

}

const search = async () => {
  const browser = await chromium.launch({
    headless: false
  });
  const context = await browser.newContext();
  const page = await context.newPage();
  await page.goto('https://duckduckgo.com/');
  await page.getByRole('combobox', { name: 'Search with DuckDuckGo' }).click();
  await page.getByRole('combobox', { name: 'Search with DuckDuckGo' }).fill(serv);
  await page.getByRole('button', { name: 'Search', exact: true }).click();
  let href = await page.locator('#r1-0 > div:nth-child(3) > h2 > a').getAttribute('href');
  console.log(href);

  if (href) {
    await page.goto(href);
  }

  let href1 = await page.getByRole('link', { name: /privacy/i }).getAttribute('href');


  if (!(href1.includes("http"))) {
    href1 = href1.slice(1);
    href1 = `${href}${href1}`;
  }

  if (href1) {
    console.log(href1);
    await page.goto(href1);
  }

  const allVisibleText = await page.locator('body').innerText();
  // console.log(allVisibleText);


  // ---------------------
  await context.close();
  await browser.close();

  return allVisibleText;
};


app.listen(PORT, async () => {
  console.log(`Server running on port ${PORT}`)


  const privacyPageText = await search();
  // callAi();
  if(privacyPageText){
    const policyText = await extractPrivacyPolicy(privacyPageText);
  } else {
    console.log("No privacy page text was found.");
  }

  analyzePolicyWithGemini(serv, policyText);
})