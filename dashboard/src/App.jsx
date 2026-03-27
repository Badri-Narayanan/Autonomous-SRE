import React from 'react'

export default function App() {
  return (
    <div className="min-h-screen bg-[#0d1117] text-gray-100 font-mono flex flex-col">
      <header className="border-b border-[#30363d] px-6 py-4 flex items-center gap-3">
        <span className="text-[#39ff14] text-xl font-bold">⬡</span>
        <h1 className="text-lg font-semibold tracking-widest uppercase text-gray-200">
          AutoSRE
        </h1>
        <span className="ml-auto text-xs text-gray-500">v0.1.0 — dashboard</span>
      </header>

      <main className="flex-1 flex items-center justify-center">
        <div className="text-center space-y-3">
          <p className="text-[#39ff14] text-sm tracking-widest uppercase">System Online</p>
          <p className="text-gray-500 text-xs">Waiting for incidents...</p>
        </div>
      </main>
    </div>
  )
}
