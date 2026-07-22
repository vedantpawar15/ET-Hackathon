import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { ChatMessage, Document, GraphData, GraphNode } from '@/types'
import type { Session } from '@supabase/supabase-js'
import { listDocuments, getGraph } from '@/api'

interface AppState {
  // Auth
  session: Session | null
  setSession: (session: Session | null) => void
  skipAuth: boolean
  setSkipAuth: (skip: boolean) => void

  // Sidebar / nav
  activeTab: 'chat' | 'graph' | 'documents' | 'compliance'
  setActiveTab: (tab: AppState['activeTab']) => void

  // Documents
  documents: Document[]
  documentsLoading: boolean
  fetchDocuments: () => Promise<void>
  addDocument: (doc: Document) => void
  removeDocument: (id: string) => void

  // Chat
  messages: ChatMessage[]
  addMessage: (msg: ChatMessage) => void
  clearMessages: () => void

  // Graph
  graphData: GraphData | null
  graphLoading: boolean
  highlightedNodes: Set<string>
  fetchGraph: () => Promise<void>
  setHighlightedNodes: (nodeIds: string[]) => void

  // Selected document for filtering
  filterDocId: string | null
  setFilterDocId: (id: string | null) => void
}

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
  session: null,
  setSession: (session) => set({ session }),
  skipAuth: false,
  setSkipAuth: (skipAuth) => set({ skipAuth }),

  activeTab: 'chat',
  setActiveTab: (tab) => set({ activeTab: tab }),

  documents: [],
  documentsLoading: false,
  fetchDocuments: async () => {
    set({ documentsLoading: true })
    try {
      const res = await listDocuments()
      set({ documents: res.documents })
    } catch (e) {
      console.error('Failed to fetch documents', e)
    } finally {
      set({ documentsLoading: false })
    }
  },
  addDocument: (doc) =>
    set((s) => ({ documents: [doc, ...s.documents] })),
  removeDocument: (id) =>
    set((s) => ({ documents: s.documents.filter((d) => d.id !== id) })),

  messages: [],
  addMessage: (msg) =>
    set((s) => ({ messages: [...s.messages, msg] })),
  clearMessages: () => set({ messages: [] }),

  graphData: null,
  graphLoading: false,
  highlightedNodes: new Set(),
  fetchGraph: async () => {
    set({ graphLoading: true })
    try {
      const data = await getGraph()
      set({ graphData: data })
    } catch (e) {
      console.error('Failed to fetch graph', e)
    } finally {
      set({ graphLoading: false })
    }
  },
  setHighlightedNodes: (ids) =>
    set({ highlightedNodes: new Set(ids) }),

  filterDocId: null,
  setFilterDocId: (id) => set({ filterDocId: id }),
    }),
    {
      name: 'chat-storage',
      partialize: (state) => ({ messages: state.messages }),
    }
  )
)
