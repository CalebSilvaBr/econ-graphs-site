# Economic Graph Builder

A small React + Vite project for generating:

- Indifference Curve
- Budget Constraint
- Budget Constraint + Indifference Curve

## Run locally

```bash
npm install
npm run dev
```

## Build

```bash
npm run build
```

## Structure

- `src/charts/IndifferenceCurveChart.jsx`
- `src/charts/BudgetConstraintChart.jsx`
- `src/charts/CombinedChart.jsx`
- `src/charts/graphMath.js`
- `src/components/AccordionSection.jsx`
- `src/components/Field.jsx`

Each chart is isolated in its own module to make future additions easier.
