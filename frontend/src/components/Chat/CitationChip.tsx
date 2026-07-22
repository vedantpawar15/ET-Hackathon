import React from 'react'
import type { Citation } from '@/types'
import { FileText } from 'lucide-react'

interface Props {
  citation: Citation
  active: boolean
  onClick: () => void
}

export default function CitationChip({ citation, active, onClick }: Props) {
  return (
    <button
      onClick={onClick}
      className={`
        inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium
        transition-all duration-150 border
        ${active
          ? 'bg-brand-700/60 border-brand-500/60 text-brand-200'
          : 'bg-surface-800/80 border-white/[0.08] text-slate-400 hover:text-slate-200 hover:border-brand-600/40'
        }
      `}
    >
      <FileText size={10} />
      <span className="font-mono text-[11px]">[{citation.index}]</span>
      <span className="max-w-[120px] truncate">{citation.doc_filename}</span>
      {citation.page_number && (
        <span className="text-slate-500">p.{citation.page_number}</span>
      )}
    </button>
  )
}
