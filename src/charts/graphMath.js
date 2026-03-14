export const DEFAULT_GRADES = ['E', 'D', 'C', 'B', 'A', "A'", "A''", "A'''"]

export function parseNumberList(value) {
  if (Array.isArray(value)) {
    return value.map((item) => Number(item)).filter((item) => Number.isFinite(item))
  }

  return String(value ?? '')
    .split(',')
    .map((item) => Number(item.trim()))
    .filter((item) => Number.isFinite(item))
}

export function parseLabelList(value) {
  if (Array.isArray(value)) {
    return value.map((item) => String(item).trim()).filter(Boolean)
  }

  return String(value ?? '')
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean)
}

function createLinearInterpolator(xs, ys) {
  const points = xs
    .map((x, index) => [Number(x), Number(ys[index])])
    .filter(([x, y]) => Number.isFinite(x) && Number.isFinite(y))
    .sort((a, b) => a[0] - b[0])

  if (!points.length) {
    return () => 0
  }

  if (points.length === 1) {
    return () => points[0][1]
  }

  return (x) => {
    const value = Number(x)

    if (!Number.isFinite(value)) return 0
    if (value <= points[0][0]) return points[0][1]
    if (value >= points[points.length - 1][0]) return points[points.length - 1][1]

    for (let i = 0; i < points.length - 1; i += 1) {
      const [x0, y0] = points[i]
      const [x1, y1] = points[i + 1]

      if (value >= x0 && value <= x1) {
        const t = (value - x0) / (x1 - x0)
        return y0 + t * (y1 - y0)
      }
    }

    return points[points.length - 1][1]
  }
}

export function computeIndifferenceLevels({
  movieTicks = [],
  movieUtils = [],
  gradeLabels = [],
  gradeUtils = [],
  wantedPoints = [],
}) {
  const safeMovieTicks = parseNumberList(movieTicks)
  const safeMovieUtils = parseNumberList(movieUtils)
  const safeGradeLabels = parseLabelList(gradeLabels)
  const safeGradeUtils = parseNumberList(gradeUtils)

  const X = createLinearInterpolator(safeMovieTicks, safeMovieUtils)

  const gradeIndexes = safeGradeLabels.map((_, index) => index)
  const Y = createLinearInterpolator(gradeIndexes, safeGradeUtils)

  const gradeToYIndex = Object.fromEntries(
    safeGradeLabels.map((label, index) => [label, index])
  )

  const points = wantedPoints
    .map((point) => {
      const x = Number(point.movies)
      const grade = String(point.grade ?? '').trim()
      const y = gradeToYIndex[grade]

      if (!Number.isFinite(x) || !Number.isFinite(y)) return null

      const utility = X(x) + Y(y)

      return {
        x,
        y,
        grade,
        utility,
      }
    })
    .filter(Boolean)

  const levels = [...new Set(points.map((point) => Number(point.utility.toFixed(7))))].sort((a, b) => a - b)

  return {
    X,
    Y,
    points,
    levels,
  }
}

export function computeBudgetLine({ budget, priceX, priceY }) {
  const safeBudget = Number(budget)
  const safePriceX = Number(priceX)
  const safePriceY = Number(priceY)

  const interceptX =
    Number.isFinite(safeBudget) && Number.isFinite(safePriceX) && safePriceX > 0
      ? safeBudget / safePriceX
      : 0

  const interceptY =
    Number.isFinite(safeBudget) && Number.isFinite(safePriceY) && safePriceY > 0
      ? safeBudget / safePriceY
      : 0

  return {
    interceptX,
    interceptY,
  }
}

function copyComputedStylesToInline(sourceNode, targetNode) {
  if (!(sourceNode instanceof Element) || !(targetNode instanceof Element)) return

  const computed = window.getComputedStyle(sourceNode)

  const styleProps = [
    'fill',
    'fill-opacity',
    'fill-rule',
    'stroke',
    'stroke-width',
    'stroke-opacity',
    'stroke-dasharray',
    'stroke-dashoffset',
    'stroke-linecap',
    'stroke-linejoin',
    'stroke-miterlimit',
    'opacity',
    'color',
    'font',
    'font-family',
    'font-size',
    'font-weight',
    'font-style',
    'letter-spacing',
    'text-anchor',
    'dominant-baseline',
    'visibility',
    'display',
    'paint-order',
    'vector-effect',
    'shape-rendering',
  ]

  styleProps.forEach((prop) => {
    const value = computed.getPropertyValue(prop)
    if (value) {
      targetNode.style.setProperty(prop, value)
    }
  })

  const sourceChildren = sourceNode.children
  const targetChildren = targetNode.children

  for (let i = 0; i < sourceChildren.length; i += 1) {
    copyComputedStylesToInline(sourceChildren[i], targetChildren[i])
  }
}

function buildStyledSvgClone(svg) {
  const clone = svg.cloneNode(true)

  copyComputedStylesToInline(svg, clone)

  clone.setAttribute('xmlns', 'http://www.w3.org/2000/svg')
  clone.setAttribute('xmlns:xlink', 'http://www.w3.org/1999/xlink')

  const viewBox = svg.viewBox?.baseVal
  const width = viewBox && viewBox.width ? viewBox.width : svg.clientWidth || 760
  const height = viewBox && viewBox.height ? viewBox.height : svg.clientHeight || 460

  if (!clone.getAttribute('viewBox')) {
    clone.setAttribute('viewBox', `0 0 ${width} ${height}`)
  }

  clone.setAttribute('width', `${width}`)
  clone.setAttribute('height', `${height}`)

  return { clone, width, height }
}

/*
  Mantido o nome downloadSvg para não mudar a dinâmica atual.
  Agora ele exporta em PNG com estilos preservados.
*/
export function downloadSvg(target, filename = 'chart.png', scale = 3) {
  let svg = null

  if (typeof target === 'string') {
    svg = document.getElementById(target)
  } else if (target?.current) {
    svg = target.current
  } else {
    svg = target
  }

  if (!svg) return

  const { clone, width, height } = buildStyledSvgClone(svg)

  const serializer = new XMLSerializer()
  const source = serializer.serializeToString(clone)

  const svgBlob = new Blob([source], { type: 'image/svg+xml;charset=utf-8' })
  const url = URL.createObjectURL(svgBlob)
  const img = new Image()

  img.onload = () => {
    const canvas = document.createElement('canvas')
    canvas.width = width * scale
    canvas.height = height * scale

    const ctx = canvas.getContext('2d')
    if (!ctx) {
      URL.revokeObjectURL(url)
      return
    }

    ctx.setTransform(scale, 0, 0, scale, 0, 0)
    ctx.fillStyle = '#ffffff'
    ctx.fillRect(0, 0, width, height)
    ctx.drawImage(img, 0, 0, width, height)

    URL.revokeObjectURL(url)

    canvas.toBlob((blob) => {
      if (!blob) return

      const pngUrl = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = pngUrl

      const safeName = filename.toLowerCase().endsWith('.png')
        ? filename
        : filename.replace(/\.[a-z0-9]+$/i, '') + '.png'

      link.download = safeName
      link.click()

      URL.revokeObjectURL(pngUrl)
    }, 'image/png')
  }

  img.onerror = () => {
    URL.revokeObjectURL(url)
  }

  img.src = url
}