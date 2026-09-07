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
 * Splits text into sentences and merges overly short clauses or headers.
 */
export const splitIntoSentences = (text) => {
  if (!text) return [];
  const rawSentences = text
    .split(/(?<=[.?!])\s+|\n\n+/)
    .map((s) => s.trim())
    .filter((s) => s.length > 0);

  const merged = [];
  for (let i = 0; i < rawSentences.length; i++) {
    const current = rawSentences[i];
    if (merged.length > 0 && merged[merged.length - 1].length < 40) {
      merged[merged.length - 1] += " " + current;
    } else {
      merged.push(current);
    }
  }

  if (merged.length > 1 && merged[merged.length - 1].length < 40) {
    const last = merged.pop();
    merged[merged.length - 1] += " " + last;
  }

  return merged;
};

/**
 * Semantic-based chunking: groups sentences into cohesive chunks by measuring
 * semantic similarity between consecutive sentences using Gemini embeddings.
 * Splits occur when semantic topic shift is detected or max chunk size is reached.
 */
export const chunkSemanticText = async (text, options = {}) => {
  const {
    similarityThreshold = 0.70,
    minChunkSize = 200,
    maxChunkSize = 1200,
  } = options;

  if (!text || !text.trim()) return [];

  const sentences = splitIntoSentences(text);
  if (sentences.length <= 2) {
    return [text.trim()];
  }

  try {
    const batchSize = 64;
    const vectors = [];
    for (let i = 0; i < sentences.length; i += batchSize) {
      const batch = sentences.slice(i, i + batchSize);
      const res = await ai.models.embedContent({
        model: "gemini-embedding-2",
        contents: batch,
      });
      for (const emb of res.embeddings) {
        vectors.push(emb.values);
      }
    }

    const chunks = [];
    let currentChunk = [];
    let currentLength = 0;

    for (let i = 0; i < sentences.length; i++) {
      currentChunk.push(sentences[i]);
      currentLength += sentences[i].length + 1;

      const isLast = i === sentences.length - 1;
      if (isLast) {
        chunks.push(currentChunk.join(" ").trim());
        break;
      }

      const sim = cosineSimilarity(vectors[i], vectors[i + 1]);
      const isTopicShift = sim < similarityThreshold && currentLength >= minChunkSize;
      const isTooLong = currentLength >= maxChunkSize;

      if (isTopicShift || isTooLong) {
        chunks.push(currentChunk.join(" ").trim());
        currentChunk = [];
        currentLength = 0;
      }
    }

    return chunks;
  } catch (error) {
    console.warn("[RAG] Semantic embedding failed, falling back to sentence-boundary grouping:", error.message);
    const chunks = [];
    let currentChunk = [];
    let currentLength = 0;

    for (let i = 0; i < sentences.length; i++) {
      currentChunk.push(sentences[i]);
      currentLength += sentences[i].length + 1;

      if (currentLength >= maxChunkSize || i === sentences.length - 1) {
        chunks.push(currentChunk.join(" ").trim());
        currentChunk = [];
        currentLength = 0;
      }
    }
    return chunks;
  }
};

export const chunkText = chunkSemanticText;

/**
 * Chunks a policy, gets embeddings from Gemini, and stores them in memory.
 */
export const storeEmbeddings = async (serviceName, policyText) => {
  try {
    const cleanServiceName = serviceName.trim().toLowerCase();
    console.log(`[RAG] Preparing embeddings for service: ${serviceName}`);

    // 1. Chunk policy semantically
    const chunks = await chunkSemanticText(policyText);
    console.log(`[RAG] Generated ${chunks.length} semantic chunks for ${serviceName}`);

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
      model: "gemini-3.6-flash",
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
