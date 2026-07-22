import React, { useState } from 'react'
import { MessageSquare, Network, FileText, ShieldCheck, Upload, PanelLeftClose, PanelLeft, Plus, LogIn, LogOut } from 'lucide-react'
import { useAppStore } from '@/store'
import { supabase } from '@/lib/supabase'
import { useDropzone } from 'react-dropzone'
import toast from 'react-hot-toast'
import { uploadDocument } from '@/api'

export default function Sidebar() {
  const { activeTab, setActiveTab, documents, addDocument, clearMessages, session, setSession, setSkipAuth } = useAppStore()
  const [isCollapsed, setIsCollapsed] = useState(false)

  const handleSignOut = async () => {
    try {
      await supabase.auth.signOut()
      setSession(null)
      setSkipAuth(false)
      toast.success('Signed out successfully')
    } catch {
      toast.error('Failed to sign out')
    }
  }

  const NAV_ITEMS = [
    { id: 'chat',       label: isCollapsed ? '' : 'Chat',               icon: MessageSquare },
    { id: 'compliance', label: isCollapsed ? '' : 'Agent',              icon: ShieldCheck },
    { id: 'graph',      label: isCollapsed ? '' : 'Knowledge Graph',    icon: Network },
    { id: 'documents',  label: isCollapsed ? '' : 'Document Library',   icon: FileText },
  ] as const

  const onDrop = async (files: File[]) => {
    for (const file of files) {
      const lowerName = file.name.toLowerCase()
      if (!lowerName.endsWith('.pdf') && !lowerName.endsWith('.doc') && !lowerName.endsWith('.docx') && !lowerName.endsWith('.xls') && !lowerName.endsWith('.xlsx')) {
        toast.error(`${file.name} — unsupported file type.`)
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
    accept: { 
      'application/pdf': ['.pdf'],
      'application/msword': ['.doc'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
      'application/vnd.ms-excel': ['.xls'],
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx']
    },
    noClick: true,
  })

  return (
    <aside 
      className={`
        flex-shrink-0 border-r border-zinc-200 bg-[#f4f4f5] flex flex-col justify-between overflow-hidden transition-all duration-300 h-full
        ${isCollapsed ? 'w-16' : 'w-60'}
      `}
      {...getRootProps()}
    >
      <input id="pdf-upload-input" {...getInputProps()} />
      
      <div className="flex flex-col flex-1 overflow-hidden">
        {/* Logo and Collapse Toggle */}
        <div className="p-3.5 flex items-center justify-between border-b border-zinc-200/50">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded bg-zinc-900 flex items-center justify-center text-white font-extrabold text-lg select-none">
              H
            </div>
            {!isCollapsed && (
              <span className="font-serif font-bold text-zinc-900 tracking-tight text-sm">Helper AI</span>
            )}
          </div>
          <button 
            type="button"
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="p-1.5 rounded-md hover:bg-zinc-200 text-zinc-600 transition-colors"
          >
            {isCollapsed ? <PanelLeft size={16} /> : <PanelLeftClose size={16} />}
          </button>
        </div>

        {/* Navigation Tabs */}
        <nav className="p-2 flex flex-col gap-1">
          {NAV_ITEMS.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              type="button"
              onClick={() => setActiveTab(id)}
              title={isCollapsed ? (id === 'compliance' ? 'Agent' : id) : ''}
              className={`
                flex items-center gap-3 p-2.5 rounded-lg text-sm font-medium transition-colors w-full text-left
                ${activeTab === id 
                  ? 'bg-zinc-200 text-zinc-950 font-semibold shadow-sm' 
                  : 'text-zinc-600 hover:text-zinc-950 hover:bg-zinc-200/50'
                }
              `}
            >
              <Icon size={18} className="flex-shrink-0" />
              {!isCollapsed && <span>{label}</span>}
            </button>
          ))}
        </nav>

        {/* New Chat Button */}
        <div className="p-2">
          <button
            type="button"
            onClick={() => {
              setActiveTab('chat')
              clearMessages()
              toast.success('Started a new chat session')
            }}
            className={`
              flex items-center gap-3 p-2.5 rounded-lg text-sm font-medium transition-colors w-full text-left border border-dashed border-zinc-300 hover:border-zinc-500
              ${isCollapsed ? 'justify-center border-none' : ''}
              text-zinc-600 hover:text-zinc-950 hover:bg-zinc-200/50
            `}
            title={isCollapsed ? 'New Chat' : ''}
          >
            <Plus size={18} className="flex-shrink-0" />
            {!isCollapsed && <span>New Chat</span>}
          </button>
        </div>

        {/* Upload Zone / Document Count (Only visible when expanded) */}
        {!isCollapsed && (
          <div className="p-3 flex-1 flex flex-col justify-end gap-3 overflow-hidden">
            <div
              className={`
                border border-dashed rounded-lg p-3 text-center transition-all duration-200 cursor-pointer bg-white/50
                ${isDragActive
                  ? 'border-zinc-900 bg-zinc-100'
                  : 'border-zinc-300 hover:border-zinc-500 hover:bg-zinc-100/50'
                }
              `}
              onClick={() => (document.getElementById('pdf-upload-input') as HTMLInputElement)?.click()}
            >
              <Upload size={16} className="mx-auto mb-1 text-zinc-500" />
              <p className="text-[10px] font-medium text-zinc-600">
                {isDragActive ? 'Drop files here' : 'Click to Upload Doc'}
              </p>
            </div>
            
            <div className="flex items-center justify-between text-[11px] text-zinc-500 px-1">
              <span>Ingested</span>
              <span className="font-semibold text-zinc-900">{documents.length} docs</span>
            </div>
          </div>
        )}
      </div>

      {/* User Login Button / Profile at the bottom */}
      <div className="p-3 border-t border-zinc-200/80">
        {session ? (
          <button 
            type="button"
            onClick={handleSignOut}
            className={`
              flex items-center gap-3 p-2 rounded-lg text-xs font-medium text-zinc-600 hover:text-zinc-950 hover:bg-zinc-200/50 w-full transition-colors
              ${isCollapsed ? 'justify-center' : ''}
            `}
            title={isCollapsed ? 'Sign out' : ''}
          >
            <LogOut size={16} className="flex-shrink-0 text-red-500" />
            {!isCollapsed && <span className="truncate flex-1 text-left text-zinc-700">{session.user.email} <span className="text-zinc-400">(Sign out)</span></span>}
          </button>
        ) : (
          <button 
            type="button"
            onClick={() => {
              setSkipAuth(false)
            }}
            className={`
              flex items-center gap-3 p-2 rounded-lg text-xs font-medium text-zinc-600 hover:text-zinc-950 hover:bg-zinc-200/50 w-full transition-colors
              ${isCollapsed ? 'justify-center' : ''}
            `}
            title={isCollapsed ? 'Sign in' : ''}
          >
            <LogIn size={16} className="flex-shrink-0" />
            {!isCollapsed && <span>Sign in</span>}
          </button>
        )}
      </div>
    </aside>
  )
}
