import { describe, expect, it } from "vitest";
import { addFractions, compareFractions, mergeParts } from "./fractionOperations.js";

const fraction = (numerator: number, denominator: number) => ({
  type: "fraction-bar" as const,
  numerator,
  denominator,
});

describe("fraction operations", () => {
  it("merges equal subparts without changing value", () => {
    expect(mergeParts(fraction(4, 8), 2)).toMatchObject({
      numerator: 2,
      denominator: 4,
      label: "2/4",
    });
  });

  it("compares fractions without floating point conversion", () => {
    expect(compareFractions(fraction(1, 2), fraction(3, 4))).toBe("less-than");
    expect(compareFractions(fraction(2, 4), fraction(1, 2))).toBe("equal");
  });

  it("adds fractions with equal denominators", () => {
    expect(addFractions(fraction(1, 4), fraction(2, 4))).toMatchObject({
      numerator: 3,
      denominator: 4,
      label: "3/4",
    });
  });

  it("rejects addition with unlike denominators", () => {
    expect(() => addFractions(fraction(1, 2), fraction(1, 4))).toThrow(/same denominator/);
  });
});
