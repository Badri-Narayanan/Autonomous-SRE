from flask import Flask, request, jsonify
from dotenv import load_dotenv
from google import genai
import requests
import os

load_dotenv()

app = Flask(__name__)
client = genai.Client(api_key=os.getenv("GEMINI_API_KEY"))

NGROK_URL = "https://wealthy-ovational-selene.ngrok-free.dev"
pending_requests = {}  # temp in-memory store

@app.route("/analyze-error", methods=["POST"])
def analyze_error():
    data = request.json
    error_log = data.get("error_log")

    # Mock Macroscope context for demo
    codebase_context = """
    File: UserService.java, Line 42
    String username = user.getName();
    int length = username.length(); // potential null here
    """

    prompt = f"""
    You are an expert software engineer.
    Given this error: {error_log}
    And this codebase context: {codebase_context}
    Return ONLY a JSON object with:
    - "summary": one sentence bug explanation
    - "diff": a suggested code fix
    """

    response = client.models.generate_content(
        model="gemini-2.5-flash-lite",
        contents=prompt
    )

    return jsonify({"result": response.text})
    
@app.route("/macroscope-webhook", methods=["GET", "POST"])
def macroscope_webhook():
    print("Headers:", dict(request.headers))
    print("Body:", request.data)
    if request.method == "GET":
        return jsonify({"status": "ok"}), 200
    
    data = request.json
    print("Macroscope response:", data)

    codebase_context = data.get("response", "No context found")
    workflow_id = data.get("workflowId", "")
    error_log = pending_requests.get(workflow_id, {}).get("error_log", "unknown error")

    prompt = f"""
    You are an expert software engineer.
    Given this error: {error_log}
    And this codebase context: {codebase_context}
    Return ONLY a JSON object with:
    - "summary": one sentence bug explanation
    - "diff": a suggested code fix
    """

    response = client.models.generate_content(
        model="gemini-2.5-flash-lite",
        contents=prompt
    )

    print("Gemini result:", response.text)
    return jsonify({"status": "ok"})

@app.route("/bland-webhook", methods=["POST"])
def bland_webhook():
    data = request.json
    print("Bland AI webhook received:", data)
    return jsonify({"status": "ok"})

if __name__ == "__main__":
    app.run(port=5000, debug=True)