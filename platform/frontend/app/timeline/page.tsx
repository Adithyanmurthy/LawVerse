'use client';

import { useEffect, useState } from 'react';
import Header from '@/components/Header';
import { RequireAuth } from '@/components/AuthGate';
import { listConcepts, getEvolutionTimeline } from '../../lib/api';

const driftColors: Record<string,string> = { STABLE:'#22c55e', EXPANSION:'#ca8a04', CONTRACTION:'#ea580c', BIFURCATION:'#dc2626', MERGER:'#9333ea' };
const driftExplain: Record<string,string> = {
  STABLE: 'Courts used this concept consistently — no significant change in meaning.',
  EXPANSION: 'The scope broadened — courts applied it to new areas of law.',
  CONTRACTION: 'The scope narrowed — courts restricted how this concept is applied.',
  BIFURCATION: 'The concept split into distinct interpretations across contexts.',
  MERGER: 'Previously separate interpretations converged into unified meaning.',
};

export default function Wrapper() { return <RequireAuth><TimelinePage /></RequireAuth>; }

function TimelinePage() {
  const [concepts, setConcepts] = useState<string[]>([]);
  const [selected, setSelected] = useState('');
  const [periods, setPeriods] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [preloaded, setPreloaded] = useState<Record<string, { latest: string; count: number }>>({});

  useEffect(() => {
    listConcepts().then(async (d: any) => {
      const names = (Array.isArray(d) ? d.map((c: any) => c.name || c) : []) as string[];
      setConcepts(names);
      // Preload summary for each concept
      for (const name of names) {
        try {
          const data = await getEvolutionTimeline(name);
          const p = data.periods || data.timeline || data || [];
          if (Array.isArray(p) && p.length > 0) {
            setPreloaded(prev => ({ ...prev, [name]: { latest: p[p.length - 1]?.drift_type || p[p.length - 1]?.classification || 'STABLE', count: p.length } }));
          }
        } catch {}
      }
    }).catch(() => {});
  }, []);

  const select = async (name: string) => {
    setSelected(name); setLoading(true);
    try {
      const data = await getEvolutionTimeline(name);
      setPeriods(data.periods || data.timeline || data || []);
    } catch { setPeriods([]); }
    setLoading(false);
  };

  const card: React.CSSProperties = { background: 'white', border: '1px solid #f0f0f0', borderRadius: 10, padding: 20, boxShadow: '0 1px 3px rgba(0,0,0,0.04)' };

  return (
    <>
      <Header />
      <div style={{ background: '#fafafa', minHeight: 'calc(100vh - 60px)', padding: '24px 20px 40px' }}>
        <div style={{ maxWidth: 1000, margin: '0 auto' }}>
          <h1 style={{ fontSize: 24, fontWeight: 700, color: '#1a1a1a', marginBottom: 4 }}>Concept Evolution Timeline</h1>
          <p style={{ color: '#888', fontSize: 14, marginBottom: 24 }}>
            {selected ? `Viewing timeline for "${selected}"` : 'Select a legal concept to see how its meaning changed across decades'}
          </p>

          {/* Concept Selector */}
          <div style={{ ...card, marginBottom: 24, display: 'flex', alignItems: 'center', gap: 12 }}>
            <label style={{ fontSize: 13, color: '#888', whiteSpace: 'nowrap' }}>Select concept:</label>
            <select value={selected} onChange={e => select(e.target.value)}
              style={{ flex: 1, padding: '10px 12px', borderRadius: 6, border: '1px solid #e0e0e0', fontSize: 14, background: 'white', textTransform: 'capitalize' }}>
              <option value="">Choose a concept...</option>
              {concepts.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>

          {/* Concept Cards Grid (when nothing selected) */}
          {!selected && (
            <>
              <h2 style={{ fontSize: 16, fontWeight: 600, color: '#1a1a1a', marginBottom: 12 }}>Quick Overview</h2>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 10, marginBottom: 24 }}>
                {concepts.map(name => {
                  const info = preloaded[name];
                  const color = info ? (driftColors[info.latest] || '#888') : '#e0e0e0';
                  return (
                    <div key={name} onClick={() => select(name)}
                      style={{ ...card, cursor: 'pointer', borderLeft: `3px solid ${color}`, transition: 'all 0.2s' }}
                      onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.08)'; }}
                      onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.04)'; }}>
                      <div style={{ fontSize: 14, fontWeight: 600, color: '#1a1a1a', textTransform: 'capitalize', marginBottom: 6 }}>{name}</div>
                      {info ? (
                        <>
                          <span style={{ fontSize: 11, padding: '2px 8px', borderRadius: 10, background: color + '18', color }}>{info.latest}</span>
                          <div style={{ fontSize: 11, color: '#aaa', marginTop: 6 }}>{info.count} periods tracked</div>
                        </>
                      ) : (
                        <div style={{ fontSize: 11, color: '#ccc' }}>Click to load →</div>
                      )}
                    </div>
                  );
                })}
              </div>
            </>
          )}

          {/* Timeline View */}
          {selected && !loading && periods.length > 0 && (
            <>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                <h2 style={{ fontSize: 16, fontWeight: 600, color: '#1a1a1a' }}>
                  Timeline: <span style={{ textTransform: 'capitalize' }}>{selected}</span> ({periods.length} periods)
                </h2>
                <button onClick={() => { setSelected(''); setPeriods([]); }}
                  style={{ background: 'none', border: '1px solid #e0e0e0', borderRadius: 6, padding: '6px 14px', fontSize: 12, color: '#666', cursor: 'pointer' }}>
                  ← All Concepts
                </button>
              </div>

              {/* Period Cards Grid */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 10, marginBottom: 24 }}>
                {(Array.isArray(periods) ? periods : []).map((p: any, i: number) => {
                  const cls = p.drift_type || p.classification || 'STABLE';
                  const color = driftColors[cls] || '#888';
                  const decade = p.period_start || p.decade || p.period || '?';
                  const decadeEnd = p.period_end || '';
                  const smi = p.smi_score ?? p.smi;
                  const docs = p.doc_count;
                  // Context-aware explanation
                  const explain = cls === 'STABLE' && smi === 0
                    ? `Between ${decade} and ${decadeEnd}, the embedding vectors were identical — likely due to similar judicial language and consistent application of this concept.`
                    : cls === 'STABLE'
                    ? `Between ${decade} and ${decadeEnd}, courts interpreted "${selected}" consistently with minimal variation (SMI: ${smi?.toFixed(3)}).`
                    : cls === 'EXPANSION'
                    ? `Between ${decade} and ${decadeEnd}, "${selected}" was applied to new legal contexts — courts broadened its scope significantly.`
                    : cls === 'CONTRACTION'
                    ? `Between ${decade} and ${decadeEnd}, courts narrowed the application of "${selected}" — restricting its earlier broader interpretation.`
                    : cls === 'MERGER'
                    ? `Between ${decade} and ${decadeEnd}, a major semantic shift occurred — the legal meaning of "${selected}" changed substantially (SMI: ${smi?.toFixed(3)}), possibly due to landmark rulings or legislative changes.`
                    : cls === 'BIFURCATION'
                    ? `Between ${decade} and ${decadeEnd}, "${selected}" split into divergent interpretations across different courts or contexts.`
                    : driftExplain[cls] || '';
                  return (
                    <div key={i} style={{ ...card, borderTop: `3px solid ${color}` }}>
                      <div style={{ fontSize: 16, fontWeight: 700, color: '#1a1a1a', marginBottom: 4 }}>{decade} → {decadeEnd}</div>
                      <div style={{ marginBottom: 8 }}>
                        <span style={{ fontSize: 11, padding: '2px 10px', borderRadius: 10, background: color + '18', color, fontWeight: 600 }}>{cls}</span>
                        {smi != null && <span style={{ fontSize: 12, color: '#888', marginLeft: 8 }}>SMI: {typeof smi === 'number' ? smi.toFixed(3) : smi}</span>}
                      </div>
                      {docs != null && <div style={{ fontSize: 12, color: '#aaa', marginBottom: 6 }}>{docs} documents</div>}
                      <div style={{ fontSize: 12, color: '#666', lineHeight: 1.5 }}>{explain}</div>
                    </div>
                  );
                })}
              </div>

              {/* Summary */}
              <div style={{ ...card, background: '#f8f8f8' }}>
                <h3 style={{ fontSize: 14, fontWeight: 600, color: '#1a1a1a', marginBottom: 8 }}>Summary</h3>
                <p style={{ fontSize: 13, color: '#666', lineHeight: 1.6 }}>
                  The concept &ldquo;<span style={{ textTransform: 'capitalize' }}>{selected}</span>&rdquo; has been tracked across {periods.length} time periods.
                  {periods.filter((p: any) => p.classification === 'STABLE').length > periods.length / 2
                    ? ' Overall, this concept has remained relatively stable in its legal interpretation.'
                    : ' This concept has undergone notable shifts in meaning over time, reflecting changes in judicial interpretation and legislative action.'}
                </p>
              </div>
            </>
          )}

          {selected && !loading && periods.length === 0 && (
            <div style={{ ...card, textAlign: 'center', padding: 40 }}>
              <p style={{ color: '#888' }}>No evolution data available for &ldquo;{selected}&rdquo; yet.</p>
              <button onClick={() => { setSelected(''); setPeriods([]); }}
                style={{ marginTop: 12, background: '#1a1a1a', color: 'white', border: 'none', borderRadius: 6, padding: '8px 20px', fontSize: 13, cursor: 'pointer' }}>
                Back to All Concepts
              </button>
            </div>
          )}

          {loading && <div style={{ textAlign: 'center', padding: 40 }}><p style={{ color: '#888' }}>Loading timeline...</p></div>}
        </div>
      </div>
    </>
  );
}
