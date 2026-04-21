'use client';

import { useState, useEffect } from 'react';
import Header from '@/components/Header';
import { RequireAuth } from '@/components/AuthGate';
import { listConcepts, calculateSMI } from '../../lib/api';

const DECADES = ['1950s','1960s','1970s','1980s','1990s','2000s','2010s','2020s'];
const driftColors: Record<string,string> = { STABLE:'#22c55e', EXPANSION:'#ca8a04', CONTRACTION:'#ea580c', BIFURCATION:'#dc2626', MERGER:'#9333ea' };

const PRECOMPUTED = [
  { concept: 'negligence', p1: '1950s', p2: '2000s', label: 'Negligence: 1950s → 2000s' },
  { concept: 'due process', p1: '1960s', p2: '2010s', label: 'Due Process: 1960s → 2010s' },
  { concept: 'judicial review', p1: '1970s', p2: '2010s', label: 'Judicial Review: 1970s → 2010s' },
  { concept: 'right to life', p1: '1970s', p2: '2000s', label: 'Right to Life: 1970s → 2000s' },
  { concept: 'fair trial', p1: '1960s', p2: '2000s', label: 'Fair Trial: 1960s → 2000s' },
  { concept: 'habeas corpus', p1: '1950s', p2: '2000s', label: 'Habeas Corpus: 1950s → 2000s' },
  { concept: 'reasonable doubt', p1: '1960s', p2: '2000s', label: 'Reasonable Doubt: 1960s → 2000s' },
  { concept: 'free speech', p1: '1950s', p2: '2010s', label: 'Free Speech: 1950s → 2010s' },
];

export default function SMIWrapper() { return <RequireAuth><SMIPage /></RequireAuth>; }

function SMIPage() {
  const [concepts, setConcepts] = useState<string[]>([]);
  const [concept, setConcept] = useState('');
  const [p1, setP1] = useState('1970s');
  const [p2, setP2] = useState('2010s');
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [quickResults, setQuickResults] = useState<any[]>([]);

  useEffect(() => {
    listConcepts().then((d: any) => {
      const names = (Array.isArray(d) ? d.map((c: any) => c.name || c) : []) as string[];
      setConcepts(names);
      if (names.length) setConcept(names[0]);
    }).catch(() => {});
    // Load precomputed comparisons
    PRECOMPUTED.forEach(async (pc) => {
      try {
        const r = await calculateSMI(pc.concept, pc.p1, pc.p2);
        setQuickResults(prev => [...prev, { ...pc, ...r }]);
      } catch {}
    });
  }, []);

  const compute = async () => {
    if (!concept) return;
    setLoading(true);
    try { setResult(await calculateSMI(concept, p1, p2)); }
    catch (e: any) { setResult({ error: e.message }); }
    setLoading(false);
  };

  const card: React.CSSProperties = { background: 'white', border: '1px solid #f0f0f0', borderRadius: 10, padding: 20, boxShadow: '0 1px 3px rgba(0,0,0,0.04)' };

  return (
    <>
      <Header />
      <div style={{ background: '#fafafa', minHeight: 'calc(100vh - 60px)', padding: '24px 20px 40px' }}>
        <div style={{ maxWidth: 1000, margin: '0 auto' }}>
          <h1 style={{ fontSize: 22, fontWeight: 600, color: '#1a1a1a', marginBottom: 4 }}>Meaning Shift Analysis</h1>
          <p style={{ color: '#888', fontSize: 13, marginBottom: 24 }}>Measure how much a legal concept's meaning changed between two time periods</p>

          {/* Calculator */}
          <div style={{ ...card, marginBottom: 24 }}>
            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'end' }}>
              <div style={{ flex: 1, minWidth: 160 }}>
                <label style={{ fontSize: 12, color: '#888', display: 'block', marginBottom: 4 }}>Concept</label>
                <select value={concept} onChange={e => setConcept(e.target.value)}
                  style={{ width: '100%', padding: '10px 12px', borderRadius: 6, border: '1px solid #e0e0e0', fontSize: 14, background: 'white' }}>
                  {concepts.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <label style={{ fontSize: 12, color: '#888', display: 'block', marginBottom: 4 }}>From</label>
                <select value={p1} onChange={e => setP1(e.target.value)}
                  style={{ padding: '10px 12px', borderRadius: 6, border: '1px solid #e0e0e0', fontSize: 14, background: 'white' }}>
                  {DECADES.map(d => <option key={d} value={d}>{d}</option>)}
                </select>
              </div>
              <div>
                <label style={{ fontSize: 12, color: '#888', display: 'block', marginBottom: 4 }}>To</label>
                <select value={p2} onChange={e => setP2(e.target.value)}
                  style={{ padding: '10px 12px', borderRadius: 6, border: '1px solid #e0e0e0', fontSize: 14, background: 'white' }}>
                  {DECADES.map(d => <option key={d} value={d}>{d}</option>)}
                </select>
              </div>
              <button onClick={compute} disabled={loading}
                style={{ padding: '10px 24px', background: '#1a1a1a', color: 'white', border: 'none', borderRadius: 6, fontSize: 14, fontWeight: 600, cursor: 'pointer' }}>
                {loading ? '...' : 'Analyze'}
              </button>
            </div>

            {result && !result.error && (
              <div style={{ marginTop: 20, padding: 20, background: '#fafafa', borderRadius: 8 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                  <div style={{ fontSize: 36, fontWeight: 700, color: '#1a1a1a' }}>{result.smi_score?.toFixed(4) ?? result.smi?.toFixed(4)}</div>
                  <div>
                    <span style={{ padding: '4px 12px', borderRadius: 12, fontSize: 12, fontWeight: 600, background: (driftColors[result.drift_type || result.classification] || '#888') + '18', color: driftColors[result.drift_type || result.classification] || '#888' }}>
                      {result.drift_type || result.classification}
                    </span>
                    <div style={{ fontSize: 12, color: '#888', marginTop: 4 }}>Confidence: {((result.confidence || 0.85) * 100).toFixed(0)}%</div>
                  </div>
                </div>
                <p style={{ fontSize: 13, color: '#666', marginTop: 12, lineHeight: 1.6 }}>
                  {result.drift_type === 'STABLE' ? `The concept "${concept}" maintained a consistent meaning between ${p1} and ${p2}. Courts interpreted it similarly across both periods.` :
                   result.drift_type === 'EXPANSION' ? `The concept "${concept}" expanded in scope between ${p1} and ${p2}. Courts applied it to broader contexts and new areas of law.` :
                   result.drift_type === 'CONTRACTION' ? `The concept "${concept}" narrowed in scope between ${p1} and ${p2}. Courts restricted its application compared to the earlier period.` :
                   `The concept "${concept}" underwent significant semantic change between ${p1} and ${p2}.`}
                </p>
              </div>
            )}
            {result?.error && <p style={{ color: '#dc2626', marginTop: 12, fontSize: 13 }}>{result.error}</p>}
          </div>

          {/* Quick Comparisons Grid */}
          <h2 style={{ fontSize: 16, fontWeight: 600, color: '#1a1a1a', marginBottom: 12 }}>Popular Comparisons</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 10 }}>
            {quickResults.map((qr, i) => {
              const cls = qr.drift_type || qr.classification || 'STABLE';
              const color = driftColors[cls] || '#888';
              return (
                <div key={i} style={{ ...card, borderLeft: `3px solid ${color}`, cursor: 'pointer' }}
                  onClick={() => { setConcept(qr.concept); setP1(qr.p1); setP2(qr.p2); setResult(qr); }}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: '#1a1a1a', marginBottom: 6 }}>{qr.label}</div>
                  <div style={{ fontSize: 22, fontWeight: 700, color: '#1a1a1a' }}>{(qr.smi_score ?? qr.smi ?? 0).toFixed(3)}</div>
                  <span style={{ fontSize: 11, padding: '2px 8px', borderRadius: 10, background: color + '18', color }}>{cls}</span>
                </div>
              );
            })}
            {quickResults.length === 0 && <p style={{ color: '#aaa', fontSize: 13, gridColumn: 'span 4' }}>Loading comparisons...</p>}
          </div>

          {/* Suggestions */}
          <div style={{ marginTop: 24, display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10 }}>
            <div style={card}>
              <div style={{ fontSize: 14, fontWeight: 600, color: '#1a1a1a', marginBottom: 6 }}>Compare Across Decades</div>
              <p style={{ fontSize: 12, color: '#888', lineHeight: 1.5 }}>Try comparing the same concept across different time spans to see when the biggest shifts occurred.</p>
            </div>
            <div style={card}>
              <div style={{ fontSize: 14, fontWeight: 600, color: '#1a1a1a', marginBottom: 6 }}>Check the Timeline</div>
              <p style={{ fontSize: 12, color: '#888', lineHeight: 1.5 }}>Visit the Timeline page to see the full decade-by-decade evolution of any concept.</p>
            </div>
            <div style={card}>
              <div style={{ fontSize: 14, fontWeight: 600, color: '#1a1a1a', marginBottom: 6 }}>Set Drift Alerts</div>
              <p style={{ fontSize: 12, color: '#888', lineHeight: 1.5 }}>Monitor concepts you care about and get notified when significant meaning shifts are detected.</p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
