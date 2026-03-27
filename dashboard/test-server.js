import express from 'express';
import cors from 'cors';

const app = express();
app.use(cors());
app.use(express.json());

// Multiple incidents with different timelines
const incidentTimeline = [
  // ERR-001: Auth service bug (fast resolution)
  {
    time: 3,
    incident: {
      id: "ERR-001",
      status: "monitoring",
      file: "src/auth_service.py",
      message: "TypeError: Cannot read properties of null (reading 'token')",
      timestamp: "14:23:01",
    }
  },
  {
    time: 8,
    incident: {
      id: "ERR-001",
      status: "investigating",
      file: "src/auth_service.py",
      message: "TypeError: Cannot read properties of null (reading 'token')",
      timestamp: "14:23:01",
    }
  },
  
  // ERR-002: Database connection issue (appears while ERR-001 is being investigated)
  {
    time: 12,
    incident: {
      id: "ERR-002",
      status: "monitoring",
      file: "src/db/connection.py",
      message: "Connection pool exhausted after 30s timeout",
      timestamp: "14:23:13",
    }
  },
  
  // ERR-001: Gets fix ready
  {
    time: 15,
    incident: {
      id: "ERR-001",
      status: "action required",
      file: "src/auth_service.py",
      message: "TypeError: Cannot read properties of null (reading 'token')",
      timestamp: "14:23:01",
      summary: "Null token passed to auth middleware. The authorization header is missing in certain edge cases, causing a null pointer exception during token extraction.",
      tavilyResults: [
        "Stack Overflow: Null token in Express middleware",
        "GitHub Issue #4521: Auth header missing on preflight"
      ],
      diff: "--- a/src/auth_service.py\n+++ b/src/auth_service.py\n@@ -12,6 +12,9 @@ def validate_token(request):\n-    token = request.headers['authorization'].split(' ')[1]\n+    if 'authorization' not in request.headers:\n+        return {'error': 'No authorization header'}, 401\n+    \n+    token = request.headers['authorization'].split(' ')[1]\n     if not token:\n         return {'error': 'Unauthorized'}, 401",
      fileName: "auth_service.py",
      lineNumber: 142,
      callStatus: "ringing"
    }
  },
  
  // ERR-003: Payment latency spike (new incident while others are active)
  {
    time: 18,
    incident: {
      id: "ERR-003",
      status: "monitoring",
      file: "src/api/payments.py",
      message: "Latency spike detected: p99 > 2000ms",
      timestamp: "14:23:19",
    }
  },
  
  // ERR-001: Call connected
  {
    time: 20,
    incident: {
      id: "ERR-001",
      status: "action required",
      file: "src/auth_service.py",
      message: "TypeError: Cannot read properties of null (reading 'token')",
      timestamp: "14:23:01",
      summary: "Null token passed to auth middleware. The authorization header is missing in certain edge cases, causing a null pointer exception during token extraction.",
      tavilyResults: [
        "Stack Overflow: Null token in Express middleware",
        "GitHub Issue #4521: Auth header missing on preflight"
      ],
      diff: "--- a/src/auth_service.py\n+++ b/src/auth_service.py\n@@ -12,6 +12,9 @@ def validate_token(request):\n-    token = request.headers['authorization'].split(' ')[1]\n+    if 'authorization' not in request.headers:\n+        return {'error': 'No authorization header'}, 401\n+    \n+    token = request.headers['authorization'].split(' ')[1]\n     if not token:\n         return {'error': 'Unauthorized'}, 401",
      fileName: "auth_service.py",
      lineNumber: 142,
      callStatus: "connected"
    }
  },
  
  // ERR-002: Starts investigating
  {
    time: 22,
    incident: {
      id: "ERR-002",
      status: "investigating",
      file: "src/db/connection.py",
      message: "Connection pool exhausted after 30s timeout",
      timestamp: "14:23:13",
    }
  },
  
  // ERR-001: Resolved (first to complete)
  {
    time: 25,
    incident: {
      id: "ERR-001",
      status: "resolved",
      file: "src/auth_service.py",
      message: "TypeError: Cannot read properties of null (reading 'token')",
      timestamp: "14:23:01",
      summary: "Null token passed to auth middleware. The authorization header is missing in certain edge cases, causing a null pointer exception during token extraction.",
      tavilyResults: [
        "Stack Overflow: Null token in Express middleware",
        "GitHub Issue #4521: Auth header missing on preflight"
      ],
      diff: "--- a/src/auth_service.py\n+++ b/src/auth_service.py\n@@ -12,6 +12,9 @@ def validate_token(request):\n-    token = request.headers['authorization'].split(' ')[1]\n+    if 'authorization' not in request.headers:\n+        return {'error': 'No authorization header'}, 401\n+    \n+    token = request.headers['authorization'].split(' ')[1]\n     if not token:\n         return {'error': 'Unauthorized'}, 401",
      fileName: "auth_service.py",
      lineNumber: 142,
      callStatus: "ended"
    }
  },
  
  // ERR-003: Escalates to investigating
  {
    time: 28,
    incident: {
      id: "ERR-003",
      status: "investigating",
      file: "src/api/payments.py",
      message: "Latency spike detected: p99 > 2000ms",
      timestamp: "14:23:19",
    }
  },
  
  // ERR-002: Gets fix ready
  {
    time: 32,
    incident: {
      id: "ERR-002",
      status: "action required",
      file: "src/db/connection.py",
      message: "Connection pool exhausted after 30s timeout",
      timestamp: "14:23:13",
      summary: "Database connection pool is not releasing connections properly. Connections are being held open after queries complete, leading to pool exhaustion under load.",
      tavilyResults: [
        "PostgreSQL Docs: Connection pooling best practices",
        "Stack Overflow: Connection pool exhaustion in Python"
      ],
      diff: "--- a/src/db/connection.py\n+++ b/src/db/connection.py\n@@ -45,7 +45,10 @@ def execute_query(query, params):\n     conn = pool.get_connection()\n     cursor = conn.cursor()\n-    cursor.execute(query, params)\n-    return cursor.fetchall()\n+    try:\n+        cursor.execute(query, params)\n+        return cursor.fetchall()\n+    finally:\n+        conn.close()",
      fileName: "connection.py",
      lineNumber: 45,
      callStatus: "ringing"
    }
  },
  
  // ERR-003: Turns out to be false alarm
  {
    time: 35,
    incident: {
      id: "ERR-003",
      status: "resolved",
      file: "src/api/payments.py",
      message: "Latency spike detected: p99 > 2000ms",
      timestamp: "14:23:19",
    }
  },
  
  // ERR-002: Call connected
  {
    time: 37,
    incident: {
      id: "ERR-002",
      status: "action required",
      file: "src/db/connection.py",
      message: "Connection pool exhausted after 30s timeout",
      timestamp: "14:23:13",
      summary: "Database connection pool is not releasing connections properly. Connections are being held open after queries complete, leading to pool exhaustion under load.",
      tavilyResults: [
        "PostgreSQL Docs: Connection pooling best practices",
        "Stack Overflow: Connection pool exhaustion in Python"
      ],
      diff: "--- a/src/db/connection.py\n+++ b/src/db/connection.py\n@@ -45,7 +45,10 @@ def execute_query(query, params):\n     conn = pool.get_connection()\n     cursor = conn.cursor()\n-    cursor.execute(query, params)\n-    return cursor.fetchall()\n+    try:\n+        cursor.execute(query, params)\n+        return cursor.fetchall()\n+    finally:\n+        conn.close()",
      fileName: "connection.py",
      lineNumber: 45,
      callStatus: "connected"
    }
  },
  
  // ERR-002: Resolved
  {
    time: 42,
    incident: {
      id: "ERR-002",
      status: "resolved",
      file: "src/db/connection.py",
      message: "Connection pool exhausted after 30s timeout",
      timestamp: "14:23:13",
      summary: "Database connection pool is not releasing connections properly. Connections are being held open after queries complete, leading to pool exhaustion under load.",
      tavilyResults: [
        "PostgreSQL Docs: Connection pooling best practices",
        "Stack Overflow: Connection pool exhaustion in Python"
      ],
      diff: "--- a/src/db/connection.py\n+++ b/src/db/connection.py\n@@ -45,7 +45,10 @@ def execute_query(query, params):\n     conn = pool.get_connection()\n     cursor = conn.cursor()\n-    cursor.execute(query, params)\n-    return cursor.fetchall()\n+    try:\n+        cursor.execute(query, params)\n+        return cursor.fetchall()\n+    finally:\n+        conn.close()",
      fileName: "connection.py",
      lineNumber: 45,
      callStatus: "ended"
    }
  }
];

let startTime = Date.now();
const activeIncidents = new Map();

app.get('/bland-webhook', (_req, res) => {
  const elapsed = Math.floor((Date.now() - startTime) / 1000);
  
  // Get all updates that should have happened by now
  const updates = incidentTimeline.filter(u => u.time <= elapsed);
  
  // Build current state of all incidents
  updates.forEach(update => {
    activeIncidents.set(update.incident.id, update.incident);
  });
  
  // Return all active incidents as an array
  const incidents = Array.from(activeIncidents.values());
  
  console.log(`[${elapsed}s] Active incidents: ${incidents.map(i => `${i.id}(${i.status})`).join(', ') || 'none'}`);
  
  res.json({ incidents });
});

app.post('/reset', (_req, res) => {
  startTime = Date.now();
  activeIncidents.clear();
  console.log('Scenario reset');
  res.json({ message: 'Scenario reset', startTime });
});

const PORT = 5000;
app.listen(PORT, () => {
  console.log(`\n🚀 Test server running on http://localhost:${PORT}`);
  console.log('📋 Scenario timeline (42 seconds):');
  console.log('   3s  - ERR-001 detected (auth)');
  console.log('   8s  - ERR-001 investigating');
  console.log('   12s - ERR-002 detected (database)');
  console.log('   15s - ERR-001 action required + call');
  console.log('   18s - ERR-003 detected (payments)');
  console.log('   20s - ERR-001 call connected');
  console.log('   22s - ERR-002 investigating');
  console.log('   25s - ERR-001 RESOLVED ✓');
  console.log('   28s - ERR-003 investigating');
  console.log('   32s - ERR-002 action required + call');
  console.log('   35s - ERR-003 RESOLVED ✓');
  console.log('   37s - ERR-002 call connected');
  console.log('   42s - ERR-002 RESOLVED ✓');
  console.log('\n💡 POST to /reset to restart the scenario\n');
});
