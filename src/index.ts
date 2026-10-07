import { renderFractionBarSvg } from "./fractionBar.js";
import type { MathVizSpec } from "./types.js";

export type {
  FractionBarSpec,
  MathVizSpec,
  NormalizedFractionBar,
} from "./types.js";
export type {
  FractionBarTimeline,
  FractionBarTimelineFrame,
  FractionBarTransition,
  SplitEachPartTransition,
} from "./timeline.js";

export { normalizeFractionBar, renderFractionBarSvg } from "./fractionBar.js";
export { compileFractionBarTimeline, splitEachPart } from "./timeline.js";
export { addFractions, compareFractions, mergeParts } from "./fractionOperations.js";
export type { FractionComparison } from "./fractionOperations.js";

export function renderSvg(spec: MathVizSpec): string {
  switch (spec.type) {
    case "fraction-bar":
      return renderFractionBarSvg(spec);
  }
}
