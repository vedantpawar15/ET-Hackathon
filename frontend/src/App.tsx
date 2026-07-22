import React, { useEffect } from 'react'
import { Toaster } from 'react-hot-toast'
import { useAppStore } from '@/store'
import Sidebar from '@/components/Layout/Sidebar'
import Navbar from '@/components/Layout/Navbar'
import ChatView from '@/components/Chat/ChatView'
import GraphView from '@/components/Graph/GraphView'
import DocumentsView from '@/components/Documents/DocumentsView'
import ComplianceView from '@/components/Compliance/ComplianceView'

export default function App() {
  const { activeTab, fetchDocuments, fetchGraph } = useAppStore()

  useEffect(() => {
    fetchDocuments()
    fetchGraph()
  }, [])

  return (
    <div className="h-screen flex flex-col overflow-hidden">
      <Navbar />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar />
        <main className="flex-1 overflow-hidden">
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
            background: '#1e293b',
            color: '#f1f5f9',
            border: '1px solid rgba(255,255,255,0.08)',
            borderRadius: '12px',
          },
        }}
      />
    </div>
  )
}
