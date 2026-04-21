'use client'
import { useState, useEffect, useCallback } from 'react'
import { Search, BookOpen, Calendar, Building2, ChevronLeft, ChevronRight, FileText, ExternalLink } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import api from '@/lib/api'
import GlassCard from '@/components/GlassCard'

interface Case { id: string; case_name: string; date: string; year: number; court: string; word_count: number; url: string }
interface Stats { total_cases: number; courts: { name: string; count: number }[]; decades: { decade: string; count: number }[] }

export default function CasesPage() {
  const [cases, setCases] = useState<Case[]>([])
  const [stats, setStats] = useState<Stats | null>(null)
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [query, setQuery] = useState('')
  const [court, setCourt] = useState('')
  const [year, setYear] = useState('')
  const [loading, setLoading] = useState(false)
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [fullTexts, setFullTexts] = useState<Record<string, string>>({})
  const limit = 20

  useEffect(() => { api.get('/cases/stats').then(r => setStats(r.data)).catch(() => {}) }, [])

  const fetchCases = useCallback(async () => {
    setLoading(true)
    try {
      const params: Record<string, string | number> = { page, limit }
      if (query) params.q = query
      if (court) params.court = court
      if (year) params.year = parseInt(year)
      const r = await api.get('/cases', { params })
      setCases(r.data.cases)
      setTotal(r.data.total)
    } catch { setCases([]); setTotal(0) }
    finally { setLoading(false) }
  }, [page, query, court, year])

  useEffect(() => { fetchCases() }, [fetchCases])

  const handleSearch = (e: React.FormEvent) => { e.preventDefault(); setPage(1); fetchCases() }
  const totalPages = Math.ceil(total / limit)

  const toggleExpand = async (c: Case) => {
    if (expandedId === c.id) { setExpandedId(null); return }
    setExpandedId(c.id)
    if (!fullTexts[c.id]) {
      try {
        const r = await api.get(`/cases/${encodeURIComponent(c.id)}`)
        setFullTexts(prev => ({ ...prev, [c.id]: r.data.text }))
      } catch { setFullTexts(prev => ({ ...prev, [c.id]: 'Failed to load case text.' })) }
    }
  }

  return (
    <div className="section-container pt-28 pb-20">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-4xl font-bold mb-2"><span className="gradient-text">Case Library</span></h1>
        <p className="text-white/40 mb-8">Browse {stats ? stats.total_cases.toLocaleString() : '...'} Indian court cases across {stats ? stats.courts.length : '...'} courts</p>
      </motion.div>

      {/* Search & Filters */}
      <form onSubmit={handleSearch} className="mb-8">
        <div className="flex flex-col md:flex-row gap-3">
          <div className="flex-1 flex items-center gap-3 glass-card p-2">
            <Search className="w-5 h-5 text-white/30 ml-4" />
            <input value={query} onChange={e => { setQuery(e.target.value); setPage(1) }}
              placeholder="Search cases by name or content..."
              className="flex-1 bg-transparent px-3 py-3 text-white placeholder-white/25 focus:outline-none" />
          </div>
          <select value={court} onChange={e => { setCourt(e.target.value); setPage(1) }}
            className="glass-card px-4 py-3 bg-transparent text-white/70 focus:outline-none cursor-pointer appearance-none min-w-[180px]">
            <option value="" className="bg-navy-950">All Courts</option>
            {stats?.courts.map(c => (
              <option key={c.name} value={c.name} className="bg-navy-950">{c.name} ({c.count})</option>
            ))}
          </select>
          <select value={year} onChange={e => { setYear(e.target.value); setPage(1) }}
            className="glass-card px-4 py-3 bg-transparent text-white/70 focus:outline-none cursor-pointer appearance-none min-w-[140px]">
            <option value="" className="bg-navy-950">All Years</option>
            {stats?.decades.map(d => (
              <option key={d.decade} value={d.decade} className="bg-navy-950">{d.decade}s ({d.count})</option>
            ))}
          </select>
        </div>
      </form>

      {/* Results info */}
      <div className="flex items-center justify-between mb-6">
        <p className="text-sm text-white/30">
          {loading ? 'Loading...' : `${total.toLocaleString()} cases found · Page ${page} of ${totalPages || 1}`}
        </p>
      </div>

      {/* Case List */}
      <div className="space-y-4">
        <AnimatePresence mode="wait">
          {cases.map((c, i) => (
            <motion.div key={c.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }} transition={{ delay: i * 0.03 }}>
              <GlassCard className="overflow-hidden">
                <button onClick={() => toggleExpand(c)} className="w-full text-left p-6">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <h3 className="text-white/90 font-medium mb-2 line-clamp-2">{c.case_name || 'Untitled Case'}</h3>
                      <div className="flex flex-wrap gap-4 text-sm text-white/40">
                        <span className="flex items-center gap-1.5"><Building2 className="w-3.5 h-3.5" />{c.court || 'Unknown'}</span>
                        <span className="flex items-center gap-1.5"><Calendar className="w-3.5 h-3.5" />{c.date || c.year || '—'}</span>
                        <span className="flex items-center gap-1.5"><FileText className="w-3.5 h-3.5" />{c.word_count?.toLocaleString()} words</span>
                      </div>
                    </div>
                    <BookOpen className={`w-5 h-5 text-white/20 shrink-0 transition-transform ${expandedId === c.id ? 'rotate-12 text-blue-400' : ''}`} />
                  </div>
                </button>
                <AnimatePresence>
                  {expandedId === c.id && (
                    <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                      <div className="px-6 pb-6 border-t border-white/[0.06] pt-4">
                        <pre className="text-white/50 text-sm whitespace-pre-wrap max-h-96 overflow-y-auto leading-relaxed">
                          {fullTexts[c.id] || 'Loading...'}
                        </pre>
                        {c.url && (
                          <a href={c.url} target="_blank" rel="noopener noreferrer"
                            className="inline-flex items-center gap-1.5 mt-4 text-sm text-blue-400 hover:text-blue-300 transition-colors">
                            <ExternalLink className="w-3.5 h-3.5" />View on Indian Kanoon
                          </a>
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </GlassCard>
            </motion.div>
          ))}
        </AnimatePresence>
        {!loading && cases.length === 0 && (
          <div className="text-center py-20 text-white/20">
            <BookOpen className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>No cases found. Try adjusting your filters.</p>
          </div>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-4 mt-10">
          <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
            className="glass-card px-4 py-2 flex items-center gap-2 text-sm text-white/50 hover:text-white/80 disabled:opacity-30 disabled:cursor-not-allowed transition-colors">
            <ChevronLeft className="w-4 h-4" />Previous
          </button>
          <span className="text-sm text-white/40">{page} / {totalPages}</span>
          <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}
            className="glass-card px-4 py-2 flex items-center gap-2 text-sm text-white/50 hover:text-white/80 disabled:opacity-30 disabled:cursor-not-allowed transition-colors">
            Next<ChevronRight className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  )
}
