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
