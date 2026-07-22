import React from 'react'
import { MessageSquare, Network, FileText, ShieldCheck, Upload } from 'lucide-react'
import { useAppStore } from '@/store'
import { useDropzone } from 'react-dropzone'
import toast from 'react-hot-toast'
import { uploadDocument } from '@/api'

const NAV_ITEMS = [
  { id: 'chat',       label: 'Expert Copilot',      icon: MessageSquare },
  { id: 'graph',      label: 'Knowledge Graph',      icon: Network },
  { id: 'documents',  label: 'Document Library',     icon: FileText },
  { id: 'compliance', label: 'Compliance Checker',   icon: ShieldCheck },
] as const

export default function Sidebar() {
  const { activeTab, setActiveTab, documents, addDocument, fetchDocuments } = useAppStore()

  const onDrop = async (files: File[]) => {
    for (const file of files) {
      if (!file.name.toLowerCase().endsWith('.pdf')) {
        toast.error(`${file.name} — only PDFs are supported.`)
        continue
      }
      const toastId = toast.loading(`Uploading ${file.name}…`)
      try {
        const res = await uploadDocument(file)
        addDocument(res.document)
        toast.success(`${file.name} ingested!`, { id: toastId })
      } catch (err: any) {
        toast.error(err?.response?.data?.detail ?? 'Upload failed', { id: toastId })
      }
    }
  }

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'application/pdf': ['.pdf'] },
    noClick: true,
  })

  return (
    <aside className="w-60 flex-shrink-0 border-r border-white/[0.06] flex flex-col overflow-hidden bg-surface-950/50">
      {/* Navigation */}
      <nav className="p-3 flex flex-col gap-1">
        {NAV_ITEMS.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setActiveTab(id)}
            className={`nav-tab ${activeTab === id ? 'active' : ''}`}
          >
            <Icon size={16} />
            <span>{label}</span>
          </button>
        ))}
      </nav>

      <div className="px-3">
        <div className="h-px bg-white/[0.06]" />
      </div>

      {/* Upload zone */}
      <div className="p-3 flex-1 overflow-hidden flex flex-col gap-3">
        <div
          {...getRootProps()}
          className={`
            border-2 border-dashed rounded-xl p-4 text-center transition-all duration-200 cursor-pointer
            ${isDragActive
              ? 'border-brand-500 bg-brand-500/10'
              : 'border-white/[0.10] hover:border-brand-600/60 hover:bg-white/[0.02]'
            }
          `}
          onClick={() => (document.getElementById('pdf-upload-input') as HTMLInputElement)?.click()}
        >
          <input id="pdf-upload-input" {...getInputProps()} />
          <Upload size={20} className={`mx-auto mb-2 ${isDragActive ? 'text-brand-400' : 'text-slate-500'}`} />
          <p className={`text-xs font-medium ${isDragActive ? 'text-brand-300' : 'text-slate-500'}`}>
            {isDragActive ? 'Drop PDFs here' : 'Drop or click to upload'}
          </p>
          <p className="text-[10px] text-slate-600 mt-0.5">PDF files only</p>
        </div>

        {/* Doc count */}
        <div className="glass-panel-light px-3 py-2 flex items-center justify-between">
          <span className="text-xs text-slate-500">Documents</span>
          <span className="text-xs font-bold text-brand-400">{documents.length}</span>
        </div>

        {/* Recent docs */}
        <div className="flex-1 overflow-y-auto space-y-1 min-h-0">
          {documents.slice(0, 15).map((doc) => (
            <div
              key={doc.id}
              className="flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-white/[0.04] transition-colors cursor-default"
            >
              <div className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${
                doc.status === 'ready' ? 'bg-emerald-400' :
                doc.status === 'error' ? 'bg-red-400' : 'bg-amber-400 animate-pulse'
              }`} />
              <span className="text-[11px] text-slate-400 truncate leading-tight">
                {doc.filename}
              </span>
            </div>
          ))}
        </div>
      </div>
    </aside>
  )
}
