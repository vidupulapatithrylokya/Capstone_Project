// server/models/KnowledgeChunk.js
const mongoose = require("mongoose");

const knowledgeChunkSchema = new mongoose.Schema(
  {
    documentId: {
      type: String,
      required: true,
      index: true,
    },
    title: {
      type: String,
      required: true,
    },
    chunkIndex: {
      type: Number,
      required: true,
    },
    content: {
      type: String,
      required: true,
    },
    embedding: {
      type: [Number],
      default: [],
    },
    metadata: {
      source: String,
      category: String,
      author: String,
    },
  },
  { timestamps: true }
);

knowledgeChunkSchema.index({ content: "text" });

module.exports = mongoose.model("KnowledgeChunk", knowledgeChunkSchema);
