import React, { useEffect, useRef, useCallback, useState } from 'react'
import ForceGraph2D from 'react-force-graph-2d'
import { useAppStore } from '@/store'
import { RefreshCw, Loader2, Info, ZoomIn, ZoomOut } from 'lucide-react'
import type { GraphNode, GraphLink } from '@/types'

const ENTITY_LABELS: Record<string, string> = {
  equipment:    'Equipment',
  person:       'Personnel',
  regulation:   'Regulation',
  location:     'Location',
  chemical:     'Chemical',
  date:         'Date/Event',
  organization: 'Organization',
  document:     'Document',
}

export default function GraphView() {
  const { graphData, graphLoading, highlightedNodes, fetchGraph } = useAppStore()
  const fgRef = useRef<any>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const [dimensions, setDimensions] = useState({ width: 800, height: 600 })
  const [hoveredNode, setHoveredNode] = useState<GraphNode | null>(null)
  const [selectedNode, setSelectedNode] = useState<GraphNode | null>(null)

  useEffect(() => {
    const obs = new ResizeObserver(entries => {
      const { width, height } = entries[0].contentRect
      setDimensions({ width, height })
    })
    if (containerRef.current) obs.observe(containerRef.current)
    return () => obs.disconnect()
  }, [])

  const nodeCanvasObject = useCallback(
    (node: any, ctx: CanvasRenderingContext2D, globalScale: number) => {
      const label = node.label as string
      const isHighlighted = highlightedNodes.has(node.label) || highlightedNodes.has(node.id)
      const isSelected = selectedNode?.id === node.id
      const isHovered = hoveredNode?.id === node.id
      const r = Math.max(4, Math.sqrt(node.val ?? 1) * 4)

      // Glow for highlighted nodes
      if (isHighlighted || isSelected) {
        ctx.beginPath()
        ctx.arc(node.x, node.y, r + 6, 0, 2 * Math.PI)
        ctx.fillStyle = isSelected ? 'rgba(79,99,243,0.35)' : 'rgba(250,204,21,0.25)'
        ctx.fill()
      }

      // Node circle
      ctx.beginPath()
      ctx.arc(node.x, node.y, r, 0, 2 * Math.PI)
      ctx.fillStyle = isHighlighted ? '#fbbf24' : (node.color as string) ?? '#94a3b8'
      ctx.fill()

      // Border
      ctx.strokeStyle = isSelected ? '#4f63f3' : isHovered ? '#cbd5e1' : 'rgba(255,255,255,0.15)'
      ctx.lineWidth = isSelected ? 2 : 1
      ctx.stroke()

      // Label
      const fontSize = Math.max(10, 12 / globalScale)
      ctx.font = `${isHighlighted ? '600' : '400'} ${fontSize}px Inter, sans-serif`
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'
      ctx.fillStyle = isHighlighted ? '#fef08a' : isHovered ? '#f1f5f9' : '#94a3b8'
      ctx.fillText(label.length > 20 ? label.slice(0, 18) + '…' : label, node.x, node.y + r + fontSize)
    },
    [highlightedNodes, selectedNode, hoveredNode]
  )

  const linkColor = useCallback(
    (link: any) => {
      const src = typeof link.source === 'object' ? link.source.id : link.source
      const tgt = typeof link.target === 'object' ? link.target.id : link.target
      if (
        (selectedNode && (src === selectedNode.id || tgt === selectedNode.id)) ||
        (hoveredNode && (src === hoveredNode.id || tgt === hoveredNode.id))
      ) {
        return 'rgba(79,99,243,0.8)'
      }
      return 'rgba(148,163,184,0.18)'
    },
    [selectedNode, hoveredNode]
  )

  if (graphLoading) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center space-y-3">
          <Loader2 size={32} className="animate-spin text-brand-500 mx-auto" />
          <p className="text-slate-400 text-sm">Building knowledge graph…</p>
        </div>
      </div>
    )
  }

  const hasData = graphData && graphData.nodes.length > 0

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-3 border-b border-white/[0.06] flex-shrink-0">
        <div>
          <h2 className="text-sm font-semibold text-slate-100">Knowledge Graph</h2>
          <p className="text-xs text-slate-500">Entity relationships extracted from your documents</p>
        </div>
        <div className="flex items-center gap-3">
          {graphData?.stats && (
            <div className="flex items-center gap-3 text-xs text-slate-500">
              <span><span className="text-slate-300 font-medium">{graphData.stats.total_nodes}</span> nodes</span>
              <span><span className="text-slate-300 font-medium">{graphData.stats.total_edges}</span> edges</span>
            </div>
          )}
          <button onClick={fetchGraph} className="btn-ghost text-xs gap-1.5">
            <RefreshCw size={13} className={graphLoading ? 'animate-spin' : ''} />
            Refresh
          </button>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Graph canvas */}
        <div ref={containerRef} className="flex-1 relative">
          {hasData ? (
            <ForceGraph2D
              ref={fgRef}
              width={dimensions.width}
              height={dimensions.height}
              graphData={graphData}
              nodeCanvasObject={nodeCanvasObject}
              nodeCanvasObjectMode={() => 'replace'}
              linkColor={linkColor}
              linkWidth={(link: any) => (link.weight ?? 1) * 1.5}
              linkDirectionalParticles={2}
              linkDirectionalParticleWidth={2}
              linkDirectionalParticleColor={() => 'rgba(79,99,243,0.6)'}
              backgroundColor="transparent"
              onNodeClick={(node: any) =>
                setSelectedNode(selectedNode?.id === node.id ? null : node)
              }
              onNodeHover={(node: any) => setHoveredNode(node)}
              cooldownTicks={100}
              d3AlphaDecay={0.02}
              d3VelocityDecay={0.3}
            />
          ) : (
            <div className="h-full flex items-center justify-center">
              <div className="text-center space-y-3">
                <Info size={32} className="text-slate-600 mx-auto" />
                <p className="text-slate-400 text-sm">No graph data yet</p>
                <p className="text-slate-600 text-xs">Upload documents to build the knowledge graph</p>
              </div>
            </div>
          )}
        </div>

        {/* Side panel */}
        <div className="w-56 flex-shrink-0 border-l border-white/[0.06] p-4 space-y-4 overflow-y-auto">
          {/* Legend */}
          <div>
            <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Legend</h3>
            <div className="space-y-1.5">
              {Object.entries(ENTITY_LABELS).map(([type, label]) => (
                <div key={type} className="flex items-center gap-2">
                  <div
                    className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                    style={{ backgroundColor: getEntityColor(type) }}
                  />
                  <span className="text-xs text-slate-500">{label}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="h-px bg-white/[0.06]" />

          {/* Selected node detail */}
          {selectedNode && (
            <div className="animate-fade-in">
              <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Selected</h3>
              <div className="glass-panel-light p-3 space-y-2">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: selectedNode.color }} />
                  <span className="text-sm font-medium text-slate-100">{selectedNode.label}</span>
                </div>
                <div>
                  <span className="badge bg-surface-800 text-slate-400 border border-white/[0.08]">
                    {ENTITY_LABELS[selectedNode.entity_type] ?? selectedNode.entity_type}
                  </span>
                </div>
                <p className="text-xs text-slate-500 truncate">{selectedNode.doc_filename}</p>
              </div>
            </div>
          )}

          {/* Highlighted */}
          {highlightedNodes.size > 0 && (
            <div className="animate-fade-in">
              <h3 className="text-xs font-semibold text-amber-400 uppercase tracking-wider mb-2">Chat Highlights</h3>
              <div className="space-y-1">
                {[...highlightedNodes].map(n => (
                  <div key={n} className="text-xs px-2 py-1 bg-amber-900/20 border border-amber-700/30 rounded-md text-amber-300">
                    {n}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function getEntityColor(type: string): string {
  const colors: Record<string, string> = {
    equipment:    '#f97316',
    person:       '#3b82f6',
    regulation:   '#8b5cf6',
    location:     '#10b981',
    chemical:     '#ef4444',
    date:         '#6b7280',
    organization: '#f59e0b',
    document:     '#06b6d4',
  }
  return colors[type] ?? '#94a3b8'
}
