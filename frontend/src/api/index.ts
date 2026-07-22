import axios from 'axios'
import type { Document, ChatMessage, GraphData, ComplianceResult } from '@/types'

const api = axios.create({
  baseURL: '/api',
  timeout: 120000, // 2 min — LLM calls can be slow
})

// ── Documents ──────────────────────────────────────────────────────────────

export const uploadDocument = async (file: File): Promise<{ document: Document }> => {
  const form = new FormData()
  form.append('file', file)
  const res = await api.post('/documents/upload', form, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })
  return res.data
}

export const listDocuments = async (): Promise<{ documents: Document[] }> => {
  const res = await api.get('/documents')
  return res.data
}

export const getDocument = async (id: string): Promise<Document> => {
  const res = await api.get(`/documents/${id}`)
  return res.data
}

export const deleteDocument = async (id: string): Promise<void> => {
  await api.delete(`/documents/${id}`)
}

// ── Chat ───────────────────────────────────────────────────────────────────

export interface ChatRequest {
  question: string
  top_k?: number
  filter_doc_id?: string
}

export interface ChatResponse {
  answer: string
  citations: ChatMessage['citations']
  confidence: number
  retrieved_chunks: number
}

export const sendChat = async (req: ChatRequest): Promise<ChatResponse> => {
  const res = await api.post('/chat', req)
  return res.data
}

// ── Graph ──────────────────────────────────────────────────────────────────

export const getGraph = async (): Promise<GraphData> => {
  const res = await api.get('/graph')
  return res.data
}

// ── Compliance ─────────────────────────────────────────────────────────────

export const checkCompliance = async (
  regulation_doc_id: string,
  procedure_doc_id: string
): Promise<ComplianceResult> => {
  const res = await api.post('/compliance/check', { regulation_doc_id, procedure_doc_id })
  return res.data
}
