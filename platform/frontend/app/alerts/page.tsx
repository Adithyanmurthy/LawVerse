'use client';

import { useEffect, useState } from 'react';
import Header from '@/components/Header';
import { RequirePaid } from '@/components/AuthGate';
import { getEvolutionTimeline } from '../../lib/api';

const card = { background: 'white', border: '1px solid #f0f0f0', borderRadius: 8, padding: 24, boxShadow: '0 1px 3px rgba(0,0,0,0.05)' };
const KEY = 'glaw_drift_alerts';
type Alert = { concept: string; threshold: number };
type AlertStatus = Alert & { triggered: boolean; latestSmi: number | null };

export default function AlertsPage() {
  return <RequirePaid feature="Drift Alerts"><AlertsInner /></RequirePaid>;
}

function AlertsInner() {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [statuses, setStatuses] = useState<AlertStatus[]>([]);
  const [concept, setConcept] = useState('');
  const [threshold, setThreshold] = useState(0.15);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem(KEY);
    if (saved) setAlerts(JSON.parse(saved));
  }, []);

  useEffect(() => {
    if (!alerts.length) { setStatuses([]); return; }
    setLoading(true);
    Promise.all(alerts.map(async a => {
      try {
        const data = await getEvolutionTimeline(a.concept);
        const periods = Array.isArray(data) ? data : data.periods || data.timeline || [];
        const smi = periods[periods.length - 1]?.smi_score ?? null;
        return { ...a, triggered: smi !== null && smi >= a.threshold, latestSmi: smi };
      } catch { return { ...a, triggered: false, latestSmi: null }; }
    })).then(setStatuses).finally(() => setLoading(false));
  }, [alerts]);

  const save = (next: Alert[]) => { setAlerts(next); localStorage.setItem(KEY, JSON.stringify(next)); };
  const add = (e: React.FormEvent) => {
    e.preventDefault();
    if (!concept.trim()) return;
    save([...alerts, { concept: concept.trim(), threshold }]);
    setConcept(''); setThreshold(0.15);
  };

  const thresholdLabel = threshold < 0.1 ? 'Very sensitive — alerts on minor shifts' : threshold <= 0.3 ? 'Moderate — alerts on meaningful changes' : 'Major changes only — high threshold';
  const inp = { padding: '12px 16px', borderRadius: 6, border: '1px solid #e0e0e0', color: '#1a1a1a', fontSize: 14, outline: 'none' as const, boxSizing: 'border-box' as const };

  return (
    <>
      <Header />
      <div style={{ minHeight: '100vh', background: '#fafafa', padding: '80px 24px 60px' }}>
        <div style={{ maxWidth: 700, margin: '0 auto' }}>
          <h1 style={{ fontSize: 28, fontWeight: 600, color: '#1a1a1a', marginBottom: 4 }}>Drift Alerts</h1>
          <p style={{ color: '#666', marginBottom: 32 }}>Get notified when a legal concept's meaning shifts beyond your threshold</p>

          <form onSubmit={add} style={{ ...card, marginBottom: 32 }}>
            <div style={{ display: 'flex', gap: 12, marginBottom: 16 }}>
              <input value={concept} onChange={e => setConcept(e.target.value)} placeholder="e.g. privacy, due process"
                style={{ ...inp, flex: 1 }} />
              <button type="submit" style={{ padding: '10px 20px', background: '#000', border: 'none', borderRadius: 6, color: 'white', fontWeight: 600, cursor: 'pointer', fontSize: 14 }}>
                Add Alert
              </button>
            </div>
            <div style={{ marginBottom: 8 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, color: '#666', marginBottom: 6 }}>
                <span>Threshold: {threshold.toFixed(2)}</span>
                <span>{thresholdLabel}</span>
              </div>
              <input type="range" min="0" max="1" step="0.05" value={threshold} onChange={e => setThreshold(Number(e.target.value))}
                style={{ width: '100%', accentColor: '#000' }} />
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: '#999', marginTop: 4 }}>
                <span>0.0 — very sensitive</span>
                <span>0.1–0.3 — moderate</span>
                <span>1.0 — major only</span>
              </div>
            </div>
          </form>

          {loading && <p style={{ textAlign: 'center', color: '#666', padding: 40 }}>Checking alerts...</p>}

          {!loading && !statuses.length && !alerts.length && (
            <p style={{ textAlign: 'center', color: '#666', padding: 40 }}>No alerts yet. Add a concept above to start monitoring.</p>
          )}

          <div style={{ display: 'flex', flexDirection: 'column' as const, gap: 12 }}>
            {statuses.map((s, i) => (
              <div key={i} style={{ ...card, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div style={{ width: 10, height: 10, borderRadius: '50%', background: s.triggered ? '#ef4444' : '#22c55e', flexShrink: 0 }} />
                  <div>
                    <div style={{ fontWeight: 600, fontSize: 15, color: '#1a1a1a' }}>{s.concept}</div>
                    <div style={{ color: '#666', fontSize: 13 }}>Threshold: {s.threshold.toFixed(2)} · Latest score: {s.latestSmi !== null ? s.latestSmi.toFixed(4) : 'N/A'}</div>
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <span style={{
                    padding: '4px 14px', borderRadius: 20, fontSize: 12, fontWeight: 600,
                    background: s.triggered ? '#fef2f2' : '#f0fdf4', color: s.triggered ? '#ef4444' : '#22c55e',
                  }}>{s.triggered ? 'TRIGGERED' : 'SAFE'}</span>
                  <button onClick={() => save(alerts.filter((_, idx) => idx !== i))}
                    style={{ background: 'none', border: 'none', color: '#999', cursor: 'pointer', fontSize: 18 }}>×</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
