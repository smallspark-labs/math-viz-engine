# math-viz-engine

A small, framework-agnostic engine for turning elementary math concepts into deterministic SVG visualizations.

> Don't just give the answer. Show why it works.

The first vertical slice is `FractionBar`: describe a fraction with a tiny JSON-friendly DSL and render it as accessible SVG.

## Playground

The repository includes an interactive playground for equivalent fractions and custom fraction bars.

Once GitHub Pages is enabled for this repository, the intended public URL is:

`https://smallspark-labs.github.io/math-viz-engine/`

Local development:

```bash
npm install
npm test
npm run build

cd playground
npm install
npm run dev
```

## Goals

- Keep the core independent from React/React Native.
- Use serializable scene descriptions so AI or apps can generate visuals safely.
- Produce deterministic SVG without a browser or canvas dependency.
- Keep reusable engine code separate from product-specific lesson content.
- Grow from one primitive at a time instead of building a general drawing system too early.

## Example

```ts
import { renderSvg } from "@smallspark/math-viz-engine";

const svg = renderSvg({
  type: "fraction-bar",
  numerator: 3,
  denominator: 5,
  label: "3/5",
});
```

The output is a complete SVG string. Filled parts are exposed with `data-filled="true"`, making the output easy to inspect and style downstream.

## Minimal DSL

```ts
type FractionBarSpec = {
  type: "fraction-bar";
  numerator: number;
  denominator: number;
  label?: string;
  width?: number;
  height?: number;
  gap?: number;
};
```

Validation is intentionally strict: denominator must be a positive integer and numerator must be an integer between `0` and `denominator`.

## Architecture

```text
math concept
   ↓
serializable DSL
   ↓
math-viz-engine
   ↓
deterministic SVG
   ↓
playground / learning app / teacher tool / video renderer / AI tutor
```

## Roadmap

1. Fraction bar — current vertical slice
2. Number line
3. Array / multiplication model
4. Geometry primitives
5. Composition/layout DSL
6. Animation / scene timeline
7. Optional React / React Native adapters

The engine should remain useful without any adapter: `spec -> normalized scene -> SVG` is the core contract.


_Pages deployment is automated from `main` via GitHub Actions._
