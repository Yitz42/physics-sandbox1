// block-diagram.js — block diagrams and their reduction (Nise, chapter 5).
//
// A block diagram is written as a tree of four kinds of node:
//   { block: "G1", tex: "G_1", tf: { num: [10], den: [1, 1, 0] }, show: ["10", "s(s + 1)"] }
//        one block. tf (optional) is its transfer function, coefficients highest
//        power first; a coefficient may be the name of a setup.params entry
//        ("K"), so sliders can change it. show (optional): how the picture
//        writes it (param names are replaced by their values).
//   { series: [node, node, …] }                  blocks one after another
//   { parallel: [node, node, …], signs: [1, -1] } branches added at a summing junction
//   { loop: node, back: node | null, sign: -1 }   a feedback loop: forward path, the
//        feedback path (null = unity feedback) and its sign (−1 negative, +1 positive)
//
// Reducing: the innermost group whose parts are all single blocks is replaced
// by one equivalent block, again and again, until one block T(s) is left:
//   series → product,  parallel → signed sum,  loop → G / (1 ∓ GH).
// Each step is kept (for the equations panel, the Solve steps and Debug).
//
// setup = { diagram, params: { K: 10 }, input: "R(s)", output: "C(s)",
//           reduce: n   (pictures: show the diagram after n steps) }

import { tf, fromDescending, fractionOps } from "../../core/poly.js";
import * as S from "../../core/symbolic.js";

export const SF = fractionOps(S.symRing); // fractions of symbolic polynomials

export const kindOf = (n) => (n.block != null ? "block" : n.series ? "series" : n.parallel ? "parallel" : n.loop ? "loop" : null);
export const childrenOf = (n) => (n.series || n.parallel || (n.loop ? [n.loop, ...(n.back ? [n.back] : [])] : []));

// Default KaTeX name of a block: "G1" → "G_1", "H12" → "H_{12}".
export function blockTex(b) {
  if (b.tex) return b.tex;
  const m = String(b.block).match(/^([A-Za-z]+)(\d+)$/);
  return m ? `${m[1]}_{${m[2]}}` : String(b.block);
}

// Every block (leaf) in the order it appears.
export function leavesOf(node, out = []) {
  if (kindOf(node) === "block") out.push(node);
  else childrenOf(node).forEach((c) => leavesOf(c, out));
  return out;
}

// A coefficient: a number, or a param name (optionally "-K").
export function coeff(c, params = {}) {
  if (typeof c === "number") return c;
  const neg = String(c).startsWith("-");
  const name = neg ? String(c).slice(1) : String(c);
  if (!(name in params)) throw new Error(`Unknown parameter "${name}" in a transfer function`);
  return neg ? -params[name] : params[name];
}

// A block's transfer function as a fraction of polynomials in s (or null).
export function blockTf(b, params) {
  if (!b.tf) return null;
  return tf.of(fromDescending(b.tf.num.map((c) => coeff(c, params))), fromDescending((b.tf.den || [1]).map((c) => coeff(c, params))));
}

// ---- Reduction ----------------------------------------------------------------------

// Wrong rules, used to predict students' mistakes (and to build Debug stages):
//   loop:     "sign" (the wrong sign in 1 ∓ GH), "noH" (1 + G instead of 1 + GH),
//             "noLoop" (the loop left out: just G), "HinNum" (GH / (1 + GH))
//   series:   "sum" (added instead of multiplied)
//   parallel: "product" (multiplied instead of added), "signs" (every sign +)
export const MISTAKES = {
  loop: ["sign", "noH", "noLoop", "HinNum"],
  series: ["sum"],
  parallel: ["product", "signs"],
};

// Combine the parts of one group, in any fraction arithmetic (ops), optionally
// with a mistake. parts: the parts' values; for a loop, [forward, back|null].
export function combine(kind, node, parts, ops, mistake) {
  if (kind === "series") {
    return mistake === "sum" ? parts.reduce(ops.add) : parts.reduce(ops.mul);
  }
  if (kind === "parallel") {
    const signs = node.signs || parts.map(() => 1);
    if (mistake === "product") return parts.reduce(ops.mul);
    return parts.map((p, i) => (signs[i] < 0 && mistake !== "signs" ? ops.neg(p) : p)).reduce(ops.add);
  }
  // loop
  const [G, H0] = parts;
  const H = H0 || ops.one();
  const sign = node.sign ?? -1;
  if (mistake === "noLoop") return G;
  if (mistake === "sign") return ops.feedback(G, H, -sign);
  if (mistake === "noH") return ops.feedback(G, ops.one(), sign);
  if (mistake === "HinNum") return ops.mul(ops.feedback(G, H, sign), H);
  return ops.feedback(G, H, sign);
}

// Does this mistake make sense for this group? (e.g. "noH" needs a real H)
export function mistakeApplies(kind, node, mistake) {
  if (!MISTAKES[kind].includes(mistake)) return false;
  if ((mistake === "noH" || mistake === "HinNum") && !node.back) return false;
  if (mistake === "signs" && !(node.signs || []).some((s) => s < 0)) return false;
  return true;
}

// Reduce the whole diagram. Returns
//   steps: [{ index, kind, node, id, tex, partTex: [..], stepSym, fullSym, numeric }]
//     id/tex: the new block's name ("Ge1" / "G_{e1}"; the last step is "T" / "T(s)")
//     stepSym: the new block in terms of its parts' names (G_{e2} = G_1 G_{e1})
//     fullSym: the same in terms of the original blocks; numeric: in s (or null)
//   T: { sym, numeric }   the whole diagram's transfer function
// mistake: { step, kind } makes step number `step` use a wrong rule.
export function reduce(setup, mistake = null) {
  const params = setup.params || {};
  const order = leavesOf(setup.diagram).map((b) => b.block);
  const steps = [];
  // Post-order walk: a group is reduced once all its parts are single blocks.
  function walk(node) {
    const kind = kindOf(node);
    if (kind === "block") {
      const t = blockTf(node, params);
      return { id: node.block, tex: blockTex(node), sym: SF.of(S.symbol(node.block)), numeric: t, leaf: node };
    }
    const kids = childrenOf(node).map(walk);
    const index = steps.length;
    const wrong = mistake && mistake.step === index ? mistake.kind : null;
    // For a loop, parts are [forward, back]; unity feedback has no back part.
    const pack = (vals) => (kind === "loop" ? [vals[0], node.back ? vals[1] : null] : vals);
    const stepSym = combine(kind, node, pack(kids.map((k) => SF.of(S.symbol(k.id)))), SF, wrong);
    const fullSym = combine(kind, node, pack(kids.map((k) => k.sym)), SF, wrong);
    const allNumeric = kids.every((k) => k.numeric);
    const numeric = allNumeric ? combine(kind, node, pack(kids.map((k) => k.numeric)), tf, wrong) : null;
    const step = {
      index, kind, node, id: `Ge${index + 1}`, tex: `G_{e${index + 1}}`,
      parts: kids.map((k) => ({ id: k.id, tex: k.tex })),
      stepSym, fullSym, numeric,
    };
    steps.push(step);
    return { id: step.id, tex: step.tex, sym: fullSym, numeric };
  }
  const top = walk(setup.diagram);
  if (steps.length) {
    const last = steps[steps.length - 1];
    last.id = "T";
    last.tex = "T(s)";
  }
  // Names of every symbol that can appear, for writing expressions.
  const names = {};
  for (const b of leavesOf(setup.diagram)) names[b.block] = blockTex(b);
  for (const s of steps) names[s.id] = s.tex;
  return { steps, T: { sym: top.sym, numeric: top.numeric }, order: [...order, ...steps.map((s) => s.id)], names };
}

// KaTeX for a symbolic fraction, with this diagram's names.
export function exprTex(red, frac) {
  return S.fracTex(frac, (id) => red.names[id] || id, red.order);
}

// The diagram after `n` reduction steps: every group reduced so far becomes
// one block (named G_e1 …). Each group node's step index is found by reducing.
export function partialDiagram(setup, n) {
  const red = reduce(setup);
  const stepOf = new Map(red.steps.map((s) => [s.node, s]));
  function cut(node) {
    const s = stepOf.get(node);
    if (s && s.index < n) return { block: s.id, tex: s.tex, reduced: true, step: s.index };
    // Copies remember their original (src), so a picture can find a group.
    if (node.series) return { ...node, src: node, series: node.series.map(cut) };
    if (node.parallel) return { ...node, src: node, parallel: node.parallel.map(cut) };
    if (node.loop) return { ...node, src: node, loop: cut(node.loop), back: node.back ? cut(node.back) : null };
    return node;
  }
  return { diagram: cut(setup.diagram), red };
}
