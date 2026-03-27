# AutoSRE Dashboard

A high-performance, dark-mode SRE Incident Command Dashboard built with React, Vite, Tailwind CSS, and Auth0 authentication.

## 🎨 Design Aesthetic

**Cyberpunk Enterprise** theme featuring:
- Deep slate backgrounds (#0f172a)
- Neon emerald accents for system health
- Crimson alerts for incidents
- High-contrast diff viewer for demo visibility
- Animated UI elements (typewriter effects, waveforms, pulsing indicators)

---

## 📋 Prerequisites

- **Node.js** v18+ and npm
- **Auth0 Account** (free tier works)
- **Backend API** running on `http://localhost:5000` (optional - falls back to dummy data)

---

## 🚀 Quick Start

### 1. Install Dependencies

```bash
cd dashboard
npm install
```

### 2. Configure Auth0

Create a `.env` file in the `dashboard` folder:

```env
VITE_AUTH0_DOMAIN=your-auth0-domain.us.auth0.com
VITE_AUTH0_CLIENT_ID=your-client-id
VITE_AUTH0_REDIRECT_URI=http://localhost:3000
```

**Auth0 Setup:**
1. Go to [Auth0 Dashboard](https://manage.auth0.com/)
2. Create a new Application → **Single Page Application**
3. Configure Allowed Callback URLs: `http://localhost:3000`
4. Configure Allowed Logout URLs: `http://localhost:3000`
5. Configure Allowed Web Origins: `http://localhost:3000`
6. Copy Domain and Client ID to `.env`

### 3. Run the Dashboard

```bash
npm run dev
```

Dashboard will be available at `http://localhost:3000`

---

## 🧪 Testing with Mock Data

### Option 1: Use Test Server (Recommended)

Run the included test server that simulates a full incident lifecycle:

```bash
# In a separate terminal
node test-server.js
```

This starts a mock backend on `http://localhost:5000` that simulates:
- **ERR-001**: Auth service bug (3s-25s, fast resolution)
- **ERR-002**: Database connection issue (12s-42s, slower resolution)  
- **ERR-003**: Payment latency spike (18s-35s, false alarm)

**Timeline**: 42 seconds total with overlapping incidents

**Reset scenario**: `POST http://localhost:5000/reset`

### Option 2: Use Dummy Data

If no backend is running, the dashboard automatically falls back to dummy data showing 3 sample incidents.

---

## 🏗️ Project Structure

```
dashboard/
├── src/
│   ├── components/
│   │   ├── DiffViewer.jsx       # Git-style diff viewer
│   │   ├── IncidentCard.jsx     # Incident feed cards
│   │   ├── Navbar.jsx           # Top navigation with system status
│   │   ├── TypewriterText.jsx   # Animated text effect
│   │   ├── VoiceCallToast.jsx   # Bland AI call notification
│   │   └── VoiceStatus.jsx      # Voice call status indicator
│   ├── hooks/
│   │   └── useIncidents.js      # Custom hook for incident polling
│   ├── App.jsx                  # Main application component
│   ├── main.jsx                 # Entry point with Auth0 provider
│   └── index.css                # Global styles + animations
├── test-server.js               # Mock backend for testing
├── .env                         # Auth0 configuration (create this)
├── package.json
├── vite.config.js
├── tailwind.config.js
└── README.md
```

---

## 🎯 Key Features

### 1. Global System Heartbeat
- **SYSTEM: NOMINAL** (green pulse) when no active incidents
- **SYSTEM: BREACHED** (red alert) when incidents are active/investigating

### 2. Real-Time Incident Feed (Left Sidebar)
- Polls backend every 2 seconds
- Color-coded status borders:
  - 🟢 Green: Monitoring
  - 🟡 Yellow: Investigating (with spinner)
  - 🔴 Red: Action Required (glowing)
  - ⚪ Grey: Resolved (desaturated)

### 3. Analysis Pane
- **Gemini AI Summary**: Typewriter effect for live terminal feel
- **Tavily Search Results**: Clickable tags showing relevant documentation

### 4. Diff Viewer
- Syntax-highlighted code with file name and line number
- High-contrast red/green for visibility from back of room
- JetBrains Mono font for readability

### 5. Voice Call Overlay
- Slides in from bottom-right when Bland AI call is triggered
- Shows call status: Ringing → Connected → Ended
- Animated waveform during active call

### 6. Approve & Deploy Button
- Only activates when incident status is "Action Required"
- Glowing green animation when active
- Changes to "✓ DEPLOYED" after approval

---

## 🔌 Backend API Integration

The dashboard expects a backend API at `http://localhost:5000/incidents` that returns:

```json
{
  "incidents": [
    {
      "id": "ERR-001",
      "status": "action required",
      "file": "src/auth_service.py",
      "message": "TypeError: Cannot read properties of null",
      "timestamp": "14:23:01",
      "summary": "Root cause analysis from Gemini...",
      "tavilyResults": ["Stack Overflow: ...", "GitHub Issue: ..."],
      "diff": "--- a/file.py\n+++ b/file.py\n...",
      "fileName": "auth_service.py",
      "lineNumber": 142,
      "callStatus": "connected"
    }
  ]
}
```

### Field Descriptions

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `id` | string | ✅ | Unique incident identifier |
| `status` | string | ✅ | One of: `monitoring`, `investigating`, `action required`, `resolved` |
| `file` | string | ✅ | File path where error occurred |
| `message` | string | ✅ | Error message |
| `timestamp` | string | ✅ | Time of incident (HH:MM:SS) |
| `summary` | string | ❌ | Gemini AI analysis (shows when available) |
| `tavilyResults` | array | ❌ | Search results from Tavily |
| `diff` | string | ❌ | Git-style diff for proposed fix |
| `fileName` | string | ❌ | Display name for file (defaults to `file`) |
| `lineNumber` | number | ❌ | Line number of error |
| `callStatus` | string | ❌ | One of: `idle`, `ringing`, `connected`, `ended` |

---

## 🎬 Demo Script (for Judges)

**[0:00]** "Our dashboard is monitoring production. Everything is nominal."

**[0:05]** "An error just hit our auth service. The system detected it immediately."

**[0:10]** "Our AI agent is now investigating the root cause using Gemini."

**[0:20]** "Analysis complete. Gemini identified a null pointer bug and generated a fix. Tavily found relevant Stack Overflow threads. The diff shows exactly what needs to change."

**[0:25]** "Bland AI is calling our on-call engineer right now to get approval."

**[0:30]** "Approved. The patch is being deployed."

**[0:35]** "Incident resolved. System back to normal. Total time: 30 seconds from detection to fix."

---

## 🛠️ Development

### Available Scripts

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Run test server
node test-server.js
```

### Tech Stack

- **React 18** - UI framework
- **Vite** - Build tool and dev server
- **Tailwind CSS v3** - Utility-first CSS
- **Auth0 React SDK** - Authentication
- **Lucide React** - Icon library
- **Express** - Test server backend
- **CORS** - Cross-origin resource sharing

---

## 🐛 Troubleshooting

### Auth0 "Unauthorized" Error
- Ensure Application Type is set to **Single Page Application** in Auth0 dashboard
- Verify Allowed Callback URLs includes `http://localhost:3000`
- Check that `.env` file exists with correct credentials

### Dashboard Not Updating
- Verify test server is running on port 5000
- Check browser console for fetch errors
- Ensure CORS is enabled on backend

### Tailwind Styles Not Working
- Run `npm install` to ensure all dependencies are installed
- Check that `tailwind.config.js` and `postcss.config.js` exist
- Restart dev server after config changes

---

## 📝 License

MIT

---

## 👥 Contributors

Built for the AutoSRE project - Autonomous Site Reliability Engineering with AI agents.
