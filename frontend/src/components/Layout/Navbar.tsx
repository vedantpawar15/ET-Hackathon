import React from 'react'
import { BrainCircuit, Zap } from 'lucide-react'

export default function Navbar() {
  return (
    <header className="h-14 border-b border-white/[0.06] glass-panel rounded-none flex items-center px-6 gap-3 flex-shrink-0 z-10">
      <div className="flex items-center gap-2.5">
        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-brand-500 to-purple-600 flex items-center justify-center shadow-lg shadow-brand-900/50">
          <BrainCircuit className="w-4.5 h-4.5 text-white" size={18} />
        </div>
        <div>
          <h1 className="text-sm font-bold text-slate-100 leading-none">
            Industrial Knowledge Intelligence
          </h1>
          <p className="text-[10px] text-slate-500 leading-none mt-0.5">
            ET AI Hackathon 2026
          </p>
        </div>
      </div>

      <div className="ml-auto flex items-center gap-2">
        <span className="flex items-center gap-1.5 text-xs text-emerald-400 bg-emerald-400/10 border border-emerald-400/20 px-2.5 py-1 rounded-full">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          RAG Active
        </span>
        <span className="flex items-center gap-1.5 text-xs text-brand-400 bg-brand-400/10 border border-brand-400/20 px-2.5 py-1 rounded-full">
          <Zap size={10} />
          Gemini 1.5
        </span>
      </div>
    </header>
  )
}
