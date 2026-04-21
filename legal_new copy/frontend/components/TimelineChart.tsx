'use client'

import { useEffect, useRef } from 'react'
import * as d3 from 'd3'

interface TimelineDataPoint {
  year: number
  smi_score: number
  drift_type: string
  key_cases: string[]
}

interface TimelineChartProps {
  data: {
    timeline: TimelineDataPoint[] | Array<{
      period_start: number
      period_end: number
      smi_score: number
      drift_type: string
      confidence: number
      key_cases: Record<string, unknown>[]
      document_count: number
    }>
  }
}

function normalizePoints(raw: TimelineChartProps['data']['timeline']): TimelineDataPoint[] {
  return raw.map((p: any) => ({
    year: p.year ?? (typeof p.period_start === 'string' ? parseInt(p.period_start) : p.period_start) ?? 0,
    smi_score: p.smi_score ?? 0,
    drift_type: (p.drift_type ?? 'stable').toLowerCase(),
    key_cases: Array.isArray(p.key_cases)
      ? p.key_cases.map((c: any) => typeof c === 'string' ? c : c?.name ?? '')
      : [],
  }))
}

export default function TimelineChart({ data }: TimelineChartProps) {
  const svgRef = useRef<SVGSVGElement>(null)

  useEffect(() => {
    if (!svgRef.current || !data.timeline.length) return
    const points = normalizePoints(data.timeline)

    const svg = d3.select(svgRef.current)
    svg.selectAll('*').remove()

    const margin = { top: 20, right: 30, bottom: 50, left: 60 }
    const width = 1000 - margin.left - margin.right
    const height = 500 - margin.top - margin.bottom

    const g = svg
      .attr('width', width + margin.left + margin.right)
      .attr('height', height + margin.top + margin.bottom)
      .append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`)

    const x = d3.scaleLinear()
      .domain(d3.extent(points, d => d.year) as [number, number])
      .range([0, width])

    const y = d3.scaleLinear()
      .domain([0, d3.max(points, d => d.smi_score) || 1])
      .range([height, 0])

    // Axes with dark theme styling
    const xAxis = g.append('g').attr('transform', `translate(0,${height})`).call(d3.axisBottom(x).tickFormat(d => d.toString()))
    xAxis.selectAll('text').style('font-size', '12px').style('fill', 'rgba(255,255,255,0.4)')
    xAxis.selectAll('line').style('stroke', 'rgba(255,255,255,0.1)')
    xAxis.select('.domain').style('stroke', 'rgba(255,255,255,0.1)')

    const yAxis = g.append('g').call(d3.axisLeft(y))
    yAxis.selectAll('text').style('font-size', '12px').style('fill', 'rgba(255,255,255,0.4)')
    yAxis.selectAll('line').style('stroke', 'rgba(255,255,255,0.1)')
    yAxis.select('.domain').style('stroke', 'rgba(255,255,255,0.1)')

    g.append('text').attr('x', width / 2).attr('y', height + 40).attr('text-anchor', 'middle')
      .style('font-size', '14px').style('fill', 'rgba(255,255,255,0.4)').text('Year')

    g.append('text').attr('transform', 'rotate(-90)').attr('x', -height / 2).attr('y', -45)
      .attr('text-anchor', 'middle').style('font-size', '14px').style('fill', 'rgba(255,255,255,0.4)').text('SMI Score')

    const line = d3.line<TimelineDataPoint>()
      .x(d => x(d.year))
      .y(d => y(d.smi_score))
      .curve(d3.curveMonotoneX)

    // Gradient line
    g.append('path').datum(points)
      .attr('fill', 'none').attr('stroke', '#3366ff').attr('stroke-width', 2.5).attr('d', line)

    // Area fill
    const area = d3.area<TimelineDataPoint>()
      .x(d => x(d.year))
      .y0(height)
      .y1(d => y(d.smi_score))
      .curve(d3.curveMonotoneX)

    g.append('path').datum(points)
      .attr('fill', 'url(#areaGradient)').attr('d', area)

    const defs = svg.append('defs')
    const gradient = defs.append('linearGradient').attr('id', 'areaGradient').attr('x1', '0').attr('y1', '0').attr('x2', '0').attr('y2', '1')
    gradient.append('stop').attr('offset', '0%').attr('stop-color', 'rgba(51,102,255,0.15)')
    gradient.append('stop').attr('offset', '100%').attr('stop-color', 'rgba(51,102,255,0)')

    const colorScale = d3.scaleOrdinal<string>()
      .domain(['expansion', 'contraction', 'shift', 'stable', 'reversal'])
      .range(['#10b981', '#ef4444', '#f59e0b', '#6b7280', '#8b5cf6'])

    g.selectAll('.dot').data(points).enter().append('circle')
      .attr('cx', d => x(d.year)).attr('cy', d => y(d.smi_score))
      .attr('r', 5).attr('fill', d => colorScale(d.drift_type))
      .attr('stroke', 'rgba(15,18,37,0.8)').attr('stroke-width', 2).style('cursor', 'pointer')
      .on('mouseover', function(event, d) {
        d3.select('body').append('div').attr('class', 'tooltip')
          .style('left', (event.pageX + 10) + 'px').style('top', (event.pageY - 10) + 'px')
          .html(`<strong>${d.year}</strong><br/>SMI: ${d.smi_score.toFixed(2)}<br/>Type: ${d.drift_type}${d.key_cases.length ? `<br/>Cases: ${d.key_cases.slice(0, 2).join(', ')}` : ''}`)
        d3.select(this).transition().duration(200).attr('r', 8)
      })
      .on('mouseout', function() {
        d3.selectAll('.tooltip').remove()
        d3.select(this).transition().duration(200).attr('r', 5)
      })

    // Legend
    const legend = g.append('g').attr('transform', `translate(${width - 150}, 20)`)
    const types = ['expansion', 'contraction', 'shift', 'stable', 'reversal']
    types.forEach((type, i) => {
      const row = legend.append('g').attr('transform', `translate(0, ${i * 20})`)
      row.append('circle').attr('r', 5).attr('fill', colorScale(type))
      row.append('text').attr('x', 10).attr('y', 5).style('font-size', '12px').style('fill', 'rgba(255,255,255,0.5)').text(type)
    })
  }, [data])

  return (
    <div className="w-full overflow-x-auto">
      <svg ref={svgRef} className="mx-auto" />
    </div>
  )
}
