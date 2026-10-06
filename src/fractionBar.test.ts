import { describe, expect, it } from "vitest";
import { normalizeFractionBar, renderFractionBarSvg } from "./fractionBar.js";

describe("fraction bar", () => {
  it("normalizes defaults", () => {
    expect(
      normalizeFractionBar({ type: "fraction-bar", numerator: 3, denominator: 5 }),
    ).toEqual({
      type: "fraction-bar",
      numerator: 3,
      denominator: 5,
      width: 320,
      height: 56,
      gap: 4,
    });
  });

  it("renders one cell per denominator and marks filled cells", () => {
    const svg = renderFractionBarSvg({
      type: "fraction-bar",
      numerator: 2,
      denominator: 4,
      label: "2/4",
    });

    expect(svg.match(/<rect /g)).toHaveLength(4);
    expect(svg.match(/data-filled="true"/g)).toHaveLength(2);
    expect(svg).toContain(">2/4</text>");
  });

  it("escapes labels", () => {
    const svg = renderFractionBarSvg({
      type: "fraction-bar",
      numerator: 1,
      denominator: 2,
      label: "1 < 2 & safe",
    });

    expect(svg).toContain("1 &lt; 2 &amp; safe");
  });

  it("rejects invalid fractions", () => {
    expect(() =>
      normalizeFractionBar({ type: "fraction-bar", numerator: 4, denominator: 3 }),
    ).toThrow(/numerator/);

    expect(() =>
      normalizeFractionBar({ type: "fraction-bar", numerator: 1, denominator: 0 }),
    ).toThrow(/denominator/);
  });
});
