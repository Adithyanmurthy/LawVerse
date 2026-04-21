'use client'
import { useState, useEffect } from 'react'
import { listConcepts, getEvolutionTimeline, ConceptResponse } from '@/lib/api'
import GlassCard from '@/components/GlassCard'
import { Bell, Plus, Trash2, AlertTriangle, CheckCircle, Info } from 'lucide-react'

interface Alert {
  concept: string
  threshold: number
  status?: 'checking' | 'safe' | 'triggered'
  currentSmi?: number
  driftType?: string
}

const driftColor: Record<string, string> = {
  STABLE: 'text-emerald-400', EXPANSION: 'text-blue-400', CONTRACTION: 'text-amber-400',
  BIFURCATION: 'text-purple-400', MERGER: 'text-red-400',
}

export default function AlertsPage() {
  const [concepts, setConcepts] = useState<ConceptResponse[]>([])
  const [alerts, setAlerts] = useState<Alert[]>([])
  const [selected, setSelected] = useState('')
  const [threshold, setThreshold] = useState(0.3)

  useEffect(() => { listConcepts().then(setConcepts).catch(console.error) }, [])

  const addAlert = async () => {
    if (!selected) return
    const newAlert: Alert = { concept: selected, threshold, status: 'checking' }
    setAlerts(prev => [...prev, newAlert])
    setSelected('')
    try {
      const evo = await getEvolutionTimeline(selected)
      const latestPeriod = evo.periods[evo.periods.length - 1]
      const smi = latestPeriod?.smi_score ?? 0
      const drift = latestPeriod?.drift_type ?? evo.overall_drift
      setAlerts(prev => prev.map(a =>
        a === newAlert ? { ...a, status: smi >= threshold ? 'triggered' : 'safe', currentSmi: smi, driftType: drift } : a
      ))
    } catch {
      setAlerts(prev => prev.map(a =>
        a === newAlert ? { ...a, status: 'safe', currentSmi: 0, driftType: 'STABLE' } : a
      ))
    }
  }

  return (
    <div className="section-container pt-28 pb-20">
      <h1 className="text-4xl font-bold mb-2"><span className="gradient-text">Drift Alerts</span></h1>
      <p className="text-white/40 mb-2">Monitor legal concepts and get notified when they shift beyond your threshold</p>
      <div className="glass-card p-4 mb-8 flex items-start gap-3">
        <Info className="w-5 h-5 text-brand-400 flex-shrink-0 mt-0.5" />
        <div className="text-sm text-white/40">
          <p className="mb-1"><strong className="text-white/60">How it works:</strong> Set an SMI threshold for any concept. When you add an alert, we immediately check the concept&apos;s latest evolution data. If the most recent SMI score exceeds your threshold, the alert triggers.</p>
          <p><strong className="text-white/60">Threshold guide:</strong> 0.1 = very sensitive (triggers on minor changes), 0.3 = moderate, 0.5 = only major shifts.</p>
        </div>
      </div>

      <GlassCard className="p-6 mb-8">
        <h3 className="text-lg font-semibold mb-4">Create Alert</h3>
        <div className="flex flex-wrap gap-3 items-end">
          <div className="flex-1 min-w-[200px]">
            <label className="text-sm text-white/40 mb-1 block">Concept</label>
            <select value={selected} onChange={e => setSelected(e.target.value)}
              className="w-full bg-white/[0.04] border border-white/[0.06] rounded-xl px-4 py-2.5 text-white focus:outline-none">
              <option value="">Select concept...</option>
              {concepts.map(c => <option key={c.name} value={c.name}>{c.name}</option>)}
            </select>
          </div>
          <div className="w-40">
            <label className="text-sm text-white/40 mb-1 block">SMI Threshold</label>
            <input type="number" step="0.05" min="0" max="1" value={threshold} onChange={e => setThreshold(parseFloat(e.target.value))}
              className="w-full bg-white/[0.04] border border-white/[0.06] rounded-xl px-4 py-2.5 text-white focus:outline-none" />
          </div>
          <button onClick={addAlert} disabled={!selected}
            className="btn-primary px-5 py-2.5 text-sm flex items-center gap-2 disabled:opacity-40"><Plus className="w-4 h-4" /> Add Alert</button>
        </div>
      </GlassCard>

      <div className="space-y-3">
        {alerts.length === 0 && (
          <GlassCard className="p-8 text-center">
            <Bell className="w-12 h-12 text-white/10 mx-auto mb-4" />
            <p className="text-white/30">No alerts configured yet. Select a concept and threshold above to start monitoring.</p>
          </GlassCard>
        )}
        {alerts.map((a, i) => (
          <GlassCard key={i} className={`p-5 ${a.status === 'triggered' ? 'border-amber-500/30' : ''}`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                {a.status === 'checking' && <div className="w-8 h-8 rounded-lg bg-white/[0.04] flex items-center justify-center"><Bell className="w-4 h-4 text-white/30 animate-pulse" /></div>}
                {a.status === 'safe' && <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center"><CheckCircle className="w-4 h-4 text-emerald-400" /></div>}
                {a.status === 'triggered' && <div className="w-8 h-8 rounded-lg bg-amber-500/10 flex items-center justify-center"><AlertTriangle className="w-4 h-4 text-amber-400" /></div>}
                <div>
                  <span className="font-semibold text-white">{a.concept}</span>
                  <span className="text-white/20 ml-2 text-sm">threshold: {a.threshold}</span>
                  {a.status === 'checking' && <p className="text-xs text-white/30 mt-0.5">Checking current drift status...</p>}
                  {a.status === 'safe' && (
                    <p className="text-xs text-emerald-400/70 mt-0.5">
                      ✓ Safe — Current SMI: {a.currentSmi?.toFixed(4)} ({a.driftType}) — below threshold of {a.threshold}
                    </p>
                  )}
                  {a.status === 'triggered' && (
                    <p className="text-xs text-amber-400 mt-0.5">
                      ⚠ Alert triggered — Current SMI: {a.currentSmi?.toFixed(4)} (<span className={driftColor[a.driftType || ''] || ''}>{a.driftType}</span>) — exceeds threshold of {a.threshold}
                    </p>
                  )}
                </div>
              </div>
              <button onClick={() => setAlerts(prev => prev.filter((_, j) => j !== i))}
                className="text-white/20 hover:text-red-400 transition-colors"><Trash2 className="w-4 h-4" /></button>
            </div>
          </GlassCard>
        ))}
      </div>
    </div>
  )
}
