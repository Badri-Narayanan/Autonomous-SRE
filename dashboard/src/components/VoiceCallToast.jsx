import React from 'react'
import { Phone, PhoneCall } from 'lucide-react'

export default function VoiceCallToast({ visible, engineerName = 'On-Call Engineer', status = 'ringing' }) {
  if (!visible) return null

  return (
    <div className="fixed bottom-6 right-6 bg-slate-800 border border-emerald-500 rounded-lg shadow-2xl shadow-emerald-500/30 p-4 w-80 animate-slide-in-right z-50">
      <div className="flex items-center gap-3">
        {status === 'connected' ? (
          <PhoneCall className="w-5 h-5 text-emerald-400 animate-pulse" />
        ) : (
          <Phone className="w-5 h-5 text-yellow-400 animate-bounce" />
        )}
        <div className="flex-1">
          <p className="text-slate-400 font-mono text-xs uppercase tracking-widest">Bland AI</p>
          <p className="text-white font-mono text-sm font-bold">
            {status === 'connected' ? `Connected: ${engineerName}` : `Connecting to ${engineerName}...`}
          </p>
        </div>
      </div>

      {/* Waveform Animation */}
      {status === 'connected' && (
        <div className="flex items-center justify-center gap-1 mt-3 h-8">
          {[...Array(12)].map((_, i) => (
            <div
              key={i}
              className="w-1 bg-emerald-400 rounded-full animate-waveform"
              style={{
                animationDelay: `${i * 0.1}s`,
                height: '100%',
              }}
            />
          ))}
        </div>
      )}
    </div>
  )
}
