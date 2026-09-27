// block-tools.js — what the block diagram solver gives the challenges:
//   solveBlocks      the numbers a stage can ask for
//   blockQuantities  their names
//   blockMistakes    wrong answers from classic slips, with explanations
//   blockSummary     the lines under the picture (the reduction, step by step)
//   blockChoices     "which is the right next step?" groups (Solve)
//   blockDebug       a student's reduction with one wrong step (Debug)

import { polyTex } from "../../core/poly.js";
import { reduce, exprTex, MISTAKES, mistakeApplies, kindOf } from "./block-diagram.js";

// The closed-loop T(s) written with a monic bottom (leading coefficient 1):
//   T(s) = (b_m s^m + … + b_0) / (s^n + a_{n−1} s^{n−1} + … + a_0)
// values: "b0" … "bm", "a0" … "a{n−1}", "dc" = T(0) (the steady-state output
// for a unit step, when it exists), "order" = n.
function numericValues(T) {
  const v = {};
  if (!T) return v;
  T.num.forEach((c, k) => (v[`b${k}`] = c));
  T.den.slice(0, -1).forEach((c, k) => (v[`a${k}`] = c));
  v.order = T.den.length - 1;
  if (Math.abs(T.den[0]) > 1e-12) v.dc = T.num[0] / T.den[0];
  return v;
}

export function solveBlocks(setup, mistake = null) {
  // Nothing built yet (the workbench starts empty): nothing to solve.
  if (!setup.diagram) return { status: "resultant", values: {}, red: null, equations: [] };
  const red = reduce(setup, mistake);
  return {
    status: "resultant",
    values: numericValues(red.T.numeric),
    red,
    equations: [],
  };
}

export function blockQuantities(setup) {
  const q = { dc: { label: "T(0)", unit: "" }, order: { label: "n", unit: "" } };
  for (let k = 0; k < 8; k++) {
    q[`a${k}`] = { label: `a_${k}`, unit: "" };
    q[`b${k}`] = { label: `b_${k}`, unit: "" };
  }
  return q;
}

// ---- Classic slips -----------------------------------------------------------------

export const MESSAGES = {
  sign: (node) => ((node.sign ?? -1) < 0
    ? "Check the loop's sign: NEGATIVE feedback gives G/(1 + GH), with a plus in the bottom."
    : "Check the loop's sign: POSITIVE feedback gives G/(1 − GH), with a minus in the bottom."),
  noH: () => "Did you leave out the feedback block H? The loop is G/(1 + GH), not G/(1 + G).",
  noLoop: () => "Did you skip a loop? A feedback loop isn't just its forward path: it becomes G/(1 + GH).",
  HinNum: () => "Only the forward path goes on top: T = G/(1 + GH), not GH/(1 + GH).",
  sum: () => "Blocks in series MULTIPLY: G₁G₂, not G₁ + G₂.",
  product: () => "Blocks in parallel ADD (with their signs): G₁ ± G₂, not G₁G₂.",
  signs: () => "Check the signs at the summing junction: a minus there subtracts that branch.",
};

// What kind of mistake each slip is (see src/core/diagnosis.js; "blockRule" is
// registered in index.js): a rule for combining blocks misapplied, a sign, or a part left out.
export const SLIP_KIND = { sign: "sign", noH: "missing", noLoop: "missing", HinNum: "blockRule", sum: "blockRule", product: "blockRule", signs: "sign" };

// [{ value, kind, message }] for quantity `name`: the same diagram reduced with one
// wrong rule somewhere.
export function blockMistakes(setup, name) {
  const correct = solveBlocks(setup).values[name];
  const out = [];
  const red = reduce(setup);
  for (const step of red.steps) {
    for (const kind of MISTAKES[step.kind]) {
      if (!mistakeApplies(step.kind, step.node, kind)) continue;
      const v = solveBlocks(setup, { step: step.index, kind }).values[name];
      if (!Number.isFinite(v) || (correct != null && Math.abs(v - correct) < 1e-6 * Math.max(1, Math.abs(correct)))) continue;
      out.push({ value: v, kind: SLIP_KIND[kind], message: MESSAGES[kind](step.node) });
    }
  }
  if (correct != null && Math.abs(correct) > 1e-9) out.push({ value: -correct, kind: "sign", message: "Right size, wrong sign. Check the signs at each summing junction." });
  return out;
}

// ---- Lines under the picture -----------------------------------------------------

const RULE = { series: "blocks in series multiply", parallel: "parallel branches add", loop: "a feedback loop" };
export const ruleName = (kind) => RULE[kind];

// One step as KaTeX: "G_{e1} = \dfrac{G_2}{1 + G_2H_2}" (and, for the last
// step when it isn't already written that way, "= <in the original blocks>").
export function stepTex(red, step, { full = false } = {}) {
  // The step's parts come first, in the order it combines them (G_1 G_{e1} G_3).
  const partIds = step.parts.map((p) => p.id);
  const inOrder = { ...red, order: [...partIds, ...red.order.filter((id) => !partIds.includes(id))] };
  const left = `${step.tex} = ${exprTex(inOrder, step.stepSym)}`;
  if (!full) return left;
  const whole = exprTex(red, step.fullSym);
  return whole === exprTex(red, step.stepSym) ? left : `${left} = ${whole}`;
}

// setup.reduce: how many steps are done (pictures that collapse step by step).
export function blockSummary(setup, result, { mode = "symbolic", reveal = true } = {}) {
  const red = result.red;
  if (!red) return []; // nothing built yet (the workbench)
  const n = setup.reduce == null ? red.steps.length : setup.reduce;
  const lines = [];
  if (!reveal) return lines;
  red.steps.slice(0, n).forEach((s, i) => lines.push(stepTex(red, s, { full: i === red.steps.length - 1 })));
  if (n < red.steps.length) lines.push(`\\text{Next: ${ruleName(red.steps[n].kind)}}`);
  const T = red.T.numeric;
  if (mode === "numeric" && T && n === red.steps.length) {
    lines.push(`T(s) = \\dfrac{${polyTex(T.num)}}{${polyTex(T.den)}}`);
    const v = result.values;
    if (v.dc != null && T.den.length > 1) lines.push(`T(0) = ${Number(v.dc.toFixed(4))}`);
  }
  return lines;
}

// ---- Solve: choose each step ------------------------------------------------------

function shuffle(list) {
  const a = list.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// One group per reduction step: the right rule, and two versions with a slip.
export function blockChoices(setup) {
  const red = reduce(setup);
  return red.steps.map((step) => {
    const wrongKinds = shuffle(MISTAKES[step.kind].filter((k) => mistakeApplies(step.kind, step.node, k)));
    const seen = new Set([stepTex(red, step)]);
    const options = [{ tex: stepTex(red, step), correct: true }];
    for (const kind of wrongKinds) {
      const bad = reduce(setup, { step: step.index, kind }).steps[step.index];
      const tex = stepTex(red, { ...step, stepSym: bad.stepSym });
      if (seen.has(tex)) continue;
      seen.add(tex);
      options.push({ tex, kind: SLIP_KIND[kind], feedback: MESSAGES[kind](step.node) });
      if (options.length === 3) break;
    }
    const parts = step.parts.map((p) => `$${p.tex}$`).join(kindOf(step.node) === "loop" ? " and " : ", ");
    return { title: `Step ${step.index + 1}: ${ruleName(step.kind)} (${parts})`, options: shuffle(options) };
  });
}

// ---- Debug: a reduction with one wrong step ----------------------------------------

const FIXES = {
  sign: "Flip the sign in the bottom (1 + GH ↔ 1 − GH)",
  noH: "Put H back in the loop: 1 + GH",
  noLoop: "Close the loop: G/(1 + GH), not just G",
  HinNum: "Only the forward path goes on top",
  sum: "Multiply the blocks in series",
  product: "Add the parallel branches",
  signs: "Use the signs at the summing junction",
};

// mutation: { step, kind }. Returns the student's lines (the wrong step, and
// the final answer that follows from it), which line is wrong, and the fixes.
export function blockDebug(setup, mutation) {
  const good = reduce(setup);
  const bad = reduce(setup, mutation);
  const lines = bad.steps.map((s, i) => ({ id: `step${i}`, tex: stepTex(bad, s, { full: i === bad.steps.length - 1 }) }));
  const others = Object.keys(FIXES).filter((k) => k !== mutation.kind && MISTAKES[good.steps[mutation.step].kind].includes(k));
  const distractors = shuffle(Object.keys(FIXES).filter((k) => k !== mutation.kind && !others.includes(k))).slice(0, Math.max(0, 2 - others.length));
  const fixes = shuffle([
    { label: FIXES[mutation.kind], correct: true },
    ...[...others, ...distractors].slice(0, 2).map((k) => ({ label: FIXES[k], feedback: "That part of the step is already right. Look again at what this step combines, and compare it with the rule." })),
  ]);
  return {
    lines,
    wrong: `step${mutation.step}`,
    // A later line that is wrong only because it builds on the mistake.
    follows: bad.steps.map((_, i) => `step${i}`).filter((id, i) => i > mutation.step && exprTex(bad, bad.steps[i].fullSym) !== exprTex(good, good.steps[i].fullSym)),
    fixes,
    explain: MESSAGES[mutation.kind](good.steps[mutation.step].node),
    kind: SLIP_KIND[mutation.kind], // what a student who can't find this line struggles with
    corrected: good.steps.map((s, i) => stepTex(good, s, { full: i === good.steps.length - 1 })),
  };
}
