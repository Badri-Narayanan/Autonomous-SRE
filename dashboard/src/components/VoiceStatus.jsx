import React from 'react'
import { Phone, PhoneCall, PhoneOff, CheckCircle } from 'lucide-react'

const callStates = {
  idle:       { label: 'Standby',    icon: <Phone className="w-4 h-4" />,       color: 'text-slate-500', border: 'border-slate-700' },
  ringing:    { label: 'Ringing...', icon: <Phone className="w-4 h-4 animate-bounce" />, color: 'text-yellow-400', border: 'border-yellow-500' },
  connected:  { label: 'Connected',  icon: <PhoneCall className="w-4 h-4" />,   color: 'text-emerald-400', border: 'border-emerald-500' },
  ended:      { label: 'Call Ended', icon: <PhoneOff className="w-4 h-4" />,    color: 'text-slate-400', border: 'border-slate-600' },
  authorized: { label: 'Authorized', icon: <CheckCircle className="w-4 h-4" />, color: 'text-emerald-400', border: 'border-emerald-500' },
}

export default function VoiceStatus({ status = 'idle' }) {
  const cfg = callStates[status] ?? callStates.idle

  return (
    <div className={`flex items-center gap-3 border ${cfg.border} bg-slate-800/50 px-4 py-3 rounded`}>
      <div className={cfg.color}>{cfg.icon}</div>
      <div>
        <p className="text-slate-500 font-mono text-xs uppercase tracking-widest">Bland AI</p>
        <p className={`font-mono text-sm font-bold ${cfg.color}`}>{cfg.label}</p>
      </div>
      {status === 'connected' && (
        <span className="ml-auto w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
      )}
    </div>
  )
}
