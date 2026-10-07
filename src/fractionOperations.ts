import type { FractionBarSpec } from "./types.js";

export type FractionComparison = "less-than" | "equal" | "greater-than";

function assertSameDenominator(left: FractionBarSpec, right: FractionBarSpec): void {
  if (left.denominator !== right.denominator) {
    throw new RangeError("fractions must have the same denominator for this operation");
  }
}

export function mergeParts(state: FractionBarSpec, factor: number): FractionBarSpec {
  if (!Number.isInteger(factor) || factor < 2) {
    throw new RangeError("merge factor must be an integer greater than or equal to 2");
  }
  if (state.denominator % factor !== 0 || state.numerator % factor !== 0) {
    throw new RangeError("numerator and denominator must both be divisible by merge factor");
  }

  const numerator = state.numerator / factor;
  const denominator = state.denominator / factor;
  return { ...state, numerator, denominator, label: `${numerator}/${denominator}` };
}

export function compareFractions(
  left: FractionBarSpec,
  right: FractionBarSpec,
): FractionComparison {
  const leftValue = left.numerator * right.denominator;
  const rightValue = right.numerator * left.denominator;
  if (leftValue === rightValue) return "equal";
  return leftValue < rightValue ? "less-than" : "greater-than";
}

export function addFractions(
  left: FractionBarSpec,
  right: FractionBarSpec,
): FractionBarSpec {
  assertSameDenominator(left, right);
  const numerator = left.numerator + right.numerator;
  if (numerator > left.denominator) {
    throw new RangeError("fraction-bar addition currently supports sums up to one whole");
  }

  return {
    ...left,
    numerator,
    label: `${numerator}/${left.denominator}`,
  };
}
