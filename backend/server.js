import express from "express";
import dotenv from "dotenv";
import cors from "cors";

import { chromium } from "playwright";

import { GoogleGenAI } from "@google/genai";

dotenv.config();
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

const serv = "Milton India";

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors({
  origin: "http://localhost:5173",
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE"],
}));

async function callAi() {
  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: "Describe in 100 words about taj mahal.",
    config: {
      thinkingConfig: {
        thinkingBudget: 0,
      }
    }
  });
  console.log(response.text);
}

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
  console.log(response.text);

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
    await extractPrivacyPolicy(privacyPageText);
  } else {
    console.log("No privacy page text was found.");
  }
})