import React from 'react'
import { computeIndifferenceLevels } from './graphMath'

const WIDTH = 760
const HEIGHT = 460
const PAD = { top: 30, right: 20, bottom: 50, left: 60 }

function scaleX(x, maxX) {
  const innerWidth = WIDTH - PAD.left - PAD.right
  return PAD.left + (x / maxX) * innerWidth
}

function scaleY(y, maxY) {
  const innerHeight = HEIGHT - PAD.top - PAD.bottom
  return HEIGHT - PAD.bottom - (y / maxY) * innerHeight
}

function createCurvePath(level, X, Y, maxX, maxY) {
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
    .map(([x, y], idx) => `${idx === 0 ? 'M' : 'L'} ${scaleX(x, maxX)} ${scaleY(y, maxY)}`)
    .join(' ')
}

export default function IndifferenceCurveChart({ config, svgId }) {
  const { movieTicks, movieUtils, gradeLabels, gradeUtils, wantedPoints, xAxisTitle = 'X labels', yAxisTitle = 'Y labels' } = config
  const { X, Y, points, levels } = computeIndifferenceLevels({
    movieTicks,
    movieUtils,
    gradeLabels,
    gradeUtils,
    wantedPoints,
  })

  const maxX = Math.max(...movieTicks, ...wantedPoints.map((p) => Number(p.movies) || 0), 1)
  const maxY = Math.max(gradeLabels.length - 1, 1)

  return (
    <svg id={svgId} viewBox={`0 0 ${WIDTH} ${HEIGHT}`} className="chart-svg" role="img">
      <rect x="0" y="0" width={WIDTH} height={HEIGHT} fill="white" />

      <line x1={PAD.left} y1={scaleY(0, maxY)} x2={WIDTH - PAD.right} y2={scaleY(0, maxY)} className="axis" />
      <line x1={PAD.left} y1={PAD.top} x2={PAD.left} y2={HEIGHT - PAD.bottom} className="axis" />

      {movieTicks.map((tick) => (
        <g key={`x-${tick}`}>
          <line x1={scaleX(tick, maxX)} y1={PAD.top} x2={scaleX(tick, maxX)} y2={HEIGHT - PAD.bottom} className="grid" />
          <text x={scaleX(tick, maxX)} y={HEIGHT - PAD.bottom + 20} textAnchor="middle" className="tick-label">
            {tick}
          </text>
        </g>
      ))}

      {gradeLabels.map((label, index) => (
        <g key={`y-${label}`}>
          <line x1={PAD.left} y1={scaleY(index, maxY)} x2={WIDTH - PAD.right} y2={scaleY(index, maxY)} className="grid" />
          <text x={PAD.left - 12} y={scaleY(index, maxY) + 4} textAnchor="end" className="tick-label">
            {label}
          </text>
        </g>
      ))}

      {levels.map((level) => {
        const path = createCurvePath(level, X, Y, maxX, maxY)
        return path ? <path key={level} d={path} fill="none" className="curve" /> : null
      })}

      {points.map((point, index) => (
        <g key={`${point.grade}-${index}`}>
          <line x1={scaleX(point.x, maxX)} y1={scaleY(0, maxY)} x2={scaleX(point.x, maxX)} y2={scaleY(point.y, maxY)} className="guide" />
          <line x1={scaleX(0, maxX)} y1={scaleY(point.y, maxY)} x2={scaleX(point.x, maxX)} y2={scaleY(point.y, maxY)} className="guide" />
          <circle cx={scaleX(point.x, maxX)} cy={scaleY(point.y, maxY)} r="5" className="point" />
          <text x={scaleX(point.x, maxX) + 8} y={scaleY(point.y, maxY) - 8} className="annotation">
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