'use client'

import { useEffect, useRef } from 'react'
import * as d3 from 'd3'
import { CitationNetwork } from '@/lib/api'

interface CitationNetworkGraphProps {
  data: CitationNetwork
}

export default function CitationNetworkGraph({ data }: CitationNetworkGraphProps) {
  const svgRef = useRef<SVGSVGElement>(null)

  useEffect(() => {
    if (!svgRef.current || !data.nodes.length) return

    const svg = d3.select(svgRef.current)
    svg.selectAll('*').remove()

    const width = 1000
    const height = 700

    svg.attr('width', width).attr('height', height)

    const simulation = d3.forceSimulation(data.nodes as any)
      .force('link', d3.forceLink(data.edges).id((d: any) => d.id).distance(100))
      .force('charge', d3.forceManyBody().strength(-300))
      .force('center', d3.forceCenter(width / 2, height / 2))
      .force('collision', d3.forceCollide().radius(30))

    const colorScale = d3.scaleSequential(d3.interpolateViridis)
      .domain([0, d3.max(data.nodes, d => d.impact_score) || 1])

    const link = svg.append('g')
      .selectAll('line')
      .data(data.edges)
      .enter()
      .append('line')
      .attr('stroke', '#999')
      .attr('stroke-opacity', 0.6)
      .attr('stroke-width', (d: any) => Math.sqrt(d.weight) * 2)

    const node = svg.append('g')
      .selectAll('circle')
      .data(data.nodes)
      .enter()
      .append('circle')
      .attr('r', (d: any) => 5 + d.impact_score * 10)
      .attr('fill', (d: any) => colorScale(d.impact_score))
      .attr('stroke', '#fff')
      .attr('stroke-width', 2)
      .style('cursor', 'pointer')
      .call(d3.drag<any, any>()
        .on('start', dragstarted)
        .on('drag', dragged)
        .on('end', dragended))

    const label = svg.append('g')
      .selectAll('text')
      .data(data.nodes)
      .enter()
      .append('text')
      .text((d: any) => d.label)
      .attr('font-size', 10)
      .attr('dx', 12)
      .attr('dy', 4)

    node.on('mouseover', function(event, d: any) {
      d3.select('body')
        .append('div')
        .attr('class', 'tooltip')
        .style('left', (event.pageX + 10) + 'px')
        .style('top', (event.pageY - 10) + 'px')
        .html(`
          <strong>${d.label}</strong><br/>
          Year: ${d.year}<br/>
          Impact Score: ${d.impact_score.toFixed(2)}
        `)

      d3.select(this)
        .transition()
        .duration(200)
        .attr('r', (d: any) => 8 + d.impact_score * 10)
    })
    .on('mouseout', function(event, d: any) {
      d3.selectAll('.tooltip').remove()
      d3.select(this)
        .transition()
        .duration(200)
        .attr('r', (d: any) => 5 + d.impact_score * 10)
    })

    simulation.on('tick', () => {
      link
        .attr('x1', (d: any) => d.source.x)
        .attr('y1', (d: any) => d.source.y)
        .attr('x2', (d: any) => d.target.x)
        .attr('y2', (d: any) => d.target.y)

      node
        .attr('cx', (d: any) => d.x)
        .attr('cy', (d: any) => d.y)

      label
        .attr('x', (d: any) => d.x)
        .attr('y', (d: any) => d.y)
    })

    function dragstarted(event: any) {
      if (!event.active) simulation.alphaTarget(0.3).restart()
      event.subject.fx = event.subject.x
      event.subject.fy = event.subject.y
    }

    function dragged(event: any) {
      event.subject.fx = event.x
      event.subject.fy = event.y
    }

    function dragended(event: any) {
      if (!event.active) simulation.alphaTarget(0)
      event.subject.fx = null
      event.subject.fy = null
    }

  }, [data])

  return (
    <div className="w-full overflow-x-auto bg-white rounded-lg p-4">
      <svg ref={svgRef} className="mx-auto"></svg>
    </div>
  )
}
