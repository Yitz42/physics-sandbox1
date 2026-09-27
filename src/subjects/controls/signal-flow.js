// signal-flow.js — signal-flow graphs and Mason's rule (Nise, chapter 5).
//
// A signal-flow graph is nodes (signals) joined by branches (gains):
//   setup = {
//     nodes:    [{ id: "R", at: [0, 0], label: "R(s)" }, …]    at: where it's drawn
//     branches: [{ from: "R", to: "V1", gain: "G1", bend: 0 }, …]
//               gain: a symbol ("G1"), its negative ("-H1"), or a number (1, -1, 0.5)
//               bend: how far the drawn branch bows out (0 = straight)
//     input: "R", output: "C",
//     symbols:  { G1: { tex: "G_1", value: 2 } }   value (optional) gives numbers
//   }
// Mason's rule:  T = Σ P_k Δ_k / Δ, where
//   P_k  forward path gains (input to output, no node twice)
//   L_i  loop gains (back to where it started, no node twice)
//   Δ  = 1 − ΣL_i + Σ(products of 2 non-touching loops) − Σ(of 3) + …
//   Δ_k = Δ using only the loops that don't touch path k.
// Loops "touch" when they share a node.

import { fractionOps } from "../../core/poly.js";
import * as S from "../../core/symbolic.js";

const SF = fractionOps(S.symRing);

// A branch's gain as a symbolic polynomial.
export function gainOf(g) {
  if (typeof g === "number") return S.constant(g);
  const t = String(g).trim();
  const neg = t.startsWith("-");
  const body = neg ? t.slice(1) : t;
  if (/^[\d.]+$/.test(body)) return S.constant(neg ? -Number(body) : Number(body));
  return S.symbol(body, neg ? -1 : 1);
}

const product = (list) => list.reduce((a, b) => S.mul(a, b), S.constant(1));

// Every forward path: [{ branches: [i…], nodes: [id…] }], in the order found.
export function forwardPaths(setup) {
  const out = [];
  const walk = (node, nodes, branches) => {
    if (node === setup.output) return out.push({ nodes: nodes.slice(), branches: branches.slice() });
    setup.branches.forEach((b, i) => {
      if (b.from !== node || nodes.includes(b.to)) return;
      walk(b.to, [...nodes, b.to], [...branches, i]);
    });
  };
  walk(setup.input, [setup.input], []);
  return out;
}

// Every loop, found once each: start at its first node (in node-list order)
// and only pass through later nodes. Listed smallest first.
export function loops(setup) {
  const order = setup.nodes.map((n) => n.id);
  const rank = (id) => order.indexOf(id);
  const out = [];
  for (const start of order) {
    const walk = (node, nodes, branches) => {
      setup.branches.forEach((b, i) => {
        if (b.from !== node) return;
        if (b.to === start) return out.push({ nodes: nodes.slice(), branches: [...branches, i] });
        if (rank(b.to) < rank(start) || nodes.includes(b.to)) return;
        walk(b.to, [...nodes, b.to], [...branches, i]);
      });
    };
    walk(start, [start], []);
  }
  // Textbook order: smaller loops first, then from left to right (by first node).
  return out.sort((a, b) => a.nodes.length - b.nodes.length || rank(a.nodes[0]) - rank(b.nodes[0]));
}

const touching = (a, b) => a.nodes.some((n) => b.nodes.includes(n));

// Every set of k loops (k ≥ 2) that don't touch each other: [[i, j], [i, j, k] …]
export function nonTouchingSets(allLoops, pool = allLoops.map((_, i) => i)) {
  const out = [];
  const grow = (set, from) => {
    for (let j = from; j < pool.length; j++) {
      const i = pool[j];
      if (set.some((s) => touching(allLoops[s], allLoops[i]))) continue;
      const next = [...set, i];
      if (next.length >= 2) out.push(next);
      grow(next, j + 1);
    }
  };
  grow([], 0);
  return out;
}

// Δ for a set of loops (indices): 1 − ΣL + Σ pairs − Σ triples …
// mistake "noPairs": leave out the non-touching products; "loopSign": 1 + ΣL.
function delta(loopGains, allLoops, pool, mistake) {
  let d = S.constant(1);
  for (const i of pool) d = mistake === "loopSign" ? S.add(d, loopGains[i]) : S.add(d, S.neg(loopGains[i]));
  if (mistake === "noPairs") return d;
  for (const set of nonTouchingSets(allLoops, pool)) {
    const term = product(set.map((i) => loopGains[i]));
    d = S.add(d, set.length % 2 === 0 ? term : S.neg(term));
  }
  return d;
}

// Everything Mason's rule needs. mistake (optional, to predict slips):
//   { kind: "noPairs" | "loopSign" }        a wrong Δ (and so wrong Δ_k)
//   { kind: "deltaOne", path: k }           Δ_k taken as 1 (non-touching loops forgotten)
//   { kind: "deltaFull", path: k }          Δ_k taken as the whole Δ
//   { kind: "missLoop", loop: i }           one loop missed
//   { kind: "missPath", path: k }           one forward path missed
export function mason(setup, mistake = null) {
  const paths = forwardPaths(setup);
  const allLoops = loops(setup);
  const gainOfBranches = (list) => product(list.map((i) => gainOf(setup.branches[i].gain)));
  const P = paths.map((p) => gainOfBranches(p.branches));
  const L = allLoops.map((l) => gainOfBranches(l.branches));
  const kind = mistake && mistake.kind;
  let pool = allLoops.map((_, i) => i);
  if (kind === "missLoop") pool = pool.filter((i) => i !== mistake.loop);
  const D = delta(L, allLoops, pool, kind);
  const Dk = paths.map((p, k) => {
    if (kind === "deltaOne" && mistake.path === k) return S.constant(1);
    if (kind === "deltaFull" && mistake.path === k) return D;
    const free = pool.filter((i) => !allLoops[i].nodes.some((n) => p.nodes.includes(n)));
    return delta(L, allLoops, free, kind === "loopSign" || kind === "noPairs" ? kind : null);
  });
  let top = S.constant(0);
  paths.forEach((_, k) => {
    if (kind === "missPath" && mistake.path === k) return;
    top = S.add(top, S.mul(P[k], Dk[k]));
  });
  const pairs = nonTouchingSets(allLoops).filter((s) => s.length === 2);
  return { paths, loops: allLoops, P, L, delta: D, deltas: Dk, T: SF.of(top, D), nonTouching: nonTouchingSets(allLoops), pairs };
}

// The numeric value of a symbolic polynomial, if every symbol has a value.
export function valueOf(setup, poly) {
  const syms = setup.symbols || {};
  let ok = true;
  const v = S.substitute(poly, { zero: 0, add: (a, b) => a + b, mul: (a, b) => a * b }, (id) => {
    if (!syms[id] || syms[id].value == null) ok = false;
    return syms[id] ? syms[id].value ?? NaN : NaN;
  }, (c) => c);
  return ok ? v : null;
}
