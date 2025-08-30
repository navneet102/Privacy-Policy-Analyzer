import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import { chromium } from "playwright";
import { GoogleGenAI } from "@google/genai";
import path from "path";

dotenv.config();
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

const app = express();
const PORT = process.env.PORT || 5000;

const __dirname = path.resolve();

// Middleware
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
  
  try {
    browser = await chromium.launch({
      headless: true, // Changed to true for production
      timeout: 30000,
    });
    
    context = await browser.newContext({
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
    });
    
    page = await context.newPage();
    
    // Set timeouts
    page.setDefaultTimeout(15000);
    page.setDefaultNavigationTimeout(15000);
    
    await page.goto('https://duckduckgo.com/');
    
    // Search for the service
    await page.getByRole('combobox', { name: 'Search with DuckDuckGo' }).click();
    await page.getByRole('combobox', { name: 'Search with DuckDuckGo' }).fill(`${serviceName} privacy policy`);
    await page.getByRole('button', { name: 'Search', exact: true }).click();
    
    // Wait for search results
    await page.waitForSelector('#r1-0', { timeout: 10000 });
    
    // let href = await page.locator('#r1-0 > div:nth-child(3) > h2 > a').getAttribute('href');
    // console.log('Found website:', href);

    // if (!href) {
    //   throw new Error('Could not find the official website for this service');
    // }

    // // Navigate to the main website
    // await page.goto(href);
    
    // Look for privacy policy link
    // let href1;
    // try {
    //   href1 = await page.getByRole('link', { name: /privacy/i }).getAttribute('href');
    // } catch (error) {
    //   // Try alternative selectors
    //   try {
    //     href1 = await page.locator('a[href*="privacy"]').first().getAttribute('href');
    //   } catch (error2) {
    //     throw new Error('Could not find privacy policy link on the website');
    //   }
    // }

    let href1;
    try {
      href1 = await page.locator('#r1-0 > div:nth-child(3) > h2 > a').getAttribute('href');
    } catch (error) {
      // Try alternative selectors
      try {
        href1 = await page.locator('a[href*="privacy"]').first().getAttribute('href');
      } catch (error2) {
        throw new Error('Could not find privacy policy link on the website');
      }
    }
    if (!href1) {
      throw new Error('Could not find privacy policy link on the website');
    }

    // Handle relative URLs
    if (!href1.includes("http")) {
      if (href1.startsWith('/')) {
        href1 = href1.slice(1);
      }
      href1 = `${href}${href1}`;
    }

    console.log('Found privacy policy URL:', href1);
    
    // Navigate to privacy policy page
    await page.goto(href1);
    
    // Extract all visible text
    const allVisibleText = await page.locator('body').innerText();
    
    if (!allVisibleText || allVisibleText.length < 100) {
      throw new Error('Privacy policy page appears to be empty or too short');
    }

    return allVisibleText;
    
  } catch (error) {
    console.error('Error in search function:', error);
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
    
    // Step 1: Search and scrape the privacy policy page
    const privacyPageText = await search(serviceName.trim());
    
    if (!privacyPageText) {
      return res.status(404).json({ 
        message: 'Could not find privacy policy page for this service',
        success: false
      });
    }

    // Step 2: Extract policy text using AI
    const policyText = await extractPrivacyPolicy(privacyPageText);
    
    if (!policyText || policyText.length < 100) {
      return res.status(404).json({ 
        message: 'Could not extract meaningful privacy policy text from the page',
        success: false
      });
    }

    console.log(`Successfully extracted policy for: ${serviceName}`);
    
    res.json({ 
      success: true,
      policyText: policyText,
      message: 'Privacy policy extracted successfully'
    });
    
  } catch (error) {
    console.error('Policy extraction error:', error);
    
    let errorMessage = 'Failed to extract privacy policy automatically';
    
    if (error.message.includes('Could not find the official website')) {
      errorMessage = 'Could not find the official website for this service. Please check the service name and try again.';
    } else if (error.message.includes('Could not find privacy policy link')) {
      errorMessage = 'Found the website but could not locate a privacy policy link. Please enter the policy text manually.';
    } else if (error.message.includes('timeout')) {
      errorMessage = 'The website took too long to load. Please try again or enter the policy text manually.';
    } else if (error.message.includes('empty or too short')) {
      errorMessage = 'The privacy policy page appears to be empty. Please enter the policy text manually.';
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
  console.log('Privacy Policy Analyzer API is ready!');
});


if(process.env.NODE_ENV === "production") {
  app.use(express.static(path.join(__dirname, "/frontend/dist")));

  app.get("*", (req, res) => {
    res.sendFile(path.resolve(__dirname, "frontend", "dist", "index.html"));
  });
}