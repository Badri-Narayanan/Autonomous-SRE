import json
import uuid
import random
import requests
from datetime import datetime
from flask import Flask, request, jsonify
from dotenv import load_dotenv
from google import genai
import os
from flask_cors import CORS
import threading

load_dotenv()
app = Flask(__name__)
CORS(app, origins=["http://localhost:3000", "http://127.0.0.1:3000"])  # app exists now
client = genai.Client(api_key=os.getenv("GEMINI_API_KEY"))

incidents = {}

SCENARIOS = [
    {
        "error_log": "NullPointerException at line 42",
        "file": "src/services/UserService.java",
        "lineNumber": 42,
        "codebase_context": """
        File: UserService.java, Line 42
        String username = user.getName();
        int length = username.length(); // potential null here
        """
    },
    {
        "error_log": "TypeError: Cannot read properties of null (reading 'token')",
        "file": "src/auth/AuthMiddleware.py",
        "lineNumber": 87,
        "codebase_context": """
        File: AuthMiddleware.py, Line 87
        token = request.headers.get('Authorization').split(' ')[1]
        # headers might not contain Authorization
        """
    },
    {
        "error_log": "IndexError: list index out of range",
        "file": "src/pipeline/DataProcessor.py",
        "lineNumber": 113,
        "codebase_context": """
        File: DataProcessor.py, Line 113
        first_item = data_list[0]
        # data_list might be empty
        """
    },
    {
        "error_log": "ConnectionTimeoutError: Database connection timed out after 30s",
        "file": "src/db/DatabasePool.py",
        "lineNumber": 56,
        "codebase_context": """
        File: DatabasePool.py, Line 56
        conn = db.connect(timeout=30)
        # no retry logic implemented
        """
    }
]

# In agent_service/app.py
# Add this import at the top with the other imports:


# Replace the entire analyze_error() function with this:
@app.route("/analyze-error", methods=["POST"])
def analyze_error():
    data = request.json

    scenario = random.choice(SCENARIOS)
    error_log = data.get("error_log", scenario["error_log"])
    file_path = data.get("file", scenario["file"])
    line_number = data.get("lineNumber", scenario["lineNumber"])
    codebase_context = scenario["codebase_context"]

    incident_id = f"ERR-{str(uuid.uuid4())[:8].upper()}"
    timestamp = datetime.now().strftime("%H:%M:%S")

    # Store immediately with "investigating" so dashboard shows it right away
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

    # Return immediately — dashboard will poll and see "investigating"
    # Process Gemini + Bland AI in background
    def process_async():
        prompt = f"""
        You are an expert software engineer.
        Given this error: {error_log}
        And this codebase context: {codebase_context}
        Return ONLY a raw JSON object (no markdown, no backticks) with:
        - "summary": one sentence bug explanation
        - "diff": a git-style diff string showing the fix
        """

        try:
            response = client.models.generate_content(
                model="gemini-2.5-flash-lite",
                contents=prompt
            )

            raw = response.text.strip().removeprefix("```json").removeprefix("```").removesuffix("```").strip()
            result = json.loads(raw)

            incidents[incident_id]["summary"] = result.get("summary")
            incidents[incident_id]["diff"] = result.get("diff")
            incidents[incident_id]["status"] = "action required"

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
            print("Bland AI response:", bland_resp.status_code, bland_resp.text)
            incidents[incident_id]["callStatus"] = "ringing"

        except json.JSONDecodeError:
            incidents[incident_id]["status"] = "error"
        except Exception as e:
            print(f"Background processing error: {e}")
            incidents[incident_id]["status"] = "error"

    thread = threading.Thread(target=process_async, daemon=True)
    thread.start()

    # Return the "investigating" state immediately to Person 2's poller
    return jsonify(incidents[incident_id])

@app.route("/incidents", methods=["GET"])
def get_incidents():
    return jsonify({"incidents": list(incidents.values())})

@app.route("/bland-webhook", methods=["POST"])
def bland_webhook():
    data = request.json
    print("Bland AI webhook received:", data)
    return jsonify({"status": "ok"})

if __name__ == "__main__":
    app.run(port=5000, debug=True)