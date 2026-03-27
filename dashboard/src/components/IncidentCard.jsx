import React from 'react'
import { AlertTriangle, Eye, Radio, Loader2, CheckCircle } from 'lucide-react'

const statusConfig = {
  monitoring: {
    label: 'Monitoring',
    border: 'border-emerald-500',
    badge: 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/50',
    icon: <Radio className="w-3 h-3" />,
    glow: '',
  },
  investigating: {
    label: 'Investigating',
    border: 'border-yellow-500',
    badge: 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/50',
    icon: <Loader2 className="w-3 h-3 animate-spin" />,
    glow: '',
  },
  'action required': {
    label: 'Action Required',
    border: 'border-red-500',
    badge: 'bg-red-500/20 text-red-400 border border-red-500/50',
    icon: <AlertTriangle className="w-3 h-3" />,
    glow: 'shadow-lg shadow-red-500/30',
  },
  resolved: {
    label: 'Resolved',
    border: 'border-slate-600',
    badge: 'bg-slate-700/50 text-slate-500 border border-slate-600',
    icon: <CheckCircle className="w-3 h-3" />,
    glow: '',
  },
}

export default function IncidentCard({ incident, active = false }) {
  const status = incident?.status?.toLowerCase() ?? 'monitoring'
  const cfg = statusConfig[status] ?? statusConfig['monitoring']
  const isResolved = status === 'resolved'

  return (
    <div className={`border-l-2 ${cfg.border} ${cfg.glow} bg-slate-800/50 px-4 py-3 rounded-r cursor-pointer
      ${active ? 'bg-slate-700/70' : 'hover:bg-slate-800'} 
      ${isResolved ? 'opacity-50 grayscale' : ''} 
      transition-all`}>
      <div className="flex items-center justify-between mb-1">
        <span className={`font-mono text-sm font-bold ${isResolved ? 'text-slate-500' : 'text-white'}`}>
          {incident?.id ?? 'ERR-???'}
        </span>
        <span className={`flex items-center gap-1 text-xs px-2 py-0.5 rounded font-mono ${cfg.badge}`}>
          {cfg.icon}
          {cfg.label}
        </span>
      </div>
      <p className={`font-mono text-xs truncate ${isResolved ? 'text-slate-600' : 'text-slate-400'}`}>
        {incident?.file ?? 'unknown'}
      </p>
      <p className="text-slate-500 font-mono text-xs mt-1">{incident?.timestamp ?? '--:--:--'}</p>
    </div>
  )
}
