'use client'

import { ConceptEvolution } from '@/lib/api'
import { exportTimelineToPDF, exportTimelineToCSV } from '@/lib/export'
import { FileText, Download } from 'lucide-react'
import toast from 'react-hot-toast'

interface ExportButtonsProps {
  data: ConceptEvolution
}

export default function ExportButtons({ data }: ExportButtonsProps) {
  const handlePDF = () => {
    try { exportTimelineToPDF(data); toast.success('PDF exported') }
    catch { toast.error('Failed to export PDF') }
  }

  const handleCSV = () => {
    try { exportTimelineToCSV(data); toast.success('CSV exported') }
    catch { toast.error('Failed to export CSV') }
  }

  return (
    <div className="flex gap-3">
      <button onClick={handlePDF}
        className="flex items-center gap-2 px-4 py-2 rounded-xl bg-red-500/10 text-red-400 border border-red-500/20 hover:bg-red-500/20 transition-colors text-sm">
        <FileText className="w-4 h-4" /> Export PDF
      </button>
      <button onClick={handleCSV}
        className="flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 hover:bg-emerald-500/20 transition-colors text-sm">
        <Download className="w-4 h-4" /> Export CSV
      </button>
    </div>
  )
}
