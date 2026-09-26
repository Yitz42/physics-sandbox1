// equations.js — equations as data, turned into KaTeX strings.
//
// An equation is a list of TERMS added together. Keeping equations as data
// (instead of hand-written strings) lets the game:
//   • show them in symbols first, then with numbers substituted,
//   • highlight one term when its arrow is clicked (and the reverse),
//   • make deliberately-wrong copies for "debug" and "solve" challenges,
//   • build the linear system that the solver hands to linear.js.
//
// A term looks like:
//   { id: "T_AB",            // which force/quantity it belongs to (for highlighting)
//     sign: -1,              // +1 or -1
//     symbol: "T_{AB}",      // KaTeX symbol
//     value: null,           // known number, or null when unknown
//     factor: { tex: "\\cos 30^\\circ", value: 0.866, pre: false,
//               alt: { tex: "\\sin 30^\\circ", value: 0.5 } } }   // optional
// `factor.alt` is the "sin/cos swapped" version used to build mistakes.
//
// An equation looks like:
//   { id: "sumFx", lhs: "\\Sigma F_x", terms: [...], form: "zero" | "define",
//     result: { value, unit } }   // result only for "define" equations
//   form "zero":   ΣFx = T_AB cos30° − … = 0          (equilibrium)
//   form "define": F_Rx = ΣFx = 200 cos30° + … = 173 N (a resultant)

import { sigFig, formatTex } from "./units.js";
import { solveSystem } from "./linear.js";

// CSS class that links a term to its arrow. KaTeX's \htmlClass puts it on the HTML.
export function termClass(id) {
  return "term-" + String(id).replace(/[^A-Za-z0-9_-]/g, "_");
}

function factorValue(term) {
  return term.factor ? term.factor.value : 1;
}

// KaTeX for one term (without its leading sign).
function termBody(term, numeric) {
  const known = numeric && term.value != null;
  const sym = known ? `(${sigFig(term.value, 4)})` : term.symbol;
  if (!term.factor) return known ? sigFig(term.value, 4) : sym;
  return term.factor.pre ? `${term.factor.tex}${sym}` : `${sym}${term.factor.tex}`;
}

// KaTeX for the sum of terms, e.g. "T_{AB}\cos 30^\circ - W".
// `highlight` wraps each term so clicking it (or its arrow) can light it up.
export function termsTex(terms, { numeric = false, highlight = true } = {}) {
  if (terms.length === 0) return "0";
  return terms
    .map((t, i) => {
      const op = t.sign < 0 ? (i === 0 ? "-" : " - ") : i === 0 ? "" : " + ";
      const body = termBody(t, numeric);
      const wrapped = highlight ? `\\htmlClass{eqterm ${termClass(t.id)}}{${body}}` : body;
      return op + wrapped;
    })
    .join("");
}

// Full equation as KaTeX. mode: "symbolic" or "numeric".
export function equationTex(eq, mode = "symbolic", opts = {}) {
  const numeric = mode === "numeric";
  const body = termsTex(eq.terms, { ...opts, numeric });
  if (eq.form === "define") {
    const end = numeric && eq.result && opts.showResult !== false ? ` = ${formatTex(eq.result.value, eq.result.unit || "")}` : "";
    return `${eq.lhs} = ${body}${end}`;
  }
  return `${eq.lhs} = ${body} = 0`;
}

// Numeric value of the sum of terms, given values for any unknown symbols.
export function evaluate(eq, unknownValues = {}) {
  return eq.terms.reduce((s, t) => {
    const v = t.value != null ? t.value : unknownValues[t.id];
    return s + t.sign * factorValue(t) * (v ?? NaN);
  }, 0);
}

// Solve a set of "zero" equations for the terms whose value is null.
// Returns { status, values: { id: number }, residual } — see linear.js.
export function solveEquations(equations, unknownIds) {
  const col = new Map(unknownIds.map((id, j) => [id, j]));
  const A = equations.map(() => new Array(unknownIds.length).fill(0));
  const b = equations.map(() => 0);
  equations.forEach((eq, i) => {
    for (const t of eq.terms) {
      const c = t.sign * factorValue(t);
      if (t.value == null && col.has(t.id)) A[i][col.get(t.id)] += c;
      else b[i] -= c * (t.value ?? 0);
    }
  });
  const out = solveSystem(A, b);
  const values = {};
  if (out.x) unknownIds.forEach((id, j) => (values[id] = out.x[j]));
  return { status: out.status, values, residual: out.residual };
}

// ---- Deliberate mistakes (used by debug and solve challenges) -------------

const copy = (eq) => JSON.parse(JSON.stringify(eq));

// Swap sin ↔ cos (or any factor with an `alt`) in one term.
export function swapFactor(eq, termId) {
  const out = copy(eq);
  const t = out.terms.find((x) => x.id === termId);
  if (t && t.factor && t.factor.alt) {
    const { alt, ...rest } = t.factor;
    t.factor = { ...rest, tex: alt.tex, value: alt.value, alt: { tex: rest.tex, value: rest.value } };
  }
  return out;
}

export function flipSign(eq, termId) {
  const out = copy(eq);
  const t = out.terms.find((x) => x.id === termId);
  if (t) t.sign = -t.sign;
  return out;
}

export function removeTerm(eq, termId) {
  const out = copy(eq);
  out.terms = out.terms.filter((x) => x.id !== termId);
  return out;
}

// Every single-mistake version of an equation, each with a short reason.
// The solve challenge picks a few of these as wrong multiple-choice options.
export function mistakesOf(eq) {
  const list = [];
  for (const t of eq.terms) {
    if (t.factor && t.factor.alt) list.push({ eq: swapFactor(eq, t.id), kind: "swap", termId: t.id });
    list.push({ eq: flipSign(eq, t.id), kind: "sign", termId: t.id });
    if (eq.terms.length > 1) list.push({ eq: removeTerm(eq, t.id), kind: "missing", termId: t.id });
  }
  return list;
}
