import type { FractionBarSpec } from "./types.js";

export type SplitEachPartTransition = {
  type: "split-each-part";
  factor: number;
  durationMs?: number;
};

export type FractionBarTransition = SplitEachPartTransition;

export type FractionBarTimeline = {
  type: "fraction-bar-timeline";
  initial: FractionBarSpec;
  transitions: FractionBarTransition[];
};

export type FractionBarTimelineFrame = {
  state: FractionBarSpec;
  transition?: FractionBarTransition;
};

export function splitEachPart(
  state: FractionBarSpec,
  factor: number,
): FractionBarSpec {
  if (!Number.isInteger(factor) || factor < 2) {
    throw new RangeError("split factor must be an integer greater than or equal to 2");
  }

  return {
    ...state,
    numerator: state.numerator * factor,
    denominator: state.denominator * factor,
    label: `${state.numerator * factor}/${state.denominator * factor}`,
  };
}

export function compileFractionBarTimeline(
  timeline: FractionBarTimeline,
): FractionBarTimelineFrame[] {
  const frames: FractionBarTimelineFrame[] = [{ state: timeline.initial }];
  let state = timeline.initial;

  for (const transition of timeline.transitions) {
    switch (transition.type) {
      case "split-each-part":
        state = splitEachPart(state, transition.factor);
        frames.push({ state, transition });
        break;
    }
  }

  return frames;
}
