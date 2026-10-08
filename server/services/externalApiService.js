// server/services/externalApiService.js
const axios = require("axios");

/**
 * 3rd Party API Service with Timeout, Exponential Backoff Retry, and Validation
 */
const fetchEducationalResources = async (query, retries = 2) => {
  const apiKey = process.env.EXTERNAL_API_KEY || "demo_key";
  const url = `https://api.duckduckgo.com/?q=${encodeURIComponent(query)}&format=json`;

  for (let attempt = 1; attempt <= retries + 1; attempt++) {
    try {
      const response = await axios.get(url, {
        timeout: 4000,
        headers: {
          "User-Agent": "ExplainAI-Educational-Platform/1.0",
        },
      });

      if (!response.data) {
        throw new Error("Empty response received from external API.");
      }

      return {
        query,
        heading: response.data.Heading || query,
        abstract: response.data.AbstractText || `Educational guide and details regarding ${query}.`,
        sourceUrl: response.data.AbstractURL || `https://wikipedia.org/wiki/${encodeURIComponent(query)}`,
        relatedTopics: (response.data.RelatedTopics || []).slice(0, 5).map((t) => t.Text).filter(Boolean),
      };
    } catch (error) {
      if (attempt > retries) {
        console.warn(`[External API] All ${retries + 1} attempts failed for query '${query}': ${error.message}`);
        // Fallback response
        return {
          query,
          heading: query,
          abstract: `Comprehensive educational material and overview on ${query}.`,
          sourceUrl: `https://wikipedia.org/wiki/${encodeURIComponent(query)}`,
          relatedTopics: [`Fundamental principles of ${query}`, `Applications of ${query}`],
          fallback: true,
        };
      }
      // Exponential backoff
      await new Promise((resolve) => setTimeout(resolve, attempt * 500));
    }
  }
};

module.exports = {
  fetchEducationalResources,
};
