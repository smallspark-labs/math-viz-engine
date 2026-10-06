import "../../src/index.ts";
import { renderSvg } from "../../src/index.ts";
import "./styles.css";

const app = document.querySelector<HTMLDivElement>("#app");
if (!app) throw new Error("App root not found");

const equivalents = [
  { numerator: 1, denominator: 2 },
  { numerator: 2, denominator: 4 },
  { numerator: 4, denominator: 8 },
  { numerator: 8, denominator: 16 },
];

let equivalentIndex = 0;
let numerator = 1;
let denominator = 2;

app.innerHTML = `
  <section class="hero">
    <p class="eyebrow">SmallSpark Labs · math-viz-engine</p>
    <h1>Don't just give the answer.<br />Show why it works.</h1>
    <p class="lead">
      A deterministic visualization engine for elementary math concepts, built for reuse.
      This first playground explores equivalent fractions.
    </p>
  </section>

  <section class="demo-card" aria-labelledby="equivalent-title">
    <div class="section-heading">
      <div>
        <p class="kicker">Concept demo</p>
        <h2 id="equivalent-title">Equivalent fractions keep the same size</h2>
      </div>
      <button id="next-equivalent" type="button">Split into smaller parts</button>
    </div>

    <div class="equivalent-stage">
      <div>
        <p class="fraction-label" id="equivalent-label">1/2</p>
        <div class="viz" id="equivalent-viz"></div>
      </div>
      <p class="explanation" id="equivalent-explanation">
        Half of the whole is filled. Splitting the same whole into more equal parts does not change its size.
      </p>
    </div>
  </section>

  <section class="playground-grid">
    <div class="panel">
      <p class="kicker">Playground</p>
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
      <p class="kicker">Current DSL</p>
      <h2>Serializable input</h2>
      <pre id="dsl"></pre>
      <p class="note">
        The engine turns this data into SVG. Future apps, lesson content, and AI-generated explanations can reuse the same contract.
      </p>
    </div>
  </section>

  <section class="about">
    <p class="kicker">Direction</p>
    <h2>Engine first, products later</h2>
    <p>
      The core stays framework-agnostic. Learning apps, teacher tools, video generators, and AI tutors can sit on top of the same visualization primitives.
    </p>
  </section>
`;

const equivalentViz = document.querySelector<HTMLDivElement>("#equivalent-viz")!;
const equivalentLabel = document.querySelector<HTMLParagraphElement>("#equivalent-label")!;
const equivalentExplanation = document.querySelector<HTMLParagraphElement>("#equivalent-explanation")!;
const nextButton = document.querySelector<HTMLButtonElement>("#next-equivalent")!;
const numeratorInput = document.querySelector<HTMLInputElement>("#numerator")!;
const denominatorInput = document.querySelector<HTMLInputElement>("#denominator")!;
const numeratorValue = document.querySelector<HTMLOutputElement>("#numerator-value")!;
const denominatorValue = document.querySelector<HTMLOutputElement>("#denominator-value")!;
const customViz = document.querySelector<HTMLDivElement>("#custom-viz")!;
const dsl = document.querySelector<HTMLElement>("#dsl")!;

function renderEquivalent() {
  const value = equivalents[equivalentIndex]!;
  const label = `${value.numerator}/${value.denominator}`;
  equivalentLabel.textContent = label;
  equivalentViz.innerHTML = renderSvg({
    type: "fraction-bar",
    numerator: value.numerator,
    denominator: value.denominator,
    label,
    width: 560,
    height: 76,
    gap: 3,
  });

  equivalentExplanation.textContent =
    equivalentIndex === 0
      ? "Half of the whole is filled. Split the same whole into smaller equal parts."
      : `The filled area is still exactly one half. Only the number of equal parts changed: ${label}.`;

  nextButton.textContent =
    equivalentIndex === equivalents.length - 1
      ? "Start again"
      : "Split into smaller parts";
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
  dsl.textContent = JSON.stringify(spec, null, 2);
}

nextButton.addEventListener("click", () => {
  equivalentIndex = (equivalentIndex + 1) % equivalents.length;
  renderEquivalent();
});

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
