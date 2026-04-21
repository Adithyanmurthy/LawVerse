import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'
import { ConceptEvolution, ImpactAnalysis } from './api'

export const exportTimelineToPDF = (data: ConceptEvolution) => {
  const doc = new jsPDF()
  doc.setFontSize(20)
  doc.text('Legal Concept Evolution Report', 20, 20)
  doc.setFontSize(12)
  doc.text(`Concept: ${data.concept}`, 20, 35)
  doc.text(`Overall Drift: ${data.overall_drift.toFixed(2)}`, 20, 45)
  doc.text(`Classification: ${data.drift_classification}`, 20, 55)

  const tableData = data.timeline.map(point => [
    point.year.toString(),
    point.smi_score.toFixed(2),
    point.drift_type,
    point.key_cases.slice(0, 2).join(', ')
  ])

  autoTable(doc, {
    head: [['Year', 'SMI Score', 'Drift Type', 'Key Cases']],
    body: tableData,
    startY: 65,
  })

  doc.save(`${data.concept}-evolution-report.pdf`)
}

export const exportTimelineToCSV = (data: ConceptEvolution) => {
  const headers = ['Year', 'SMI Score', 'Drift Type', 'Key Cases']
  const rows = data.timeline.map(point => [
    point.year,
    point.smi_score,
    point.drift_type,
    point.key_cases.join('; ')
  ])

  const csvContent = [
    headers.join(','),
    ...rows.map(row => row.join(','))
  ].join('\n')

  const blob = new Blob([csvContent], { type: 'text/csv' })
  const url = window.URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `${data.concept}-evolution-data.csv`
  a.click()
  window.URL.revokeObjectURL(url)
}
