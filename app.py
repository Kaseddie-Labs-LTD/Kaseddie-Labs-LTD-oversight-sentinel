import os
import time
from datetime import datetime, timedelta
from flask import Flask, request, jsonify, send_from_directory
from pymongo import MongoClient
from qdrant_client import QdrantClient
from qdrant_client.http import models
import google.generativeai as genai

app = Flask(__name__, static_folder='dist')

# ===========================================================================
# 1. CLOUD STORAGE & COGNITIVE LOGIC INITIALIZATION
# ===========================================================================
MONGO_URI = os.environ.get("MONGO_URI") or os.environ.get("MDB_URI")
mongo_client = MongoClient(MONGO_URI)
db = mongo_client["oversight_sentinel_db"]

qdrant_client = QdrantClient(
    url=os.environ.get("QDRANT_URL"),
    api_key=os.environ.get("QDRANT_API_KEY")
)

genai.configure(api_key=os.environ.get("VERTEX_API_KEY") or os.environ.get("GEMINI_API_KEY"))
ai_model = genai.GenerativeModel('gemini-3.1-flash-lite')

# SYSTEM LAW PROTOCOL DEFINITION
SYSTEM_PROTOCOL = (
    "You are the Oversight Sentinel, an autonomous compliance auditing and B2B engagement engine. "
    "Your mission is to enforce a Zero-Fee Guarantee across transit corridors and protect vulnerable workers "
    "by flag-checking corporate recruitment data for upfront processing charges, passport retention, or pay-to-play language."
)

# ===========================================================================
# 2. THE CORE INGESTION PIPELINE GATEWAY
# ===========================================================================
@app.route('/api/compliance/submit', methods=['POST'])
def submit_compliance_pipeline():
    try:
        data = request.json
        title = data.get('title')
        description = data.get('description')
        corridor = data.get('corridor', 'Kampala')
        metadata = data.get('metadata', {})

        if not title or not description:
            return jsonify({"status": "error", "message": "Missing required operational parameters"}), 400

        # PHASE 1: COMPLIANCE AUDIT WITH GEN-AI EXTRACTION
        prompt = (
            f"{SYSTEM_PROTOCOL}\n\n"
            f"Analyze this operational corridor log and extract structured insights:\n"
            f"Context: {description}\n\n"
            f"Respond with a clear, concise executive summary, explicitly noting if any compliance violations "
            f"or illegal placement fees are present in this corridor data."
        )
        ai_response = ai_model.generate_content(prompt)
        compliance_summary = ai_response.text

        # PHASE 2: PERMANENT STATE VAULT LOGGING (MongoDB Atlas)
        log_document = {
            "title": title,
            "description": description,
            "corridor": corridor,
            "ai_analysis": {
                "summary": compliance_summary,
                "engine": "gemini-3.1-flash-lite"
            },
            "metadata": metadata,
            "auditTimestamp": datetime.utcnow()
        }
        inserted_doc = db["audit_ledger"].insert_one(log_document)
        mongo_id = str(inserted_doc.inserted_id)

        # PHASE 3: VECTOR STREAM SYNCHRONIZATION (Qdrant Cloud Clusters)
        simulated_vector = [0.05] * 128  # Matches standard cluster configurations
        qdrant_client.upsert(
            collection_name="oversight_vectors",
            points=[
                models.PointStruct(
                    id=int(time.time()) % 10000000,
                    vector=simulated_vector,
                    payload={
                        "mongo_id": mongo_id,
                        "title": title,
                        "corridor": corridor,
                        "summary": compliance_summary
                    }
                )
            ]
        )

        return jsonify({
            "status": "success",
            "logId": mongo_id,
            "analysis": {"summary": compliance_summary}
        }), 200

    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 500

# ===========================================================================
# 3. AUTONOMOUS TRANS-NATIONAL WORKER PULSE-CHECK ENGINE
# ===========================================================================
@app.route('/api/workers/pulse-check', methods=['POST'])
def trigger_worker_pulse_checks():
    try:
        # Pull latest worker tracking logs from Atlas
        workers = list(db["worker_pulse_checks"].find().limit(10))
        results = []

        # If database collection is fresh, use your sample worker dataset parameters
        if not workers:
            workers = [{
                "workerId": "UG-2024-7842",
                "workerName": "Nakimuli Sarah",
                "sourceNode": "Kampala, Uganda",
                "destinationNode": "Dubai Marina, UAE",
                "lastPulseCheck": datetime.utcnow() - timedelta(days=25),
                "distressSignals": 0
            }]

        for worker in workers:
            last_check = worker.get("lastPulseCheck")
            if isinstance(last_check, str):
                last_check = datetime.fromisoformat(last_check.replace("Z", ""))
            days_since_check = (datetime.utcnow() - last_check).days
            status = "NORMAL"
            alert = None
            # Enforce the strict 21-day safety threshold rule
            if days_since_check > 21:
                status = "CRITICAL"
                alert = "⚠️ RED-FLAG ALERT: Worker silence exceeds 21-day threshold!"
            elif worker.get("distressSignals", 0) > 0:
                status = "CRITICAL"
                alert = "🚨 IMMEDIATE ACTION REQUIRED: Distress signals detected in profile."
            analysis_node = {
                "workerId": worker.get("workerId"),
                "workerName": worker.get("workerName"),
                "daysSinceLastCheck": days_since_check,
                "status": status,
                "alert": alert
            }
            results.append(analysis_node)

        return jsonify({"status": "success", "pulse_checks": results}), 200

    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 500

# ===========================================================================
# 4. STATIC ASSET ROUTING FOR RENDER WEB CONTAINER
# ===========================================================================
@app.route('/', defaults={'path': ''})
@app.route('/<path:path>')
def serve_frontend(path):
    if path != "" and os.path.exists(os.path.join(app.static_folder, path)):
        return send_from_directory(app.static_folder, path)
    else:
        # Serve the core HTML file from the public folder (fallback when no static asset matches)
        return send_from_directory('public', 'index.html')

if __name__ == '__main__':
    port = int(os.environ.get("PORT", 4000))
    app.run(host='0.0.0.0', port=port)
