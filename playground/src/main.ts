import {
  addFractions,
  compareFractions,
  compileFractionBarTimeline,
  mergeParts,
  renderSvg,
  type FractionBarTimeline,
} from "../../src/index.ts";
import "./styles.css";

const app = document.querySelector<HTMLDivElement>("#app");
if (!app) throw new Error("App root not found");

const timeline: FractionBarTimeline = {
  type: "fraction-bar-timeline",
  initial: { type: "fraction-bar", numerator: 1, denominator: 2, label: "1/2" },
  transitions: [
    { type: "split-each-part", factor: 2, durationMs: 650 },
    { type: "split-each-part", factor: 2, durationMs: 650 },
    { type: "split-each-part", factor: 2, durationMs: 650 },
  ],
};

const frames = compileFractionBarTimeline(timeline);
let frameIndex = 0;
let numerator = 1;
let denominator = 2;
let animating = false;

app.innerHTML = `
  <section class="hero">
    <p class="eyebrow">SmallSpark Labs · math-viz-engine</p>
    <h1>Don't just give the answer.<br />Show why it works.</h1>
    <p class="lead">
      Math is easier to understand when you can see what changes — and what stays the same.
      This playground turns equivalent fractions into a visible transformation.
    </p>
  </section>

  <section class="demo-card" aria-labelledby="equivalent-title">
    <div class="section-heading">
      <div>
        <p class="kicker">State → transition → state</p>
        <h2 id="equivalent-title">Why is 1/2 the same as 2/4?</h2>
      </div>
      <button id="next-equivalent" type="button">Split every part in 2</button>
    </div>

    <div class="equivalent-stage">
      <div class="fraction-readout">
        <span class="fraction-label" id="equivalent-label">1/2</span>
        <span class="equals-one-half">= one half</span>
      </div>
      <div class="continuous-viz" id="equivalent-viz" aria-live="polite"></div>
      <div class="timeline-row" id="timeline-row"></div>
      <p class="explanation" id="equivalent-explanation">
        Start with one whole split into 2 equal parts. One of those parts is filled.
      </p>
    </div>
  </section>

  <section class="concept-grid">
    <article class="concept-card">
      <p class="kicker">Merge</p>
      <h2>4/8 → 2/4</h2>
      <div class="mini-viz" id="merge-viz"></div>
      <button class="secondary-button" id="merge-button" type="button">Merge every 2 parts</button>
      <p class="concept-copy" id="merge-copy">Adjacent small parts can be grouped back together without changing the amount.</p>
    </article>

    <article class="concept-card">
      <p class="kicker">Compare</p>
      <h2>Which is larger?</h2>
      <div class="compare-stack" id="compare-viz"></div>
      <button class="secondary-button" id="compare-button" type="button">Compare 1/2 and 3/4</button>
      <p class="concept-copy" id="compare-copy">Put fractions against the same whole to compare their actual sizes.</p>
    </article>

    <article class="concept-card">
      <p class="kicker">Add</p>
      <h2>1/4 + 2/4</h2>
      <div class="mini-viz" id="add-viz"></div>
      <button class="secondary-button" id="add-button" type="button">Combine the parts</button>
      <p class="concept-copy" id="add-copy">When the parts are the same size, we can count them together.</p>
    </article>
  </section>

  <section class="playground-grid">
    <div class="panel">
      <p class="kicker">State playground</p>
      <h2>Try your own fraction</h2>

      <label>
        Numerator
        <input id="numerator" type="range" min="0" max="2" value="1" />
        <output id="numerator-value">1</output>
      </label>

      <label>
        Denominator
        <input id="denominator" type="range" min="1" max="16" value="2" />
        <output id="denominator-value">2</output>
      </label>

      <div class="viz playground-viz" id="custom-viz"></div>
    </div>

    <div class="panel code-panel">
      <p class="kicker">Transition DSL</p>
      <h2>The math operation is data</h2>
      <pre id="dsl"></pre>
      <p class="note">
        Apps do not need to describe animation pixels. They describe the mathematical operation:
        <code>split-each-part</code>. The engine derives the next valid state.
      </p>
    </div>
  </section>

  <section class="about">
    <p class="kicker">Engine direction</p>
    <h2>Visualize mathematical change, not just mathematical state</h2>
    <p>
      The same transition model can later power grouping, distribution, merging, rotation,
      comparison, and other operations used by multiplication, division, fractions, and geometry.
    </p>
  </section>
`;

const equivalentViz = document.querySelector<HTMLDivElement>("#equivalent-viz")!;
const equivalentLabel = document.querySelector<HTMLSpanElement>("#equivalent-label")!;
const equivalentExplanation = document.querySelector<HTMLParagraphElement>("#equivalent-explanation")!;
const timelineRow = document.querySelector<HTMLDivElement>("#timeline-row")!;
const nextButton = document.querySelector<HTMLButtonElement>("#next-equivalent")!;
const numeratorInput = document.querySelector<HTMLInputElement>("#numerator")!;
const denominatorInput = document.querySelector<HTMLInputElement>("#denominator")!;
const numeratorValue = document.querySelector<HTMLOutputElement>("#numerator-value")!;
const denominatorValue = document.querySelector<HTMLOutputElement>("#denominator-value")!;
const customViz = document.querySelector<HTMLDivElement>("#custom-viz")!;
const dsl = document.querySelector<HTMLElement>("#dsl")!;
const mergeViz = document.querySelector<HTMLDivElement>("#merge-viz")!;
const mergeButton = document.querySelector<HTMLButtonElement>("#merge-button")!;
const mergeCopy = document.querySelector<HTMLParagraphElement>("#merge-copy")!;
const compareViz = document.querySelector<HTMLDivElement>("#compare-viz")!;
const compareButton = document.querySelector<HTMLButtonElement>("#compare-button")!;
const compareCopy = document.querySelector<HTMLParagraphElement>("#compare-copy")!;
const addViz = document.querySelector<HTMLDivElement>("#add-viz")!;
const addButton = document.querySelector<HTMLButtonElement>("#add-button")!;
const addCopy = document.querySelector<HTMLParagraphElement>("#add-copy")!;

function continuousFractionMarkup(n: number, d: number, newLines: number[] = []) {
  const filledPercent = (n / d) * 100;
  const lines = Array.from({ length: d - 1 }, (_, index) => {
    const position = ((index + 1) / d) * 100;
    const isNew = newLines.includes(index + 1);
    return `<span class="partition-line ${isNew ? "partition-line--new" : ""}" style="left:${position}%"></span>`;
  }).join("");

  return `
    <div class="whole" role="img" aria-label="${n} out of ${d} equal parts">
      <div class="whole-fill" style="width:${filledPercent}%"></div>
      ${lines}
    </div>
  `;
}

function renderTimeline() {
  timelineRow.innerHTML = frames.map(({ state }, index) => {
    const active = index === frameIndex ? "timeline-step--active" : "";
    return `<span class="timeline-step ${active}">${state.numerator}/${state.denominator}</span>`;
  }).join('<span class="timeline-arrow">→</span>');
}

function renderEquivalent() {
  const frame = frames[frameIndex]!;
  equivalentLabel.textContent = `${frame.state.numerator}/${frame.state.denominator}`;
  equivalentViz.innerHTML = continuousFractionMarkup(
    frame.state.numerator,
    frame.state.denominator,
  );
  renderTimeline();

  equivalentExplanation.textContent =
    frameIndex === 0
      ? "Start with one whole split into 2 equal parts. One of those parts is filled."
      : `We split every previous part into 2 smaller equal parts. Nothing moved and the filled area did not change, so ${frame.state.numerator}/${frame.state.denominator} is still one half.`;

  nextButton.textContent =
    frameIndex === frames.length - 1 ? "Start again" : "Split every part in 2";

  dsl.textContent = JSON.stringify(
    frameIndex === 0 ? timeline.initial : frames[frameIndex]!.transition,
    null,
    2,
  );
}

async function animateToNextFrame() {
  if (animating) return;

  if (frameIndex === frames.length - 1) {
    frameIndex = 0;
    renderEquivalent();
    return;
  }

  animating = true;
  nextButton.disabled = true;

  const previous = frames[frameIndex]!.state;
  const nextIndex = frameIndex + 1;
  const next = frames[nextIndex]!.state;
  const factor = next.denominator / previous.denominator;
  const newLines = Array.from(
    { length: previous.denominator },
    (_, index) => index * factor + 1,
  );

  equivalentViz.innerHTML = continuousFractionMarkup(
    next.numerator,
    next.denominator,
    newLines,
  );

  requestAnimationFrame(() => {
    equivalentViz.querySelectorAll(".partition-line--new").forEach((line) => {
      line.classList.add("partition-line--visible");
    });
  });

  await new Promise((resolve) => setTimeout(resolve, 680));
  frameIndex = nextIndex;
  animating = false;
  nextButton.disabled = false;
  renderEquivalent();
}

function renderCustom() {
  numerator = Math.min(numerator, denominator);
  numeratorInput.max = String(denominator);
  numeratorInput.value = String(numerator);
  numeratorValue.value = String(numerator);
  denominatorValue.value = String(denominator);

  const spec = {
    type: "fraction-bar" as const,
    numerator,
    denominator,
    label: `${numerator}/${denominator}`,
    width: 520,
    height: 68,
    gap: 3,
  };

  customViz.innerHTML = renderSvg(spec);
}


function labeledContinuousFraction(n: number, d: number) {
  return `<div class="mini-row"><strong>${n}/${d}</strong>${continuousFractionMarkup(n, d)}</div>`;
}

function renderOperationDemos() {
  mergeViz.innerHTML = labeledContinuousFraction(4, 8);
  compareViz.innerHTML =
    labeledContinuousFraction(1, 2) + labeledContinuousFraction(3, 4);
  addViz.innerHTML =
    labeledContinuousFraction(1, 4) +
    '<div class="math-sign">+</div>' +
    labeledContinuousFraction(2, 4);
}

mergeButton.addEventListener("click", async () => {
  const result = mergeParts(
    { type: "fraction-bar", numerator: 4, denominator: 8 },
    2,
  );
  mergeButton.disabled = true;
  mergeViz.innerHTML = labeledContinuousFraction(4, 8);
  const lines = Array.from(mergeViz.querySelectorAll(".partition-line"));
  lines.forEach((line, index) => {
    if (index % 2 === 0) line.classList.add("partition-line--removing");
  });
  requestAnimationFrame(() => {
    mergeViz.querySelectorAll(".partition-line--removing").forEach((line) =>
      line.classList.add("partition-line--removed"),
    );
  });
  await new Promise((resolve) => setTimeout(resolve, 620));
  mergeViz.innerHTML = labeledContinuousFraction(result.numerator, result.denominator);
  mergeButton.disabled = false;
  mergeCopy.textContent =
    "Two neighboring eighths become one quarter. Watch the unnecessary boundaries disappear while the filled amount stays fixed.";
  dsl.textContent = JSON.stringify({ type: "merge-parts", factor: 2 }, null, 2);
});

compareButton.addEventListener("click", () => {
  const left = { type: "fraction-bar" as const, numerator: 1, denominator: 2 };
  const right = { type: "fraction-bar" as const, numerator: 3, denominator: 4 };
  const result = compareFractions(left, right);
  compareViz.innerHTML =
    labeledContinuousFraction(1, 2) +
    '<div class="comparison-symbol">&lt;</div>' +
    labeledContinuousFraction(3, 4);
  compareCopy.textContent =
    result === "less-than"
      ? "1/2 is smaller than 3/4. Because both bars represent the same whole, the longer filled length makes the comparison visible."
      : "The fractions are equal.";
  dsl.textContent = JSON.stringify({ type: "compare", left, right, result }, null, 2);
});

addButton.addEventListener("click", async () => {
  const left = { type: "fraction-bar" as const, numerator: 1, denominator: 4 };
  const right = { type: "fraction-bar" as const, numerator: 2, denominator: 4 };
  const result = addFractions(left, right);
  addButton.disabled = true;
  addViz.innerHTML = `
    <div class="addition-stage">
      <div class="addition-source addition-source--left">${labeledContinuousFraction(1, 4)}</div>
      <div class="math-sign">+</div>
      <div class="addition-source addition-source--right">${labeledContinuousFraction(2, 4)}</div>
      <div class="addition-target">
        <strong>3/4</strong>
        <div class="whole">
          <div class="addition-piece addition-piece--one"></div>
          <div class="addition-piece addition-piece--two"></div>
          ${Array.from({ length: 3 }, (_, i) => `<span class="partition-line" style="left:${(i + 1) * 25}%"></span>`).join("")}
        </div>
      </div>
    </div>`;
  requestAnimationFrame(() => addViz.querySelector(".addition-stage")?.classList.add("addition-stage--combine"));
  await new Promise((resolve) => setTimeout(resolve, 850));
  addViz.innerHTML = labeledContinuousFraction(result.numerator, result.denominator);
  addButton.disabled = false;
  addCopy.textContent =
    "The one-quarter piece and the two-quarter piece slide into the same whole. Because every piece is a quarter, together they occupy three quarters.";
  dsl.textContent = JSON.stringify({ type: "add", left, right, result }, null, 2);
});

nextButton.addEventListener("click", animateToNextFrame);

numeratorInput.addEventListener("input", () => {
  numerator = Number(numeratorInput.value);
  renderCustom();
});

denominatorInput.addEventListener("input", () => {
  denominator = Number(denominatorInput.value);
  if (numerator > denominator) numerator = denominator;
  renderCustom();
});

renderEquivalent();
renderCustom();
renderOperationDemos();
