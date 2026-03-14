import React from 'react'
import { computeBudgetLine } from './graphMath'

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

export default function BudgetConstraintChart({ budget, priceX, priceY, xLabel, yLabel, svgId }) {
  const { interceptX, interceptY } = computeBudgetLine({ budget, priceX, priceY })
  const maxX = Math.max(interceptX * 1.1, 1)
  const maxY = Math.max(interceptY * 1.1, 1)
  const { domainMax, scaleX, scaleY, xAxisStart, xAxisEnd, yAxisTop, yAxisBottom } = createEqualScale(maxX, maxY)

  return (
    <svg id={svgId} viewBox={`0 0 ${WIDTH} ${HEIGHT}`} className="chart-svg" role="img">
      <rect x="0" y="0" width={WIDTH} height={HEIGHT} fill="white" />

      <line x1={xAxisStart} y1={yAxisBottom} x2={xAxisEnd} y2={yAxisBottom} className="axis" />
      <line x1={xAxisStart} y1={yAxisTop} x2={xAxisStart} y2={yAxisBottom} className="axis" />

      {Array.from({ length: 6 }, (_, i) => i).map((step) => {
        const x = (domainMax / 5) * step
        return (
          <g key={`gx-${step}`}>
            <line x1={scaleX(x)} y1={yAxisTop} x2={scaleX(x)} y2={yAxisBottom} className="grid" />
            <text x={scaleX(x)} y={yAxisBottom + 20} textAnchor="middle" className="tick-label">
              {x.toFixed(1)}
            </text>
          </g>
        )
      })}

      {Array.from({ length: 6 }, (_, i) => i).map((step) => {
        const y = (domainMax / 5) * step
        return (
          <g key={`gy-${step}`}>
            <line x1={xAxisStart} y1={scaleY(y)} x2={xAxisEnd} y2={scaleY(y)} className="grid" />
            <text x={xAxisStart - 12} y={scaleY(y) + 4} textAnchor="end" className="tick-label">
              {y.toFixed(1)}
            </text>
          </g>
        )
      })}

      <polygon
        points={`${scaleX(0)},${scaleY(0)} ${scaleX(0)},${scaleY(interceptY)} ${scaleX(interceptX)},${scaleY(0)}`}
        className="area"
      />
      <line x1={scaleX(0)} y1={scaleY(interceptY)} x2={scaleX(interceptX)} y2={scaleY(0)} className="budget-line" />

      <circle cx={scaleX(interceptX)} cy={scaleY(0)} r="5" className="point" />
      <circle cx={scaleX(0)} cy={scaleY(interceptY)} r="5" className="point" />

      <text x={scaleX(interceptX) - 8} y={scaleY(0) - 10} className="annotation">
        ({interceptX.toFixed(2)}, 0)
      </text>
      <text x={scaleX(0) + 8} y={scaleY(interceptY) - 10} className="annotation">
        (0, {interceptY.toFixed(2)})
      </text>

      <text x={WIDTH / 2} y={HEIGHT - 10} textAnchor="middle" className="axis-title">
        {xLabel}
      </text>
      <text x="18" y={HEIGHT / 2} textAnchor="middle" transform={`rotate(-90 18 ${HEIGHT / 2})`} className="axis-title">
        {yLabel}
      </text>
    </svg>
  )
}