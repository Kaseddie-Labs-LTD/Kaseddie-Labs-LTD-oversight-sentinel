// src/server.js
const express = require('express');
const bodyParser = require('body-parser');
const mongoClient = require('./mongoClient');
const vertexClient = require('./vertexClient');
const qdrantClient = require('./qdrantClient');

const app = express();
app.use(bodyParser.json());

// POST /log - store request/response data in MongoDB Atlas
app.post('/log', async (req, res) => {
  try {
    const result = await mongoClient.logState(req.body);
    res.json({ success: true, insertedId: result.insertedId });
  } catch (err) {
    console.error('Log error:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// POST /semantics - forward payload to Vertex AI and return embedding
app.post('/semantics', async (req, res) => {
  try {
    const { text } = req.body;
    const semantics = await vertexClient.generateSemantics(text);
    res.json({ success: true, semantics });
  } catch (err) {
    console.error('Semantics error:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// POST /vector - upsert embedding into Qdrant
app.post('/vector', async (req, res) => {
  try {
    const { id, embedding, metadata } = req.body;
    await qdrantClient.upsertVector(id, embedding, metadata);
    res.json({ success: true });
  } catch (err) {
    console.error('Vector sync error:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`Express gateway listening on port ${PORT}`);
});