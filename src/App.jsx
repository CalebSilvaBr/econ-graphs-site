import React, { useMemo, useState } from 'react'
import AccordionSection from './components/AccordionSection'
import Field from './components/Field'
import IndifferenceCurveChart from './charts/IndifferenceCurveChart'
import BudgetConstraintChart from './charts/BudgetConstraintChart'
import CombinedChart from './charts/CombinedChart'
import { DEFAULT_GRADES, downloadSvg, parseLabelList, parseNumberList } from './charts/graphMath'

function parseWantedPoints(text) {
  return String(text || '')
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const [xValue, yValue] = line.split(',').map((item) => item.trim())
      return { movies: Number(xValue), grade: yValue }
    })
    .filter((item) => Number.isFinite(item.movies) && item.grade)
}

export default function App() {
  const [movieTicksText, setMovieTicksText] = useState('0,1,2,3,4,5,6,7')
  const [movieUtilsText, setMovieUtilsText] = useState('0,200,300,350,375,385,390,390')
  const [gradeLabelsText, setGradeLabelsText] = useState("E,D,C,B,A,A',A'',A'''")
  const [gradeUtilsText, setGradeUtilsText] = useState('0,100,200,500,700,800,850,860')
  const [wantedPointsText, setWantedPointsText] = useState("0,A'\n5,A'\n1,A\n2,B\n3,C")

  const [budget, setBudget] = useState(10)
  const [priceX, setPriceX] = useState(2)
  const [priceY, setPriceY] = useState(2)
  const [xLabel, setXLabel] = useState('X labels')
  const [yLabel, setYLabel] = useState('Y labels')

  const indifferenceConfig = useMemo(() => {
    const movieTicks = parseNumberList(movieTicksText, [0, 1, 2, 3, 4, 5, 6, 7])
    const movieUtils = parseNumberList(movieUtilsText, [0, 200, 300, 350, 375, 385, 390, 390])
    const gradeLabels = parseLabelList(gradeLabelsText, DEFAULT_GRADES)
    const gradeUtils = parseNumberList(gradeUtilsText, [0, 100, 200, 500, 700, 800, 850, 860])
    const wantedPoints = parseWantedPoints(wantedPointsText)

    return {
      movieTicks,
      movieUtils,
      gradeLabels,
      gradeUtils,
      wantedPoints,
      xAxisTitle: xLabel,
      yAxisTitle: yLabel,
    }
  }, [movieTicksText, movieUtilsText, gradeLabelsText, gradeUtilsText, wantedPointsText, xLabel, yLabel])

  return (
    <div className="page-shell">
      <header className="hero">
        <div>
          <p className="eyebrow">Economic Graph Builder</p>
          <h1>Generate economic charts live and export them instantly.</h1>
          <p className="hero-copy">
            Build indifference curves, budget constraints, and combined views in one place.
          </p>
        </div>
      </header>

      <main className="stacked-layout">
        <AccordionSection
          title="Indifference Curve"
          subtitle="Edit the axis mappings, utility values, and highlighted points."
          defaultOpen
        >
          <div className="split-panel">
            <div className="panel-controls">
              <div className="form-grid">
                <Field label="X-axis title">
                  <input value={xLabel} onChange={(e) => setXLabel(e.target.value)} />
                </Field>
                <Field label="Y-axis title">
                  <input value={yLabel} onChange={(e) => setYLabel(e.target.value)} />
                </Field>
                <Field label="X-axis ticks" hint="Comma-separated numbers.">
                  <input value={movieTicksText} onChange={(e) => setMovieTicksText(e.target.value)} />
                </Field>
                <Field label="X-axis utilities" hint="Must follow the same order as the X-axis ticks.">
                  <input value={movieUtilsText} onChange={(e) => setMovieUtilsText(e.target.value)} />
                </Field>
                <Field label="Y-axis labels" hint="Comma-separated labels.">
                  <input value={gradeLabelsText} onChange={(e) => setGradeLabelsText(e.target.value)} />
                </Field>
                <Field label="Y-axis utilities" hint="Must follow the same order as the Y-axis labels.">
                  <input value={gradeUtilsText} onChange={(e) => setGradeUtilsText(e.target.value)} />
                </Field>
                <Field label="Highlighted points" hint="One point per line: x value,y label">
                  <textarea rows="6" value={wantedPointsText} onChange={(e) => setWantedPointsText(e.target.value)} />
                </Field>
              </div>

              <button className="download-btn" onClick={() => downloadSvg('indifference-chart', 'indifference-curve.svg')}>
                Download chart
              </button>
            </div>

            <div className="panel-graph">
              <div className="preview-head compact">
                <h3>Live preview</h3>
              </div>
              <IndifferenceCurveChart config={indifferenceConfig} svgId="indifference-chart" />
            </div>
          </div>
        </AccordionSection>

        <AccordionSection
          title="Budget Constraint"
          subtitle="Set the total budget, two prices, and axis titles."
        >
          <div className="split-panel">
            <div className="panel-controls">
              <div className="form-grid two-columns">
                <Field label="Total budget">
                  <input type="number" value={budget} onChange={(e) => setBudget(Number(e.target.value))} />
                </Field>
                <Field label="Price of X">
                  <input type="number" value={priceX} onChange={(e) => setPriceX(Number(e.target.value))} />
                </Field>
                <Field label="Price of Y">
                  <input type="number" value={priceY} onChange={(e) => setPriceY(Number(e.target.value))} />
                </Field>
                <Field label="X-axis title">
                  <input value={xLabel} onChange={(e) => setXLabel(e.target.value)} />
                </Field>
                <Field label="Y-axis title">
                  <input value={yLabel} onChange={(e) => setYLabel(e.target.value)} />
                </Field>
              </div>

              <button className="download-btn" onClick={() => downloadSvg('budget-chart', 'budget-constraint.svg')}>
                Download chart
              </button>
            </div>

            <div className="panel-graph">
              <div className="preview-head compact">
                <h3>Live preview</h3>
              </div>
              <BudgetConstraintChart
                budget={budget}
                priceX={priceX}
                priceY={priceY}
                xLabel={xLabel}
                yLabel={yLabel}
                svgId="budget-chart"
              />
            </div>
          </div>
        </AccordionSection>

        <AccordionSection
          title="Budget Constraint + Indifference Curve"
          subtitle="Overlay both charts using the current values from the sections above."
        >
          <div className="split-panel">
            <div className="panel-controls">
              <p className="section-note">
                This combined chart uses the same X and Y titles, utility mappings, highlighted points, budget, and prices already entered above.
              </p>

              <div className="summary-card">
                <div>
                  <span className="summary-label">Budget</span>
                  <strong>{budget}</strong>
                </div>
                <div>
                  <span className="summary-label">Price of X</span>
                  <strong>{priceX}</strong>
                </div>
                <div>
                  <span className="summary-label">Price of Y</span>
                  <strong>{priceY}</strong>
                </div>
                <div>
                  <span className="summary-label">Axes</span>
                  <strong>{xLabel} / {yLabel}</strong>
                </div>
              </div>

              <button className="download-btn" onClick={() => downloadSvg('combined-chart', 'combined-chart.svg')}>
                Download chart
              </button>
            </div>

            <div className="panel-graph">
              <div className="preview-head compact">
                <h3>Live preview</h3>
              </div>
              <CombinedChart
                config={indifferenceConfig}
                budget={budget}
                priceX={priceX}
                priceY={priceY}
                svgId="combined-chart"
              />
            </div>
          </div>
        </AccordionSection>
      </main>
    </div>
  )
}
