import React from 'react'

interface Props {
  confidence: number
}

const getColor = (v: number) => {
  if (v >= 0.75) return 'from-emerald-500 to-green-400'
  if (v >= 0.5)  return 'from-amber-500 to-yellow-400'
  return 'from-red-500 to-orange-400'
}

const getLabel = (v: number) => {
  if (v >= 0.75) return 'High'
  if (v >= 0.5)  return 'Medium'
  return 'Low'
}

export default function ConfidenceBar({ confidence }: Props) {
  const pct = Math.round(confidence * 100)
  return (
    <div className="flex items-center gap-2 px-1">
      <span className="text-[10px] text-slate-600 flex-shrink-0">Confidence</span>
      <div className="flex-1 h-1 bg-surface-800 rounded-full overflow-hidden">
        <div
          className={`confidence-bar ${getColor(confidence)}`}
          style={{ width: `${pct}%` }}
        />
      </div>
      <span className={`text-[10px] font-medium flex-shrink-0 ${
        confidence >= 0.75 ? 'text-emerald-400' :
        confidence >= 0.5 ? 'text-amber-400' : 'text-red-400'
      }`}>
        {getLabel(confidence)} ({pct}%)
      </span>
    </div>
  )
}
