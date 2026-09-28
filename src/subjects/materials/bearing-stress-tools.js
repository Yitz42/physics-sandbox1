// bearing-stress-tools.js — equations, summary, quantities, and debug steps for bearing stress (Unit 1.3).

import { fixedTex, sigFig } from "../../core/units.js";
import { solveBearingStress } from "./bearing-stress.js";

// KaTeX equations for bearing stress, as data the equations panel can draw.
export function bearingStressEquations(setup = {}, result) {
  const res = result || solveBearingStress(setup);
  const v = res.values;
  const kN = (x) => `${sigFig(x, 4)}\\,\\text{kN}`;

  return [
    // 1. Projected bearing area: rectangle formed by plate thickness t and pin diameter d.
    {
      id: "bearing-area",
      lhs: "A_b",
      form: "define",
      terms: [
        {
          id: "Ab_calc",
          sign: 1,
          symbol: "t \\cdot d",
          value: v.A_b,
          numTex: `(${sigFig(v.t, 4)}\\,\\text{mm})(${sigFig(v.d, 4)}\\,\\text{mm})`,
        },
      ],
      result: { value: v.A_b, unit: "mm^2" },
    },
    // 2. Average bearing stress: σ_b = P / A_b, with P in newtons (1 N/mm² = 1 MPa).
    {
      id: "bearing-stress",
      lhs: "\\sigma_b",
      form: "define",
      terms: [
        {
          id: "sigmab_calc",
          sign: 1,
          symbol: "\\dfrac{P}{A_b}",
          value: v.sigma_b,
          numTex: `\\dfrac{${sigFig(v.P_N, 4)}\\,\\text{N}}{A_b}`,
        },
      ],
      result: { value: v.sigma_b, unit: "MPa" },
    },
  ];
}

// The full working under the equations panel, once the answer is revealed.
export function bearingStressSummary(setup = {}, result, { reveal = true } = {}) {
  if (!reveal) return [];
  const res = result || solveBearingStress(setup);
  const v = res.values;

  const lines = [
    `A_b = t \\cdot d = (${fixedTex(v.t, "", 1)}\\,\\text{mm})(${fixedTex(v.d, "", 1)}\\,\\text{mm}) = ${fixedTex(v.A_b, "", 1)}\\,\\text{mm}^2`,
    `\\sigma_b = \\dfrac{P}{A_b} = \\dfrac{${fixedTex(v.P_N, "", 0)}\\,\\text{N}}{${fixedTex(v.A_b, "", 1)}\\,\\text{mm}^2} = ${fixedTex(v.sigma_b, "", 1)}\\,\\text{MPa}`,
  ];

  if (v.FS != null) {
    lines.push(
      `FS = \\dfrac{\\sigma_{b,\\text{allow}}}{\\sigma_b} = \\dfrac{${fixedTex(v.sigma_allow, "", 1)}\\,\\text{MPa}}{${fixedTex(v.sigma_b, "", 1)}\\,\\text{MPa}} = ${fixedTex(v.FS, "", 2)}`
    );
  }

  return lines;
}

export function bearingStressQuantities() {
  return {
    P: { label: "P", unit: "kN", name: "Bearing load" },
    t: { label: "t", unit: "mm", name: "Plate thickness" },
    d: { label: "d", unit: "mm", name: "Pin diameter" },
    A_b: { label: "A_b", unit: "mm^2", name: "Projected bearing area" },
    sigma_b: { label: "\\sigma_b", unit: "MPa", name: "Average bearing stress" },
    FS: { label: "FS", unit: "", name: "Factor of safety" },
  };
}

// Wrong answers common slips give: [{ value, message, kind }].
export function bearingStressMistakes(setup = {}, name) {
  const res = solveBearingStress(setup);
  const v = res.values;
  const right = v[name];
  if (right == null) return [];

  const list = [];
  const add = (value, message, kind) => {
    if (!Number.isFinite(value) || Math.abs(value - right) < 1e-6 * Math.max(1, Math.abs(right))) return;
    if (!list.some((m) => Math.abs(m.value - value) < 1e-9)) list.push({ value, message, kind });
  };

  const t = v.t;
  const d = v.d;
  const PI = Math.PI;

  if (name === "A_b") {
    // Slip: curved cylindrical surface (π / 2) · d · t
    add((PI / 2) * d * t, "Did you use the curved surface area $\\frac{\\pi}{2} d t$? Bearing stress is based on the PROJECTED rectangular area $A_b = t \\cdot d$.", "geometry");
    // Slip: circular pin shear area (π / 4) · d²
    add((PI / 4) * d * d, "That is the cross-sectional shear area of the pin $\\frac{\\pi}{4} d^2$, not the projected bearing area $A_b = t \\cdot d$.", "concept");
    // Slip: perimeter
    add(PI * d, "That is the circumference of the pin, not the projected bearing area $A_b = t \\cdot d$.", "geometry");
  }

  if (name === "sigma_b") {
    // Slip: using curved cylindrical surface area
    const curvedTau = v.P_N / ((PI / 2) * d * t);
    add(curvedTau, "Did you divide by the curved surface area $\\frac{\\pi}{2} d t$? Standard engineering practice uses the projected area $A_b = t \\cdot d$.", "geometry");
    // Slip: using pin shear area
    const pinTau = v.P_N / ((PI / 4) * d * d);
    add(pinTau, "That is the shear stress in the pin $\\tau = P / [\\frac{\\pi}{4} d^2]$, not the bearing stress on the plate $\\sigma_b = P / (t \\cdot d)$.", "concept");
    // Slip: units slip (forgot kilo)
    add(right / 1000, "Units slip: did you divide load in kN by area in $\\text{mm}^2$? Multiply $P$ by 1000 to convert to newtons first.", "units");
    add(right * 1000, "Check your unit conversions: $1\\text{ MPa} = 1\\text{ N/mm}^2$.", "units");
  }

  return list;
}

export function bearingStressDebug(setup = {}, mutation = {}) {
  const res = solveBearingStress(setup);
  const v = res.values;
  const P = v.P;
  const t = v.t;
  const d = v.d;
  const PI = Math.PI;

  const slip = mutation.slip || "cylinderArea";

  // Correct values
  const corrAb = v.A_b;
  const corrSigmaB = v.sigma_b;

  // Student's flawed values
  let studAb = corrAb;
  let studSigmaB = corrSigmaB;

  if (slip === "cylinderArea") {
    studAb = (PI / 2) * d * t;
    studSigmaB = (P * 1000) / studAb;
  } else if (slip === "pinArea") {
    studAb = (PI / 4) * d * d;
    studSigmaB = (P * 1000) / studAb;
  } else if (slip === "noKilo") {
    studSigmaB = P / studAb;
  }

  const lineAb = (val, isWrongCyl = false, isWrongPin = false) => {
    if (isWrongCyl) {
      return `A_b = \\dfrac{\\pi}{2} d \\cdot t = \\dfrac{\\pi}{2} (${sigFig(d, 4)}\\,\\text{mm})(${sigFig(t, 4)}\\,\\text{mm}) = ${fixedTex(val, "", 1)}\\,\\text{mm}^2`;
    }
    if (isWrongPin) {
      return `A_b = \\dfrac{\\pi}{4} d^2 = \\dfrac{\\pi}{4} (${sigFig(d, 4)}\\,\\text{mm})^2 = ${fixedTex(val, "", 1)}\\,\\text{mm}^2`;
    }
    return `A_b = t \\cdot d = (${sigFig(t, 4)}\\,\\text{mm})(${sigFig(d, 4)}\\,\\text{mm}) = ${fixedTex(val, "", 1)}\\,\\text{mm}^2`;
  };

  const lineSigmaB = (loadN, areaVal, stressVal) =>
    `\\sigma_b = \\dfrac{P}{A_b} = \\dfrac{${fixedTex(loadN, "", 0)}\\,\\text{N}}{${fixedTex(areaVal, "", 1)}\\,\\text{mm}^2} = ${fixedTex(stressVal, "", 1)}\\,\\text{MPa}`;

  const correct = [
    lineAb(corrAb),
    lineSigmaB(P * 1000, corrAb, corrSigmaB),
  ];

  const lines = [
    { id: "bearing-area", tex: lineAb(studAb, slip === "cylinderArea", slip === "pinArea") },
    { id: "bearing-stress", tex: lineSigmaB(slip === "noKilo" ? P : P * 1000, studAb, studSigmaB) },
  ];

  const WHY = {
    cylinderArea: {
      wrong: "bearing-area",
      kind: "geometry",
      fix: "Use the projected rectangular area $A_b = t \\cdot d$, not the curved half-cylinder area",
      explain: "The resultant compressive contact force equals the average bearing stress multiplied by the projected area $A_b = t \\cdot d$.",
    },
    pinArea: {
      wrong: "bearing-area",
      kind: "concept",
      fix: "Use the plate contact area $A_b = t \\cdot d$, not the pin cross-sectional shear area",
      explain: "Bearing stress is the contact pressure between the plate hole and the pin ($t \\cdot d$), whereas $\\frac{\\pi}{4} d^2$ is the pin's internal shear area.",
    },
    noKilo: {
      wrong: "bearing-stress",
      kind: "units",
      fix: "Convert load from kN to N ($1\\text{ kN} = 1000\\text{ N}$) before dividing by area",
      explain: "To obtain stress in MPa (where $1\\text{ MPa} = 1\\text{ N/mm}^2$), force in kilonewtons must be multiplied by 1000 to convert to newtons.",
    },
  }[slip];

  const ids = lines.map((l) => l.id);
  const follows = lines.filter((l, i) => ids.indexOf(l.id) > ids.indexOf(WHY.wrong) && l.tex !== correct[i]).map((l) => l.id);

  const others = [
    { key: "bearing-area", label: "Multiply by the plate width instead of pin diameter", feedback: "Bearing contact only occurs along the pin diameter, not the full plate width." },
    { key: "bearing-stress", label: "Multiply load by area instead of dividing", feedback: "Stress is force divided by area: $\\sigma = P / A$." },
  ].slice(0, 2).map(({ label, feedback }) => ({ label, feedback }));

  return {
    lines,
    wrong: WHY.wrong,
    follows,
    fixes: [{ label: WHY.fix, correct: true }, ...others],
    explain: WHY.explain,
    kind: WHY.kind,
    corrected: correct,
  };
}
