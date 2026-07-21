import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

if (!process.env.GEMINI_API_KEY) {
  throw new Error("GEMINI_API_KEY is not defined in the environment variables.");
}

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

// In-memory Vector Database: serviceName -> Array of { text, vector }
const vectorStore = new Map();

/**
 * Splits text into overlapping chunks of a specified size, trying not to cut sentences or words.
 */
export const chunkText = (text, chunkSize = 1000, overlap = 200) => {
  const chunks = [];
  if (!text) return chunks;

  let i = 0;
  while (i < text.length) {
    let end = Math.min(i + chunkSize, text.length);

    // If not at the end of the text, try to split at a space to keep words whole
    if (end < text.length) {
      const lastSpace = text.lastIndexOf(" ", end);
      // Ensure we don't shrink the chunk too much (at least 60% of chunkSize)
      if (lastSpace > i + chunkSize * 0.6) {
        end = lastSpace;
      }
    }

    const chunk = text.slice(i, end).trim();
    if (chunk.length > 0) {
      chunks.push(chunk);
    }

    i = end - overlap;
    if (i >= text.length || end === text.length) break;
    if (i <= 0) i = end; // Prevent infinite loop
  }
  return chunks;
};

/**
 * Calculates the cosine similarity between two vectors.
 */
export const cosineSimilarity = (vecA, vecB) => {
  let dotProduct = 0.0;
  let normA = 0.0;
  let normB = 0.0;
  
  for (let i = 0; i < vecA.length; i++) {
    dotProduct += vecA[i] * vecB[i];
    normA += vecA[i] * vecA[i];
    normB += vecB[i] * vecB[i];
  }
  
  if (normA === 0 || normB === 0) return 0;
  return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
};

/**
 * Chunks a policy, gets embeddings from Gemini, and stores them in memory.
 */
export const storeEmbeddings = async (serviceName, policyText) => {
  try {
    const cleanServiceName = serviceName.trim().toLowerCase();
    console.log(`[RAG] Preparing embeddings for service: ${serviceName}`);
    
    // 1. Chunk policy
    const chunks = chunkText(policyText, 1000, 200);
    console.log(`[RAG] Generated ${chunks.length} chunks for ${serviceName}`);

    if (chunks.length === 0) {
      console.warn(`[RAG] No chunks created for ${serviceName}. Text might be empty.`);
      return;
    }

    // 2. Generate embeddings in a single batched call
    const response = await ai.models.embedContent({
      model: "gemini-embedding-2",
      contents: chunks,
    });

    if (!response.embeddings || response.embeddings.length !== chunks.length) {
      throw new Error("Mismatch in generated embeddings length or invalid API response.");
    }

    // 3. Store mapped chunks and vectors in memory
    const mappedData = chunks.map((text, idx) => ({
      text,
      vector: response.embeddings[idx].values,
    }));

    vectorStore.set(cleanServiceName, mappedData);
    console.log(`[RAG] Successfully cached ${mappedData.length} vectors for ${serviceName}`);
  } catch (error) {
    console.error(`[RAG] Error preparing embeddings for ${serviceName}:`, error);
    throw error;
  }
};

/**
 * Queries the vector database and generates a grounded response from Gemini.
 */
export const queryPolicy = async (serviceName, question) => {
  try {
    const cleanServiceName = serviceName.trim().toLowerCase();
    const cachedData = vectorStore.get(cleanServiceName);

    if (!cachedData || cachedData.length === 0) {
      return {
        answer: `Embeddings not found for "${serviceName}". Please re-analyze the policy text first so we can initialize the RAG vector search.`,
        success: false
      };
    }

    console.log(`[RAG] Querying policy for: ${serviceName} | Question: "${question}"`);

    // 1. Embed user query
    const embedResponse = await ai.models.embedContent({
      model: "gemini-embedding-2",
      contents: question,
    });

    if (!embedResponse.embeddings || embedResponse.embeddings.length === 0 || !embedResponse.embeddings[0].values) {
      throw new Error("Failed to generate embedding for the question.");
    }

    const questionVector = embedResponse.embeddings[0].values;

    // 2. Compute similarity and sort chunks
    const chunksWithSimilarity = cachedData.map((item) => ({
      text: item.text,
      similarity: cosineSimilarity(questionVector, item.vector),
    }));

    chunksWithSimilarity.sort((a, b) => b.similarity - a.similarity);

    // Retrieve top 4 relevant chunks
    const topChunks = chunksWithSimilarity.slice(0, 4);
    console.log(`[RAG] Retrieved top matches with similarity scores:`, topChunks.map(c => c.similarity.toFixed(4)));

    // 3. Construct prompt with retrieved chunks
    const excerptsText = topChunks
      .map((c, i) => `--- Excerpt ${i + 1} ---\n${c.text}`)
      .join("\n\n");

    const systemInstruction = `You are a helpful, clear, and direct privacy policy assistant. Your goal is to answer the user's questions about the privacy policy of "${serviceName}" based ONLY on the excerpts provided. 
If the excerpts do not contain the answer, say exactly: "I cannot find the answer to this in the privacy policy." and do not make up any information.
Keep your answers objective and simple.`;

    const userPrompt = `Below are relevant excerpts from the privacy policy of "${serviceName}":

${excerptsText}

User's Question: "${question}"
Answer:`;

    // 4. Generate grounded answer
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: userPrompt,
      config: {
        systemInstruction,
        temperature: 0.2,
      },
    });

    const answer = response.text || "No response generated.";
    
    return {
      success: true,
      answer,
      sources: topChunks.map(c => c.text)
    };

  } catch (error) {
    console.error(`[RAG] Error querying policy for ${serviceName}:`, error);
    return {
      success: false,
      answer: `An error occurred while scanning the policy to answer your question: ${error.message || 'Unknown error'}`
    };
  }
};
