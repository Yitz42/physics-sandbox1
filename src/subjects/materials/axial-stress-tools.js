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
      // (4 times too big: the area 4 times too small — the radius put into (π/4)d², i.e. π r²/4.)
      add(right * 4, "Did you put the RADIUS into $\\frac{\\pi}{4} d^2$? That formula takes the diameter; with the radius it's $\\pi r^2$.", "geometry");
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
