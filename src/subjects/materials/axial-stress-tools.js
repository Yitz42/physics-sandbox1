// axial-stress-tools.js — equations, summary lines, quantity labels, and mistake diagnosis for normal stress.

import { sigFig, fixedTex } from "../../core/units.js";
import { solveAxialStress, PI } from "./axial-stress.js";

const n4 = (v) => sigFig(v, 4);

// Names and units for quantities displayed in answer boxes or tooltips.
export function axialStressQuantities(setup = {}) {
  const q = {
    P: { label: "P", unit: "kN" },
    P_N: { label: "P", unit: "N" },
    A: { label: "A", unit: "mm^2" },
    A_m2: { label: "A", unit: "m^2" },
    sigma: { label: "\\sigma", unit: "MPa" },
    sigma_abs: { label: "|\\sigma|", unit: "MPa" },
    d: { label: "d", unit: "mm" },
    b: { label: "b", unit: "mm" },
    h: { label: "h", unit: "mm" },
    L: { label: "L", unit: "m" },
    FS: { label: "FS", unit: "" },
  };

  if (Array.isArray(setup.segments)) {
    setup.segments.forEach((_, i) => {
      const idx = i + 1;
      q[`P_${idx}`] = { label: `P_${idx}`, unit: "kN" };
      q[`A_${idx}`] = { label: `A_${idx}`, unit: "mm^2" };
      q[`sigma_${idx}`] = { label: `\\sigma_${idx}`, unit: "MPa" };
      q[`sigma_abs_${idx}`] = { label: `|\\sigma_${idx}|`, unit: "MPa" };
      q[`d_${idx}`] = { label: `d_${idx}`, unit: "mm" };
    });
  }

  return q;
}

// KaTeX equations: σ = P / A in symbols and numbers.
// In Numbers, each line puts in only the GIVEN numbers (d, b, h, P) — A stays a
// symbol inside σ = P/A — and the "= result" at the end appears only once the
// answer is revealed. So a build stage can't be passed by reading σ off the
// panel while dragging a slider: the student still works the numbers out.
export function axialStressEquations(setup = {}, result) {
  const res = result || solveAxialStress(setup);
  const v = res.values;
  const bar = setup.bar || {};
  const shape = bar.shape || "circle";
  const mm = (x) => `${n4(x)}\\,\\text{mm}`;

  const eqs = [];

  // Area equation:
  if (shape === "circle" && bar.diameter != null) {
    eqs.push({
      id: "area",
      lhs: "A",
      form: "define",
      terms: [{ id: "A_calc", sign: 1, symbol: "\\tfrac{\\pi}{4} d^2", value: v.A, numTex: `\\tfrac{\\pi}{4}(${mm(bar.diameter)})^2` }],
      result: { value: v.A, unit: "mm^2" },
    });
  } else if (shape === "rectangle") {
    eqs.push({
      id: "area",
      lhs: "A",
      form: "define",
      terms: [{ id: "A_calc", sign: 1, symbol: "b \\cdot h", value: v.A, numTex: `(${mm(v.b)})(${mm(v.h)})` }],
      result: { value: v.A, unit: "mm^2" },
    });
  }

  // Stress equation: σ = P / A, with P in newtons (1 N/mm² = 1 MPa).
  // Compression is written −P/A, so the number put in is the load's size.
  eqs.push({
    id: "stress",
    lhs: "\\sigma",
    form: "define",
    terms: [{
      id: "sigma_calc",
      sign: v.P >= 0 ? 1 : -1,
      symbol: "\\dfrac{P}{A}",
      value: Math.abs(v.sigma),
      numTex: `\\dfrac{${n4(Math.abs(v.P_N))}\\,\\text{N}}{A}`,
    }],
    result: { value: v.sigma, unit: "MPa" },
  });

  return eqs;
}

// Summary lines under the equations panel (explaining the numbers).
export function axialStressSummary(setup = {}, result, { reveal = true } = {}) {
  if (!reveal) return [];
  const res = result || solveAxialStress(setup);
  const v = res.values;
  const bar = setup.bar || {};
  const shape = bar.shape || "circle";
  const lines = [];

  // Line 1: Area calculation
  if (shape === "circle" && bar.diameter != null) {
    lines.push(`A = \\dfrac{\\pi}{4} d^2 = \\dfrac{\\pi}{4} (${n4(bar.diameter)}\\,\\text{mm})^2 = ${fixedTex(v.A, "", 1)}\\,\\text{mm}^2`);
  } else if (shape === "rectangle") {
    lines.push(`A = b \\cdot h = (${n4(v.b)}\\,\\text{mm})(${n4(v.h)}\\,\\text{mm}) = ${fixedTex(v.A, "", 1)}\\,\\text{mm}^2`);
  }

  // Line 2: Stress calculation
  const kind = v.sigma >= 0 ? "tension" : "compression";
  lines.push(`\\sigma = \\dfrac{P}{A} = \\dfrac{${n4(v.P_N)}\\,\\text{N}}{${n4(v.A)}\\,\\text{mm}^2} = ${fixedTex(v.sigma, "", 2)}\\,\\text{MPa} \\quad \\text{(${kind})}`);

  // Optional: Factor of safety
  if (v.FS != null) {
    lines.push(`FS = \\dfrac{\\sigma_{\\text{allow}}}{|\\sigma|} = \\dfrac{${n4(v.allowable)}\\,\\text{MPa}}{${n4(v.sigma_abs)}\\,\\text{MPa}} = ${fixedTex(v.FS, "", 2)}`);
  }

  return lines;
}

// Wrong answers common slips give: [{ value, message, kind }].
export function axialStressMistakes(setup = {}, name) {
  const res = solveAxialStress(setup);
  const v = res.values;
  const right = v[name];
  if (right == null) return [];

  const list = [];
  const add = (value, message, kind) => {
    if (!Number.isFinite(value) || Math.abs(value - right) < 1e-6 * Math.max(1, Math.abs(right))) return;
    if (!list.some((m) => Math.abs(m.value - value) < 1e-9)) list.push({ value, message, kind });
  };

  const bar = setup.bar || {};
  const shape = bar.shape || "circle";

  if (name === "A" && shape === "circle" && bar.diameter != null) {
    const d = bar.diameter;
    // Slip: π d² (forgot factor of 1/4)
    add(PI * d * d, "Did you use $A = \\pi d^2$? The area of a circle is $\\frac{\\pi}{4} d^2$, or $\\pi r^2$ using the radius $r = d/2$.", "algebra");
    // Slip: d² without π (square instead of circle)
    add(d * d, "That's $d^2$ (a square with side $d$). For a round bar, multiply by $\\frac{\\pi}{4}$: $A = \\frac{\\pi}{4} d^2$.", "geometry");
    // Slip: perimeter π d instead of area
    add(PI * d, "That is the circumference $\\pi d$, not the cross-sectional area: $A = \\frac{\\pi}{4} d^2$.", "geometry");
  }

  if (name === "sigma" || name === "sigma_abs") {
    // Slip: forgot to convert kN to N (giving answer 1000 times too small)
    add(right / 1000, "Units slip: did you divide force in kN by area in $\\text{mm}^2$? $1\\text{ MPa} = 1\\text{ N/mm}^2$, so convert $P$ to newtons ($P \\times 1000$) first.", "units");
    add(right * 1000, "Check your unit conversions: $1\\text{ MPa} = 1\\text{ N/mm}^2 = 10^6\\text{ N/m}^2$.", "units");

    // Slip: used A = π d² for circular bar (stress 4 times too small)
    if (shape === "circle") {
      add(right / 4, "Did you use $A = \\pi d^2$ without dividing by 4? A circle's area is $A = \\frac{\\pi}{4} d^2$, so the stress is 4 times larger.", "algebra");
      add(right * 4, "Did you use $r = 2d$ instead of $r = d/2$?", "geometry");
    }

    // Slip: wrong sign (tension vs compression)
    if (name === "sigma") {
      add(-right, right > 0 ? "Tensile stress (pulling the bar longer) is positive (+)." : "Compressive stress (pushing/squashing the bar) is negative (−).", "sign");
    }

    // Slip: multiplied P * A instead of P / A
    add(v.P_N * v.A * 1e-6, "Stress is force PER unit area: divide force by area ($\\sigma = P / A$), don't multiply.", "algebra");
  }

  if (name === "d" && v.allowable != null) {
    // Solving for required diameter d = sqrt(4P / (pi * sigma))
    // Slip: forgot square root (gave d²)
    const dReq = right;
    add(dReq * dReq, "Don't forget to take the square root: $d = \\sqrt{\\frac{4P}{\\pi \\sigma_{\\text{allow}}}}$.", "algebra");
  }

  return list;
}

// Student's working for normal stress: one line wrong (debug challenge, view: "steps").
export function axialStressDebug(setup = {}, mutation = {}) {
  const v = solveAxialStress(setup).values;
  const bar = setup.bar || {};
  const d = bar.diameter ?? 20;
  const P_kN = v.P;
  const P_N = v.P_N;
  const slip = mutation.slip || "diameterAsRadius";

  // Correct values
  const corrA = v.A;
  const corrP = P_N;
  const corrSigma = v.sigma;
  const corrKind = corrSigma >= 0 ? "\\text{Tension (stretching)}" : "\\text{Compression (squashing)}";

  // Student's potentially flawed values
  let studA = corrA;
  let studP = corrP;
  let studSigma = corrSigma;
  let studKind = corrKind;

  if (slip === "diameterAsRadius") {
    studA = PI * d * d;
    studSigma = studP / studA;
  } else if (slip === "perimeter") {
    studA = PI * d;
    studSigma = studP / studA;
  } else if (slip === "noKilo") {
    studP = P_kN; // forgot to multiply by 1000
    studSigma = studP / studA;
  } else if (slip === "wrongSign") {
    studKind = corrSigma >= 0 ? "\\text{Compression (squashing)}" : "\\text{Tension (stretching)}";
  }

  const lineA = (a, isWrongFormula = false) =>
    `A = ${isWrongFormula ? "\\pi d^2" : "\\dfrac{\\pi}{4} d^2"} = ${fixedTex(a, "", 1)}\\,\\text{mm}^2`;
  const lineP = (p, inKilo = false) =>
    `P = ${inKilo ? `${P_kN}\\,\\text{N}` : `${P_kN}\\,\\text{kN} = ${n4(p)}\\,\\text{N}`}`;
  const lineSigma = (p, a, s) =>
    `\\sigma = \\dfrac{P}{A} = \\dfrac{${n4(p)}\\,\\text{N}}{${fixedTex(a, "", 1)}\\,\\text{mm}^2} = ${fixedTex(s, "", 1)}\\,\\text{MPa}`;
  const lineKind = (k) => `\\text{Type: } ${k}`;

  const correct = [
    lineA(corrA),
    lineP(corrP),
    lineSigma(corrP, corrA, corrSigma),
    lineKind(corrKind),
  ];

  const lines = [
    { id: "area", tex: slip === "diameterAsRadius" ? lineA(studA, true) : (slip === "perimeter" ? `A = \\pi d = ${fixedTex(studA, "", 1)}\\,\\text{mm}^2` : lineA(corrA)) },
    { id: "load", tex: slip === "noKilo" ? `P = ${P_kN}\\,\\text{N} \\quad \\text{(forgot kilo- prefix)}` : lineP(corrP) },
    { id: "stress", tex: lineSigma(studP, studA, studSigma) },
    { id: "type", tex: lineKind(studKind) },
  ];

  const WHY = {
    diameterAsRadius: {
      wrong: "area",
      kind: "algebra",
      fix: "Divide by 4: the area is $A = \\frac{\\pi}{4} d^2$, not $\\pi d^2$",
      explain: "The diameter is $d = 2r$. In terms of diameter, $A = \\pi (d/2)^2 = \\frac{\\pi}{4} d^2$. Using $\\pi d^2$ makes the area 4 times too large!",
    },
    perimeter: {
      wrong: "area",
      kind: "geometry",
      fix: "Use the circle area formula $A = \\frac{\\pi}{4} d^2$, not the perimeter $\\pi d$",
      explain: "$\\pi d$ is the circumference (perimeter) of the circle, measured in millimetres. The cross-sectional area is $A = \\frac{\\pi}{4} d^2$ in $\\text{mm}^2$.",
    },
    noKilo: {
      wrong: "load",
      kind: "units",
      fix: "Convert kN to N: $1\\text{ kN} = 1000\\text{ N}$",
      explain: "The load was given as $40\\text{ kN}$. Since $1\\text{ MPa} = 1\\text{ N/mm}^2$, the force must be in newtons: $40\\text{ kN} = 40\\,000\\text{ N}$.",
    },
    wrongSign: {
      wrong: "type",
      kind: "sign",
      fix: "A load pulling away from the bar causes TENSION, not compression",
      explain: "Tension stretches the member ($P > 0, \\sigma > 0$); compression squashes it ($P < 0, \\sigma < 0$).",
    },
  }[slip];

  const ids = lines.map((l) => l.id);
  const follows = lines.filter((l, i) => ids.indexOf(l.id) > ids.indexOf(WHY.wrong) && l.tex !== correct[i]).map((l) => l.id);

  const others = [
    { key: "area", label: "Use radius instead of diameter", feedback: "The diameter was measured directly; the formula just needed $\\pi/4$." },
    { key: "load", label: "Convert the load to kilograms", feedback: "Force belongs in newtons, not kilograms." },
    { key: "stress", label: "Multiply load by area instead of dividing", feedback: "Stress is force PER area, so dividing is correct." },
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

