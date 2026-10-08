// server/services/ragService.js
const KnowledgeChunk = require("../models/KnowledgeChunk");
const mongoose = require("mongoose");

// In-memory vector store fallback when MongoDB is offline
const memoryKnowledgeStore = [
  {
    documentId: "doc_explainai_syllabus",
    title: "ExplainAI Official Syllabus & Curriculum",
    chunkIndex: 0,
    content: "ExplainAI covers AI Application Engineering, RAG Vector Search, LLM Tool Calling, Multi-Step Agents, Security, React 19, and Full-Stack System Design.",
    embedding: [],
  },
];

/**
 * Generate a deterministic normalized vector embedding from text
 */
const generateEmbedding = (text) => {
  const vector = new Array(64).fill(0);
  const normalized = text.toLowerCase().replace(/[^a-z0-9\s]/g, "");
  const words = normalized.split(/\s+/).filter(Boolean);

  words.forEach((word) => {
    let hash = 0;
    for (let i = 0; i < word.length; i++) {
      hash = (hash << 5) - hash + word.charCodeAt(i);
      hash |= 0;
    }
    const index = Math.abs(hash) % 64;
    vector[index] += 1;
  });

  const magnitude = Math.sqrt(vector.reduce((sum, val) => sum + val * val, 0)) || 1;
  return vector.map((val) => Number((val / magnitude).toFixed(6)));
};

// Populate memory store embeddings
memoryKnowledgeStore.forEach((chunk) => {
  chunk.embedding = generateEmbedding(chunk.content);
});

/**
 * Compute cosine similarity between two numeric vector arrays
 */
const cosineSimilarity = (vecA, vecB) => {
  if (!vecA || !vecB || vecA.length !== vecB.length) return 0;
  let dotProduct = 0;
  let normA = 0;
  let normB = 0;

  for (let i = 0; i < vecA.length; i++) {
    dotProduct += vecA[i] * vecB[i];
    normA += vecA[i] * vecA[i];
    normB += vecB[i] * vecB[i];
  }

  if (normA === 0 || normB === 0) return 0;
  return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
};

/**
 * Chunk document text into overlapping segments
 */
const chunkText = (text, chunkSize = 400, overlap = 50) => {
  const chunks = [];
  if (!text || typeof text !== "string") return chunks;

  let start = 0;
  while (start < text.length) {
    const end = Math.min(start + chunkSize, text.length);
    chunks.push(text.slice(start, end).trim());
    start += chunkSize - overlap;
    if (start >= text.length - overlap) break;
  }
  return chunks;
};

/**
 * Ingest document content into vector store
 */
const ingestDocument = async ({ documentId, title, content, metadata = {} }) => {
  if (!documentId || !content) {
    throw new Error("Document ID and content are required.");
  }

  const rawChunks = chunkText(content);
  const chunkDocs = rawChunks.map((chunk, index) => ({
    documentId,
    title: title || documentId,
    chunkIndex: index,
    content: chunk,
    embedding: generateEmbedding(chunk),
    metadata,
  }));

  if (mongoose.connection.readyState === 1) {
    try {
      await KnowledgeChunk.deleteMany({ documentId });
      await KnowledgeChunk.insertMany(chunkDocs);
    } catch (err) {}
  }

  // Update memory store
  chunkDocs.forEach((c) => memoryKnowledgeStore.push(c));

  return {
    documentId,
    totalChunks: chunkDocs.length,
  };
};

/**
 * Perform vector similarity search for query
 */
const retrieveRelevantContext = async (query, topK = 3) => {
  const queryEmbedding = generateEmbedding(query);
  let allChunks = [];

  if (mongoose.connection.readyState === 1) {
    try {
      allChunks = await KnowledgeChunk.find({}).lean();
    } catch (err) {}
  }

  if (allChunks.length === 0) {
    allChunks = memoryKnowledgeStore;
  }

  const scoredChunks = allChunks.map((chunk) => ({
    ...chunk,
    score: cosineSimilarity(queryEmbedding, chunk.embedding),
  }));

  scoredChunks.sort((a, b) => b.score - a.score);
  const topChunks = scoredChunks.slice(0, topK).filter((c) => c.score > 0.05);

  const contextText = topChunks.map((c, i) => `[Source ${i + 1}: ${c.title}]\n${c.content}`).join("\n\n");
  const sources = topChunks.map((c) => ({
    title: c.title,
    documentId: c.documentId,
    chunkIndex: c.chunkIndex,
    relevanceScore: Number(c.score.toFixed(4)),
  }));

  return {
    contextText,
    sources,
  };
};

module.exports = {
  generateEmbedding,
  cosineSimilarity,
  chunkText,
  ingestDocument,
  retrieveRelevantContext,
};
