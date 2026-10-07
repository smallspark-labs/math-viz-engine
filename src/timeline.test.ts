import { describe, expect, it } from "vitest";
import { compileFractionBarTimeline, splitEachPart } from "./timeline.js";

describe("fraction bar timeline", () => {
  it("splits every part while preserving the fraction value", () => {
    expect(
      splitEachPart(
        { type: "fraction-bar", numerator: 1, denominator: 2, label: "1/2" },
        2,
      ),
    ).toMatchObject({
      numerator: 2,
      denominator: 4,
      label: "2/4",
    });
  });

  it("compiles state -> transition -> state frames", () => {
    const frames = compileFractionBarTimeline({
      type: "fraction-bar-timeline",
      initial: { type: "fraction-bar", numerator: 1, denominator: 2 },
      transitions: [
        { type: "split-each-part", factor: 2 },
        { type: "split-each-part", factor: 2 },
      ],
    });

    expect(frames.map(({ state }) => [state.numerator, state.denominator])).toEqual([
      [1, 2],
      [2, 4],
      [4, 8],
    ]);
  });

  it("rejects invalid split factors", () => {
    expect(() =>
      splitEachPart({ type: "fraction-bar", numerator: 1, denominator: 2 }, 1),
    ).toThrow(/split factor/);
  });
});
