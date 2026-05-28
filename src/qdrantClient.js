// src/qdrantClient.js
const axios = require('axios');

const API_KEY = process.env.QDRANT_API_KEY; // Qdrant API key
const ENDPOINT = process.env.QDRANT_ENDPOINT || 'https://YOUR_QDRANT_INSTANCE/api/v1';
const COLLECTION = process.env.QDRANT_COLLECTION || 'cloud_vectors';

/**
 * Upsert a vector embedding into Qdrant collection.
 * @param {string|number} id - Unique identifier for the point.
 * @param {Array<number>} embedding - Numeric embedding array.
 * @param {object} metadata - Additional payload to store with the point.
 */
async function upsertVector(id, embedding, metadata = {}) {
  const url = `${ENDPOINT}/collections/${COLLECTION}/points`;
  const payload = {
    points: [
      {
        id,
        vector: embedding,
        payload: {
          ...metadata,
          original_text: metadata.original_text || null,
          timestamp: metadata.timestamp || new Date().toISOString(),
        },
      },
    ],
    // Optional: set "upsert": true (default behavior)
  };

  const headers = {
    'Content-Type': 'application/json',
    ...(API_KEY && { 'api-key': API_KEY }),
  };

  const response = await axios.put(url, payload, { headers });
  return response.data;
}

module.exports = { upsertVector };
