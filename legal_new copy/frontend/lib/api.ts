import axios from 'axios'

const API_BASE_URL = process.env.API_BASE_URL || 'http://localhost:8000'

const api = axios.create({
  baseURL: `${API_BASE_URL}/api/v1`,
  headers: { 'Content-Type': 'application/json' },
})

api.interceptors.request.use((config) => {
  const token = typeof window !== 'undefined' ? localStorage.getItem('lcet_token') : null
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

// ── Types ──

export type DriftType = 'STABLE' | 'EXPANSION' | 'CONTRACTION' | 'BIFURCATION' | 'MERGER'
export type DocumentType = 'CASE' | 'STATUTE' | 'REGULATION' | 'ARTICLE'

export interface EvolutionPeriod {
  period_start: string
  period_end: string
  smi_score: number
  drift_type: DriftType
  confidence_low: number
  confidence_high: number
}

export interface EvolutionTimeline {
  concept: string
  periods: EvolutionPeriod[]
  overall_drift: string
}

export interface TimelinePoint {
  year: number
  smi_score: number
  drift_type: string
  key_cases: string[]
}

export interface ConceptEvolution {
  concept: string
  overall_drift: number
  drift_classification: string
  timeline: TimelinePoint[]
}

export interface ConceptResponse {
  name: string
  category: string
  document_count: number
  latest_smi: number | null
}

export interface SearchResult {
  id: string
  case_name: string
  court: string
  year: number | null
  relevance_score: number
  snippet: string
}

export interface SearchResponse {
  results: SearchResult[]
  total: number
  query: string
}

export interface NEREntity {
  text: string
  label: string
  score: number
  start: number
  end: number
}

export interface SMIResponse {
  concept: string
  smi_score: number
  drift_type: DriftType
  confidence: number
}

export interface ImpactAnalysis {
  case_id: string
  case_name: string
  year: number
  impact_score: number
  impact_level: number
  citation_count: number
  affected_concepts: string[]
  downstream_cases: string[]
}

export interface CitationNode { id: string; label: string; year: number; impact_score: number }
export interface CitationEdge { source: string; target: string; weight: number }
export interface CitationNetwork { concept: string; nodes: CitationNode[]; edges: CitationEdge[] }
export interface JurisdictionSMI { jurisdiction: string; smi_score: number; drift_type: string; key_differences: string[] }
export interface SMIComparison { concept: string; jurisdictions: JurisdictionSMI[] }

// ── Auth ──
export const login = async (email: string, password: string) => {
  const r = await api.post('/auth/login', { email, password })
  return r.data
}
export const register = async (email: string, password: string, full_name: string) => {
  const r = await api.post('/auth/register', { email, password, full_name })
  return r.data
}

// ── Concepts ──
export const listConcepts = async (params?: { search?: string }): Promise<ConceptResponse[]> => {
  const r = await api.get('/concepts', { params })
  return r.data
}

export const getConcept = async (name: string): Promise<ConceptResponse> => {
  const r = await api.get(`/concepts/${encodeURIComponent(name)}`)
  return r.data
}

export const getEvolutionTimeline = async (concept: string, startYear?: number, endYear?: number): Promise<EvolutionTimeline> => {
  const r = await api.get(`/concepts/${encodeURIComponent(concept)}/evolution`, {
    params: { start_year: startYear, end_year: endYear },
  })
  return r.data
}

// ── Search (adapted: backend uses GET /search?q=...) ──
export const searchConcepts = async (query: string): Promise<ConceptEvolution> => {
  const r = await api.get(`/concepts/${encodeURIComponent(query)}/evolution`)
  const data: EvolutionTimeline = r.data
  // Map backend response to frontend ConceptEvolution shape
  const avgSmi = data.periods.length > 0
    ? data.periods.reduce((s, p) => s + p.smi_score, 0) / data.periods.length : 0
  return {
    concept: data.concept,
    overall_drift: avgSmi,
    drift_classification: data.overall_drift,
    timeline: data.periods.map(p => ({
      year: parseInt(p.period_end.replace('s', '')),
      smi_score: p.smi_score,
      drift_type: p.drift_type,
      key_cases: [],
    })),
  }
}

export const semanticSearch = async (request: { query: string; jurisdiction?: string; limit?: number }): Promise<SearchResponse> => {
  const r = await api.get('/search', { params: { q: request.query, jurisdiction: request.jurisdiction, limit: request.limit } })
  return r.data
}

// ── Analysis ──
export const calculateSMI = async (request: { concept: string; period_1_start: number; period_1_end: number; period_2_start: number; period_2_end: number }): Promise<SMIResponse> => {
  const r = await api.post('/analysis/smi', request)
  return r.data
}

export const extractEntities = async (text: string, labels?: string[]): Promise<{ entities: NEREntity[]; text_length: number }> => {
  const r = await api.post('/analysis/ner', { text, labels })
  return r.data
}

// ── Documents ──
export const listDocuments = async (params?: { jurisdiction?: string; court?: string; year_start?: number; year_end?: number; offset?: number; limit?: number }) => {
  const r = await api.get('/documents', { params })
  return r.data
}

export const getDocument = async (id: string) => {
  const r = await api.get(`/documents/${encodeURIComponent(id)}`)
  return r.data
}

export const getImpactAnalysis = async (caseId: string): Promise<ImpactAnalysis> => {
  const r = await api.get(`/documents/${encodeURIComponent(caseId)}/impact`)
  const d = r.data
  return {
    case_id: caseId,
    case_name: d.case_name,
    year: d.year,
    impact_score: d.impact_score,
    impact_level: d.impact_level,
    citation_count: d.citation_count,
    affected_concepts: d.influenced_concepts || [],
    downstream_cases: [],
  }
}

// ── Stubs for pages that need endpoints not yet built ──
export const getCitationNetwork = async (concept: string): Promise<CitationNetwork> => {
  const r = await api.get(`/concepts/${encodeURIComponent(concept)}/citations`)
  return r.data
}

export const getSMIComparison = async (concept: string, jurisdictions: string[]): Promise<SMIComparison> => {
  const results: JurisdictionSMI[] = []
  for (const j of jurisdictions) {
    try {
      const r = await api.post('/analysis/smi', { concept, period_1_start: 2000, period_1_end: 2010, period_2_start: 2010, period_2_end: 2026 })
      results.push({ jurisdiction: j, smi_score: r.data.smi_score, drift_type: r.data.drift_type, key_differences: [] })
    } catch {
      results.push({ jurisdiction: j, smi_score: 0, drift_type: 'STABLE', key_differences: [] })
    }
  }
  return { concept, jurisdictions: results }
}

export const healthCheck = async () => {
  const r = await axios.get(`${API_BASE_URL}/health`)
  return r.data
}

export default api
