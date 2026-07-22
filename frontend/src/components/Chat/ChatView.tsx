import React, { useState, useRef, useEffect } from 'react'
import { Trash2, Bot, User, Loader2, Plus, Globe, Atom, ArrowUp, ShieldCheck, Network, FileText } from 'lucide-react'
import { useAppStore } from '@/store'
import { sendChat } from '@/api'
import type { ChatMessage, Citation } from '@/types'
import CitationChip from './CitationChip'
import toast from 'react-hot-toast'

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

      if (res.citations?.length) {
        const equipmentPattern = /\b([A-Z]-\d{3}|[A-Z]{1,4}-\d{2,4})\b/g
        const matches = [...(res.answer.matchAll(equipmentPattern))].map(m => m[1])
        if (matches.length) {
          setHighlightedNodes(matches)
        }
      }
    } catch (err: any) {
      toast.error(err?.response?.data?.detail ?? 'Chat request failed.')
    } finally {
      setLoading(false)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  const hasMessages = messages.length > 0

  return (
    <div className="h-full flex flex-col bg-[#fcfcfc] relative overflow-hidden">
      {/* Background Watermark (Only visible when empty) */}
      {!hasMessages && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none z-0">
          <span className="text-[28rem] font-serif font-black text-zinc-100/50 leading-none">Z</span>
        </div>
      )}

      {/* Header bar (Only shown when there are messages to keep clean layout) */}
      {hasMessages && (
        <div className="flex items-center justify-between px-6 py-3 border-b border-zinc-200 flex-shrink-0 bg-white z-10">
          <div>
            <h2 className="text-sm font-semibold text-zinc-900">Expert Copilot</h2>
            <p className="text-[11px] text-zinc-500">RAG-powered Q&A over industrial documents</p>
          </div>
          <div className="flex items-center gap-2">
            {filterDocId && (
              <span className="badge bg-zinc-100 border border-zinc-200 text-zinc-700 text-xs">
                Filtered: {documents.find(d => d.id === filterDocId)?.filename.slice(0, 20)}…
              </span>
            )}
            <button onClick={clearMessages} className="btn-ghost text-xs flex items-center gap-1.5 py-1 px-2.5">
              <Trash2 size={13} />
              Clear Chat
            </button>
          </div>
        </div>
      )}

      {/* Main content body */}
      <div className="flex-1 overflow-y-auto z-10">
        {!hasMessages ? (
          /* Landing Screen (Matches chat.z.ai screenshot) */
          <div className="h-full flex flex-col items-center justify-center px-4 max-w-3xl mx-auto text-center space-y-6">
            <div className="space-y-2.5 animate-slide-up">
              <h1 className="text-[3.25rem] font-serif text-zinc-900 tracking-tight leading-tight select-none">
                What can I build for you?
              </h1>
              <p className="text-zinc-500 text-[14px] font-normal leading-normal max-w-lg mx-auto">
                Interact with z.ai and explore the document knowledge world
              </p>
            </div>

            {/* Input Card */}
            <div className="w-full max-w-2xl bg-white border border-zinc-200/90 shadow-sm rounded-2xl p-3 flex flex-col gap-2 focus-within:border-zinc-400 focus-within:shadow-md transition-all duration-200 mt-2">
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                rows={2}
                placeholder="How can I help today?"
                className="w-full border-none outline-none text-zinc-950 placeholder-zinc-400 resize-none min-h-[60px] bg-transparent text-sm leading-relaxed p-1"
              />
              
              <div className="flex items-center justify-between border-t border-zinc-100 pt-2.5 mt-1">
                {/* Action icons */}
                <div className="flex items-center gap-1">
                  <button 
                    type="button"
                    onClick={() => (document.getElementById('pdf-upload-input') as HTMLButtonElement)?.click()}
                    className="p-2 rounded-lg hover:bg-zinc-100 text-zinc-500 transition-colors"
                    title="Upload context file"
                  >
                    <Plus size={16} />
                  </button>
                  <button 
                    type="button"
                    onClick={() => toast.success('Web search feature is simulated')}
                    className="p-2 rounded-lg hover:bg-zinc-100 text-zinc-500 transition-colors"
                    title="Web search"
                  >
                    <Globe size={16} />
                  </button>
                  <button 
                    type="button"
                    onClick={() => toast.success('Deep Thinking mode enabled')}
                    className="p-2 rounded-lg hover:bg-zinc-100 text-blue-500 transition-colors"
                    title="Deep thought model"
                  >
                    <Atom size={16} />
                  </button>
                </div>

                {/* Send button */}
                <button
                  type="button"
                  onClick={handleSend}
                  disabled={!input.trim() || loading}
                  className={`
                    w-8 h-8 rounded-full flex items-center justify-center transition-all duration-200
                    ${input.trim() 
                      ? 'bg-zinc-900 text-white hover:bg-zinc-800' 
                      : 'bg-zinc-100 text-zinc-300'
                    }
                  `}
                >
                  <ArrowUp size={16} />
                </button>
              </div>
            </div>

            {/* Quick action buttons */}
            <div className="flex flex-wrap justify-center gap-2.5 max-w-lg mt-4 animate-slide-up" style={{ animationDelay: '0.1s' }}>
              {[
                { label: 'Compliance Checker', icon: ShieldCheck, tab: 'compliance' },
                { label: 'Knowledge Graph', icon: Network, tab: 'graph' },
                { label: 'Document Library', icon: FileText, tab: 'documents' },
              ].map(({ label, icon: Icon, tab }) => (
                <button
                  key={label}
                  type="button"
                  onClick={() => setActiveTab(tab as any)}
                  className="flex items-center gap-2 px-4 py-2 border border-zinc-200 bg-white hover:bg-zinc-50 rounded-xl text-zinc-700 text-xs font-semibold shadow-sm hover:border-zinc-300 transition-all duration-250 active:scale-95"
                >
                  <Icon size={14} className="text-zinc-500" />
                  {label}
                </button>
              ))}
            </div>
          </div>
        ) : (
          /* Message List view */
          <div className="max-w-3xl mx-auto px-6 py-6 space-y-6">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex gap-4 animate-slide-up ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}
              >
                {/* Avatar */}
                <div className={`w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center text-xs font-bold ${
                  msg.role === 'user'
                    ? 'bg-zinc-900 text-white'
                    : 'bg-zinc-100 border border-zinc-200 text-zinc-900'
                }`}>
                  {msg.role === 'user' ? <User size={14} /> : <Bot size={14} />}
                </div>

                {/* Bubble */}
                <div className={`max-w-[80%] space-y-2.5 ${msg.role === 'user' ? 'items-end' : 'items-start'} flex flex-col`}>
                  <div className={`px-4 py-3 text-sm leading-relaxed ${
                    msg.role === 'user' 
                      ? 'bg-zinc-900 text-white rounded-2xl rounded-tr-xs shadow-sm' 
                      : 'bg-zinc-100/90 border border-zinc-200/50 rounded-2xl rounded-tl-xs text-zinc-800 shadow-sm'
                  }`}>
                    <MessageContent content={msg.content} citations={msg.citations} onCitationClick={setActiveCitation} />
                  </div>

                  {/* Citations row */}
                  {(() => {
                    if (!msg.citations || msg.citations.length === 0) return null;
                    const bracketMatches = msg.content.match(/\[(.*?)\]/g) || [];
                    const usedIndices = new Set<number>();
                    bracketMatches.forEach(match => {
                      const nums = match.match(/\d+/g);
                      if (nums) nums.forEach(n => usedIndices.add(parseInt(n, 10)));
                    });
                    const usedCitations = msg.citations.filter(c => usedIndices.has(c.index));
                    
                    if (usedCitations.length === 0) return null;
                    
                    return (
                      <div className="flex flex-wrap gap-1.5 px-1">
                        {usedCitations.map((c) => (
                          <CitationChip
                            key={c.index}
                            citation={c}
                            active={activeCitation?.index === c.index}
                            onClick={() => setActiveCitation(activeCitation?.index === c.index ? null : c)}
                          />
                        ))}
                      </div>
                    )
                  })()}

                  {/* Citation details panel */}
                  {activeCitation && msg.citations?.some(c => c.index === activeCitation.index) && (
                    <div className="w-full max-w-md bg-white border border-zinc-200 rounded-xl p-3.5 text-xs space-y-2 shadow-sm animate-fade-in">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="badge bg-zinc-100 border border-zinc-200 text-zinc-700 text-[10px]">
                            Source {activeCitation.index}
                          </span>
                          <span className="text-zinc-500 font-medium truncate max-w-[200px]">{activeCitation.doc_filename}</span>
                        </div>
                        <span className="text-[10px] text-zinc-400">Match similarity: {(activeCitation.similarity * 100).toFixed(1)}%</span>
                      </div>
                      {activeCitation.page_number && (
                        <p className="text-zinc-400 font-medium">Page {activeCitation.page_number}</p>
                      )}
                      <p className="text-zinc-700 leading-relaxed border-l-2 border-zinc-400 pl-2.5 italic bg-zinc-50/50 py-1 pr-1.5 rounded-r">
                        "{activeCitation.excerpt}"
                      </p>
                    </div>
                  )}
                </div>
              </div>
            ))}

            {loading && (
              <div className="flex gap-4 animate-fade-in">
                <div className="w-8 h-8 rounded-full bg-zinc-100 border border-zinc-200 flex items-center justify-center">
                  <Bot size={14} className="text-zinc-900" />
                </div>
                <div className="bg-zinc-100/90 border border-zinc-200/50 rounded-2xl rounded-tl-xs px-4 py-3 flex items-center gap-2 shadow-sm">
                  <Loader2 size={14} className="animate-spin text-zinc-500" />
                  <span className="text-sm text-zinc-500 font-medium">Thinking…</span>
                </div>
              </div>
            )}

            <div ref={bottomRef} />
          </div>
        )}
      </div>

      {/* Floating Input Box at Bottom (Only shown when there are messages) */}
      {hasMessages && (
        <div className="flex-shrink-0 px-4 py-4 border-t border-zinc-200 bg-white">
          <div className="max-w-2xl mx-auto w-full bg-white border border-zinc-200 shadow-sm rounded-xl p-2.5 flex flex-col gap-1 focus-within:border-zinc-400 transition-all">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              rows={1}
              placeholder="Ask a question about your documents…"
              className="w-full border-none outline-none text-zinc-950 placeholder-zinc-400 resize-none min-h-[38px] max-h-32 bg-transparent text-sm p-1"
            />
            <div className="flex justify-between items-center pt-1 border-t border-zinc-100">
              <div className="text-[10px] text-zinc-400 font-medium pl-1">
                Press Enter to send · Shift+Enter for new line
              </div>
              <button
                type="button"
                onClick={handleSend}
                disabled={!input.trim() || loading}
                className={`
                  w-7 h-7 rounded-full flex items-center justify-center transition-all duration-200
                  ${input.trim() 
                    ? 'bg-zinc-900 text-white hover:bg-zinc-800' 
                    : 'bg-zinc-100 text-zinc-300'
                  }
                `}
              >
                {loading ? <Loader2 size={13} className="animate-spin" /> : <ArrowUp size={13} />}
              </button>
            </div>
          </div>
        </div>
      )}


    </div>
  )
}

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
                className="citation-chip inline-flex items-center gap-1 px-1.5 py-0.5 bg-zinc-200 border border-zinc-300/80 text-zinc-700 rounded text-[11px] font-mono cursor-pointer hover:bg-zinc-300 transition-all duration-150 mx-0.5"
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
