import json
import re
import uuid
from datetime import datetime
from flask import Flask, request, jsonify
from dotenv import load_dotenv
from google import genai
import os
import requests

load_dotenv()

app = Flask(__name__)
client = genai.Client(api_key=os.getenv("GEMINI_API_KEY"))

incidents = {}  # store incidents in memory

@app.route("/analyze-error", methods=["POST"])
def analyze_error():
    data = request.json
    error_log = data.get("error_log")
    file_path = data.get("file", "unknown/file.py")
    line_number = data.get("lineNumber", 0)

    incident_id = f"ERR-{str(uuid.uuid4())[:3].upper()}"
    timestamp = datetime.now().strftime("%H:%M:%S")

    # Store initial incident as "investigating"
    incidents[incident_id] = {
        "id": incident_id,
        "status": "investigating",
        "file": file_path,
        "message": error_log,
        "timestamp": timestamp,
        "summary": None,
        "tavilyResults": [],
        "diff": None,
        "fileName": file_path.split("/")[-1],
        "lineNumber": line_number,
        "callStatus": "idle"
    }

    # Mock Macroscope context
    codebase_context = f"""
    File: {file_path}, Line {line_number}
    String username = user.getName();
    int length = username.length(); // potential null here
    """

    prompt = f"""
    You are an expert software engineer.
    Given this error: {error_log}
    And this codebase context: {codebase_context}
    Return ONLY a raw JSON object (no markdown, no backticks) with:
    - "summary": one sentence bug explanation
    - "diff": a git-style diff string showing the fix
    """

    response = client.models.generate_content(
        model="gemini-2.5-flash-lite",
        contents=prompt
    )

    # Clean markdown backticks if present
    raw = response.text.strip().removeprefix("```json").removeprefix("```").removesuffix("```").strip()
    result = json.loads(raw)

    # Update incident with Gemini results
    incidents[incident_id]["summary"] = result.get("summary")
    incidents[incident_id]["diff"] = result.get("diff")
    incidents[incident_id]["status"] = "action required"

    # After updating incidents with Gemini results, trigger Bland AI
    bland_resp = requests.post(
        "https://api.bland.ai/v1/calls",
        headers={
            "authorization": os.getenv("BLAND_AI_API_KEY"),
            "Content-Type": "application/json"
        },
        json={
            "phone_number": os.getenv("BLAND_AI_PHONE"),
            "task": f"You are an automated SRE assistant. Notify the engineer that a {error_log} error was detected in {file_path} at line {line_number}. Gemini AI has analyzed it and says: {result.get('summary')}. Ask them to log into the dashboard to review and approve the fix.",
            "voice": "june",
            "wait_for_greeting": True
        }
    )

    incidents[incident_id]["callStatus"] = "ringing"
    return jsonify(incidents[incident_id])

@app.route("/incidents", methods=["GET"])
def get_incidents():
    return jsonify({"incidents": list(incidents.values())})

@app.route("/bland-webhook", methods=["POST"])
def bland_webhook():
    data = request.json
    # Update callStatus for relevant incident if needed
    return jsonify({"status": "ok"})

if __name__ == "__main__":
    app.run(port=5000, debug=True)