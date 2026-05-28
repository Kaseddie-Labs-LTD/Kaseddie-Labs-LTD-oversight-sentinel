import os
from flask import Flask, request, jsonify, send_from_directory
from pymongo import MongoClient
from qdrant_client import QdrantClient
from qdrant_client.http import models
import google.generativeai as genai

app = Flask(__name__, static_folder='dist')

# 1. INITIALIZE CLOUD INFRASTRUCTURE CONNECTIONS
# MongoDB Atlas Remote Connection
mongo_client = MongoClient(os.environ.get("MONGO_URI"))
db = mongo_client["oversight_sentinel_db"]
compliance_collection = db["compliance_logs"]

# Qdrant Vector Cloud Connection
qdrant_client = QdrantClient(
    url=os.environ.get("QDRANT_URL"),
    api_key=os.environ.get("QDRANT_API_KEY")
)

# Google Cloud Vertex AI / Gemini Integration
genai.configure(api_key=os.environ.get("VERTEX_API_KEY"))
ai_model = genai.GenerativeModel('gemini-1.5-flash')

# 2. END-TO-END PIPELINE ROUTE
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

        # STAGE A: Google Cloud Vertex AI (Gemini Insight Generation)
        prompt = f"Analyze the following operational corridor log for compliance concerns, risks, and human impact factors. Provide a brief summary: {description}"
        ai_response = ai_model.generate_content(prompt)
        compliance_summary = ai_response.text

        # STAGE B: MongoDB Atlas (Permanent Document Long-Term State Logging)
        log_document = {
            "title": title,
            "description": description,
            "corridor": corridor,
            "ai_analysis": {
                "summary": compliance_summary,
                "engine": "gemini-1.5-flash"
            },
            "metadata": metadata
        }
        inserted_doc = compliance_collection.insert_one(log_document)
        mongo_id = str(inserted_doc.inserted_id)

        # STAGE C: Qdrant Vector Cloud Synchronization
        simulated_embedding = [0.1] * 128
        qdrant_client.upsert(
            collection_name="oversight_vectors",
            points=[
                models.PointStruct(
                    id=hash(mongo_id) % 10000000,
                    vector=simulated_embedding,
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

# 3. SERVE COMPILED REACT FRONTEND FROM WEBPACK
@app.route('/', defaults={'path': ''})
@app.route('/<path:path>')
def serve_frontend(path):
    if path != "" and os.path.exists(os.path.join(app.static_folder, path)):
        return send_from_directory(app.static_folder, path)
    else:
        return send_from_directory(app.static_folder, 'index.html')

if __name__ == '__main__':
    port = int(os.environ.get("PORT", 4000))
    app.run(host='0.0.0.0', port=port)
