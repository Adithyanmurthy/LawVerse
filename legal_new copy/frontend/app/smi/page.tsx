'use client'
import { useState, useEffect } from 'react'
import { listConcepts, calculateSMI, getEvolutionTimeline, ConceptResponse, SMIResponse } from '@/lib/api'
import GlassCard from '@/components/GlassCard'
import { BarChart3, Info, TrendingUp, TrendingDown, Minus, ArrowRight } from 'lucide-react'

const driftMeta: Record<string, { color: string; bg: string; label: string; explanation: string }> = {
  STABLE: { color: 'text-emerald-400', bg: 'bg-emerald-500/10', label: 'Stable', explanation: 'This concept\'s legal meaning has not significantly changed between the two periods. Courts continue to interpret and apply it in a consistent manner.' },
  EXPANSION: { color: 'text-blue-400', bg: 'bg-blue-500/10', label: 'Expanding', explanation: 'This concept is being applied more broadly. Courts are extending its reach to new areas of law or interpreting it with a wider scope than before.' },
  CONTRACTION: { color: 'text-amber-400', bg: 'bg-amber-500/10', label: 'Contracting', explanation: 'This concept is being applied more narrowly. Courts are restricting its scope or adding more conditions to its application.' },
  BIFURCATION: { color: 'text-purple-400', bg: 'bg-purple-500/10', label: 'Bifurcating', explanation: 'This concept is splitting into distinct sub-meanings. Different courts or legal contexts are interpreting it in divergent ways.' },
  MERGER: { color: 'text-red-400', bg: 'bg-red-500/10', label: 'Merging', explanation: 'Previously separate interpretations of this concept are converging. Courts are unifying how they understand and apply it.' },
}

export default function SMIPage() {
  const [concepts, setConcepts] = useState<ConceptResponse[]>([])
  const [selected, setSelected] = useState('')
  const [result, setResult] = useState<SMIResponse | null>(null)
  const [evolution, setEvolution] = useState<any>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => { listConcepts().then(setConcepts).catch(console.error) }, [])

  const handleCalculate = async () => {
    if (!selected) return
    setLoading(true)
    try {
      const [smi, evo] = await Promise.all([
        calculateSMI({ concept: selected, period_1_start: 2000, period_1_end: 2015, period_2_start: 2015, period_2_end: 2026 }),
        getEvolutionTimeline(selected),
      ])
      setResult(smi)
      setEvolution(evo)
    } catch (err) { console.error(err) }
    finally { setLoading(false) }
  }

  const dm = result ? (driftMeta[result.drift_type] || driftMeta.STABLE) : null

  return (
    <div className="section-container pt-28 pb-20">
      <h1 className="text-4xl font-bold mb-2"><span className="gradient-text">SMI Dashboard</span></h1>
      <p className="text-white/40 mb-2">Semantic Movement Index — quantify how much a legal concept has shifted in meaning</p>
      <div className="glass-card p-4 mb-8 flex items-start gap-3">
        <Info className="w-5 h-5 text-brand-400 flex-shrink-0 mt-0.5" />
        <div className="text-sm text-white/40">
          <p className="mb-1"><strong className="text-white/60">What is SMI?</strong> The Semantic Movement Index measures the cosine distance between how a legal concept is used in court documents across two time periods. It ranges from 0 (identical meaning) to 1 (completely different meaning).</p>
          <p><strong className="text-white/60">How is it computed?</strong> We embed court documents mentioning the concept using LexLM legal-roberta-large (355M params), average the embeddings per period, and compute 1 − cosine_similarity.</p>
        </div>
      </div>
      <div className="flex flex-wrap gap-2 mb-6">
        {concepts.map(c => (
          <button key={c.name} onClick={() => setSelected(c.name)}
            className={`px-4 py-2 rounded-xl text-sm transition-all ${selected === c.name
              ? 'bg-brand-500/20 text-brand-400 border border-brand-500/30'
              : 'bg-white/[0.04] text-white/50 border border-white/[0.06] hover:text-white'}`}>
            {c.name}
          </button>
        ))}
      </div>
      <button onClick={handleCalculate} disabled={!selected || loading}
        className="btn-primary px-6 py-3 text-sm mb-8 disabled:opacity-40">{loading ? 'Analyzing...' : 'Calculate SMI'}</button>

      {result && dm && (
        <div className="space-y-6">
          <GlassCard className="p-8">
            <div className="flex items-center gap-3 mb-6">
              <BarChart3 className="w-6 h-6 text-brand-400" />
              <h2 className="text-2xl font-semibold">&ldquo;{result.concept}&rdquo;</h2>
              <span className={`ml-auto px-4 py-1.5 rounded-full text-sm font-semibold ${dm.bg} ${dm.color}`}>{dm.label}</span>
            </div>
            <div className="grid md:grid-cols-3 gap-6 mb-6">
              <div className="text-center">
                <div className="text-sm text-white/30 mb-2">SMI Score</div>
                <div className="text-4xl font-bold gradient-text">{result.smi_score.toFixed(4)}</div>
                <div className="w-full bg-white/[0.06] rounded-full h-2 mt-3">
                  <div className={`h-2 rounded-full ${result.smi_score < 0.1 ? 'bg-emerald-500' : result.smi_score < 0.3 ? 'bg-blue-500' : 'bg-amber-500'}`}
                    style={{ width: `${Math.max(5, Math.min(result.smi_score * 200, 100))}%` }} />
                </div>
              </div>
              <div className="text-center">
                <div className="text-sm text-white/30 mb-2">Drift Classification</div>
                <div className={`text-2xl font-bold ${dm.color}`}>{result.drift_type}</div>
              </div>
              <div className="text-center">
                <div className="text-sm text-white/30 mb-2">Model Confidence</div>
                <div className="text-2xl font-bold text-white/70">{(result.confidence * 100).toFixed(0)}%</div>
              </div>
            </div>
            <div className="border-t border-white/[0.06] pt-4">
              <h3 className="text-sm font-semibold text-white/60 mb-2">What does this mean?</h3>
              <p className="text-sm text-white/40">{dm.explanation}</p>
              <p className="text-sm text-white/30 mt-2">
                {result.smi_score < 0.05
                  ? `With an SMI of ${result.smi_score.toFixed(4)}, "${result.concept}" shows almost no semantic change. Courts are using this concept in essentially the same way across both periods.`
                  : result.smi_score < 0.15
                  ? `With an SMI of ${result.smi_score.toFixed(4)}, "${result.concept}" shows minor but detectable semantic movement. The concept is evolving slowly.`
                  : `With an SMI of ${result.smi_score.toFixed(4)}, "${result.concept}" shows meaningful semantic shift. The way courts use this concept has noticeably changed.`
                }
              </p>
            </div>
          </GlassCard>

          {evolution && evolution.periods && evolution.periods.length > 0 && (
            <GlassCard className="p-6">
              <h3 className="text-lg font-semibold mb-4">Decade-by-Decade Breakdown</h3>
              <div className="space-y-3">
                {evolution.periods.map((p: any, i: number) => (
                  <div key={i} className="flex items-center gap-4 p-3 bg-white/[0.02] rounded-xl">
                    <span className="text-sm font-mono text-white/50 w-32">{p.period_start} → {p.period_end}</span>
                    <div className="flex-1 bg-white/[0.06] rounded-full h-2">
                      <div className={`h-2 rounded-full ${p.smi_score < 0.1 ? 'bg-emerald-500' : p.smi_score < 0.3 ? 'bg-blue-500' : 'bg-amber-500'}`}
                        style={{ width: `${Math.max(5, Math.min(p.smi_score * 200, 100))}%` }} />
                    </div>
                    <span className="text-sm font-mono text-white/60 w-16 text-right">{p.smi_score.toFixed(4)}</span>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${(driftMeta[p.drift_type] || driftMeta.STABLE).bg} ${(driftMeta[p.drift_type] || driftMeta.STABLE).color}`}>{p.drift_type}</span>
                  </div>
                ))}
              </div>
            </GlassCard>
          )}
        </div>
      )}
    </div>
  )
}
