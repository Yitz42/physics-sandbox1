// shear-stress-tools.js — equations, summary, quantities, and debug steps for direct shear (Unit 1.2).

import { fixedTex, sigFig } from "../../core/units.js";
import { solveShearStress, PI } from "./shear-stress.js";

// KaTeX equations for direct shear, as data the equations panel can draw
// (core/equations.js: lhs = terms, form "define", result). Like normal stress,
// Numbers puts in only the GIVEN numbers (P, d); each "= result" appears once
// the answer is revealed, so a build stage can't be passed by reading τ off it.
export function shearStressEquations(setup = {}, result) {
  const res = result || solveShearStress(setup);
  const v = res.values;
  const kN = (x) => `${sigFig(x, 4)}\\,\\text{kN}`;

  return [
    // 1. Shear force per plane: V = P / n (n shear planes share the load).
    {
      id: "shear-force",
      lhs: "V",
      form: "define",
      terms: [v.n === 1
        ? { id: "V_calc", sign: 1, symbol: "P", value: v.P, numTex: `(${kN(v.P)})` }
        : { id: "V_calc", sign: 1, symbol: `\\dfrac{P}{${v.n}}`, value: v.V, numTex: `\\dfrac{${kN(v.P)}}{${v.n}}` }],
      result: { value: v.V, unit: "kN" },
    },
    // 2. Area of one shear plane: the pin's circular cross-section.
    {
      id: "pin-area",
      lhs: "A",
      form: "define",
      terms: [{ id: "A_calc", sign: 1, symbol: "\\tfrac{\\pi}{4} d^2", value: v.A, numTex: `\\tfrac{\\pi}{4}(${sigFig(v.d, 4)}\\,\\text{mm})^2` }],
      result: { value: v.A, unit: "mm^2" },
    },
    // 3. Average shear stress: τ = V / A, with V in newtons (1 N/mm² = 1 MPa).
    {
      id: "shear-stress",
      lhs: "\\tau",
      form: "define",
      terms: [{ id: "tau_calc", sign: 1, symbol: "\\dfrac{V}{A}", value: v.tau, numTex: `\\dfrac{${sigFig(v.V_N, 4)}\\,\\text{N}}{A}` }],
      result: { value: v.tau, unit: "MPa" },
    },
  ];
}

// The full working under the equations panel, once the answer is revealed
// (after Test). Before that it stays empty: the panel's own equations show the
// given numbers, and printing A or τ here would hand over what's being asked.
export function shearStressSummary(setup = {}, result, { reveal = true } = {}) {
  if (!reveal) return [];
  const res = result || solveShearStress(setup);
  const v = res.values;
  const isDouble = v.n === 2;

  const lines = [];

  if (isDouble) {
    lines.push(`V = \\dfrac{P}{2} = \\dfrac{${fixedTex(v.P, "kN", 1)}}{2} = ${fixedTex(v.V, "kN", 1)} = ${fixedTex(v.V_N, "", 0)}\\,\\text{N}`);
  } else {
    lines.push(`V = P = ${fixedTex(v.P, "kN", 1)} = ${fixedTex(v.V_N, "", 0)}\\,\\text{N}`);
  }

  lines.push(`A = \\dfrac{\\pi}{4} d^2 = \\dfrac{\\pi}{4} (${fixedTex(v.d, "", 1)}\\,\\text{mm})^2 = ${fixedTex(v.A, "", 1)}\\,\\text{mm}^2`);
  lines.push(`\\tau = \\dfrac{V}{A} = \\dfrac{${fixedTex(v.V_N, "", 0)}\\,\\text{N}}{${fixedTex(v.A, "", 1)}\\,\\text{mm}^2} = ${fixedTex(v.tau, "", 1)}\\,\\text{MPa}`);

  // Factor of safety, when the joint has an allowable shear stress.
  if (v.FS != null) {
    lines.push(`FS = \\dfrac{\\tau_{\\text{allow}}}{\\tau} = \\dfrac{${fixedTex(v.tau_allow, "", 1)}\\,\\text{MPa}}{${fixedTex(v.tau, "", 1)}\\,\\text{MPa}} = ${fixedTex(v.FS, "", 2)}`);
  }

  return lines;
}

export function shearStressQuantities() {
  return {
    P: { label: "P", unit: "kN", name: "Axial load" },
    V: { label: "V", unit: "kN", name: "Shear force per plane" },
    d: { label: "d", unit: "mm", name: "Pin diameter" },
    A: { label: "A", unit: "mm^2", name: "Pin shear area" },
    tau: { label: "\\tau", unit: "MPa", name: "Average shear stress" },
    FS: { label: "FS", unit: "", name: "Factor of safety" },
  };
}

const n4 = (x) => (typeof x === "number" ? (Math.abs(x) >= 1000 ? x.toLocaleString("en-US", { maximumFractionDigits: 1 }) : x.toFixed(1)) : x);

// Wrong answers common slips give: [{ value, message, kind }].
export function shearStressMistakes(setup = {}, name) {
  const res = solveShearStress(setup);
  const v = res.values;
  const right = v[name];
  if (right == null) return [];

  const list = [];
  const add = (value, message, kind) => {
    if (!Number.isFinite(value) || Math.abs(value - right) < 1e-6 * Math.max(1, Math.abs(right))) return;
    if (!list.some((m) => Math.abs(m.value - value) < 1e-9)) list.push({ value, message, kind });
  };

  const d = v.d;
  const isDouble = v.n === 2;

  if (name === "V") {
    if (isDouble) {
      // Slip: forgot double shear (used V = P instead of P / 2)
      add(v.P, "In double shear, the applied load P is shared equally across TWO shear planes: V = P / 2.", "concept");
    } else {
      // Slip: divided single shear by 2
      add(v.P / 2, "In single shear, there is only ONE shear plane, so it carries the full load: V = P.", "concept");
    }
  }

  if (name === "A") {
    // Slip: π d² instead of (π / 4) d²
    add(PI * d * d, "Did you use $A = \\pi d^2$? The area of a circular cross-section is $A = \\frac{\\pi}{4} d^2$.", "algebra");
    // Slip: perimeter π d
    add(PI * d, "That is the circumference $\\pi d$, not the area: $A = \\frac{\\pi}{4} d^2$.", "geometry");
  }

  if (name === "tau") {
    // Slip: forgot double shear (stress doubled)
    if (isDouble) {
      add(right * 2, "Did you forget to divide by 2 for double shear? Two shear planes share the load: $\\tau = \\frac{P / 2}{A}$.", "concept");
    }
    // Slip: units slip (forgot kilo)
    add(right / 1000, "Units slip: did you divide force in kN by area in $\\text{mm}^2$? Convert $V$ to newtons ($V \\times 1000$) first.", "units");
    add(right * 1000, "Check your unit conversions: $1\\text{ MPa} = 1\\text{ N/mm}^2$.", "units");
    // Slip: used π d²
    add(right / 4, "Did you use $A = \\pi d^2$? The area is $A = \\frac{\\pi}{4} d^2$, so the stress should be 4 times larger.", "algebra");
  }

  return list;
}

export function shearStressDebug(setup = {}, mutation = {}) {
  const res = solveShearStress(setup);
  const v = res.values;
  const joint = setup.joint || {};
  const load = setup.load || {};
  const P = load.P ?? 48;
  const n = joint.planes ?? 2;
  const d = joint.pinDiameter ?? 20;

  const slip = mutation.slip || "forgotDoubleShear";

  // Correct values
  const corrV = v.V;
  const corrA = v.A;
  const corrTau = v.tau;

  // Student's flawed values
  let studV = corrV;
  let studA = corrA;
  let studTau = corrTau;

  if (slip === "forgotDoubleShear") {
    studV = P; // Forgot to divide by 2
    studTau = (studV * 1000) / studA;
  } else if (slip === "noKilo") {
    studTau = studV / studA; // Forgot to multiply by 1000
  } else if (slip === "diameterAsRadius") {
    studA = PI * d * d; // Used π d²
    studTau = (studV * 1000) / studA;
  }

  const lineV = (val, isWrong = false) =>
    n === 2
      ? (isWrong
          ? `V = P = ${fixedTex(val, "kN", 1)} = ${fixedTex(val * 1000, "", 0)}\\,\\text{N}`
          : `V = \\dfrac{P}{2} = \\dfrac{${P}\\,\\text{kN}}{2} = ${fixedTex(val, "kN", 1)} = ${fixedTex(val * 1000, "", 0)}\\,\\text{N}`)
      : `V = P = ${fixedTex(val, "kN", 1)} = ${fixedTex(val * 1000, "", 0)}\\,\\text{N}`;

  const lineA = (val, isWrong = false) =>
    `A = ${isWrong ? "\\pi d^2" : "\\dfrac{\\pi}{4} d^2"} = ${fixedTex(val, "", 1)}\\,\\text{mm}^2`;

  const lineTau = (forceN, areaVal, tauVal) =>
    `\\tau = \\dfrac{V}{A} = \\dfrac{${fixedTex(forceN, "", 0)}\\,\\text{N}}{${fixedTex(areaVal, "", 1)}\\,\\text{mm}^2} = ${fixedTex(tauVal, "", 1)}\\,\\text{MPa}`;

  const correct = [
    lineV(corrV),
    lineA(corrA),
    lineTau(corrV * 1000, corrA, corrTau),
  ];

  const lines = [
    { id: "shear-force", tex: lineV(studV, slip === "forgotDoubleShear") },
    { id: "pin-area", tex: lineA(studA, slip === "diameterAsRadius") },
    { id: "shear-stress", tex: lineTau(slip === "noKilo" ? studV : studV * 1000, studA, studTau) },
  ];

  const WHY = {
    forgotDoubleShear: {
      wrong: "shear-force",
      kind: "concept",
      fix: "Divide the load by 2: in double shear, two planes share the load ($V = P / 2$)",
      explain: "The clevis holds the pin on both sides of the central plate, creating two shear planes that each carry $V = P / 2 = 24\\,\\text{kN}$.",
    },
    noKilo: {
      wrong: "shear-stress",
      kind: "units",
      fix: "Convert shear force from kN to N ($1\\text{ kN} = 1000\\text{ N}$) before dividing by area",
      explain: "Since $1\\text{ MPa} = 1\\text{ N/mm}^2$, the shear force must be converted to newtons: $24\\text{ kN} = 24\\,000\\text{ N}$.",
    },
    diameterAsRadius: {
      wrong: "pin-area",
      kind: "algebra",
      fix: "Use the circle area formula $A = \\frac{\\pi}{4} d^2$, not $\\pi d^2$",
      explain: "For a circular cross-section, $A = \\pi r^2 = \\pi (d/2)^2 = \\frac{\\pi}{4} d^2$. Using $\\pi d^2$ overestimates area by a factor of 4.",
    },
  }[slip];

  const ids = lines.map((l) => l.id);
  const follows = lines.filter((l, i) => ids.indexOf(l.id) > ids.indexOf(WHY.wrong) && l.tex !== correct[i]).map((l) => l.id);

  const others = [
    { key: "shear-force", label: "Multiply load by 2 instead of dividing", feedback: "The two planes share the load, reducing the force on each plane." },
    { key: "pin-area", label: "Use circumference instead of area", feedback: "Shear stress acts across the surface area, not the circumference." },
    { key: "shear-stress", label: "Multiply force by area instead of dividing", feedback: "Stress is force PER area, so dividing is correct." },
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

