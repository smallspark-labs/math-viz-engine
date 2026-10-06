import { renderFractionBarSvg } from "./fractionBar.js";
import type { MathVizSpec } from "./types.js";

export type {
  FractionBarSpec,
  MathVizSpec,
  NormalizedFractionBar,
} from "./types.js";
export { normalizeFractionBar, renderFractionBarSvg } from "./fractionBar.js";

export function renderSvg(spec: MathVizSpec): string {
  switch (spec.type) {
    case "fraction-bar":
      return renderFractionBarSvg(spec);
  }
}
