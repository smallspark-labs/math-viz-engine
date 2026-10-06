import type { FractionBarSpec, NormalizedFractionBar } from "./types.js";

const DEFAULT_WIDTH = 320;
const DEFAULT_HEIGHT = 56;
const DEFAULT_GAP = 4;

function assertFinitePositive(value: number, name: string): void {
  if (!Number.isFinite(value) || value <= 0) {
    throw new RangeError(`${name} must be a finite number greater than 0`);
  }
}

export function normalizeFractionBar(spec: FractionBarSpec): NormalizedFractionBar {
  if (!Number.isInteger(spec.denominator) || spec.denominator <= 0) {
    throw new RangeError("denominator must be a positive integer");
  }

  if (
    !Number.isInteger(spec.numerator) ||
    spec.numerator < 0 ||
    spec.numerator > spec.denominator
  ) {
    throw new RangeError("numerator must be an integer between 0 and denominator");
  }

  const width = spec.width ?? DEFAULT_WIDTH;
  const height = spec.height ?? DEFAULT_HEIGHT;
  const gap = spec.gap ?? DEFAULT_GAP;

  assertFinitePositive(width, "width");
  assertFinitePositive(height, "height");

  if (!Number.isFinite(gap) || gap < 0) {
    throw new RangeError("gap must be a finite number greater than or equal to 0");
  }

  const totalGap = gap * (spec.denominator - 1);
  if (totalGap >= width) {
    throw new RangeError("gap is too large for the requested width");
  }

  return {
    type: "fraction-bar",
    numerator: spec.numerator,
    denominator: spec.denominator,
    ...(spec.label === undefined ? {} : { label: spec.label }),
    width,
    height,
    gap,
  };
}

function escapeXml(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&apos;");
}

function number(value: number): string {
  return Number(value.toFixed(4)).toString();
}

export function renderFractionBarSvg(input: FractionBarSpec): string {
  const spec = normalizeFractionBar(input);
  const labelHeight = spec.label ? 28 : 0;
  const cellWidth =
    (spec.width - spec.gap * (spec.denominator - 1)) / spec.denominator;

  const cells = Array.from({ length: spec.denominator }, (_, index) => {
    const x = index * (cellWidth + spec.gap);
    const filled = index < spec.numerator;

    return `<rect x="${number(x)}" y="${labelHeight}" width="${number(cellWidth)}" height="${number(spec.height)}" rx="4" fill="${filled ? "currentColor" : "none"}" stroke="currentColor" stroke-width="2" data-part="${index + 1}" data-filled="${filled}" />`;
  }).join("");

  const label = spec.label
    ? `<text x="${number(spec.width / 2)}" y="18" text-anchor="middle" font-family="system-ui, sans-serif" font-size="16" fill="currentColor">${escapeXml(spec.label)}</text>`
    : "";

  const ariaLabel = escapeXml(
    spec.label ?? `${spec.numerator} out of ${spec.denominator} parts`,
  );

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${number(spec.width)}" height="${number(spec.height + labelHeight)}" viewBox="0 0 ${number(spec.width)} ${number(spec.height + labelHeight)}" role="img" aria-label="${ariaLabel}">${label}${cells}</svg>`;
}
