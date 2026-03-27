import React from 'react'
import { GitBranch } from 'lucide-react'

export default function DiffViewer({ diff, fileName = 'unknown', lineNumber = null }) {
  if (!diff) return null

  const lines = diff.split('\n')

  return (
    <div className="bg-slate-900 border border-slate-700 rounded overflow-hidden">
      <div className="flex items-center justify-between px-4 py-2 border-b border-slate-700 bg-slate-800">
        <div className="flex items-center gap-2">
          <GitBranch className="w-3 h-3 text-slate-400" />
          <span className="text-slate-400 font-mono text-xs tracking-widest uppercase">Diff Engine</span>
        </div>
        <span className="text-slate-500 font-mono text-xs">
          {fileName}{lineNumber ? ` @ line ${lineNumber}` : ''}
        </span>
      </div>
      <div className="p-4 overflow-x-auto text-sm font-mono" style={{ fontFamily: 'JetBrains Mono, Fira Code, monospace' }}>
        {lines.map((line, i) => {
          let cls = 'text-slate-300'
          let bg = ''
          if (line.startsWith('+') && !line.startsWith('+++')) {
            cls = 'text-emerald-300 font-semibold'
            bg = 'bg-emerald-500/20'
          } else if (line.startsWith('-') && !line.startsWith('---')) {
            cls = 'text-red-300 font-semibold'
            bg = 'bg-red-500/20'
          } else if (line.startsWith('@@')) {
            cls = 'text-blue-400'
            bg = 'bg-blue-500/10'
          } else if (line.startsWith('+++') || line.startsWith('---')) {
            cls = 'text-slate-400 font-bold'
          }

          return (
            <div key={i} className={`px-3 py-1 whitespace-pre ${bg}`}>
              <span className={cls}>{line || ' '}</span>
            </div>
          )
        })}
      </div>
    </div>
  )
}
