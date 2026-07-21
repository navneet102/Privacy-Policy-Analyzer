import { JSDOM } from "jsdom";
import { Readability } from "@mozilla/readability";
import { search } from "../services/scraper.service.js";
import { analyzePolicyWithGemini } from "../lib/gemini.js";
import { storeEmbeddings, queryPolicy } from "../services/rag.service.js";

export const extract_policy = async (req, res) => {
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

        if (searchResult.success && searchResult.htmlContent) {
            const url = searchResult.url;
            const doc = new JSDOM(searchResult.htmlContent, { url });
            const reader = new Readability(doc.window.document);
            const policyText = reader.parse()?.textContent;

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
}

export const analyze = async (req, res) => {
    try {
        const { serviceName, policyText } = req.body;

        if (!serviceName || !policyText) {
            return res.status(400).json({
                message: 'Service name and policy text are required'
            });
        }

        const result = await analyzePolicyWithGemini(serviceName, policyText);

        // Pre-compute and store embeddings for RAG chat in the background
        try {
            await storeEmbeddings(serviceName, policyText);
        } catch (embedError) {
            console.error("Failed to generate and store embeddings for RAG:", embedError);
        }

        res.json(result);
    } catch (error) {
        console.error('Analysis error:', error);
        res.status(500).json({
            message: error.message || 'Failed to analyze policy'
        });
    }
}

export const chatWithPolicy = async (req, res) => {
    try {
        const { serviceName, question } = req.body;

        if (!serviceName || !question) {
            return res.status(400).json({
                message: 'Service name and question are required',
                success: false
            });
        }

        const result = await queryPolicy(serviceName, question);
        
        res.json(result);
    } catch (error) {
        console.error('Chat with policy error:', error);
        res.status(500).json({
            success: false,
            answer: error.message || 'Failed to query the privacy policy'
        });
    }
}