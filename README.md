# Autonomous Incident Manager

> An autonomous, self-healing site reliability agent that detects production errors, investigates root causes using Gemini AI, generates code patches, and calls your on-call engineer via Bland AI — all within seconds of an incident occurring.

---

## What It Does

When a production error hits, engineers are paged, context is gathered, a fix is written, reviewed, and deployed. That entire process takes minutes to hours. Auto-SRE compresses it to under 30 seconds — fully autonomously.

The moment an error record lands in Aerospike:

1. **Aerospike** stores the incident and the infra poller picks it up within 3 seconds
2. **Overmind** traces the decision-making in real time on the terminal
3. **Gemini AI** reads the codebase context, identifies the root cause, and writes a git-style patch
4. **Bland AI** calls the on-call engineer's phone and reads out a summary of the incident
5. **The dashboard** shows the incident card, Gemini's analysis, the diff, and an Approve & Deploy button — all updating live

The engineer reviews the AI-generated fix on the dashboard and clicks one button to deploy. The system goes back to nominal.

---

## Architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│                          Auto-SRE System                            │
│                                                                     │
│  scripts/                  infra_service/          agent_service/   │
│  generate_error.py  ──►   app.py (poller)   ──►   app.py           │
│       │                        │                   │               │
│       ▼                        │                   ├── Gemini AI   │
│  Aerospike (Docker)  ◄─────────┘                   ├── Bland AI    │
│  port 3000                                         └── /incidents  │
│                                                          │         │
│                                                          ▼         │
│                                                    dashboard/       │
│                                                    React + Auth0    │
│                                                    port 3000        │
└─────────────────────────────────────────────────────────────────────┘
```

### Services and Ports

| Service | Port | Technology | Responsibility |
|---|---|---|---|
| Aerospike | 3000 | Docker | High-velocity incident state store |
| Agent Service | 5000 | Python + Flask | Gemini reasoning engine + Bland AI voice calls |
| Infra Service | 5001 | Python + Flask | Aerospike poller + Overmind tracer |
| Dashboard | 3000 (browser) | React + Vite | Incident command UI with Auth0 |

---

## Repository Structure

```
Autonomous-SRE/
├── agent_service/                  # Person 1 — AI reasoning engine
│   ├── app.py                      # Flask API: /analyze-error, /incidents, /bland-webhook
│   └── requirements.txt
│
├── infra_service/                  # Person 2 — Data pipeline and observability
│   ├── app.py                      # Polling loop — watches Aerospike, routes to agent
│   └── utils/
│       ├── aerospike_helper.py     # Aerospike read/write/lock logic
│       └── overmind_tracer.py      # Color-coded terminal trace output
│
├── dashboard/                      # Person 3 — Incident command UI
│   ├── src/
│   │   ├── App.jsx                 # Main component, polling logic, state management
│   │   ├── main.jsx                # Entry point with Auth0 provider
│   │   ├── index.css               # Global styles and animations
│   │   ├── components/
│   │   │   ├── DiffViewer.jsx      # Git-style syntax-highlighted diff renderer
│   │   │   ├── IncidentCard.jsx    # Sidebar incident card with status colors
│   │   │   ├── Navbar.jsx          # System heartbeat header
│   │   │   ├── TypewriterText.jsx  # Animated typewriter for Gemini summaries
│   │   │   ├── VoiceCallToast.jsx  # Bland AI call notification overlay
│   │   │   └── VoiceStatus.jsx     # Voice call state indicator
│   │   └── hooks/
│   │       └── useIncidents.js
│   ├── test-server.js              # Standalone mock backend for UI testing
│   ├── package.json
│   ├── vite.config.js
│   ├── tailwind.config.js
│   └── postcss.config.js
│
├── scripts/
│   └── generate_error.py           # Demo trigger — injects a mock error into Aerospike
│
├── docker-compose.yml              # Aerospike container definition
├── requirements.txt                # Root-level Python dependencies
└── .env.example                    # Environment variable template
```

---

## Prerequisites

Make sure you have all of these installed before starting:

- **Python 3.8+** and pip
- **Node.js v18+** and npm
- **Docker Desktop** (running)
- **ngrok** (for Bland AI webhooks) — `brew install ngrok` or download from ngrok.com
- API keys for: **Gemini**, **Bland AI**
- A free **Auth0** account

---

## Setup

### Step 1 — Clone the repo

```bash
git clone https://github.com/Badri-Narayanan/Autonomous-SRE.git
cd Autonomous-SRE
```

### Step 2 — Create your `.env` file

Copy the example and fill in every value:

```bash
cp .env.example .env
```

Open `.env` and fill in:

```env
# Gemini AI
GEMINI_API_KEY=your_gemini_api_key

# Bland AI — voice calls
BLAND_AI_API_KEY=your_bland_ai_key
BLAND_AI_PHONE=+1XXXXXXXXXX          # E.164 format, e.g. +14155552671

# ngrok — exposes your local Flask server so Bland AI can send webhooks back
NGROK_URL=https://your-url.ngrok-free.app

# Auth0 — used by the dashboard
AUTH0_DOMAIN=your-domain.us.auth0.com
AUTH0_CLIENT_ID=your_client_id

# Aerospike — leave these as-is for local Docker setup
AEROSPIKE_HOST=localhost
AEROSPIKE_PORT=3000
```

**How to get each key:**

- **GEMINI_API_KEY** — [aistudio.google.com](https://aistudio.google.com) → Get API Key
- **BLAND_AI_API_KEY** and **BLAND_AI_PHONE** — [app.bland.ai](https://app.bland.ai) → API Keys
- **NGROK_URL** — run `ngrok http 5000` in a terminal and copy the `https://` URL it gives you
- **AUTH0_DOMAIN / AUTH0_CLIENT_ID** — see Auth0 setup below

### Step 3 — Auth0 setup

1. Go to [manage.auth0.com](https://manage.auth0.com) and create a free account
2. Create a new Application → choose **Single Page Application**
3. Go to the Settings tab and copy your **Domain** and **Client ID** into `.env`
4. Scroll down to **Application URIs** and set all three fields to `http://localhost:3000`:
   - Allowed Callback URLs
   - Allowed Logout URLs
   - Allowed Web Origins
5. Click **Save Changes**

### Step 4 — Create the dashboard `.env`

The dashboard needs its own `.env` file inside the `dashboard/` folder:

```bash
cd dashboard
touch .env
```

Paste this into `dashboard/.env`:

```env
VITE_AUTH0_DOMAIN=your-domain.us.auth0.com
VITE_AUTH0_CLIENT_ID=your_client_id
VITE_AUTH0_REDIRECT_URI=http://localhost:3000
```

### Step 5 — Install Python dependencies

```bash
# From the repo root
pip install flask flask-cors google-genai requests python-dotenv aerospike

# Apple Silicon Mac only — if aerospike fails above:
pip install aerospike-macos
```

### Step 6 — Install dashboard dependencies

```bash
cd dashboard
npm install
cd ..
```

---

## Running the Application

You need **5 terminals** open simultaneously. Start them in this exact order.

### Terminal 1 — Aerospike database

```bash
# From repo root
docker-compose up -d

# Verify it started — wait for this line:
docker logs aerospike-sre | grep "service ready"
# Expected: "service ready: soon there will be cake"
```

### Terminal 2 — ngrok tunnel

```bash
ngrok http 5000
# Copy the https:// URL it shows and paste it into your root .env as NGROK_URL
```

### Terminal 3 — Agent service (AI engine)

```bash
cd agent_service
python app.py
# Running on http://127.0.0.1:5000
```

Verify it's alive:

```bash
curl http://localhost:5000/incidents
# Expected: {"incidents": []}
```

### Terminal 4 — Infra service (poller)

```bash
cd infra_service
python app.py
```

You should see:

```
════════════════════════════════════════════════════════════
  🟢  Auto-SRE Nervous System — ONLINE
  📡  Polling Aerospike every 3s for new incidents...
  🤖  AI Engine target: http://127.0.0.1:5000/analyze-error
════════════════════════════════════════════════════════════

..........
```

Dots mean the poller is alive and watching. No errors means everything is connected.

### Terminal 5 — Dashboard

```bash
cd dashboard
npm run dev
# Open http://localhost:3000 in your browser
```

Log in with your Auth0 credentials. You will see the dashboard in the **SYSTEM: NOMINAL** state with an empty incident feed.

---

## Running a Demo

With all 5 terminals running, open a **6th terminal** and fire the demo trigger:

```bash
cd scripts
python generate_error.py
```

### What happens next — second by second

| Time | What you see |
|---|---|
| 0s | Error injected into Aerospike |
| ~3s | Terminal 4 shows Overmind trace — incident detected and locked |
| ~3s | Dashboard sidebar: new incident card with yellow **Investigating** border and spinner |
| ~5–15s | Gemini analyzes the error in the background |
| ~15s | Dashboard flips to red **Action Required** — Gemini summary appears with typewriter animation, diff viewer renders the patch |
| ~15s | Bland AI calls your phone — the VoiceCallToast slides in from the bottom-right of the dashboard |
| ~20s | Your phone rings — Bland AI reads out the incident summary and asks you to approve |
| Any time | Click **APPROVE & DEPLOY** on the dashboard — button turns to **DEPLOYED** |

You can fire `generate_error.py` multiple times. Each run creates a new unique incident ID and picks a random error scenario from the built-in library.

---

## Dashboard Features

### System Heartbeat
The navbar shows **SYSTEM: NOMINAL** (green pulse) when no active incidents exist, and switches to **SYSTEM: BREACHED** (red alert) the moment any incident is in `investigating` or `action required` state.

### Incident Feed (left sidebar)
Polls `http://localhost:5000/incidents` every 2 seconds. Each card is color-coded by status:

- Green border — Monitoring
- Yellow border + spinner — Investigating (Gemini is working)
- Red border + glow — Action Required (fix ready, needs approval)
- Grey + desaturated — Resolved

### Analysis Pane
When an incident reaches "action required", the main panel shows:
- **Incident header** — error message, file path, line number, timestamp
- **Gemini Analysis** — root cause summary rendered with a typewriter animation
- **Search Context** — Tavily web search results shown as clickable tags

### Diff Viewer
Renders the AI-generated git-style patch with full syntax highlighting — green for additions, red for deletions, blue for diff headers. Uses JetBrains Mono for readability.

### Voice Call Overlay
Slides in from the bottom-right when Bland AI initiates a call. Shows ringing → connected state with an animated waveform while the call is active.

### Approve & Deploy Button
Inactive (grey) until the incident reaches "action required". Pulses green when ready. Clicking it marks that specific incident as deployed — state is tracked per incident so deploying one does not affect others.

---

## Testing Without the Full Stack

If you want to test just the dashboard UI without running Aerospike, the agent service, or the infra service, use the built-in test server:

```bash
cd dashboard
node test-server.js
```

This starts a mock backend on port 5000 that automatically plays out a scripted 42-second incident lifecycle with 3 overlapping incidents:

- **ERR-001** — Auth service null token bug (resolves at 25s)
- **ERR-002** — Database connection pool exhaustion (resolves at 42s)
- **ERR-003** — Payment latency spike, false alarm (resolves at 35s)

To replay the scenario:

```bash
curl -X POST http://localhost:5000/reset
```

---

## API Reference

### `POST /analyze-error`

Accepts an error payload and begins async AI analysis. Returns immediately with `"investigating"` status while Gemini processes in the background.

**Request body:**
```json
{
  "error_log": "TypeError: Cannot read properties of null (reading 'token')",
  "file": "src/auth/AuthMiddleware.py",
  "lineNumber": 87
}
```

**Response:**
```json
{
  "id": "ERR-A3F7B2C1",
  "status": "investigating",
  "file": "src/auth/AuthMiddleware.py",
  "message": "TypeError: Cannot read properties of null (reading 'token')",
  "timestamp": "14:32:07",
  "summary": null,
  "tavilyResults": [],
  "diff": null,
  "fileName": "AuthMiddleware.py",
  "lineNumber": 87,
  "callStatus": "idle"
}
```

### `GET /incidents`

Returns all incidents currently in memory. Polled by the dashboard every 2 seconds.

**Response:**
```json
{
  "incidents": [
    {
      "id": "ERR-A3F7B2C1",
      "status": "action required",
      "file": "src/auth/AuthMiddleware.py",
      "message": "TypeError: Cannot read properties of null (reading 'token')",
      "timestamp": "14:32:07",
      "summary": "The Authorization header is absent in certain requests, causing a null dereference when splitting the token.",
      "tavilyResults": [],
      "diff": "--- a/src/auth/AuthMiddleware.py\n+++ b/src/auth/AuthMiddleware.py\n...",
      "fileName": "AuthMiddleware.py",
      "lineNumber": 87,
      "callStatus": "ringing"
    }
  ]
}
```

### `POST /bland-webhook`

Receives call completion callbacks from Bland AI via the ngrok tunnel.

---

## Troubleshooting

**`ImportError: cannot import name 'genai' from 'google'`**
```bash
pip uninstall google-generativeai google-ai-generativelanguage google-api-core google-auth googleapis-common-protos -y
pip install google-genai
```

**`aerospike.exception.ConnectionError`**
```bash
# Check Docker is running
docker ps
# Restart Aerospike
docker-compose down && docker-compose up -d
# Wait 15 seconds, then check
docker logs aerospike-sre | grep "service ready"
```

**`pip install aerospike` fails on Apple Silicon Mac**
```bash
pip install aerospike-macos
```

**Dashboard shows dummy data instead of real incidents**

The dashboard falls back to dummy data only when the fetch to `localhost:5000/incidents` throws a network error. This means the agent service is not running. Start Terminal 3 (`python agent_service/app.py`) and refresh.

**Dashboard shows "No active incidents" after firing `generate_error.py`**

The infra poller is not running. Start Terminal 4 (`python infra_service/app.py`). Then fire `generate_error.py` again.

**Bland AI not calling**

- Confirm `BLAND_AI_PHONE` in `.env` is in E.164 format: `+14155552671`
- Confirm `BLAND_AI_API_KEY` is correct
- Check Terminal 3 logs for `Bland AI response: 200`

**CORS errors in browser console**

Confirm `agent_service/app.py` has:
```python
CORS(app, origins=["http://localhost:3000", "http://127.0.0.1:3000"])
```

**Auth0 "Unauthorized" after login**

- Confirm your Auth0 application type is **Single Page Application**, not Regular Web Application
- Confirm Allowed Callback URLs, Logout URLs, and Web Origins all include `http://localhost:3000`
- Confirm `dashboard/.env` has the correct `VITE_AUTH0_DOMAIN` and `VITE_AUTH0_CLIENT_ID`

---

## Tech Stack

| Layer | Technology | Purpose |
|---|---|---|
| AI reasoning | Google Gemini 2.5 Flash | Root cause analysis and patch generation |
| Voice calls | Bland AI | Phone call to on-call engineer |
| Database | Aerospike (Docker) | High-velocity incident state store |
| Agent backend | Python + Flask | REST API and async AI processing |
| Data pipeline | Python (polling loop) | Aerospike watcher and agent router |
| Observability | Overmind tracer | Real-time terminal trace of agent decisions |
| Frontend | React 18 + Vite | Incident command dashboard |
| Styling | Tailwind CSS v3 | Cyberpunk dark-mode terminal aesthetic |
| Authentication | Auth0 | Enterprise-grade login for the dashboard |
| Tunnel | ngrok | Exposes local Flask server for Bland AI webhooks |

---

## Demo Script

Use this script when presenting to judges. The full flow runs in under 35 seconds.

**[0:00]** Open the dashboard at `http://localhost:3000`. Point to the navbar. *"The system is fully operational. SYSTEM: NOMINAL. No active incidents."*

**[0:05]** Run `python scripts/generate_error.py` in Terminal 6. *"A critical error just hit our production auth service. Our Aerospike pipeline detected it immediately."*

**[0:08]** Point to Terminal 4. *"Overmind is tracing the agent's decision-making in real time. The incident has been locked and routed to the AI engine."*

**[0:10]** Point to the dashboard sidebar. *"The incident card appeared instantly. The system is now in Investigating state — Gemini is reading the codebase context."*

**[0:20]** Point to the main panel as it flips to Action Required. *"Analysis complete. Gemini identified the root cause — a missing null check on the Authorization header. It generated this patch automatically."*

**[0:25]** Point to the diff viewer. *"This is a production-ready git diff. Green lines are additions, red lines are deletions."*

**[0:27]** Phone rings. Point to VoiceCallToast. *"Bland AI is calling our on-call engineer right now to notify them and request approval."*

## Contributors

Built for the Aerospike + Overmind Hackathon by a team of three.

- **Badri Narayanan** — AI Agent Architect: Gemini reasoning engine, Bland AI integration, Flask API
- **Krishna Ramesh** — Data Infrastructure Lead: Aerospike pipeline, Overmind tracing, polling loop
- **Mithilesh** — Interface & Security Lead: React dashboard, Auth0, real-time UI state
