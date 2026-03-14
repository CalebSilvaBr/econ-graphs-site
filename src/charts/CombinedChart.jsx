import React from 'react'
import { computeIndifferenceLevels, computeBudgetLine } from './graphMath'

const WIDTH = 760
const HEIGHT = 460
const PAD = { top: 30, right: 20, bottom: 50, left: 60 }

function createEqualScale(maxX, maxY) {
  const innerWidth = WIDTH - PAD.left - PAD.right
  const innerHeight = HEIGHT - PAD.top - PAD.bottom
  const domainMax = Math.max(maxX, maxY, 1)
  const unitScale = Math.min(innerWidth / domainMax, innerHeight / domainMax)
  const plotWidth = domainMax * unitScale
  const plotHeight = domainMax * unitScale
  const extraX = innerWidth - plotWidth
  const extraY = innerHeight - plotHeight
  const x0 = PAD.left + extraX / 2
  const y0 = HEIGHT - PAD.bottom - extraY / 2

  return {
    domainMax,
    scaleX: (x) => x0 + x * unitScale,
    scaleY: (y) => y0 - y * unitScale,
    xAxisStart: x0,
    xAxisEnd: x0 + plotWidth,
    yAxisTop: y0 - plotHeight,
    yAxisBottom: y0,
  }
}

function createCurvePath(level, X, Y, maxX, maxY, scaleX, scaleY) {
  const points = []

  for (let x = 0; x <= maxX; x += maxX / 140) {
    for (let y = 0; y <= maxY; y += maxY / 140) {
      const utility = X(x) + Y(y)
      if (Math.abs(utility - level) < Math.max(2, level * 0.004)) {
        points.push([x, y])
        break
      }
    }
  }

  if (!points.length) return ''

  return points
    .map(([x, y], idx) => `${idx === 0 ? 'M' : 'L'} ${scaleX(x)} ${scaleY(y)}`)
    .join(' ')
}

export default function CombinedChart({ config, budget, priceX, priceY, svgId }) {
  const { movieTicks, movieUtils, gradeLabels, gradeUtils, wantedPoints, xAxisTitle = 'X labels', yAxisTitle = 'Y labels' } = config
  const { X, Y, points, levels } = computeIndifferenceLevels({
    movieTicks,
    movieUtils,
    gradeLabels,
    gradeUtils,
    wantedPoints,
  })
  const { interceptX, interceptY } = computeBudgetLine({ budget, priceX, priceY })
  const maxX = Math.max(...movieTicks, interceptX, ...wantedPoints.map((p) => Number(p.movies) || 0), 1)
  const maxY = Math.max(gradeLabels.length - 1, interceptY, 1)
  const { scaleX, scaleY, xAxisStart, xAxisEnd, yAxisTop, yAxisBottom } = createEqualScale(maxX, maxY)

  return (
    <svg id={svgId} viewBox={`0 0 ${WIDTH} ${HEIGHT}`} className="chart-svg" role="img">
      <rect x="0" y="0" width={WIDTH} height={HEIGHT} fill="white" />

      <line x1={xAxisStart} y1={yAxisBottom} x2={xAxisEnd} y2={yAxisBottom} className="axis" />
      <line x1={xAxisStart} y1={yAxisTop} x2={xAxisStart} y2={yAxisBottom} className="axis" />

      {movieTicks.map((tick) => (
        <g key={`x-${tick}`}>
          <line x1={scaleX(tick)} y1={yAxisTop} x2={scaleX(tick)} y2={yAxisBottom} className="grid" />
          <text x={scaleX(tick)} y={yAxisBottom + 20} textAnchor="middle" className="tick-label">
            {tick}
          </text>
        </g>
      ))}

      {gradeLabels.map((label, index) => (
        <g key={`y-${label}`}>
          <line x1={xAxisStart} y1={scaleY(index)} x2={xAxisEnd} y2={scaleY(index)} className="grid" />
          <text x={xAxisStart - 12} y={scaleY(index) + 4} textAnchor="end" className="tick-label">
            {label}
          </text>
        </g>
      ))}

      <polygon
        points={`${scaleX(0)},${scaleY(0)} ${scaleX(0)},${scaleY(interceptY)} ${scaleX(interceptX)},${scaleY(0)}`}
        className="area overlay-area"
      />
      <line x1={scaleX(0)} y1={scaleY(interceptY)} x2={scaleX(interceptX)} y2={scaleY(0)} className="budget-line" />

      {levels.map((level) => {
        const path = createCurvePath(level, X, Y, maxX, maxY, scaleX, scaleY)
        return path ? <path key={level} d={path} fill="none" className="curve" /> : null
      })}

      {points.map((point, index) => (
        <g key={`${point.grade}-${index}`}>
          <line x1={scaleX(point.x)} y1={scaleY(0)} x2={scaleX(point.x)} y2={scaleY(point.y)} className="guide" />
          <line x1={scaleX(0)} y1={scaleY(point.y)} x2={scaleX(point.x)} y2={scaleY(point.y)} className="guide" />
          <circle cx={scaleX(point.x)} cy={scaleY(point.y)} r="5" className="point" />
          <text x={scaleX(point.x) + 8} y={scaleY(point.y) - 8} className="annotation">
            {Math.round(point.utility)}
          </text>
        </g>
      ))}

      <text x={WIDTH / 2} y={HEIGHT - 10} textAnchor="middle" className="axis-title">
        {xAxisTitle}
      </text>
      <text x="18" y={HEIGHT / 2} textAnchor="middle" transform={`rotate(-90 18 ${HEIGHT / 2})`} className="axis-title">
        {yAxisTitle}
      </text>
    </svg>
  )
}
