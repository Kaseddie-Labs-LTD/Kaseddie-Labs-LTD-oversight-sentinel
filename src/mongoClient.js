// src/mongoClient.js
const { MongoClient } = require('mongodb');

const uri = process.env.MONGODB_URI; // e.g., "mongodb+srv://<user>:<pass>@cluster0.mongodb.net"
const dbName = process.env.MONGODB_DB || 'cloud_blueprint_db';
const collectionName = process.env.MONGODB_COLLECTION || 'state_logs';

let client;
let collection;

async function init() {
  if (!client) {
    client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
    await client.connect();
    const db = client.db(dbName);
    collection = db.collection(collectionName);
    console.log('Connected to MongoDB Atlas');
  }
}

/**
 * Insert a log entry into MongoDB.
 * Expected schema (based on chosen logging schema):
 * {
 *   timestamp: ISODate,
 *   userId: string,
 *   action: string,
 *   payload: object,
 *   status: string
 * }
 */
async function logState(entry) {
  await init();
  const doc = {
    timestamp: new Date(),
    userId: entry.userId,
    action: entry.action,
    payload: entry.payload,
    status: entry.status,
  };
  const result = await collection.insertOne(doc);
  return result;
}

module.exports = { logState };
