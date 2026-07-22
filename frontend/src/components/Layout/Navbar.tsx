import React, { useState } from 'react'
import { ChevronDown } from 'lucide-react'
import toast from 'react-hot-toast'

export default function Navbar() {
  const [model, setModel] = useState('Gemini 1.5 Flash')

  return (
    <header className="h-14 border-b border-zinc-200/80 bg-white/95 flex items-center justify-between px-6 flex-shrink-0 z-10">
      {/* Left: Model Selector Dropdown */}
      <div className="flex items-center gap-2">
        <div className="relative">
          <select
            value={model}
            onChange={(e) => {
              setModel(e.target.value)
              toast.success(`Switched LLM to ${e.target.value}`)
            }}
            className="appearance-none bg-transparent hover:bg-zinc-100/80 text-zinc-950 font-semibold text-sm pl-3 pr-8 py-1.5 rounded-lg cursor-pointer transition-colors outline-none flex items-center gap-1.5"
          >
            <option value="Gemini 1.5 Flash">Gemini 1.5 Flash</option>
            <option value="Voyage AI Embeddings">Voyage AI Embeddings</option>
            <option value="Local Embeddings Fallback">Local bge-large</option>
          </select>
          <div className="absolute inset-y-0 right-2 flex items-center pointer-events-none text-zinc-500">
            <ChevronDown size={14} />
          </div>
        </div>
        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" title="System online" />
      </div>

    </header>
  )
}
