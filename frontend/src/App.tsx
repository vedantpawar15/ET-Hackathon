import React, { useEffect, useState } from 'react'
import { Toaster } from 'react-hot-toast'
import { useAppStore } from '@/store'
import { supabase } from '@/lib/supabase'
import Sidebar from '@/components/Layout/Sidebar'
import Navbar from '@/components/Layout/Navbar'
import ChatView from '@/components/Chat/ChatView'
import GraphView from '@/components/Graph/GraphView'
import DocumentsView from '@/components/Documents/DocumentsView'
import ComplianceView from '@/components/Compliance/ComplianceView'
import AuthView from '@/components/Auth/AuthView'

export default function App() {
  const { activeTab, fetchDocuments, fetchGraph, session, setSession, skipAuth, documents } = useAppStore()
  const [initializing, setInitializing] = useState(true)

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      setInitializing(false)
    })

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event: any, session: any) => {
      setSession(session)
    })

    return () => subscription.unsubscribe()
  }, [setSession])

  useEffect(() => {
    if (session || skipAuth) {
      fetchDocuments()
      fetchGraph()
    }
  }, [session, skipAuth, fetchDocuments, fetchGraph])

  // Poll for document status updates if any document is processing
  useEffect(() => {
    const hasProcessing = documents.some((doc) => doc.status === 'processing')
    if (!hasProcessing) return

    const interval = setInterval(() => {
      fetchDocuments()
      fetchGraph()
    }, 4000)

    return () => clearInterval(interval)
  }, [documents, fetchDocuments, fetchGraph])

  if (initializing) {
    return <div className="h-screen w-screen flex items-center justify-center bg-zinc-50/30"></div>
  }

  if (!session && !skipAuth) {
    return (
      <>
        <AuthView />
        <Toaster
          position="bottom-right"
          toastOptions={{
            style: {
              background: '#18181b',
              color: '#fafafa',
              border: '1px solid rgba(0,0,0,0.08)',
              borderRadius: '12px',
            },
          }}
        />
      </>
    )
  }

  return (
    <div className="h-screen w-screen flex overflow-hidden bg-zinc-50/30">
      {/* Full-height Sidebar on the Left */}
      <Sidebar />

      {/* Right container for Header + Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <Navbar />
        <main className="flex-1 overflow-hidden bg-white relative">
          {activeTab === 'chat' && <ChatView />}
          {activeTab === 'graph' && <GraphView />}
          {activeTab === 'documents' && <DocumentsView />}
          {activeTab === 'compliance' && <ComplianceView />}
        </main>
      </div>

      <Toaster
        position="bottom-right"
        toastOptions={{
          style: {
            background: '#18181b',
            color: '#fafafa',
            border: '1px solid rgba(0,0,0,0.08)',
            borderRadius: '12px',
          },
        }}
      />
    </div>
  )
}
