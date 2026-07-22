export interface Document {
  id: string
  filename: string
  doc_type: string
  upload_date: string
  page_count: number | null
  file_size: number
  status: 'processing' | 'ready' | 'error'
  error_msg?: string
  chunk_count?: number
}

export interface Citation {
  index: number
  doc_filename: string
  document_id: string
  page_number: number | null
  chunk_index: number
  excerpt: string
  similarity: number
}

export interface ChatMessage {
  id: string
  role: 'user' | 'assistant'
  content: string
  citations?: Citation[]
  confidence?: number
  timestamp: Date
}

export interface GraphNode {
  id: string
  label: string
  entity_type: string
  color: string
  document_id: string | null
  doc_filename: string
  val: number
  // runtime fields added by force-graph
  x?: number
  y?: number
  vx?: number
  vy?: number
  fx?: number | null
  fy?: number | null
}

export interface GraphLink {
  id: string
  source: string | GraphNode
  target: string | GraphNode
  relationship_type: string
  label: string
  document_id: string | null
  doc_filename: string
  weight: number
}

export interface GraphData {
  nodes: GraphNode[]
  links: GraphLink[]
  stats: {
    total_nodes: number
    total_edges: number
    connected_components: number
  }
}

export interface ComplianceItem {
  requirement: string
  status: 'compliant' | 'non_compliant' | 'partial' | 'not_assessed'
  evidence: string
  severity: 'critical' | 'high' | 'medium' | 'low'
}

export interface ComplianceResult {
  regulation_doc: string
  procedure_doc: string
  compliance_items: ComplianceItem[]
  summary: {
    total: number
    compliant: number
    non_compliant: number
    partial: number
  }
}
