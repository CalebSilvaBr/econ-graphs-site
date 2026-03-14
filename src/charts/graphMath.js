export const DEFAULT_GRADES = ['E', 'D', 'C', 'B', 'A', "A'", "A''", "A'''"]

export function parseNumberList(text, fallback = []) {
  const values = String(text || '')
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean)
    .map(Number)

  return values.length && values.every((v) => Number.isFinite(v)) ? values : fallback
}

export function parseLabelList(text, fallback = DEFAULT_GRADES) {
  const values = String(text || '')
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean)

  return values.length ? values : fallback
}

export function buildLinearInterpolator(xs, ys) {
  return (x) => {
    if (x <= xs[0]) return ys[0]
    if (x >= xs[xs.length - 1]) return ys[ys.length - 1]

    for (let i = 0; i < xs.length - 1; i += 1) {
      if (x >= xs[i] && x <= xs[i + 1]) {
        const t = (x - xs[i]) / (xs[i + 1] - xs[i])
        return ys[i] + t * (ys[i + 1] - ys[i])
      }
    }

    return ys[ys.length - 1]
  }
}

export function buildGradeIndexMap(labels) {
  return Object.fromEntries(labels.map((label, index) => [label, index]))
}

export function computeIndifferenceLevels({ movieTicks, movieUtils, gradeLabels, gradeUtils, wantedPoints }) {
  const X = buildLinearInterpolator(movieTicks, movieUtils)
  const Y = buildLinearInterpolator(
    Array.from({ length: gradeUtils.length }, (_, i) => i),
    gradeUtils
  )
  const gradeToIndex = buildGradeIndexMap(gradeLabels)

  const points = wantedPoints
    .filter((item) => item.grade in gradeToIndex)
    .map((item) => {
      const x = Number(item.movies)
      const y = gradeToIndex[item.grade]
      const utility = X(x) + Y(y)
      return { x, y, grade: item.grade, utility }
    })

  const levels = [...new Set(points.map((p) => Math.round(p.utility)))]
  return { X, Y, points, levels, gradeToIndex }
}

export function computeBudgetLine({ budget, priceX, priceY }) {
  if (priceX <= 0 || priceY <= 0 || budget < 0) {
    return { interceptX: 0, interceptY: 0 }
  }

  return {
    interceptX: budget / priceX,
    interceptY: budget / priceY,
  }
}

export function downloadSvg(svgId, filename) {
  const svg = document.getElementById(svgId)
  if (!svg) return

  const serializer = new XMLSerializer()
  const source = serializer.serializeToString(svg)
  const blob = new Blob([source], { type: 'image/svg+xml;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  link.click()
  URL.revokeObjectURL(url)
}
