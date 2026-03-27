import React from 'react'
import { useAuth0 } from '@auth0/auth0-react'
import { Activity, User, LogOut, AlertCircle } from 'lucide-react'

export default function Navbar({ systemBreached = false }) {
  const { user, logout } = useAuth0()

  return (
    <header className="border-b border-slate-700 px-6 py-3 flex items-center gap-4 bg-[#0f172a]">
      <div className="flex items-center gap-2">
        <Activity className="text-emerald-400 w-5 h-5" />
        <span className="text-emerald-400 font-mono font-bold tracking-widest uppercase text-sm">
          AutoSRE
        </span>
        <span className="text-slate-600 font-mono text-xs ml-2">// Incident Command</span>
      </div>

      {/* Global System Status */}
      <div className="flex items-center gap-2 ml-6">
        {systemBreached ? (
          <>
            <AlertCircle className="w-4 h-4 text-red-400 animate-pulse" />
            <span className="text-red-400 font-mono text-xs tracking-widest font-bold">SYSTEM: BREACHED</span>
          </>
        ) : (
          <>
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            <span className="text-emerald-400 font-mono text-xs tracking-widest">SYSTEM: NOMINAL</span>
          </>
        )}
      </div>

      <div className="ml-auto flex items-center gap-4">
        <div className="flex items-center gap-2 border border-slate-700 px-3 py-1.5 rounded">
          <User className="w-3 h-3 text-slate-400" />
          <span className="text-slate-300 font-mono text-xs">{user?.email}</span>
        </div>
        <button
          onClick={() => logout({ logoutParams: { returnTo: window.location.origin } })}
          className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-red-400 transition-colors font-mono"
        >
          <LogOut className="w-3 h-3" />
          Logout
        </button>
      </div>
    </header>
  )
}
