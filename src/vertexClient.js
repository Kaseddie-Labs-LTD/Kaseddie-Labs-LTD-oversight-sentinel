// src/vertexClient.js
const axios = require('axios');

const API_KEY = process.env.VERTEX_API_KEY; // Google Cloud Vertex AI API key
const ENDPOINT = process.env.VERTEX_ENDPOINT || 'https://us-central1-aiplatform.googleapis.com/v1/projects/PROJECT_ID/locations/us-central1/publishers/google/models/gemini-2.5-flash-lite:generateContent';

/**
 * Generate semantics (embedding) for given text using Vertex AI Gemini model.
 * Returns the model's generated content (could be embedding or text based on model).
 */
async function generateSemantics(text) {
  const payload = {
    contents: [{ role: 'user', parts: [{ text }] }],
    // Adjust generation config as needed
    generationConfig: {
      temperature: 0.2,
      maxOutputTokens: 256,
    },
  };

  const response = await axios.post(ENDPOINT, payload, {
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${API_KEY}`,
    },
  });

  // Assuming the response contains a field "candidates[0].content.parts[0].text"
  const semantics = response.data;
  return semantics;
}

module.exports = { generateSemantics };
