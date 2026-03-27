import time
import requests
import sys
import os
sys.path.insert(0, os.path.dirname(__file__))

from utils.aerospike_helper import get_new_errors_and_lock, update_status
from utils.overmind_tracer import log_trace

AI_SERVICE_URL = "http://127.0.0.1:5000/analyze-error"
POLL_INTERVAL_SECONDS = 3

def polling_loop():
    print("\n" + "═" * 60)
    print("  🟢  Auto-SRE Nervous System — ONLINE")
    print("  📡  Polling Aerospike every 3 seconds for new incidents...")
    print("═" * 60 + "\n")

    while True:
        errors = get_new_errors_and_lock()

        if not errors:
            print(".", end="", flush=True)  # Quiet dot so you know it's alive
        else:
            for key, record in errors:
                print()  # Newline after the dots

                log_trace(
                    "Incident Detected",
                    f"ID={record['id']} | File={record['file']} | Status: new → investigating",
                    level="warning"
                )

                payload = {
                    "error_log":  record.get('error_log'),
                    "file":       record.get('file'),
                    "lineNumber": record.get('lineNumber', 0),
                }

                log_trace(
                    "AI Engine Accepted",
                    f"Incident {record['id']} queued | Status: {record.get('status')} | Gemini processing async...",
                    level="success"
                )

                try:
                    response = requests.post(AI_SERVICE_URL, json=payload, timeout=60)

                    if response.status_code == 200:
                        log_trace(
                            "AI Handoff Successful",
                            f"Agent accepted {record['id']} — Gemini is reasoning...",
                            level="success"
                        )
                        update_status(key, "ai_processing")
                    else:
                        log_trace(
                            "AI Handoff Failed",
                            f"HTTP {response.status_code} — check Person 1's Flask server",
                            level="error"
                        )
                        update_status(key, "error")

                except requests.exceptions.ConnectionError:
                    log_trace(
                        "AI Service Unreachable",
                        "Person 1's server on :5000 is not running. Start it first.",
                        level="error"
                    )
                except requests.exceptions.Timeout:
                    log_trace(
                        "AI Request Timed Out",
                        f"Gemini took >30s for {record['id']} — may still be processing",
                        level="warning"
                    )

        time.sleep(POLL_INTERVAL_SECONDS)

if __name__ == "__main__":
    polling_loop()