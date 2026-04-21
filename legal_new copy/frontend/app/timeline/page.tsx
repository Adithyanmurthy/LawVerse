'use client'
import { useState, useEffect } from 'react'
import { listConcepts, getEvolutionTimeline, ConceptResponse, EvolutionTimeline } from '@/lib/api'
import GlassCard from '@/components/GlassCard'
import { Clock, TrendingUp, TrendingDown, Minus, ArrowRight, Info } from 'lucide-react'

const driftInfo: Record<string, { color: string; bg: string; icon: any; meaning: string }> = {
  STABLE: { color: 'text-emerald-400', bg: 'bg-emerald-500/10', icon: Minus, meaning: 'The concept\'s legal meaning has remained consistent — courts interpret it similarly across these periods.' },
  EXPANSION: { color: 'text-blue-400', bg: 'bg-blue-500/10', icon: TrendingUp, meaning: 'The concept\'s scope has broadened — courts are applying it to new areas or interpreting it more broadly than before.' },
  CONTRACTION: { color: 'text-amber-400', bg: 'bg-amber-500/10', icon: TrendingDown, meaning: 'The concept\'s scope has narrowed — courts are restricting its application or interpreting it more narrowly.' },
  BIFURCATION: { color: 'text-purple-400', bg: 'bg-purple-500/10', icon: TrendingUp, meaning: 'The concept has split into multiple distinct meanings — different courts or contexts now use it differently.' },
  MERGER: { color: 'text-red-400', bg: 'bg-red-500/10', icon: TrendingDown, meaning: 'Previously distinct meanings of this concept have converged into a unified interpretation.' },
}

function smiExplanation(score: number): string {
  if (score < 0.05) return 'Almost no semantic change detected between these periods.'
  if (score < 0.1) return 'Very minor semantic shift — the concept is largely stable.'
  if (score < 0.2) return 'Noticeable semantic movement — the concept is evolving.'
  if (score < 0.4) return 'Significant semantic shift — the concept\'s meaning is changing substantially.'
  return 'Major semantic transformation — the concept\'s meaning has fundamentally changed.'
}

export default function TimelinePage() {
  const [concepts, setConcepts] = useState<ConceptResponse[]>([])
  const [selected, setSelected] = useState('')
  const [data, setData] = useState<EvolutionTimeline | null>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => { listConcepts().then(setConcepts).catch(console.error) }, [])
  useEffect(() => {
    if (!selected) return
    setLoading(true)
    getEvolutionTimeline(selected).then(setData).catch(console.error).finally(() => setLoading(false))
  }, [selected])

  const di = data ? (driftInfo[data.overall_drift] || driftInfo.STABLE) : driftInfo.STABLE

  return (
    <div className="section-container pt-28 pb-20">
      <h1 className="text-4xl font-bold mb-2"><span className="gradient-text">Evolution Timeline</span></h1>
      <p className="text-white/40 mb-2">Track how legal concepts change meaning over time using the Semantic Movement Index (SMI)</p>
      <div className="glass-card p-4 mb-8 flex items-start gap-3">
        <Info className="w-5 h-5 text-brand-400 flex-shrink-0 mt-0.5" />
        <p className="text-sm text-white/40">The SMI measures semantic distance between how a concept is used in different time periods. A score of 0 means identical usage; closer to 1 means the meaning has changed dramatically. Scores are computed using LexLM legal-roberta-large (355M params) embeddings across court documents.</p>
      </div>
      <div className="flex flex-wrap gap-2 mb-8">
        {concepts.map(c => (
          <button key={c.name} onClick={() => setSelected(c.name)}
            className={`px-4 py-2 rounded-xl text-sm transition-all ${selected === c.name
              ? 'bg-brand-500/20 text-brand-400 border border-brand-500/30'
              : 'bg-white/[0.04] text-white/50 border border-white/[0.06] hover:text-white'}`}>
            {c.name} <span className="text-white/20 ml-1">({c.document_count} docs)</span>
          </button>
        ))}
      </div>
      {loading && <p className="text-white/30">Analyzing evolution data...</p>}
      {data && !loading && (
        <>
          <GlassCard className="p-6 mb-6">
            <div className="flex items-center gap-3 mb-4">
              <div className={`w-10 h-10 rounded-xl ${di.bg} flex items-center justify-center`}>
                <di.icon className={`w-5 h-5 ${di.color}`} />
              </div>
              <div>
                <h2 className="text-xl font-semibold">&ldquo;{data.concept}&rdquo; — Overall: <span className={di.color}>{data.overall_drift}</span></h2>
                <p className="text-sm text-white/40">{di.meaning}</p>
              </div>
            </div>
          </GlassCard>

          {data.periods.length > 0 ? (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-white/70">Period-by-Period Analysis</h3>
              {data.periods.map((p, i) => {
                const pi = driftInfo[p.drift_type] || driftInfo.STABLE
                const PIcon = pi.icon
                return (
                  <GlassCard key={i} className="p-6">
                    <div className="flex items-center gap-4 mb-4">
                      <span className="text-2xl font-bold text-white/70">{p.period_start}</span>
                      <ArrowRight className="w-5 h-5 text-white/20" />
                      <span className="text-2xl font-bold text-white/70">{p.period_end}</span>
                      <span className={`ml-auto px-3 py-1 rounded-full text-sm font-medium ${pi.bg} ${pi.color}`}>
                        <PIcon className="w-3.5 h-3.5 inline mr-1" />{p.drift_type}
                      </span>
                    </div>
                    <div className="grid grid-cols-2 gap-4 mb-4">
                      <div>
                        <div className="text-sm text-white/30 mb-1">SMI Score</div>
                        <div className="text-3xl font-bold gradient-text">{p.smi_score.toFixed(4)}</div>
                      </div>
                      <div>
                        <div className="text-sm text-white/30 mb-1">Semantic Distance</div>
                        <div className="w-full bg-white/[0.06] rounded-full h-3 mt-2">
                          <div className={`h-3 rounded-full transition-all ${p.smi_score < 0.1 ? 'bg-emerald-500' : p.smi_score < 0.3 ? 'bg-blue-500' : p.smi_score < 0.5 ? 'bg-amber-500' : 'bg-red-500'}`}
                            style={{ width: `${Math.max(5, Math.min(p.smi_score * 200, 100))}%` }} />
                        </div>
                      </div>
                    </div>
                    <p className="text-sm text-white/40">{smiExplanation(p.smi_score)}</p>
                  </GlassCard>
                )
              })}
            </div>
          ) : (
            <GlassCard className="p-8 text-center">
              <Clock className="w-12 h-12 text-white/20 mx-auto mb-4" />
              <p className="text-white/40">Only one time period available — need documents from multiple decades to show evolution.</p>
            </GlassCard>
          )}
        </>
      )}
    </div>
  )
}
