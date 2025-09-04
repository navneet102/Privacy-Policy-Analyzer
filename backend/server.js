import express from "express";
import dotenv from "dotenv";
import cors from "cors";
// import { chromium } from "playwright";
import { GoogleGenAI } from "@google/genai";
import path from "path";
import { chromium } from "playwright-extra";
import StealthPlugin from "puppeteer-extra-plugin-stealth";

chromium.use(StealthPlugin);

dotenv.config();
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
if (!process.env.GEMINI_API_KEY) {
  throw new Error("GEMINI_API_KEY is not defined in the environment variables.");
}
if (!process.env.BRAVE_API_KEY) {
  throw new Error("BRAVE_API_KEY is not defined in the environment variables.");
}

const app = express();
const PORT = process.env.PORT || 5000;

const __dirname = path.resolve();

if(process.env.NODE_ENV !== "production"){
  app.use(cors({
    origin: "http://localhost:5173",
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE"],
  }));
}

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

const analyzePolicyWithGemini = async (serviceName, policyText) => {
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

const search = async (serviceName) => {
  let browser, context, page;
  let privacyPolicyUrl = null;
  
  try {
    // Step 1: Use Brave Search API to find the privacy policy URL
    console.log(`Searching for privacy policy URL for: ${serviceName}`);
    const params = new URLSearchParams({
      q: `${serviceName} privacy policy`,
      country: 'IN',
      count: '1',
      ui_lang: 'en-US',
      result_filter: 'web'
    });
    const braveApiUrl = `https://api.search.brave.com/res/v1/web/search?${params.toString()}`;
    
    const braveResponse = await fetch(braveApiUrl, {
      headers: {
        "X-Subscription-Token": process.env.BRAVE_API_KEY,
        "X-Loc-Country": 'IN',
        "Accept": "application/json"
      }
    });

    if (!braveResponse.ok) {
      const errorBody = await braveResponse.text();
      console.error("Brave Search API error:", errorBody);
      throw new Error(`Brave Search API request failed with status: ${braveResponse.status}`);
    }

    const searchData = await braveResponse.json();

    if (!searchData.web || !searchData.web.results || searchData.web.results.length === 0) {
      throw new Error('Could not find the official website for this service using Brave Search API.');
    }

    privacyPolicyUrl = searchData.web.results[0].url;
    console.log('Found privacy policy URL:', privacyPolicyUrl);

    // Step 2: Use Playwright to scrape the content from the found URL
    browser = await chromium.launch({
      headless: true, 
      timeout: 30000,
    });
    
    context = await browser.newContext({
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
    });
    
    page = await context.newPage();
    
    // Set timeouts
    page.setDefaultTimeout(15000);
    page.setDefaultNavigationTimeout(15000);
    
    // Navigate to privacy policy page
    await page.goto(privacyPolicyUrl);
    
    // Extract all visible text
    const allVisibleText = await page.locator('body').innerText();
    
    if (!allVisibleText || allVisibleText.length < 100) {
      throw new Error('Privacy policy page appears to be empty or too short');
    }

    return { success: true, text: allVisibleText, url: privacyPolicyUrl };
    
  } catch (error) {
    console.error('Error in search function:', error);
    
    // Return the URL we found (if any) even when scraping fails
    if (privacyPolicyUrl) {
      return { 
        success: false, 
        text: null, 
        url: privacyPolicyUrl, 
        error: error.message 
      };
    }
    
    throw error;
  } finally {
    // Cleanup
    try {
      if (context) await context.close();
      if (browser) await browser.close();
    } catch (cleanupError) {
      console.error('Error during cleanup:', cleanupError);
    }
  }
};

// API Routes
app.post('/api/extract-policy', async (req, res) => {
  try {
    const { serviceName } = req.body;
    
    if (!serviceName || !serviceName.trim()) {
      return res.status(400).json({ 
        message: 'Service name is required',
        success: false
      });
    }

    console.log(`Starting policy extraction for: ${serviceName}`);
    
    // Step 1: Search and attempt to scrape the privacy policy page
    const searchResult = await search(serviceName.trim());
    
    if (searchResult.success && searchResult.text) {
      // Step 2: Extract policy text using AI
      const policyText = await extractPrivacyPolicy(searchResult.text);
      
      if (!policyText || policyText.length < 100) {
        return res.status(404).json({ 
          message: 'Could not extract meaningful privacy policy text from the page',
          success: false,
          privacyPolicyUrl: searchResult.url
        });
      }

      console.log(`Successfully extracted policy for: ${serviceName}`);
      
      res.json({ 
        success: true,
        policyText: policyText,
        message: 'Privacy policy extracted successfully',
        privacyPolicyUrl: searchResult.url
      });
      
    } else if (searchResult.url) {
      // We found the URL but couldn't scrape it (likely blocked)
      console.log(`Found URL but scraping failed for: ${serviceName}`);
      
      res.status(200).json({ 
        success: false,
        blocked: true,
        privacyPolicyUrl: searchResult.url,
        message: 'Privacy policy page found but could not be accessed automatically',
        userFriendlyMessage: `We found the privacy policy page for ${serviceName}, but the website blocks automated access. Please copy and paste the policy text manually from the link below.`,
        details: searchResult.error
      });
      
    } else {
      return res.status(404).json({ 
        message: 'Could not find privacy policy page for this service',
        success: false
      });
    }
    
  } catch (error) {
    console.error('Policy extraction error:', error);
    
    let errorMessage = 'Failed to extract privacy policy automatically';
    
    if (error.message.includes('Could not find the official website')) {
      errorMessage = 'Could not find the official website for this service. Please check the service name and try again.';
    } else if (error.message.includes('timeout')) {
      errorMessage = 'The search request took too long to complete. Please try again or enter the policy text manually.';
    } else if (error.message.includes('Brave Search API')) {
      errorMessage = 'Search service is temporarily unavailable. Please enter the policy text manually.';
    }
    
    res.status(500).json({ 
      message: errorMessage,
      success: false,
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

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

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log('Privacy Lens API is ready!');
});

if(process.env.NODE_ENV === "production") {
  app.use(express.static(path.join(__dirname, "/frontend/dist")));

  app.get("*", (req, res) => {
    res.sendFile(path.resolve(__dirname, "frontend", "dist", "index.html"));
  });
}

