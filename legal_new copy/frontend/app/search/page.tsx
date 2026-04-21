'use client'
import { useState } from 'react'
import { Search as SearchIcon, Building2, Calendar, FileText, ChevronDown, ChevronUp } from 'lucide-react'
import { semanticSearch, SearchResult } from '@/lib/api'
import GlassCard from '@/components/GlassCard'

export default function SearchPage() {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<SearchResult[]>([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(false)
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [fullTexts, setFullTexts] = useState<Record<string, string>>({})

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!query.trim()) return
    setLoading(true)
    setExpandedId(null)
    try {
      const data = await semanticSearch({ query: query.trim(), limit: 20 })
      setResults(data.results)
      setTotal(data.total)
    } catch (err) { console.error(err) }
    finally { setLoading(false) }
  }

  const toggleExpand = async (r: SearchResult) => {
    if (expandedId === r.id) { setExpandedId(null); return }
    setExpandedId(r.id)
    if (!fullTexts[r.id]) {
      try {
        const res = await fetch(`http://localhost:8000/api/v1/documents/${encodeURIComponent(r.id)}`)
        const doc = await res.json()
        setFullTexts(prev => ({ ...prev, [r.id]: doc.text || r.snippet }))
      } catch { setFullTexts(prev => ({ ...prev, [r.id]: r.snippet })) }
    }
  }

  return (
    <div className="section-container pt-28 pb-20">
      <h1 className="text-4xl font-bold mb-2"><span className="gradient-text">Semantic Search</span></h1>
      <p className="text-white/40 mb-2">Search across legal documents using AI-powered semantic understanding</p>
      <p className="text-sm text-white/20 mb-8">Powered by BAAI/bge-large-en-v1.5 (1024-dim embeddings). Results are ranked by cosine similarity — higher % means closer semantic match to your query.</p>
      <form onSubmit={handleSearch} className="mb-10">
        <div className="flex items-center gap-3 glass-card p-2">
          <SearchIcon className="w-5 h-5 text-white/30 ml-4" />
          <input value={query} onChange={e => setQuery(e.target.value)}
            placeholder="Try: due process, privacy rights, first amendment, contract breach..."
            className="flex-1 bg-transparent px-3 py-3 text-white placeholder-white/25 focus:outline-none" />
          <button type="submit" disabled={loading} className="btn-primary px-6 py-3 text-sm">
            {loading ? 'Searching...' : 'Search'}
          </button>
        </div>
      </form>
      {total > 0 && <p className="text-sm text-white/30 mb-6">{total} documents in corpus · Showing top {results.length} results ranked by semantic relevance</p>}
      <div className="space-y-4">
        {results.map((r, i) => (
          <GlassCard key={i} className="overflow-hidden">
            <button onClick={() => toggleExpand(r)} className="w-full text-left p-6">
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1 mr-4">
                  <h3 className="text-lg font-semibold text-white">{r.case_name || 'Untitled'}</h3>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <span className="text-xs px-2.5 py-1 rounded-full bg-brand-500/10 text-brand-400">
                    {(r.relevance_score * 100).toFixed(0)}% match
                  </span>
                  {expandedId === r.id ? <ChevronUp className="w-4 h-4 text-white/30" /> : <ChevronDown className="w-4 h-4 text-white/30" />}
                </div>
              </div>
              <p className="text-sm text-white/40 mb-3 line-clamp-2">{r.snippet}</p>
              <div className="flex items-center gap-4 text-xs text-white/30">
                <span className="flex items-center gap-1"><Building2 className="w-3 h-3" />{r.court?.toUpperCase()}</span>
                {r.year && <span className="flex items-center gap-1"><Calendar className="w-3 h-3" />{r.year}</span>}
                <span className="flex items-center gap-1"><FileText className="w-3 h-3" />{r.id}</span>
                <span className="text-brand-400/60">Click to {expandedId === r.id ? 'collapse' : 'read full document'}</span>
              </div>
            </button>
            {expandedId === r.id && (
              <div className="border-t border-white/[0.06] p-6 bg-white/[0.01]">
                <div className="flex items-center gap-2 mb-4">
                  <FileText className="w-4 h-4 text-brand-400" />
                  <span className="text-sm font-medium text-brand-400">Full Document Text</span>
                </div>
                <div className="text-sm text-white/60 leading-relaxed whitespace-pre-wrap max-h-[600px] overflow-y-auto pr-4">
                  {fullTexts[r.id] || 'Loading...'}
                </div>
              </div>
            )}
          </GlassCard>
        ))}
      </div>
    </div>
  )
}
