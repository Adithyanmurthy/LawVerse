'use client';

import { useEffect, useState } from 'react';
import Header from '@/components/Header';
import { RequirePaid } from '@/components/AuthGate';
import { listCases, getCaseStats, getCase } from '../../lib/api';

const cardStyle = { background: 'white', border: '1px solid #f0f0f0', borderRadius: 8, padding: 24, boxShadow: '0 1px 3px rgba(0,0,0,0.05)' };

export default function CasesPageWrapper() {
  return <RequirePaid feature="Case Library"><CasesPageInner /></RequirePaid>;
}

function CasesPageInner() {
  const [cases, setCases] = useState<any[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [q, setQ] = useState('');
  const [court, setCourt] = useState('');
  const [year, setYear] = useState('');
  const [page, setPage] = useState(1);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [fullText, setFullText] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  const fetchCases = () => {
    setLoading(true);
    listCases({ q: q || undefined, court: court || undefined, year: year ? Number(year) : undefined, page })
      .then(d => setCases(Array.isArray(d) ? d : d.cases || d.results || []))
      .catch(() => setCases([]))
      .finally(() => setLoading(false));
  };

  useEffect(() => { getCaseStats().then(setStats).catch(() => {}); }, []);
  useEffect(() => { fetchCases(); }, [page]);

  const handleExpand = async (docId: string) => {
    if (expanded === docId) { setExpanded(null); return; }
    setExpanded(docId);
    if (!fullText[docId]) {
      try {
        const d = await getCase(docId);
        setFullText(prev => ({ ...prev, [docId]: d.text || d.content || JSON.stringify(d) }));
      } catch { setFullText(prev => ({ ...prev, [docId]: 'Failed to load.' })); }
    }
  };

  const inputStyle = { padding: '12px 16px', borderRadius: 6, border: '1px solid #e0e0e0', color: '#1a1a1a', fontSize: 14, outline: 'none' as const };

  return (
    <>
      <Header />
      <div style={{ minHeight: '100vh', background: '#fafafa', padding: '80px 24px 60px' }}>
        <div style={{ maxWidth: 900, margin: '0 auto' }}>
          <h1 style={{ fontSize: 28, fontWeight: 600, color: '#1a1a1a', marginBottom: 4 }}>Case Library</h1>
          <p style={{ color: '#666', marginBottom: 24 }}>Browse and explore legal cases</p>

          {stats && (
            <div style={{ display: 'flex', gap: 16, marginBottom: 32 }}>
              {[['Total Cases', stats.total_cases ?? stats.total ?? 0], ['Courts Covered', stats.courts_covered ?? (Array.isArray(stats.courts) ? stats.courts.length : stats.courts) ?? 0]].map(([label, val], i) => (
                <div key={i} style={{ ...cardStyle, flex: 1, textAlign: 'center' as const }}>
                  <div style={{ fontSize: 28, fontWeight: 700, color: '#1a1a1a' }}>{val ?? '—'}</div>
                  <div style={{ color: '#666', fontSize: 13, marginTop: 4 }}>{label}</div>
                </div>
              ))}
            </div>
          )}

          <div style={{ display: 'flex', gap: 12, marginBottom: 32, flexWrap: 'wrap' as const }}>
            <input value={q} onChange={e => setQ(e.target.value)} placeholder="Search cases..." style={{ ...inputStyle, flex: 2, minWidth: 200 }} />
            <input value={court} onChange={e => setCourt(e.target.value)} placeholder="Court" style={{ ...inputStyle, flex: 1, minWidth: 120 }} />
            <input value={year} onChange={e => setYear(e.target.value)} placeholder="Year" type="number" style={{ ...inputStyle, width: 100 }} />
            <button onClick={() => { setPage(1); fetchCases(); }}
              style={{ padding: '10px 20px', borderRadius: 6, background: '#000', color: 'white', border: 'none', fontWeight: 600, cursor: 'pointer', fontSize: 14 }}>Search</button>
          </div>

          {loading ? (
            <p style={{ textAlign: 'center', color: '#666', padding: 40 }}>Loading cases...</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column' as const, gap: 12 }}>
              {cases.map((c, i) => {
                const docId = c.doc_id || c.id || String(i);
                return (
                  <div key={i} style={{ ...cardStyle, cursor: 'pointer' }} onClick={() => handleExpand(docId)}>
                    <h3 style={{ margin: '0 0 6px', fontSize: 15, fontWeight: 600, color: '#1a1a1a' }}>{c.case_name || c.title || 'Untitled'}</h3>
                    <div style={{ display: 'flex', gap: 16, color: '#666', fontSize: 13 }}>
                      {c.court && <span>{c.court}</span>}
                      {c.date && <span>{c.date}</span>}
                      {c.word_count && <span>{c.word_count.toLocaleString()} words</span>}
                    </div>
                    {expanded === docId && (
                      <pre style={{ marginTop: 16, color: '#666', fontSize: 13, whiteSpace: 'pre-wrap', lineHeight: 1.6, maxHeight: 400, overflow: 'auto' }}>
                        {fullText[docId] || 'Loading...'}
                      </pre>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {!loading && cases.length > 0 && (
            <div style={{ display: 'flex', justifyContent: 'center', gap: 12, marginTop: 32 }}>
              <button disabled={page <= 1} onClick={() => setPage(p => p - 1)}
                style={{ padding: '10px 20px', borderRadius: 6, border: '1px solid #e0e0e0', background: 'white', color: '#1a1a1a', cursor: 'pointer', fontSize: 14, opacity: page <= 1 ? 0.4 : 1 }}>← Previous</button>
              <span style={{ padding: '10px 16px', color: '#666' }}>Page {page}</span>
              <button onClick={() => setPage(p => p + 1)}
                style={{ padding: '10px 20px', borderRadius: 6, border: '1px solid #e0e0e0', background: 'white', color: '#1a1a1a', cursor: 'pointer', fontSize: 14 }}>Next →</button>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
