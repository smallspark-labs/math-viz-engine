export type FractionBarSpec = {
  type: "fraction-bar";
  numerator: number;
  denominator: number;
  label?: string;
  width?: number;
  height?: number;
  gap?: number;
};

export type MathVizSpec = FractionBarSpec;

export type NormalizedFractionBar = {
  type: "fraction-bar";
  numerator: number;
  denominator: number;
  label?: string;
  width: number;
  height: number;
  gap: number;
};
