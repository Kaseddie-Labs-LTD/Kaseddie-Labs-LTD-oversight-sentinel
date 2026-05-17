import { GoogleGenAI } from "@google/genai";
import { MongoClient } from "mongodb";
import fs from "fs";
import dotenv from "dotenv";
dotenv.config();

// ═══════════════════════════════════════════════════════════════════════════════
// SENTINEL COMPLIANCE & B2B EXTREMA PROTOCOL v2.0.0
// Organization: Kaseddie Labs LTD
// Author: Kasamba Wahitu Eddie, Lead System Designer
// ═══════════════════════════════════════════════════════════════════════════════

// MongoDB connection string from environment variable
const MONGO_URI = process.env.MDB_URI;

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

// ═══════════════════════════════════════════════════════════════════════════════
// SAMPLE PAYLOAD 1: RAW B2B RECRUITMENT LEAD (UNSTRUCTURED)
// ═══════════════════════════════════════════════════════════════════════════════
const sampleB2BLead = {
  rawText: `VANGUARD GLOBAL HORIZON GROUP
Dubai Marina, UAE | Kampala Corridor Office

IMMEDIATE SECURITY PERSONNEL DEPLOYMENT

We are urgently seeking retail security officers for Dubai Marina premium locations. 
Salary: AED 2,800/month + accommodation. Visa guaranteed within 14 days.

REQUIREMENTS:
- Valid passport
- Medical clearance certificate
- Administrative processing fee: 1,500,000 UGX ($400 USD) payable upfront
- Submit passport bio-data page immediately to secure deployment slot

CONTACT:
Operations Manager: James Okello
Email: operations@vanguardhorizon.ae
Phone: +971 50 123 4567

Apply NOW - Limited slots available!`,
  source: "Kampala Job Board",
  scannedAt: new Date()
};

// ═══════════════════════════════════════════════════════════════════════════════
// SAMPLE PAYLOAD 2: TRANS-NATIONAL WORKER TRACKING NODE
// ═══════════════════════════════════════════════════════════════════════════════
const sampleWorkerTransit = {
  workerId: "UG-2024-7842",
  workerName: "Nakimuli Sarah",
  sourceNode: "Kampala, Uganda",
  destinationNode: "Dubai Marina, UAE",
  employerId: "VG-001",
  supervisorName: "Ahmed Al-Fayed",
  contractStartDate: "2024-03-15",
  expectedSalary: "AED 2,800",
  deploymentStatus: "ACTIVE",
  lastPulseCheck: new Date(Date.now() - 25 * 24 * 60 * 60 * 1000), // 25 days ago
  pulseCheckMethod: "WhatsApp Automated",
  distressSignals: 0
};

// ═══════════════════════════════════════════════════════════════════════════════
// LOAD SYSTEM PROTOCOL
// ═══════════════════════════════════════════════════════════════════════════════
function loadSystemProtocol() {
  const defaultProtocol = "You are the Oversight Sentinel, an autonomous compliance auditing and B2B engagement engine.";
  if (fs.existsSync("./src/sentinel_logic.md")) {
    const savedProtocol = fs.readFileSync("./src/sentinel_logic.md", "utf8");
    if (savedProtocol.trim().length > 0) return savedProtocol;
  }
  return defaultProtocol;
}

// ═══════════════════════════════════════════════════════════════════════════════
// AUTONOMOUS WORKER PULSE-CHECK SIMULATION
// ═══════════════════════════════════════════════════════════════════════════════
function simulateWorkerPulseCheck(workerData) {
  console.log("\n" + "═".repeat(70));
  console.log("🔴 TRANS-NATIONAL WORKER PULSE-CHECK SIMULATION");
  console.log("═".repeat(70));
  console.log(`👤 Worker: ${workerData.workerName} (${workerData.workerId})`);
  console.log(`📍 Route: ${workerData.sourceNode} → ${workerData.destinationNode}`);
  console.log(`📅 Last Check: ${workerData.lastPulseCheck.toISOString()}`);
  console.log(`📊 Status: ${workerData.deploymentStatus}`);
  
  const daysSinceLastCheck = Math.floor((Date.now() - workerData.lastPulseCheck.getTime()) / (1000 * 60 * 60 * 24));
  
  if (daysSinceLastCheck > 21) {
    console.log("\n⚠️  RED-FLAG ALERT: Worker silence exceeds 21-day threshold!");
    console.log("🚨 IMMEDIATE ACTION REQUIRED: Verify worker safety and contract compliance.");
    return { status: "CRITICAL", alert: "Worker silence threshold exceeded", daysSinceLastCheck };
  } else if (workerData.distressSignals > 0) {
    console.log("\n⚠️  RED-FLAG ALERT: Distress signals detected in worker profile!");
    console.log("🚨 IMMEDIATE ACTION REQUIRED: Investigate working conditions and wage compliance.");
    return { status: "CRITICAL", alert: "Distress signals present", distressSignals: workerData.distressSignals };
  } else {
    console.log("\n✅ Worker pulse-check within normal parameters.");
    console.log("📡 Next automated check scheduled in 7 days.");
    return { status: "NORMAL", alert: null };
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
// MAIN EXECUTION FUNCTION
// ═══════════════════════════════════════════════════════════════════════════════
async function executeOversightSentinel() {
  console.log("\n" + "═".repeat(70));
  console.log("╔══════════════════════════════════════════════════════════════════╗");
  console.log("║     OVERSIGHT SENTINEL v2.0.0 - ACTIVE HANDSHAKE                 ║");
  console.log("║     Kaseddie Labs LTD | Compliance & B2B Extrema Protocol       ║");
  console.log("╚══════════════════════════════════════════════════════════════════╝");
  console.log("═".repeat(70));
  
  const systemProtocol = loadSystemProtocol();
  let aiAnalysisResult = null;

  // ═══════════════════════════════════════════════════════════════════════════════
  // PHASE 1: B2B LEAD AUDIT WITH STRUCTURED JSON EXTRACTION
  // ═══════════════════════════════════════════════════════════════════════════════
  console.log("\n🧠 PHASE 1: B2B LEAD AUDIT & STRUCTURED EXTRACTION");
  console.log("─".repeat(70));
  
  try {
    console.log("📡 Ingesting lead to Agent Platform via gemini-2.5-flash...");
    console.log(`📄 Lead Source: ${sampleB2BLead.source}`);
    
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: `Analyze this recruitment lead and extract structured data:\n\n${sampleB2BLead.rawText}\n\nReturn a JSON object with this exact schema:\n{\n  "companyName": "string",\n  "adminEmail": "string or null",\n  "inChargeRole": "string or null",\n  "riskAssessment": "LOW | MEDIUM | CRITICAL",\n  "b2bHumanProposal": "A deeply professional, human-sounding B2B pitch offering Kaseddie Labs LTD compliance verification systems directly to this company's leadership team",\n  "complianceViolationDetected": "boolean"\n}`,
      config: { 
        systemInstruction: systemProtocol,
        temperature: 0.1,
        responseMimeType: "application/json"
      }
    });
    
    const rawResponse = response.text;
    aiAnalysisResult = JSON.parse(rawResponse);
    
    console.log("\n🟩🟣 --- SENTINEL STRUCTURED AUDIT RESULTS ---");
    console.log(JSON.stringify(aiAnalysisResult, null, 2));
    console.log("─".repeat(70) + "\n");
    
  } catch (aiError) {
    console.error("❌ AI Engine Failure:", aiError.message);
    console.log("⚠️  Proceeding with worker tracking phase...\n");
  }

  // ═══════════════════════════════════════════════════════════════════════════════
  // PHASE 2: AUTONOMOUS WORKER PULSE-CHECK SIMULATION
  // ═══════════════════════════════════════════════════════════════════════════════
  console.log("🔴 PHASE 2: TRANS-NATIONAL WORKER TRACKING");
  console.log("─".repeat(70));
  
  const pulseCheckResult = simulateWorkerPulseCheck(sampleWorkerTransit);
  console.log("─".repeat(70) + "\n");

  // ═══════════════════════════════════════════════════════════════════════════════
  // PHASE 3: PERSIST TO SENTINEL-MEMORY-VAULT
  // ═══════════════════════════════════════════════════════════════════════════════
  console.log("💾 PHASE 3: SECURE VAULT PERSISTENCE");
  console.log("─".repeat(70));
  
  const mongoClient = new MongoClient(MONGO_URI, { serverSelectionTimeoutMS: 5000 });
  
  try {
    console.log("� Attempting direct port connection to MongoDB Atlas Vault...");
    await mongoClient.connect();
    console.log("✅ Connected to Sentinel-Memory-Vault");
    
    const db = mongoClient.db("oversight_sentinel_db");
    const auditLedger = db.collection("audit_ledger");
    const workerTracking = db.collection("worker_pulse_checks");
    
    // Persist B2B Audit Result
    if (aiAnalysisResult) {
      const b2bPayload = {
        ...sampleB2BLead,
        structuredAnalysis: aiAnalysisResult,
        auditTimestamp: new Date(),
        protocolVersion: "2.0.0"
      };
      
      const b2bResult = await auditLedger.insertOne(b2bPayload);
      console.log(`✅ B2B Audit written to Atlas | ID: ${b2bResult.insertedId}`);
    }
    
    // Persist Worker Pulse-Check Result
    const workerPayload = {
      ...sampleWorkerTransit,
      pulseCheckResult: pulseCheckResult,
      checkTimestamp: new Date(),
      protocolVersion: "2.0.0"
    };
    
    const workerResult = await workerTracking.insertOne(workerPayload);
    console.log(`✅ Worker pulse-check written to Atlas | ID: ${workerResult.insertedId}`);
    
  } catch (mongoError) {
    console.log("⚠️  MongoDB Vault connection timed out or failed.");
    console.log("💡 Troubleshooting: Check ISP port 27017 access or Atlas IP whitelist.");
    console.log("🔒 Core audit completed successfully regardless of database status.");
  } finally {
    await mongoClient.close();
    console.log("🔒 MongoDB connection closed securely.");
  }

  // ═══════════════════════════════════════════════════════════════════════════════
  // EXECUTION SUMMARY
  // ═══════════════════════════════════════════════════════════════════════════════
  console.log("\n" + "═".repeat(70));
  console.log("╔══════════════════════════════════════════════════════════════════╗");
  console.log("║              SENTINEL EXECUTION COMPLETE                           ║");
  console.log("╚══════════════════════════════════════════════════════════════════╝");
  console.log("═".repeat(70) + "\n");
}

// ═══════════════════════════════════════════════════════════════════════════════
// EXECUTE SENTINEL
// ═══════════════════════════════════════════════════════════════════════════════
executeOversightSentinel().catch(console.error);