// internal.js — internal forces in a beam (Units 7.1–7.3).
//
// Cut a beam at a point C: each piece is a rigid body in equilibrium, so the cut
// face must carry three internal forces that hold it there:
//   N  the normal (axial) force, along the beam
//   V  the shear force, across the beam
//   M  the bending moment
// Sign convention (the textbook's, agreed as the course's):
//   N > 0 in TENSION: it pulls away from the cut face on either piece;
//   V > 0 acts DOWN on the left piece's cut face (and up on the right piece's);
//   M > 0 bends the beam concave UP (a smile): counterclockwise on the left piece's
//         face, clockwise on the right piece's.
// With the reactions found first (the whole beam, rigid-body.js), the kept piece's
//   ΣF_x = 0 → N,   ΣF_y = 0 → V,   ΣM_C = 0 → M   (moments about the cut: N and V drop out).
// Along the beam, V(x) and M(x) are polynomials between "event" points (ends,
// supports, point loads, couples, load starts and ends): dV/dx = −w and dM/dx = V.
// Distributed loads push DOWN (w > 0 down), as in Unit 6.
//
// setup = a rigid-body beam setup (rigid-body.js): body { points: [[x0, y], [x1, y]] } (a straight,
//   horizontal beam), supports, forces, loads (uniform / triangle / linear), moments, plus:
//   cut:     x of the cut (from the same origin as the beam's points)
//   keep:    "left" (default) | "right" — the piece whose equations are shown
//   cutName: the cut point's letter (default "C")
//   Drawing only (internal-scene.js): view "cut" | "diagrams", showSegments, fbdGap …
// result.values: the reactions (as rigid-body.js), and
//   N, V, M        at the cut (when setup.cut is set)
//   Mmax, xM       the bending moment of largest size (signed) and where it is
//   Vmax, xV       the same for the shear
//   Mpos, Mneg     the largest positive and most negative moments (0 if none)
//   nSeg           how many segments V(x), M(x) need
//   V0_k … M3_k    segment k's coefficients (k = 1, 2 …, left to right; x from the origin):
//                  V(x) = V0 + V1 x + V2 x²,  M(x) = M0 + M1 x + M2 x² + M3 x³

import { sigFig } from "../../core/units.js";
import { solveRigidBody, knownForces } from "./rigid-body.js";
import { allReactions } from "./supports.js";
import { magnitudeOf, directionOf } from "./particle.js";
import { directionVector, componentFactors, reverse } from "./directions.js";
import { armOf } from "./moment.js";
import { partsOf, endValues } from "./distributed-loads.js";

const EPS = 1e-9;
const numM = (v) => `(${sigFig(Math.abs(v), 3)}\\,\\text{m})`;

// ---- What acts on the beam ------------------------------------------------------------

// Every point force and couple on the beam, with the reactions' SOLVED values drawn
// the way they really act: { points: [{ id, symbol, at, x, Fx, Fy, direction, value, reaction? }],
// couples: [{ id, symbol, x, M (counterclockwise +), value, sense }], loads }.
export function beamActions(setup, values) {
  const points = [], couples = [];
  for (const f of knownForces(setup)) {
    if (f.fromLoad) continue; // (distributed loads are kept as loads, below)
    const F = magnitudeOf(f);
    const u = f.kind === "weight" ? [0, -1] : directionOf(f);
    points.push({ id: f.id, symbol: f.symbol, at: f.at, x: f.at[0], Fx: F * u[0], Fy: F * u[1], direction: f.kind === "weight" ? "down" : f.direction, value: F, kind: f.kind });
  }
  for (const m of setup.moments || []) couples.push({ id: m.id, symbol: m.symbol, x: m.at[0], at: m.at, M: m.magnitude * m.sense, value: m.magnitude, sense: m.sense });
  for (const r of allReactions(setup)) {
    const v = values[r.id];
    if (v == null) continue;
    if (r.moment) {
      couples.push({ id: r.id, symbol: r.symbol, x: r.at[0], at: r.at, M: v * r.sense, value: Math.abs(v), sense: Math.sign(v * r.sense) || 1, reaction: true });
      continue;
    }
    const d = r.dir || directionVector(r.direction);
    points.push({ id: r.id, symbol: r.symbol, at: r.at, x: r.at[0], Fx: v * d[0], Fy: v * d[1], direction: v < 0 ? reverse(r.direction) : r.direction, value: Math.abs(v), reaction: true });
  }
  for (const l of setup.loads || []) {
    if (l.shape === "power") throw new Error("Internal forces: power-curve loads aren't supported (use uniform, triangle or linear)");
  }
  return { points, couples, loads: setup.loads || [] };
}

// A distributed load as w(s) = p + q s (global s), from `from` to `to`.
function linearOf(load) {
  const [a, b] = endValues(load);
  const L = load.to - load.from;
  const q = L > 0 ? (b - a) / L : 0;
  return { p: a - q * load.from, q, from: load.from, to: load.to };
}

// The part of a load between x = a and x = b, as a new "linear" load (or null).
export function loadPortion(load, a, b) {
  const from = Math.max(a, load.from), to = Math.min(b, load.to);
  if (to - from < EPS) return null;
  const { p, q } = linearOf(load);
  const wa = p + q * from, wb = p + q * to;
  const shape = Math.abs(wa - wb) < EPS ? "uniform" : "linear";
  return { ...load, id: load.id, shape, from, to, w: shape === "uniform" ? wa : [wa, wb], peak: undefined };
}

// ---- Internal forces at one section ----------------------------------------------------

// N, V, M just right of x (side +1) or just left of it (side −1), from the piece LEFT of x.
export function internalAt(setup, actions, x, side = 1) {
  const y0 = beamY(setup);
  const left = (xi) => (side > 0 ? xi < x + EPS : xi < x - EPS);
  let Fx = 0, V = 0, M = 0;
  for (const f of actions.points) {
    if (!left(f.x)) continue;
    Fx += f.Fx;
    V += f.Fy;
    M += f.Fy * (x - f.x) + f.Fx * (f.at[1] - y0);
  }
  for (const c of actions.couples) if (left(c.x)) M -= c.M;
  for (const l of actions.loads) {
    const part = loadPortion(l, -Infinity, x);
    if (!part) continue;
    for (const p of partsOf(part)) {
      V -= p.F;
      M -= p.F * (x - p.x);
    }
  }
  return { N: -Fx, V, M };
}

export const beamY = (setup) => ((setup.body && setup.body.points && setup.body.points[0]) || [0, 0])[1];
export function beamEnds(setup) {
  const pts = (setup.body && setup.body.points) || [[0, 0], [1, 0]];
  const xs = pts.map((p) => p[0]);
  return [Math.min(...xs), Math.max(...xs)];
}

// ---- V(x) and M(x), segment by segment ----------------------------------------------------

// Polynomials (lowest power first, length 4) for V and M on the open segment (a, b).
function segmentPolys(setup, actions, a, b) {
  const y0 = beamY(setup);
  const V = [0, 0, 0, 0], M = [0, 0, 0, 0], mid = (a + b) / 2;
  let N = 0;
  for (const f of actions.points) {
    if (f.x > mid) continue;
    N -= f.Fx;
    V[0] += f.Fy;
    M[0] += -f.Fy * f.x + f.Fx * (f.at[1] - y0);
    M[1] += f.Fy;
  }
  for (const c of actions.couples) if (c.x < mid) M[0] -= c.M;
  for (const l of actions.loads) {
    if (l.from > mid) continue;
    if (l.to < mid) {
      // Wholly to the left: its resultant F at x̄ — V −= F, M −= F(x − x̄).
      for (const p of partsOf(l)) {
        V[0] -= p.F;
        M[0] += p.F * p.x;
        M[1] -= p.F;
      }
      continue;
    }
    // Covering the segment: ∫ from f to x of (p + q s) ds and of (p + q s)(x − s) ds.
    const { p, q, from: f } = linearOf(l);
    V[0] -= -p * f - (q * f * f) / 2;
    V[1] -= p;
    V[2] -= q / 2;
    M[0] -= (p * f * f) / 2 + (q * f * f * f) / 3;
    M[1] -= -(p * f + (q * f * f) / 2);
    M[2] -= p / 2;
    M[3] -= q / 6;
  }
  return { a, b, V: clean(V), M: clean(M), N };
}

const clean = (p) => p.map((c) => (Math.abs(c) < 1e-9 ? 0 : c));
export const evalPoly = (p, x) => p.reduce((s, c, i) => s + c * x ** i, 0);

// The points where V or M change their formula.
export function eventPoints(setup, actions) {
  const [x0, x1] = beamEnds(setup);
  const xs = [x0, x1, ...actions.points.map((f) => f.x), ...actions.couples.map((c) => c.x)];
  for (const l of actions.loads) xs.push(l.from, l.to);
  return [...new Set(xs.filter((x) => x >= x0 - EPS && x <= x1 + EPS).map((x) => +x.toFixed(9)))].sort((a, b) => a - b);
}

export function beamSegments(setup, actions) {
  const ev = eventPoints(setup, actions);
  const out = [];
  for (let i = 1; i < ev.length; i++) if (ev[i] - ev[i - 1] > 1e-6) out.push(segmentPolys(setup, actions, ev[i - 1], ev[i]));
  return out;
}

// Where V = 0 inside a segment (V has degree ≤ 2): candidates for the biggest moment.
function rootsIn(p, a, b) {
  const [c, bq, aq] = p;
  const roots = [];
  if (Math.abs(aq) < 1e-12) {
    if (Math.abs(bq) > 1e-12) roots.push(-c / bq);
  } else {
    const disc = bq * bq - 4 * aq * c;
    if (disc >= 0) roots.push((-bq + Math.sqrt(disc)) / (2 * aq), (-bq - Math.sqrt(disc)) / (2 * aq));
  }
  return roots.filter((x) => x > a + 1e-9 && x < b - 1e-9);
}

// The largest shear and moment, and where.
export function extremes(segments) {
  let Vmax = 0, xV = null, Mmax = 0, xM = null, Mpos = 0, Mneg = 0;
  for (const s of segments) {
    for (const x of [s.a, s.b]) {
      const v = evalPoly(s.V, x);
      if (Math.abs(v) > Math.abs(Vmax) + 1e-9) [Vmax, xV] = [v, x];
    }
    for (const x of [s.a, s.b, ...rootsIn(s.V, s.a, s.b)]) {
      const m = evalPoly(s.M, x);
      if (Math.abs(m) > Math.abs(Mmax) + 1e-9) [Mmax, xM] = [m, x];
      Mpos = Math.max(Mpos, m);
      Mneg = Math.min(Mneg, m);
    }
  }
  return { Vmax, xV, Mmax, xM, Mpos, Mneg };
}

// ---- The kept piece's equations (Unit 7.1) --------------------------------------------------

// ΣF_x, ΣF_y and ΣM_C for the piece kept, with the reactions known and N, V, M unknown.
export function pieceEquations(setup, actions) {
  const x = setup.cut;
  const keep = setup.keep === "right" ? "right" : "left";
  const C = setup.cutName || "C";
  const at = [x, beamY(setup)];
  const on = (xi) => (keep === "left" ? xi < x - EPS : xi > x + EPS);
  const fx = { id: "sumFx", lhs: "\\Sigma F_x", form: "zero", terms: [] };
  const fy = { id: "sumFy", lhs: "\\Sigma F_y", form: "zero", terms: [] };
  const mm = { id: "sumM", lhs: `\\Sigma M_{${C}}`, form: "zero", terms: [] };
  const arm = (sym) => `d_{${String(sym).replace(/[{}]/g, "")}}`;
  const push = (id, symbol, direction, P, value) => {
    const c = componentFactors(direction);
    if (c.x) fx.terms.push({ id, sign: c.x.sign, symbol, value, unit: "N", factor: c.x.factor });
    if (c.y) fy.terms.push({ id, sign: c.y.sign, symbol, value, unit: "N", factor: c.y.factor });
    const a = armOf({ about: { at } }, { direction }, P);
    if (a.d < 1e-9) return;
    const factor = { tex: arm(symbol), numTex: numM(a.d), value: a.d };
    if (Math.abs(a.rLen - a.d) > 1e-6) {
      Object.assign(factor, { alt: { tex: arm(symbol).replace(/^d/, "r"), numTex: numM(a.rLen), value: a.rLen },
        swapLabel: "Use the perpendicular distance d", swapReason: `uses the distance to ${C} instead of the perpendicular distance to the line of action`, swapKind: "momentArm" });
    }
    mm.terms.push({ id, sign: Math.sign(a.perNewton), symbol, value, unit: "N", factor });
  };
  for (const f of actions.points) if (on(f.x)) push(f.id, f.symbol, f.direction, f.at, f.value);
  for (const c of actions.couples) if (on(c.x)) mm.terms.push({ id: c.id, sign: c.sense, symbol: c.symbol, value: c.value, unit: "N·m" });
  // The distributed load on the piece: each part's resultant (the part ON the piece only).
  let k = 0;
  for (const l of actions.loads) {
    const part = keep === "left" ? loadPortion(l, -Infinity, x) : loadPortion(l, x, Infinity);
    if (!part) continue;
    for (const p of partsOf(part)) {
      k++;
      const id = `${l.id}_${k}`, symbol = `F_{${k}}`;
      fy.terms.push({ id, sign: -1, symbol, value: p.F, unit: "N" });
      const d = Math.abs(p.x - x);
      const factor = { tex: `d_{${k}}`, numTex: numM(d), value: d };
      // The classic slip: the whole length of the loaded part as the arm (not to its centroid).
      const far = keep === "left" ? x - p.from : p.to - x;
      if (Math.abs(far - d) > 1e-6) Object.assign(factor, { alt: { tex: `d_{${k}}`, numTex: numM(far), value: far },
        swapLabel: "Measure to the load's centroid", swapReason: "measures to the far end of the load instead of to its resultant (its centroid)", swapKind: "centroid" });
      mm.terms.push({ id, sign: keep === "left" ? (p.x < x ? 1 : -1) : -1, symbol, value: p.F, unit: "N", factor });
    }
  }
  // The internal forces on the cut face, in their positive directions.
  const s = keep === "left" ? 1 : -1;
  fx.terms.push({ id: "N", sign: s, symbol: "N", value: null, unit: "N" });
  fy.terms.push({ id: "V", sign: -s, symbol: "V", value: null, unit: "N" });
  mm.terms.push({ id: "M", sign: s, symbol: "M", value: null, unit: "N·m" });
  return [fx, fy, mm];
}

// ---- Solve ---------------------------------------------------------------------------------

export function solveInternal(setup) {
  const rb = solveRigidBody(setup);
  const values = { ...rb.values };
  if (rb.status !== "determinate") return { ...rb, values, equations: [], segments: [] };
  const actions = beamActions(setup, rb.values);
  const segments = beamSegments(setup, actions);
  Object.assign(values, extremes(segments));
  values.nSeg = segments.length;
  segments.forEach((s, i) => {
    s.V.slice(0, 3).forEach((c, j) => (values[`V${j}_${i + 1}`] = c));
    s.M.forEach((c, j) => (values[`M${j}_${i + 1}`] = c));
  });
  let equations = [];
  if (setup.cut != null) {
    // (A load exactly at the cut counts on the RIGHT piece, as in pieceEquations.)
    Object.assign(values, internalAt(setup, actions, setup.cut, -1));
    equations = pieceEquations(setup, actions);
  }
  return { status: "determinate", message: rb.message, values, equations, reactions: rb.reactions, unknowns: ["N", "V", "M"], segments, actions, rigid: rb };
}

// Names and units for result.values.
export function internalQuantities(setup, rbQuantities) {
  const q = { ...rbQuantities,
    N: { label: "N", unit: "N" }, V: { label: "V", unit: "N" }, M: { label: "M", unit: "N·m" },
    Mmax: { label: "M_{max}", unit: "N·m" }, xM: { label: "x", unit: "m" },
    Vmax: { label: "V_{max}", unit: "N" }, xV: { label: "x", unit: "m" },
    Mpos: { label: "M_{max}", unit: "N·m" }, Mneg: { label: "M_{min}", unit: "N·m" },
    nSeg: { label: "\\text{segments}", unit: "" } };
  for (let k = 1; k <= 6; k++) {
    for (let j = 0; j < 3; j++) q[`V${j}_${k}`] = { label: j ? `\\text{coefficient of } x${j > 1 ? "^2" : ""} \\text{ in } V` : "\\text{constant in } V", unit: ["N", "N/m", "N/m²"][j] };
    for (let j = 0; j < 4; j++) q[`M${j}_${k}`] = { label: j ? `\\text{coefficient of } x${j > 1 ? `^${j}` : ""} \\text{ in } M` : "\\text{constant in } M", unit: ["N·m", "N", "N/m", "N/m²"][j] };
  }
  return q;
}
