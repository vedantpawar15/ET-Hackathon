import React, { useState, useRef, useEffect } from 'react'
import { Send, Trash2, Bot, User, Loader2 } from 'lucide-react'
import { useAppStore } from '@/store'
import { sendChat } from '@/api'
import type { ChatMessage, Citation } from '@/types'
import CitationChip from './CitationChip'
import ConfidenceBar from './ConfidenceBar'
import toast from 'react-hot-toast'

// uuid isn't installed — inline simple generator
function uid() {
  return Math.random().toString(36).slice(2) + Date.now().toString(36)
}

export default function ChatView() {
  const { messages, addMessage, clearMessages, filterDocId, documents, setHighlightedNodes, setActiveTab } =
    useAppStore()
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [activeCitation, setActiveCitation] = useState<Citation | null>(null)
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const handleSend = async () => {
    const q = input.trim()
    if (!q || loading) return

    const userMsg: ChatMessage = {
      id: uid(),
      role: 'user',
      content: q,
      timestamp: new Date(),
    }
    addMessage(userMsg)
    setInput('')
    setLoading(true)

    try {
      const res = await sendChat({ question: q, filter_doc_id: filterDocId ?? undefined })
      const assistantMsg: ChatMessage = {
        id: uid(),
        role: 'assistant',
        content: res.answer,
        citations: res.citations,
        confidence: res.confidence,
        timestamp: new Date(),
      }
      addMessage(assistantMsg)

      // Highlight cited entities in graph
      if (res.citations?.length) {
        // Simple heuristic: extract equipment names from answer
        const equipmentPattern = /\b([A-Z]-\d{3}|[A-Z]{1,4}-\d{2,4})\b/g
        const matches = [...(res.answer.matchAll(equipmentPattern))].map(m => m[1])
        if (matches.length) {
          // This triggers graph highlight — handled in graph view via store
          setHighlightedNodes(matches)
        }
      }
    } catch (err: any) {
      toast.error(err?.response?.data?.detail ?? 'Chat request failed.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-3 border-b border-white/[0.06] flex-shrink-0">
        <div>
          <h2 className="text-sm font-semibold text-slate-100">Expert Knowledge Copilot</h2>
          <p className="text-xs text-slate-500">RAG-powered Q&A over your industrial documents</p>
        </div>
        <div className="flex items-center gap-2">
          {filterDocId && (
            <span className="badge bg-brand-900/60 border border-brand-700/40 text-brand-300 text-xs">
              Filtered: {documents.find(d => d.id === filterDocId)?.filename.slice(0, 20)}…
            </span>
          )}
          {messages.length > 0 && (
            <button onClick={clearMessages} className="btn-ghost text-xs gap-1.5">
              <Trash2 size={13} />
              Clear
            </button>
          )}
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-center space-y-4 py-12">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-brand-600/30 to-purple-600/30 border border-brand-500/20 flex items-center justify-center">
              <Bot size={28} className="text-brand-400" />
            </div>
            <div>
              <h3 className="text-slate-300 font-semibold mb-1">Ask about your documents</h3>
              <p className="text-slate-500 text-sm max-w-sm">
                Try: "What are the maintenance requirements for Pump P-101?" or "What does OISD-105 say about hot work permits?"
              </p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 w-full max-w-lg">
              {[
                "What were the findings in the 2024 safety audit?",
                "What caused the compressor C-204 shutdown?",
                "What PPE is required for hot work near P-101?",
                "What are the confined space entry requirements for V-301?",
              ].map(q => (
                <button
                  key={q}
                  onClick={() => { setInput(q); }}
                  className="text-left text-xs px-3 py-2 rounded-lg glass-panel-light text-slate-400 hover:text-slate-200 hover:border-brand-600/40 transition-all duration-200"
                >
                  {q}
                </button>
              ))}
            </div>
          </div>
        )}

        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex gap-3 animate-slide-up ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}
          >
            {/* Avatar */}
            <div className={`w-7 h-7 rounded-full flex-shrink-0 flex items-center justify-center text-xs font-bold ${
              msg.role === 'user'
                ? 'bg-brand-700 text-brand-200'
                : 'bg-gradient-to-br from-purple-700 to-brand-700 text-white'
            }`}>
              {msg.role === 'user' ? <User size={13} /> : <Bot size={13} />}
            </div>

            {/* Bubble */}
            <div className={`max-w-[75%] space-y-2 ${msg.role === 'user' ? 'items-end' : 'items-start'} flex flex-col`}>
              <div className={`px-4 py-3 text-sm leading-relaxed ${msg.role === 'user' ? 'msg-user' : 'msg-assistant'}`}>
                {/* Parse citations in response text */}
                <MessageContent content={msg.content} citations={msg.citations} onCitationClick={setActiveCitation} />
              </div>

              {/* Citations row */}
              {msg.citations && msg.citations.length > 0 && (
                <div className="flex flex-wrap gap-1.5 px-1">
                  {msg.citations.map((c) => (
                    <CitationChip
                      key={c.index}
                      citation={c}
                      active={activeCitation?.index === c.index}
                      onClick={() => setActiveCitation(activeCitation?.index === c.index ? null : c)}
                    />
                  ))}
                </div>
              )}

              {/* Confidence */}
              {msg.confidence !== undefined && (
                <ConfidenceBar confidence={msg.confidence} />
              )}

              {/* Citation detail panel */}
              {activeCitation && msg.citations?.some(c => c.index === activeCitation.index) && (
                <div className="glass-panel p-3 text-xs space-y-1.5 max-w-sm animate-fade-in">
                  <div className="flex items-center gap-2">
                    <span className="badge bg-brand-900/50 text-brand-300 border border-brand-700/30">
                      Source {activeCitation.index}
                    </span>
                    <span className="text-slate-400 truncate">{activeCitation.doc_filename}</span>
                  </div>
                  {activeCitation.page_number && (
                    <p className="text-slate-500">Page {activeCitation.page_number}</p>
                  )}
                  <p className="text-slate-300 leading-relaxed border-l-2 border-brand-600/50 pl-2 italic">
                    "{activeCitation.excerpt}"
                  </p>
                  <p className="text-slate-600">Similarity: {(activeCitation.similarity * 100).toFixed(1)}%</p>
                </div>
              )}
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex gap-3 animate-fade-in">
            <div className="w-7 h-7 rounded-full bg-gradient-to-br from-purple-700 to-brand-700 flex items-center justify-center">
              <Bot size={13} className="text-white" />
            </div>
            <div className="msg-assistant px-4 py-3 flex items-center gap-2">
              <Loader2 size={14} className="animate-spin text-brand-400" />
              <span className="text-sm text-slate-400">Thinking…</span>
            </div>
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="flex-shrink-0 px-6 py-4 border-t border-white/[0.06]">
        <div className="flex gap-3">
          <textarea
            className="input resize-none min-h-[44px] max-h-32"
            rows={1}
            placeholder="Ask a question about your industrial documents…"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault()
                handleSend()
              }
            }}
          />
          <button
            onClick={handleSend}
            disabled={!input.trim() || loading}
            className="btn-primary flex-shrink-0 h-11 w-11 flex items-center justify-center p-0"
          >
            {loading ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
          </button>
        </div>
        <p className="text-[11px] text-slate-600 mt-1.5">Press Enter to send · Shift+Enter for new line</p>
      </div>
    </div>
  )
}

// Render message content with citation references highlighted
function MessageContent({
  content,
  citations,
  onCitationClick,
}: {
  content: string
  citations?: any[]
  onCitationClick: (c: any) => void
}) {
  if (!citations?.length) return <span className="whitespace-pre-wrap">{content}</span>

  // Replace [Source N] patterns with clickable spans
  const parts = content.split(/(\[Source \d+\])/g)
  return (
    <span className="whitespace-pre-wrap">
      {parts.map((part, i) => {
        const match = part.match(/\[Source (\d+)\]/)
        if (match) {
          const idx = parseInt(match[1])
          const cit = citations.find(c => c.index === idx)
          if (cit) {
            return (
              <span
                key={i}
                className="citation-chip"
                onClick={() => onCitationClick(cit)}
              >
                [{idx}]
              </span>
            )
          }
        }
        return <span key={i}>{part}</span>
      })}
    </span>
  )
}
