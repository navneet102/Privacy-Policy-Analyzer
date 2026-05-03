import { chromium } from "playwright-extra";
import dotenv from "dotenv";
import StealthPlugin from "puppeteer-extra-plugin-stealth";

dotenv.config();

if (!process.env.BRAVE_API_KEY) {
  throw new Error("BRAVE_API_KEY is not defined in the environment variables.");
}

export const search = async (serviceName) => {
  chromium.use(StealthPlugin());
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
        "X-Subscription-Token": process.env.BRAVE_API_KEY || "",
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

    // Extract html
    const htmlContent = await page.content();

    return { success: true, htmlContent: htmlContent, url: privacyPolicyUrl };

  } catch (error) {
    console.error('Error in search function:', error);

    // Return the URL we found (if any) even when scraping fails
    if (privacyPolicyUrl) {
      return {
        success: false,
        url: privacyPolicyUrl,
        htmlContent: "",
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
