import React, { useState } from 'react'
import { useAppStore } from '@/store'
import { FileText, Trash2, AlertCircle, CheckCircle, Clock, Eye } from 'lucide-react'
import { deleteDocument } from '@/api'
import toast from 'react-hot-toast'
import type { Document } from '@/types'

const DOC_TYPE_LABELS: Record<string, string> = {
  maintenance_log: 'Maintenance Log',
  safety_procedure: 'Safety Procedure',
  regulation: 'Regulation',
  incident_report: 'Incident Report',
  audit_report: 'Audit Report',
  general: 'General',
}

const DOC_TYPE_COLORS: Record<string, string> = {
  maintenance_log: 'bg-orange-900/40 text-orange-300 border-orange-700/40',
  safety_procedure: 'bg-blue-900/40 text-blue-300 border-blue-700/40',
  regulation: 'bg-purple-900/40 text-purple-300 border-purple-700/40',
  incident_report: 'bg-red-900/40 text-red-300 border-red-700/40',
  audit_report: 'bg-amber-900/40 text-amber-300 border-amber-700/40',
  general: 'bg-surface-800 text-slate-400 border-white/[0.08]',
}

function StatusIcon({ status }: { status: Document['status'] }) {
  if (status === 'ready') return <CheckCircle size={13} className="text-emerald-400" />
  if (status === 'error') return <AlertCircle size={13} className="text-red-400" />
  return <Clock size={13} className="text-amber-400 animate-pulse" />
}

function formatBytes(bytes: number) {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

export default function DocumentsView() {
  const { documents, removeDocument, setFilterDocId, filterDocId } = useAppStore()
  const [selectedDoc, setSelectedDoc] = useState<Document | null>(null)
  const [deleting, setDeleting] = useState<string | null>(null)

  const handleDelete = async (doc: Document) => {
    if (!confirm(`Delete "${doc.filename}"? This will remove all chunks and entities.`)) return
    setDeleting(doc.id)
    try {
      await deleteDocument(doc.id)
      removeDocument(doc.id)
      if (selectedDoc?.id === doc.id) setSelectedDoc(null)
      toast.success(`Deleted ${doc.filename}`)
    } catch {
      toast.error('Delete failed')
    } finally {
      setDeleting(null)
    }
  }

  return (
    <div className="h-full flex">
      {/* Document list */}
      <div className="w-96 flex-shrink-0 border-r border-white/[0.06] flex flex-col overflow-hidden">
        <div className="px-6 py-3 border-b border-white/[0.06] flex-shrink-0">
          <h2 className="text-sm font-semibold text-slate-100">Document Library</h2>
          <p className="text-xs text-slate-500">{documents.length} document{documents.length !== 1 ? 's' : ''} ingested</p>
        </div>

        <div className="flex-1 overflow-y-auto p-3 space-y-2">
          {documents.length === 0 && (
            <div className="flex flex-col items-center justify-center h-full text-center py-12">
              <FileText size={32} className="text-slate-700 mb-3" />
              <p className="text-slate-500 text-sm">No documents yet</p>
              <p className="text-slate-600 text-xs mt-1">Upload PDFs from the sidebar</p>
            </div>
          )}

          {documents.map((doc) => (
            <div
              key={doc.id}
              onClick={() => setSelectedDoc(doc)}
              className={`
                p-3 rounded-xl cursor-pointer transition-all duration-200 border
                ${selectedDoc?.id === doc.id
                  ? 'border-brand-600/50 bg-brand-900/20'
                  : 'border-white/[0.06] hover:border-white/[0.12] hover:bg-white/[0.02]'
                }
              `}
            >
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-surface-800 flex items-center justify-center flex-shrink-0">
                  <FileText size={15} className="text-brand-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-slate-200 font-medium truncate">{doc.filename}</p>
                  <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                    <span className={`badge border text-[10px] ${DOC_TYPE_COLORS[doc.doc_type] ?? DOC_TYPE_COLORS.general}`}>
                      {DOC_TYPE_LABELS[doc.doc_type] ?? doc.doc_type}
                    </span>
                    <span className="flex items-center gap-1 text-[10px] text-slate-600">
                      <StatusIcon status={doc.status} />
                      {doc.status}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 mt-1.5 text-[10px] text-slate-600">
                    {doc.page_count && <span>{doc.page_count} pages</span>}
                    {doc.file_size && <span>{formatBytes(doc.file_size)}</span>}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Detail / preview */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {selectedDoc ? (
          <>
            <div className="px-6 py-3 border-b border-white/[0.06] flex items-center justify-between flex-shrink-0">
              <div>
                <h3 className="text-sm font-semibold text-slate-100 truncate max-w-lg">{selectedDoc.filename}</h3>
                <p className="text-xs text-slate-500">
                  {new Date(selectedDoc.upload_date).toLocaleString()}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    setFilterDocId(filterDocId === selectedDoc.id ? null : selectedDoc.id)
                  }}
                  className={`btn-ghost text-xs gap-1.5 ${filterDocId === selectedDoc.id ? 'text-brand-400' : ''}`}
                >
                  <Eye size={13} />
                  {filterDocId === selectedDoc.id ? 'Unfilter Chat' : 'Filter Chat'}
                </button>
                <button
                  onClick={() => handleDelete(selectedDoc)}
                  disabled={deleting === selectedDoc.id}
                  className="btn-ghost text-xs text-red-400 hover:text-red-300 gap-1.5"
                >
                  <Trash2 size={13} />
                  Delete
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              {/* Metadata cards */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {[
                  { label: 'Type', value: DOC_TYPE_LABELS[selectedDoc.doc_type] ?? selectedDoc.doc_type },
                  { label: 'Status', value: selectedDoc.status },
                  { label: 'Pages', value: selectedDoc.page_count ?? '—' },
                  { label: 'Size', value: selectedDoc.file_size ? formatBytes(selectedDoc.file_size) : '—' },
                ].map(({ label, value }) => (
                  <div key={label} className="glass-panel p-3">
                    <p className="text-[10px] text-slate-600 uppercase tracking-wider mb-1">{label}</p>
                    <p className="text-sm text-slate-200 font-medium">{value}</p>
                  </div>
                ))}
              </div>

              {selectedDoc.error_msg && (
                <div className="flex items-start gap-2 p-3 bg-red-900/20 border border-red-700/30 rounded-lg text-sm text-red-300">
                  <AlertCircle size={15} className="flex-shrink-0 mt-0.5" />
                  <span>{selectedDoc.error_msg}</span>
                </div>
              )}

              <div className="glass-panel p-4">
                <p className="text-xs text-slate-500 mb-3 uppercase tracking-wider font-medium">Document ID</p>
                <code className="text-xs text-brand-400 font-mono">{selectedDoc.id}</code>
              </div>

              <div className="glass-panel p-4">
                <p className="text-xs text-slate-500 mb-2 uppercase tracking-wider font-medium">Uploaded</p>
                <p className="text-sm text-slate-300">
                  {new Date(selectedDoc.upload_date).toLocaleString('en-IN', {
                    dateStyle: 'long', timeStyle: 'short'
                  })}
                </p>
              </div>

              <div className="p-4 glass-panel-light text-center text-slate-500 text-sm">
                <Eye size={20} className="mx-auto mb-2 text-slate-600" />
                <p>PDF preview requires a running backend.</p>
                <p className="text-xs mt-1 text-slate-600">Use the chat to query this document, or filter chat to this document only.</p>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-center">
            <div>
              <FileText size={32} className="text-slate-700 mx-auto mb-3" />
              <p className="text-slate-500 text-sm">Select a document to view details</p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
