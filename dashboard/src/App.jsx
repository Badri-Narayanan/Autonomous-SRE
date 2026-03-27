import { useState, useEffect } from 'react'
import { useAuth0 } from '@auth0/auth0-react'
import Navbar from './components/Navbar'
import IncidentCard from './components/IncidentCard'
import DiffViewer from './components/DiffViewer'
import VoiceCallToast from './components/VoiceCallToast'
import TypewriterText from './components/TypewriterText'
import { Search, Brain, Zap } from 'lucide-react'

const DUMMY_INCIDENTS = [
  {
    id: 'ERR-001',
    status: 'action required',
    file: 'src/auth.js',
    message: 'TypeError: Cannot read properties of null (reading "token")',
    timestamp: '14:23:01',
    summary: 'Null token passed to auth middleware. The authorization header is missing in certain edge cases, causing a null pointer exception during token extraction.',
    tavilyResults: ['Stack Overflow: Null token in Express middleware', 'GitHub Issue #4521: Auth header missing on preflight'],
    diff: `--- a/src/auth.js\n+++ b/src/auth.js\n@@ -12,6 +12,9 @@ function validateToken(req, res, next) {\n-  const token = req.headers.authorization.split(' ')[1]\n+  if (!req.headers.authorization) {\n+    return res.status(401).json({ error: 'No authorization header' })\n+  }\n+  const token = req.headers.authorization.split(' ')[1]\n   if (!token) return res.status(401).json({ error: 'Unauthorized' })\n   next()\n }`,
    fileName: 'auth_service.py',
    lineNumber: 142,
    callStatus: 'connected',
  },
  {
    id: 'ERR-002',
    status: 'investigating',
    file: 'src/db/connection.js',
    message: 'Connection pool exhausted after 30s timeout',
    timestamp: '14:19:44',
    summary: null,
    diff: null,
    callStatus: 'idle',
  },
  {
    id: 'ERR-003',
    status: 'monitoring',
    file: 'src/api/payments.js',
    message: 'Latency spike detected: p99 > 2000ms',
    timestamp: '14:15:12',
    summary: null,
    diff: null,
    callStatus: 'idle',
  },
]

export default function App() {
  const { isLoading, isAuthenticated, loginWithRedirect, error } = useAuth0()
  const [incidents, setIncidents] = useState([])
  const [selected, setSelected] = useState(null)
  const [deployed, setDeployed] = useState(false)
  const [showCallToast, setShowCallToast] = useState(false)
  const [backendLive, setBackendLive] = useState(false)

  const systemBreached = incidents.some(i => ['action required', 'investigating'].includes(i.status?.toLowerCase()))

  useEffect(() => {
    if (!isAuthenticated) return
    
    // Initial fetch
    const fetchData = async () => {
      try {
        const res = await fetch('http://localhost:5000/incidents')
        if (res.ok) {
          setBackendLive(true)
          const data = await res.json()
          
          if (data?.incidents && Array.isArray(data.incidents)) {
            // Backend returned multiple incidents
            setIncidents(data.incidents)
            
            // Handle empty incidents array
            if (data.incidents.length === 0) {
              setSelected(null)
            } else if (!selected) {
              // No incident selected, select the first one
              setSelected(data.incidents[0])
            } else {
              // Update selected incident if it still exists
              const updated = data.incidents.find(i => i.id === selected.id)
              if (updated) {
                setSelected(updated)
              } else {
                // Selected incident no longer exists, clear selection
                setSelected(null)
              }
            }
          }
        }
      } catch {
        // Backend not live, use dummy data
        setBackendLive(false)
        setIncidents(DUMMY_INCIDENTS)
        setSelected(DUMMY_INCIDENTS[0])
      }
    }

    fetchData()
    const poll = setInterval(fetchData, 2000)
    return () => clearInterval(poll)
  }, [isAuthenticated])

  // Show call toast when call status changes to ringing or connected
  useEffect(() => {
    if (selected?.callStatus === 'ringing' || selected?.callStatus === 'connected') {
      setShowCallToast(true)
    } else {
      setShowCallToast(false)
    }
  }, [selected?.callStatus])

  if (error) return (
    <div className="min-h-screen bg-[#0f172a] flex items-center justify-center">
      <p className="text-red-400 font-mono text-sm">Auth error: {error.message}</p>
    </div>
  )

  if (isLoading) return (
    <div className="min-h-screen bg-[#0f172a] flex items-center justify-center">
      <p className="text-emerald-400 font-mono text-sm tracking-widest animate-pulse">INITIALIZING...</p>
    </div>
  )

  if (!isAuthenticated) return (
    <div className="min-h-screen bg-[#0f172a] flex flex-col items-center justify-center gap-6">
      <span className="text-emerald-400 text-5xl">⬡</span>
      <h1 className="text-white font-mono text-2xl tracking-widest uppercase">AutoSRE</h1>
      <p className="text-slate-500 font-mono text-xs tracking-widest">Incident Command Dashboard</p>
      <button
        onClick={() => loginWithRedirect()}
        className="mt-4 px-8 py-3 bg-emerald-400 text-black font-mono font-bold text-sm tracking-widest uppercase hover:bg-emerald-300 transition-colors shadow-lg shadow-emerald-500/20"
      >
        Login to Access Dashboard
      </button>
    </div>
  )

  const canDeploy = selected?.status?.toLowerCase() === 'action required' && !deployed

  return (
    <div className="min-h-screen bg-[#0f172a] text-gray-100 font-mono flex flex-col">
      <Navbar systemBreached={systemBreached} />

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar — Incident Feed (25%) */}
        <aside className="w-1/4 border-r border-slate-700 flex flex-col bg-slate-900/50">
          <div className="px-4 py-3 border-b border-slate-700 flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
            <span className="text-slate-400 text-xs tracking-widest uppercase">Incident Feed</span>
          </div>
          <div className="flex-1 overflow-y-auto p-3 space-y-2">
            {incidents.map(inc => (
              <div key={inc.id} onClick={() => { setSelected(inc); setDeployed(false) }}>
                <IncidentCard incident={inc} active={selected?.id === inc.id} />
              </div>
            ))}
          </div>
        </aside>

        {/* Main Panel (75%) */}
        <main className="flex-1 overflow-y-auto p-6 space-y-5">
          {!selected ? (
            <div className="flex items-center justify-center h-full">
              <p className="text-slate-600 text-sm">Select an incident</p>
            </div>
          ) : (
            <>
              {/* Analysis Pane — Gemini + Tavily */}
              {selected.summary && (
                <div className="bg-slate-800/50 border border-slate-700 rounded p-5 space-y-4">
                  <div className="flex items-center gap-2">
                    <Brain className="w-5 h-5 text-purple-400" />
                    <span className="text-slate-400 text-xs tracking-widest uppercase">Gemini Analysis</span>
                  </div>
                  <p className="text-slate-200 text-sm leading-relaxed">
                    <TypewriterText text={selected.summary} speed={20} />
                  </p>

                  {selected.tavilyResults?.length > 0 && (
                    <div className="border-t border-slate-700 pt-4">
                      <div className="flex items-center gap-2 mb-3">
                        <Search className="w-4 h-4 text-blue-400" />
                        <span className="text-slate-500 text-xs tracking-widest uppercase">Search Context</span>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {selected.tavilyResults.map((r, i) => (
                          <span
                            key={i}
                            className="inline-flex items-center gap-1 px-3 py-1 bg-blue-500/10 border border-blue-500/30 rounded-full text-blue-400 text-xs hover:bg-blue-500/20 cursor-pointer transition-colors"
                          >
                            {r}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Diff Viewer */}
              {selected.diff && (
                <DiffViewer 
                  diff={selected.diff} 
                  fileName={selected.fileName ?? selected.file} 
                  lineNumber={selected.lineNumber}
                />
              )}

              {/* Action Bar */}
              <button
                disabled={!canDeploy}
                onClick={() => setDeployed(true)}
                className={`w-full py-6 font-mono font-black text-2xl tracking-widest uppercase rounded transition-all
                  ${canDeploy
                    ? 'bg-emerald-400 text-black hover:bg-emerald-300 shadow-2xl shadow-emerald-500/50 animate-pulse cursor-pointer'
                    : deployed
                      ? 'bg-slate-800 text-emerald-400 border-2 border-emerald-500 cursor-default'
                      : 'bg-slate-800 text-slate-600 border-2 border-slate-700 cursor-not-allowed'
                  }`}
              >
                {deployed ? (
                  <span className="flex items-center justify-center gap-3">
                    <Zap className="w-6 h-6" />
                    DEPLOYED
                  </span>
                ) : canDeploy ? (
                  <span className="flex items-center justify-center gap-3">
                    <Zap className="w-6 h-6" />
                    APPROVE & DEPLOY
                  </span>
                ) : (
                  'APPROVE & DEPLOY'
                )}
              </button>

              {!canDeploy && !deployed && (
                <p className="text-center text-slate-600 text-xs">
                  Button activates when incident reaches "Action Required"
                </p>
              )}
            </>
          )}
        </main>
      </div>

      {/* Voice Call Toast */}
      <VoiceCallToast 
        visible={showCallToast} 
        engineerName="SRE Team Lead"
        status={selected?.callStatus}
      />
    </div>
  )
}
