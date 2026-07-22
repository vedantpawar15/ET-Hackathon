import React, { useState } from 'react'
import { ShieldCheck, Loader2, AlertTriangle, CheckCircle, MinusCircle, HelpCircle } from 'lucide-react'
import { useAppStore } from '@/store'
import { checkCompliance } from '@/api'
import type { ComplianceResult } from '@/types'
import toast from 'react-hot-toast'

const STATUS_CONFIG = {
  compliant:    { icon: CheckCircle, color: 'text-emerald-400', bg: 'bg-emerald-900/20 border-emerald-700/30', label: 'Compliant' },
  non_compliant:{ icon: AlertTriangle, color: 'text-red-400', bg: 'bg-red-900/20 border-red-700/30', label: 'Non-Compliant' },
  partial:      { icon: MinusCircle, color: 'text-amber-400', bg: 'bg-amber-900/20 border-amber-700/30', label: 'Partial' },
  not_assessed: { icon: HelpCircle, color: 'text-slate-500', bg: 'bg-surface-800 border-white/[0.08]', label: 'Not Assessed' },
}

const SEVERITY_COLORS = {
  critical: 'text-red-400 bg-red-900/30 border-red-700/30',
  high:     'text-orange-400 bg-orange-900/30 border-orange-700/30',
  medium:   'text-amber-400 bg-amber-900/30 border-amber-700/30',
  low:      'text-slate-400 bg-surface-800 border-white/[0.08]',
}

export default function ComplianceView() {
  const { documents } = useAppStore()
  const [regDocId, setRegDocId] = useState('')
  const [procDocId, setProcDocId] = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<ComplianceResult | null>(null)

  const readyDocs = documents.filter(d => d.status === 'ready')

  const handleCheck = async () => {
    if (!regDocId || !procDocId) {
      toast.error('Select both a regulation and procedure document.')
      return
    }
    if (regDocId === procDocId) {
      toast.error('Select two different documents.')
      return
    }
    setLoading(true)
    setResult(null)
    try {
      const res = await checkCompliance(regDocId, procDocId)
      setResult(res)
    } catch (err: any) {
      toast.error(err?.response?.data?.detail ?? 'Compliance check failed.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="h-full flex flex-col">
      <div className="px-6 py-3 border-b border-white/[0.06] flex-shrink-0">
        <h2 className="text-sm font-semibold text-slate-100">Compliance Gap Checker</h2>
        <p className="text-xs text-slate-500">Compare a regulation against a procedure document using AI</p>
      </div>

      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        {/* Selector */}
        <div className="glass-panel p-5 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1.5">Regulation / Standard</label>
              <select
                value={regDocId}
                onChange={e => setRegDocId(e.target.value)}
                className="input"
              >
                <option value="">Select regulation document…</option>
                {readyDocs.map(d => (
                  <option key={d.id} value={d.id}>{d.filename}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1.5">Procedure / SOP</label>
              <select
                value={procDocId}
                onChange={e => setProcDocId(e.target.value)}
                className="input"
              >
                <option value="">Select procedure document…</option>
                {readyDocs.map(d => (
                  <option key={d.id} value={d.id}>{d.filename}</option>
                ))}
              </select>
            </div>
          </div>
          <button
            onClick={handleCheck}
            disabled={loading || !regDocId || !procDocId}
            className="btn-primary flex items-center gap-2"
          >
            {loading ? <Loader2 size={15} className="animate-spin" /> : <ShieldCheck size={15} />}
            {loading ? 'Analyzing…' : 'Run Compliance Check'}
          </button>
        </div>

        {/* Results */}
        {result && (
          <div className="space-y-4 animate-slide-up">
            {/* Summary */}
            <div className="glass-panel p-5">
              <h3 className="text-sm font-semibold text-slate-200 mb-4">
                {result.regulation_doc} → {result.procedure_doc}
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {[
                  { label: 'Total', value: result.summary.total, color: 'text-slate-200' },
                  { label: 'Compliant', value: result.summary.compliant, color: 'text-emerald-400' },
                  { label: 'Non-Compliant', value: result.summary.non_compliant, color: 'text-red-400' },
                  { label: 'Partial', value: result.summary.partial, color: 'text-amber-400' },
                ].map(({ label, value, color }) => (
                  <div key={label} className="glass-panel-light p-3 text-center">
                    <p className={`text-2xl font-bold ${color}`}>{value}</p>
                    <p className="text-[10px] text-slate-500 mt-0.5">{label}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Table */}
            <div className="glass-panel overflow-hidden">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-white/[0.06]">
                    <th className="text-left px-4 py-3 text-slate-500 font-medium w-[35%]">Requirement</th>
                    <th className="text-left px-4 py-3 text-slate-500 font-medium w-[15%]">Status</th>
                    <th className="text-left px-4 py-3 text-slate-500 font-medium w-[10%]">Severity</th>
                    <th className="text-left px-4 py-3 text-slate-500 font-medium">Evidence</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/[0.04]">
                  {result.compliance_items.map((item, i) => {
                    const cfg = STATUS_CONFIG[item.status] ?? STATUS_CONFIG.not_assessed
                    const Icon = cfg.icon
                    return (
                      <tr key={i} className="hover:bg-white/[0.02] transition-colors">
                        <td className="px-4 py-3 text-slate-300 leading-relaxed">{item.requirement}</td>
                        <td className="px-4 py-3">
                          <span className={`inline-flex items-center gap-1 badge border ${cfg.bg} ${cfg.color}`}>
                            <Icon size={10} />
                            {cfg.label}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <span className={`badge border text-[10px] ${SEVERITY_COLORS[item.severity] ?? SEVERITY_COLORS.low}`}>
                            {item.severity}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-slate-400 leading-relaxed">{item.evidence}</td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {!result && !loading && (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <ShieldCheck size={40} className="text-slate-700 mb-3" />
            <p className="text-slate-500 text-sm">Select two documents and run the compliance check</p>
            <p className="text-slate-600 text-xs mt-1">Powered by Gemini AI — compares requirements against procedures</p>
          </div>
        )}
      </div>
    </div>
  )
}
