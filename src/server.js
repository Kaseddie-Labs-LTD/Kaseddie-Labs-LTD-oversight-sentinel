import express from "express";
import { MongoClient } from "mongodb";
import { GoogleGenAI } from "@google/genai";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

// ESM-compatible __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// MongoDB connection string from environment variable
const MONGO_URI = process.env.MDB_URI;

// Initialize GoogleGenAI with API key from environment
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

// Load system protocol from sentinel_logic.md
function loadSystemProtocol() {
  const defaultProtocol = "You are the Oversight Sentinel, an advanced compliance auditing engine for Kaseddie Labs LTD.";
  if (fs.existsSync("./src/sentinel_logic.md")) {
    const savedProtocol = fs.readFileSync("./src/sentinel_logic.md", "utf8");
    if (savedProtocol.trim().length > 0) return savedProtocol;
  }
  return defaultProtocol;
}

const app = express();
const PORT = 3000;

// Middleware to parse JSON bodies
app.use(express.json());

// Serve static frontend files from src/public
app.use(express.static(join(__dirname, "public")));

// Secure simulation dataset for fallback
const SIMULATION_DATA = {
  totalAudits: 127,
  flaggedViolations: 43,
  complianceRate: 66.1,
  activeWorkers: 89,
  criticalAlerts: 7,
  recentActivity: [
    {
      id: "SIM-001",
      company: "Vanguard Global Horizon Group",
      riskLevel: "CRITICAL",
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
      status: "FLAGGED_VIOLATION"
    },
    {
      id: "SIM-002",
      company: "Dubai Marina Security Services",
      riskLevel: "MEDIUM",
      timestamp: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
      status: "INVESTIGATE"
    },
    {
      id: "SIM-003",
      company: "Kampala Labor Solutions",
      riskLevel: "LOW",
      timestamp: new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString(),
      status: "VERIFIED_COMPLIANT"
    }
  ],
  riskDistribution: {
    LOW: 84,
    MEDIUM: 31,
    CRITICAL: 12
  },
  corridorActivity: {
    "Uganda-Dubai": 67,
    "Uganda-Qatar": 34,
    "Uganda-Saudi": 26
  }
};

// API Endpoint: GET /api/dashboard-stats
app.get("/api/dashboard-stats", async (req, res) => {
  const mongoClient = new MongoClient(MONGO_URI, { serverSelectionTimeoutMS: 5000 });
  
  try {
    console.log("📡 Fetching dashboard stats from MongoDB Atlas...");
    await mongoClient.connect();
    
    const db = mongoClient.db("oversight_sentinel_db");
    const auditLedger = db.collection("audit_ledger");
    const workerPulseChecks = db.collection("worker_pulse_checks");
    
    // Fetch real audit data
    const auditPipeline = [
      {
        $group: {
          _id: null,
          totalAudits: { $sum: 1 },
          flaggedViolations: {
            $sum: {
              $cond: [
                { $eq: ["$structuredAnalysis.complianceViolationDetected", true] },
                1,
                0
              ]
            }
          },
          recentActivity: {
            $push: {
              id: "$_id",
              companyName: { $ifNull: ["$structuredAnalysis.companyName", "Unknown"] },
              riskLevel: { $ifNull: ["$structuredAnalysis.riskAssessment", "UNKNOWN"] },
              adminEmail: { $ifNull: ["$structuredAnalysis.adminEmail", null] },
              inChargeRole: { $ifNull: ["$structuredAnalysis.inChargeRole", null] },
              b2bHumanProposal: { $ifNull: ["$structuredAnalysis.b2bHumanProposal", null] },
              complianceViolationDetected: { $ifNull: ["$structuredAnalysis.complianceViolationDetected", false] },
              timestamp: "$auditTimestamp",
              status: { $cond: [{ $eq: ["$structuredAnalysis.complianceViolationDetected", true] }, "FLAGGED_VIOLATION", "VERIFIED_COMPLIANT"] }
            }
          }
        }
      },
      {
        $project: {
          _id: 0,
          totalAudits: 1,
          flaggedViolations: 1,
          complianceRate: {
            $multiply: [
              {
                $divide: [
                  { $subtract: ["$totalAudits", "$flaggedViolations"] },
                  "$totalAudits"
                ]
              },
              100
            ]
          },
          recentActivity: {
            $slice: ["$recentActivity", 10]
          }
        }
      }
    ];
    
    const auditResult = await auditLedger.aggregate(auditPipeline).toArray();
    
    // Fetch real worker pulse check data
    let workerData = [];
    try {
      workerData = await workerPulseChecks.find({})
        .sort({ checkTimestamp: -1 })
        .limit(10)
        .toArray();
    } catch (workerError) {
      console.log("⚠️ Worker pulse checks collection not accessible");
    }
    
    if (auditResult.length > 0) {
      const stats = auditResult[0];
      
      // Calculate real metrics
      stats.activeWorkers = workerData.length || 0;
      stats.criticalAlerts = stats.recentActivity.filter(
        item => item.riskLevel === "CRITICAL"
      ).length;
      stats.riskDistribution = {
        LOW: stats.recentActivity.filter(item => item.riskLevel === "LOW").length,
        MEDIUM: stats.recentActivity.filter(item => item.riskLevel === "MEDIUM").length,
        CRITICAL: stats.recentActivity.filter(item => item.riskLevel === "CRITICAL").length
      };
      
      // Calculate corridor activity from real data
      const corridorCounts = {};
      stats.recentActivity.forEach(item => {
        // Extract corridor from company name or add default
        const corridor = item.companyName?.toLowerCase().includes('dubai') ? "Uganda-Dubai" :
                        item.companyName?.toLowerCase().includes('qatar') ? "Uganda-Qatar" :
                        item.companyName?.toLowerCase().includes('saudi') ? "Uganda-Saudi" : "Uganda-Dubai";
        corridorCounts[corridor] = (corridorCounts[corridor] || 0) + 1;
      });
      stats.corridorActivity = corridorCounts;
      
      // Add worker pulse check data
      stats.workerPulseChecks = workerData.map(worker => ({
        id: worker._id,
        workerName: worker.workerName || "Unknown Worker",
        workerId: worker.workerId || "Unknown ID",
        destination: worker.destination || "Unknown",
        pulseStatus: worker.pulseStatus || "UNKNOWN",
        lastContact: worker.checkTimestamp,
        redFlags: worker.redFlags || []
      }));
      
      console.log("✅ Dashboard stats fetched successfully from MongoDB");
      res.json(stats);
    } else {
      console.log("⚠️ No data found in MongoDB, using simulation dataset");
      res.json(SIMULATION_DATA);
    }
    
  } catch (mongoError) {
    console.log("⚠️ MongoDB connection failed, serving simulation dataset");
    console.log("💡 Error:", mongoError.message);
    res.json(SIMULATION_DATA);
  } finally {
    await mongoClient.close();
  }
});

// API Endpoint: POST /api/audit
app.post("/api/audit", async (req, res) => {
  const { text } = req.body;
  
  if (!text || !text.trim()) {
    return res.status(400).json({ error: "No audit text provided" });
  }

  const mongoClient = new MongoClient(MONGO_URI, { serverSelectionTimeoutMS: 5000 });
  
  try {
    console.log("🧠 Processing audit request via Gemini 2.5 Flash AI...");
    
    // Load system protocol
    const systemProtocol = loadSystemProtocol();
    
    // Use Gemini 2.5 Flash for real AI analysis
    const model = ai.models.generativeModel({ model: "gemini-2.5-flash" });
    
    const prompt = `${systemProtocol}

Analyze the following recruitment lead and return a JSON object with this exact schema:
{
  "companyName": "string",
  "adminEmail": "string or null",
  "inChargeRole": "string or null",
  "riskAssessment": "LOW | MEDIUM | CRITICAL",
  "b2bHumanProposal": "string",
  "complianceViolationDetected": "boolean"
}

Recruitment Lead to Analyze:
${text}`;

    const result = await model.generateContent({
      contents: [{ role: "user", parts: [{ text: prompt }] }],
      generationConfig: {
        responseMimeType: "application/json",
        temperature: 0.7,
        maxOutputTokens: 2048
      }
    });

    const aiResponseText = result.response.text();
    let aiAnalysis;
    
    try {
      aiAnalysis = JSON.parse(aiResponseText);
    } catch (parseError) {
      console.error("❌ Failed to parse AI response as JSON:", parseError.message);
      throw new Error("AI response parsing failed");
    }

    const auditResult = {
      id: `AUD-${Date.now().toString().slice(-4)}`,
      companyName: aiAnalysis.companyName || "Unknown Company",
      riskLevel: aiAnalysis.riskAssessment || "UNKNOWN",
      status: aiAnalysis.complianceViolationDetected ? "FLAGGED_VIOLATION" : "VERIFIED_COMPLIANT",
      timestamp: new Date().toISOString(),
      complianceViolationDetected: aiAnalysis.complianceViolationDetected || false,
      structuredAnalysis: {
        adminEmail: aiAnalysis.adminEmail || null,
        inChargeRole: aiAnalysis.inChargeRole || null,
        b2bHumanProposal: aiAnalysis.b2bHumanProposal || null,
        riskAssessment: aiAnalysis.riskAssessment || "UNKNOWN"
      }
    };

    // Try to persist to MongoDB
    try {
      await mongoClient.connect();
      const db = mongoClient.db("oversight_sentinel_db");
      const collection = db.collection("audit_ledger");
      
      const payload = {
        rawText: text,
        structuredAnalysis: auditResult,
        auditTimestamp: new Date(),
        protocolVersion: "2.0.0",
        source: "WEB_DASHBOARD"
      };
      
      await collection.insertOne(payload);
      console.log("✅ Audit result persisted to MongoDB");
    } catch (mongoError) {
      console.log("⚠️ MongoDB persistence failed, returning audit result anyway");
    }

    res.json(auditResult);
    
  } catch (error) {
    console.error("❌ Audit processing failed:", error.message);
    res.status(500).json({ error: "Audit processing failed: " + error.message });
  } finally {
    await mongoClient.close();
  }
});

// Start server
app.listen(PORT, () => {
  console.log("\n" + "═".repeat(70));
  console.log("╔══════════════════════════════════════════════════════════════════╗");
  console.log("║         OVERSIGHT SENTINEL DASHBOARD SERVER ACTIVE             ║");
  console.log("╚══════════════════════════════════════════════════════════════════╝");
  console.log("═".repeat(70));
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log(`📁 Serving static files from: ${join(__dirname, "public")}`);
  console.log(`📊 API Endpoint: http://localhost:${PORT}/api/dashboard-stats`);
  console.log("═".repeat(70) + "\n");
});
