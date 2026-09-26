// distributed.js — distributed loads (Unit 6).
//
// A distributed load is replaced by ONE force: its size is the AREA under the
// load curve and it acts at the CENTROID of that area (see distributed-loads.js).
// A beam with several loads (and point loads) is then reduced to a single
// resultant, as in Unit 5 — every load here pushes down, so taking down as
// positive keeps the signs simple:
//   F_R = ΣF              (add up the pieces' areas and the point loads)
//   F_R x̄ = ΣF x̃          (the resultant turns the beam about O as much as they do)
// A curved load w = w₀(x/L)ⁿ is found by integration: F_R = ∫w dx, F_R x̄ = ∫x w dx.
//
// setup = {
//   about:  { at: [x, y], label: "O" }   where x̄ is measured from
//   loads:  distributed loads (format in distributed-loads.js)
//   forces: point loads [{ id, symbol, magnitude, direction: "down" | "up", at }]
//   Drawing only: body, dims, texts, loadScale, showParts, showResultant, extras
// }
//
// result.values: "R" (F_R, N), "pos" (x̄ from O, m), "M" (ΣF x̃, N·m), and for
// each piece "<partId>" (its resultant) and "x_<partId>" (its centroid from O);
// a point load gives "<id>" and "x_<id>".

import { sigFig } from "../../core/units.js";
import { partsOf, wrongCentroid, spanSymbol, spanOf } from "./distributed-loads.js";
import { magnitudeOf } from "./particle.js";

const numM = (v) => `(${sigFig(Math.abs(v), 4)}\\,\\text{m})`; // a distance, with its unit
const originX = (setup) => (setup.about ? setup.about.at[0] : 0);

// Every piece of every load, each given a name: F_1, F_2 … (or F_R when a
// single piece is the whole system) and x̃_1 … for its centroid.
export function namedParts(setup) {
  const parts = (setup.loads || []).flatMap(partsOf);
  const alone = parts.length === 1 && !(setup.forces || []).length;
  return parts.map((p, i) => {
    const load = setup.loads.find((l) => l.id === p.load);
    const given = load.partSymbols && load.partSymbols[partsOf(load).findIndex((q) => q.id === p.id)];
    const symbol = alone ? "F_R" : given || `F_{${i + 1}}`;
    const xSymbol = alone ? "\\bar{x}" : `\\tilde{x}_{${(symbol.match(/_\{?([^}]*)\}?$/) || [])[1] || i + 1}}`;
    return { ...p, symbol, xSymbol, spanSymbol: spanSymbol(load), alone };
  });
}

// Downward point loads count +, upward ones −.
const signOf = (f) => (f.direction === "up" ? -1 : 1);

// ---- Equations as data (see core/equations.js) -----------------------------

// One piece's area: F = wL (rectangle), ½wL (triangle), or ∫w dx (curve).
function areaEquation(part) {
  const Ls = part.spanSymbol, Ln = `(${sigFig(part.L, 4)}\\,\\text{m})`;
  const term = { id: part.id, sign: 1, symbol: part.heightSymbol, value: part.height, unit: "N/m" };
  let lhs = part.symbol;
  if (part.kind === "rect") {
    term.factor = { tex: `\\,${Ls}`, numTex: Ln, value: part.L };
  } else if (part.kind === "tri") {
    term.factor = {
      tex: `\\tfrac{1}{2}${Ls}\\,`, numTex: `\\tfrac{1}{2}${Ln}`, value: part.L / 2, pre: true,
      alt: { tex: `${Ls}\\,`, numTex: Ln, value: part.L },
      swapLabel: "Put in the ½ (a triangle's area)",
      swapReason: "is missing the ½ — a triangle's area is ½ × base × height",
    };
  } else {
    // A curve: the integral, worked out. The tempting wrong answers treat it
    // as a triangle (½w₀L) or a rectangle (w₀L).
    const n = part.n;
    lhs = `${part.symbol} = \\int_0^{${Ls}} w\\,dx = \\int_0^{${Ls}} ${part.heightSymbol}\\left(\\tfrac{x}{${Ls}}\\right)^{${n}} dx`;
    term.signFixed = true; // "−w₀L/3" isn't a tempting mistake
    term.factor = {
      tex: `\\,\\tfrac{${Ls}}{${n + 1}}`, numTex: `\\tfrac{${Ln}}{${n + 1}}`, value: part.L / (n + 1),
      alt: { tex: `\\,\\tfrac{${Ls}}{2}`, numTex: `\\tfrac{${Ln}}{2}`, value: part.L / 2, reason: "treats the curve as a straight-sided triangle (½w₀L) — integrate the actual curve" },
      alts: [{ tex: `\\,${Ls}`, numTex: Ln, value: part.L, reason: "uses w₀L, the area of a rectangle — the load is not uniform, so integrate w = w₀(x/L)ⁿ" }],
    };
  }
  // `defines`: this piece's force is used by later equations (F_R = ΣF …).
  const title = part.kind === "curve" ? part.symbol : undefined; // short group title when choosing equations
  return { id: `A_${part.id}`, lhs, title, form: "define", terms: [term], result: { value: part.F, unit: "N" }, defines: part.alone ? undefined : part.id };
}

// "a·X / b" as KaTeX, in lowest terms: fracTex(2, 12, "L^{2}") → "\tfrac{L^{2}}{6}".
function fracTex(a, b, X) {
  const gcd = (p, q) => (q ? gcd(q, p % q) : p);
  const g = gcd(a, b);
  const [p, q] = [a / g, b / g];
  return q === 1 ? `${p === 1 ? "" : p}${X}` : `\\tfrac{${p === 1 ? "" : p}${X}}{${q}}`;
}

// Moment of a single curved load, by integration: F_R x̄ = ∫x w dx = w₀L²/(n+2).
function curveMomentEquation(part, O) {
  const Ls = part.spanSymbol, n = part.n, L = part.L;
  const Ln = `(${sigFig(L, 4)}\\,\\text{m})`;
  const sq = (s) => `${s}^{2}`;
  return {
    id: "M", title: "F_R\\,\\bar{x}", form: "define", result: { value: part.F * (part.x - O), unit: "N·m" },
    lhs: `F_R\\,\\bar{x} = \\int_0^{${Ls}} x\\,w\\,dx = \\int_0^{${Ls}} x\\,${part.heightSymbol}\\left(\\tfrac{x}{${Ls}}\\right)^{${n}} dx`,
    terms: [{
      id: part.id, sign: 1, signFixed: true, symbol: part.heightSymbol, value: part.height, unit: "N/m",
      factor: {
        tex: `\\,\\tfrac{${sq(Ls)}}{${n + 2}}`, numTex: `\\tfrac{${sq(Ln)}}{${n + 2}}`, value: (L * L) / (n + 2),
        alt: { tex: `\\,\\tfrac{${sq(Ls)}}{${2 * (n + 1)}}`, numTex: `\\tfrac{${sq(Ln)}}{${2 * (n + 1)}}`, value: (L * L) / (2 * (n + 1)), reason: "puts the resultant at the middle of the span (F_R · L/2) — a curved load isn't symmetric" },
        alts: [{ tex: `\\,${fracTex(2, 3 * (n + 1), sq(Ls))}`, numTex: fracTex(2, 3 * (n + 1), sq(Ln)), value: (2 * L * L) / (3 * (n + 1)), reason: "uses a triangle's centroid (⅔L) — for this curve, integrate x w to find it" }],
      },
    }],
  };
}

export function distributedEquations(setup, parts = namedParts(setup)) {
  const O = originX(setup);
  const forces = setup.forces || [];
  const eqs = parts.map(areaEquation);
  if (parts.length === 1 && !forces.length) {
    // One piece is the whole resultant: its centroid IS x̄ (a curve's is found by integration).
    if (parts[0].kind === "curve") eqs.push(curveMomentEquation(parts[0], O));
    return eqs;
  }
  const sum = { id: "F", lhs: "F_R = \\Sigma F", form: "define", terms: [], result: { value: 0, unit: "N" } };
  const mom = { id: "M", lhs: "F_R\\,\\bar{x} = \\Sigma F\\,\\tilde{x}", form: "define", terms: [], result: { value: 0, unit: "N·m" } };
  for (const p of parts) {
    sum.terms.push({ id: p.id, sign: 1, symbol: p.symbol, value: p.F, unit: "N" });
    const d = p.x - O;
    const factor = { tex: `\\,${p.xSymbol}`, numTex: numM(d), value: Math.abs(d) };
    const wrong = wrongCentroid(p);
    if (wrong != null) {
      factor.alt = { tex: `\\,${p.xSymbol}`, numTex: numM(wrong - O), value: Math.abs(wrong - O) };
      factor.swapLabel = p.kind === "tri" ? "Move it to ⅓ of the base from the TALL end" : "Use the curve's centroid";
      factor.swapReason = p.kind === "tri" ? "puts the triangle's resultant ⅓ from its SHORT end — it acts ⅓ of the base from the TALL end" : "puts the curve's resultant at the middle — find its centroid";
    }
    mom.terms.push({ id: p.id, sign: Math.sign(d) || 1, symbol: p.symbol, value: p.F, unit: "N", factor });
  }
  for (const f of forces) {
    sum.terms.push({ id: f.id, sign: signOf(f), symbol: f.symbol, value: magnitudeOf(f), unit: "N" });
    const d = f.at[0] - O;
    if (Math.abs(d) > 1e-9) mom.terms.push({ id: f.id, sign: signOf(f) * Math.sign(d), symbol: f.symbol, value: magnitudeOf(f), unit: "N", factor: { tex: `\\,x_{${f.symbol.replace(/[{}_]/g, "")}}`, numTex: numM(d), value: Math.abs(d) } });
  }
  const total = (eq) => eq.terms.reduce((s, t) => s + t.sign * t.value * (t.factor ? t.factor.value : 1), 0);
  sum.result.value = total(sum);
  mom.result.value = total(mom);
  eqs.push(sum, mom);
  return eqs;
}

// ---- Solve -----------------------------------------------------------------

export function solveDistributed(setup) {
  const O = originX(setup);
  const parts = namedParts(setup);
  const values = {};
  let R = 0, M = 0;
  for (const p of parts) {
    values[p.id] = p.F;
    values[`x_${p.id}`] = p.x - O;
    R += p.F;
    M += p.F * (p.x - O);
  }
  for (const f of setup.forces || []) {
    const F = magnitudeOf(f);
    values[f.id] = F;
    values[`x_${f.id}`] = f.at[0] - O;
    R += signOf(f) * F;
    M += signOf(f) * F * (f.at[0] - O);
  }
  values.R = R;
  values.M = M;
  let message;
  if (Math.abs(R) > 1e-9) values.pos = M / R;
  else message = "The loads add up to zero, so no single force can replace them.";
  for (const l of setup.loads || []) values[`L_${l.id}`] = spanOf(l);
  return { status: "resultant", message, values, parts, equations: distributedEquations(setup, parts), unknowns: [] };
}

// Names and units for result.values (answer boxes and labels).
export function distributedQuantities(setup) {
  const q = {
    R: { label: "F_R", unit: "N" },
    pos: { label: setup.posSymbol || "\\bar{x}", unit: "m" },
    M: { label: "F_R\\,\\bar{x}", unit: "N·m" },
  };
  for (const p of namedParts(setup)) {
    q[p.id] = { label: p.symbol, unit: "N" };
    q[`x_${p.id}`] = { label: p.xSymbol, unit: "m" };
  }
  for (const f of setup.forces || []) q[f.id] = { label: f.symbol, unit: "N" };
  return q;
}
