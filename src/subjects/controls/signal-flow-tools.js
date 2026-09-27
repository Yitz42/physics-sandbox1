// signal-flow-tools.js — what the signal-flow graph solver gives the challenges:
//   solveSignalFlow   the numbers a stage can ask for (counts, and values when
//                     every gain has a number)
//   signalQuantities  their names;  signalMistakes  classic slips
//   signalSummary     Mason's rule, line by line
//   signalChoices     "which list / which Δ is right?" groups (Solve)
//   signalDebug       a student's Mason's rule with one wrong line (Debug)

import * as S from "../../core/symbolic.js";
import { mason, valueOf } from "./signal-flow.js";

// KaTeX names of the gains: setup.symbols[id].tex, else "G1" → "G_1".
function texOf(setup) {
  const syms = setup.symbols || {};
  return (id) => (syms[id] && syms[id].tex) || id.replace(/^([A-Za-z]+)(\d+)$/, "$1_{$2}");
}
const orderOf = (setup) => Object.keys(setup.symbols || {});
const tex = (setup, poly) => S.symTex(poly, texOf(setup), orderOf(setup));

export function solveSignalFlow(setup, mistake = null) {
  const m = mason(setup, mistake);
  const values = { paths: m.paths.length, loops: m.loops.length, pairs: m.pairs.length, sets: m.nonTouching.length };
  const D = valueOf(setup, m.delta);
  const top = valueOf(setup, m.T.num);
  if (D != null) values.Delta = D;
  if (D != null && top != null && Math.abs(D) > 1e-12) values.T = top / D;
  m.P.forEach((p, k) => { const v = valueOf(setup, p); if (v != null) values[`P${k + 1}`] = v; });
  m.L.forEach((l, i) => { const v = valueOf(setup, l); if (v != null) values[`L${i + 1}`] = v; });
  m.deltas.forEach((d, k) => { const v = valueOf(setup, d); if (v != null) values[`Delta${k + 1}`] = v; });
  return { status: "resultant", values, mason: m, equations: [] };
}

export function signalQuantities(setup) {
  const q = {
    paths: { label: "\\text{forward paths}", unit: "" },
    loops: { label: "\\text{loops}", unit: "" },
    pairs: { label: "\\text{non-touching pairs}", unit: "" },
    Delta: { label: "\\Delta", unit: "" },
    T: { label: "T", unit: "" },
  };
  for (let k = 1; k <= 8; k++) {
    q[`P${k}`] = { label: `P_${k}`, unit: "" };
    q[`L${k}`] = { label: `L_${k}`, unit: "" };
    q[`Delta${k}`] = { label: `\\Delta_${k}`, unit: "" };
  }
  return q;
}

// ---- Classic slips ---------------------------------------------------------------

const MESSAGES = {
  noPairs: "Did you leave out the non-touching loops? Δ also has + (products of pairs of loops that don't touch).",
  loopSign: "Check the sign: Δ = 1 − ΣL, so each loop gain is SUBTRACTED.",
  deltaOne: "Δ_k isn't always 1: it keeps the loops that don't touch path k.",
  deltaFull: "Δ_k uses only the loops that DON'T touch path k — not all of Δ.",
  missLoop: "Did you miss a loop? Look for every closed route that comes back to where it started.",
  missPath: "Did you miss a forward path? Look for every route from the input to the output.",
};

function allMistakes(m) {
  const list = [{ kind: "noPairs" }, { kind: "loopSign" }];
  m.paths.forEach((_, k) => list.push({ kind: "deltaOne", path: k }, { kind: "deltaFull", path: k }, { kind: "missPath", path: k }));
  m.loops.forEach((_, i) => list.push({ kind: "missLoop", loop: i }));
  return list;
}

export function signalMistakes(setup, name) {
  const correct = solveSignalFlow(setup).values[name];
  const out = [];
  const base = mason(setup);
  for (const mk of allMistakes(base)) {
    const v = solveSignalFlow(setup, mk).values[name];
    if (!Number.isFinite(v) || (correct != null && Math.abs(v - correct) < 1e-6 * Math.max(1, Math.abs(correct)))) continue;
    out.push({ value: v, message: MESSAGES[mk.kind] });
  }
  // Counts: one off is usually a missed (or extra) path or loop.
  if (name === "paths" || name === "loops" || name === "pairs") {
    const what = { paths: "forward path", loops: "loop", pairs: "non-touching pair" }[name];
    out.push({ value: correct + 1, message: `One too many. A ${what} may not pass through any node twice — and don't count the same one twice.` });
    if (correct > 0) out.push({ value: correct - 1, message: `One ${what} is missing. Trace every route through the graph systematically.` });
  }
  return out;
}

// ---- Lines ----------------------------------------------------------------------

// Mason's rule as KaTeX lines: the paths, the loops, the non-touching loops,
// Δ, each Δ_k and T. mistake: build a student's (wrong) version.
// expand: also write T out in the gains (long; the equations panel has room).
export function masonLines(setup, mistake = null, { expand = true } = {}) {
  const m = mason(setup, mistake);
  const lines = [];
  const missed = mistake && mistake.kind === "missLoop" ? mistake.loop : null; // a loop the student missed
  const kept = m.L.map((l, i) => i).filter((i) => i !== missed);
  lines.push({ id: "paths", tex: m.P.map((p, k) => `P_{${k + 1}} = ${tex(setup, p)}`).join(",\\quad ") || "\\text{no forward paths}" });
  lines.push({ id: "loops", tex: kept.map((i, j) => `L_{${j + 1}} = ${tex(setup, m.L[i])}`).join(",\\quad ") || "\\text{no loops}" });
  const name = (i) => `L_{${kept.indexOf(i) + 1}}`;
  const sets = m.nonTouching.filter((set) => !set.includes(missed)).map((set) => set.map(name).join(""));
  lines.push({ id: "pairs", tex: sets.length ? `\\text{non-touching: } ${sets.join(",\\ ")}` : "\\text{no non-touching loops}" });
  lines.push({ id: "delta", tex: `\\Delta = ${tex(setup, m.delta)}` });
  m.deltas.forEach((d, k) => lines.push({ id: `delta${k + 1}`, tex: `\\Delta_{${k + 1}} = ${tex(setup, d)}` }));
  const sum = m.P.map((_, k) => `P_{${k + 1}}\\Delta_{${k + 1}}`).join(" + ");
  lines.push({ id: "T", tex: `T = \\dfrac{${sum}}{\\Delta}` + (expand ? ` = ${S.fracTex(m.T, texOf(setup), orderOf(setup))}` : "") });
  return lines;
}

export function signalSummary(setup, result, { mode = "symbolic", reveal = true } = {}) {
  if (!reveal) return [];
  const lines = masonLines(setup).map((l) => l.tex);
  const v = result.values;
  if (mode === "numeric" && v.T != null) lines.push(`\\Delta = ${Number(v.Delta.toFixed(4))},\\quad T = ${Number(v.T.toFixed(4))}`);
  return lines;
}

// ---- Solve: choose each part ----------------------------------------------------

function shuffle(list) {
  const a = list.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// Groups: the loops, Δ, and each Δ_k — the right line and versions with a slip.
export function signalChoices(setup) {
  const good = masonLines(setup);
  const line = (id, lines = good) => lines.find((l) => l.id === id).tex;
  const m = mason(setup);
  const groups = [];
  const group = (title, id, wrongs) => {
    const seen = new Set([line(id)]);
    const options = [{ tex: line(id), correct: true }];
    for (const mk of wrongs) {
      const t = line(id, masonLines(setup, mk));
      if (seen.has(t)) continue;
      seen.add(t);
      options.push({ tex: t, feedback: MESSAGES[mk.kind] });
      if (options.length === 3) break;
    }
    if (options.length > 1) groups.push({ title, options: shuffle(options) });
  };
  group("The loops", "loops", shuffle(m.loops.map((_, i) => ({ kind: "missLoop", loop: i }))));
  group("The determinant Δ", "delta", [{ kind: "noPairs" }, { kind: "loopSign" }]);
  m.paths.forEach((_, k) => group(`$\\Delta_{${k + 1}}$ for path $P_{${k + 1}}$`, `delta${k + 1}`, [{ kind: "deltaOne", path: k }, { kind: "deltaFull", path: k }, { kind: "loopSign" }]));
  return groups;
}

// ---- Debug: Mason's rule with one wrong line ------------------------------------

const FIXES = {
  noPairs: "Add the products of non-touching loops to Δ",
  loopSign: "Subtract the loop gains: Δ = 1 − ΣL",
  deltaOne: "Keep the loops that don't touch this path in Δ_k",
  deltaFull: "Use only the loops that don't touch this path",
};

export function signalDebug(setup, mutation) {
  const good = masonLines(setup, null, { expand: false });
  const bad = masonLines(setup, mutation, { expand: false });
  const wrongId = mutation.kind === "deltaOne" || mutation.kind === "deltaFull" ? `delta${mutation.path + 1}` : "delta";
  const others = shuffle(Object.keys(FIXES).filter((k) => k !== mutation.kind)).slice(0, 2);
  return {
    lines: bad,
    wrong: wrongId,
    follows: bad.filter((l) => l.id !== wrongId && good.find((g) => g.id === l.id).tex !== l.tex).map((l) => l.id),
    fixes: shuffle([
      { label: FIXES[mutation.kind], correct: true },
      ...others.map((k) => ({ label: FIXES[k], feedback: "That part of this line is right. Compare it with Mason's rule again." })),
    ]),
    explain: MESSAGES[mutation.kind],
    corrected: good.map((l) => l.tex),
  };
}
