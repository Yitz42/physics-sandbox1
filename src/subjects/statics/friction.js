// friction.js — dry (Coulomb) friction (Unit 9.1).
//
// The rule (textbook): a rough surface pushes with N, perpendicular to it, and grips
// with a friction force F along it. F is whatever equilibrium needs — up to a limit:
//     |F| ≤ μ_s N        (μ_s: the coefficient of static friction)
// While |F| < μ_s N the body HOLDS. When equilibrium would need exactly μ_s N, motion
// is IMPENDING (about to start). If it would need more, the body SLIDES, and friction
// drops to the kinetic value μ_k N, against the motion.
//
// Two kinds of setup:
//
// 1. A block (a crate) on a ramp or a level floor, treated as a particle — unless
//    setup.tipping is set (Unit 9.2, friction-tip.js): then its size matters, N acts
//    wherever the moments need it (values.x), and it may TIP instead of slipping:
//      ramp:   { angle, length, maxAngle? }   angle in degrees (0: a level floor). The
//              ramp rises to the right from its low corner O = (0, 0); maxAngle: the
//              steepest a slider can make it (the picture keeps room for it)
//      block:  { w, h, at }   the crate: size (m), and its centre's distance along the surface from O
//      weight (N) or mass (kg), mus, muk
//      forces: [{ id, symbol, magnitude, along: "up" | "down", tilt?, push?, rope? }]
//              along: up (or down) the slope — on a level floor, "up" is to the right;
//              tilt: degrees away from the surface (negative: into it, e.g. a push
//              angled down). Or a textbook `direction` instead (e.g. "right": level).
//    Axes: x' up the slope, y' away from it (on a level floor, just x and y).
//    F is positive UP the slope (to the right on a floor).
//
// 2. A rigid body with rough supports (a ladder): { body, supports: [{ type: "rough",
//    mus, … }], forces, … } — the rigid-body solver finds N_A and F_A, then each rough
//    contact is checked. forces[i].along: d puts a force d metres along the (straight)
//    body from its first point (a painter partway up a ladder).
//
// Either kind may ask where motion starts: setup.find = { path, motion, min, max,
// symbol, unit } — the value of the number at `path` (a push, an angle, a distance)
// that makes friction reach μ_s N, found by stepping from min to max (the first change
// between holding and slipping). motion: which
// way the block is about to move, "up" or "down" the slope ("right"/"left" on a floor).

import { directionVector } from "./directions.js";
import { G } from "./particle.js";
import { solveRigidBody } from "./rigid-body.js";
import { tipState } from "./friction-tip.js";
import { criticalValue } from "./friction-find.js";

export { criticalValue }; // (where motion starts: friction-find.js)

const deg = Math.PI / 180;

// ---- 1. A block on a surface ----------------------------------------------------------

// The surface's directions: t up the slope, n away from it (both unit vectors).
export function surfaceAxes(setup) {
  const a = ((setup.ramp && setup.ramp.angle) || 0) * deg;
  return { t: [Math.cos(a), Math.sin(a)], n: [-Math.sin(a), Math.cos(a)], angle: (setup.ramp && setup.ramp.angle) || 0 };
}

export const weightOfBlock = (setup) => (setup.weight != null ? setup.weight : (setup.mass || 0) * G);

// A force's direction as a unit vector (world axes).
export function forceDir(f, setup) {
  if (f.along) {
    const { t, n } = surfaceAxes(setup);
    const s = f.along === "down" ? -1 : 1;
    const b = (f.tilt || 0) * deg;
    return [s * t[0] * Math.cos(b) + n[0] * Math.sin(b), s * t[1] * Math.cos(b) + n[1] * Math.sin(b)];
  }
  return directionVector(f.direction);
}

const dot = (u, v) => u[0] * v[0] + u[1] * v[1];

// Where the block stands: N, the friction F needed (+ up the slope), the most friction can
// give (μ_s N) and what happens.
// opts.plainN: a slip for the mistakes list — N taken as W cos θ, forgetting the push's part.
export function blockState(setup, opts = {}) {
  const { t, n, angle } = surfaceAxes(setup);
  const W = weightOfBlock(setup);
  let alongP = 0, awayP = 0;
  for (const f of setup.forces || []) {
    const u = forceDir(f, setup);
    alongP += f.magnitude * dot(u, t);
    awayP += f.magnitude * dot(u, n);
  }
  const sin = Math.sin(angle * deg), cos = Math.cos(angle * deg);
  // ΣF_x' = F + ΣP_x' − W sin θ = 0,   ΣF_y' = N + ΣP_y' − W cos θ = 0
  const Fneed = W * sin - alongP;
  const N = W * cos - (opts.plainN ? 0 : awayP);
  const out = { W, N, Fneed, ...judge(Fneed, N, setup.mus, setup.muk) };
  // A crate that can tip (Unit 9.2, friction-tip.js): where N acts, and whether it
  // would have to act outside the base. If it would both slip and tip, the one it is
  // further past its limit wins (it goes that way first).
  if (setup.tipping && out.state !== "lifts") {
    const { x, tipRatio } = tipState(setup, N);
    out.x = x;
    out.tipRatio = tipRatio;
    const slipRatio = out.Fmax > 0 ? Math.abs(Fneed) / out.Fmax : Infinity;
    if (tipRatio > 1 + 1e-6 && (out.state !== "slides" || tipRatio >= slipRatio)) {
      Object.assign(out, { state: "tips", F: Fneed, moves: undefined });
    } else if (Math.abs(tipRatio - 1) <= 1e-6 && out.state === "holds") out.state = "tipImpending";
  }
  return out;
}

// Holds, impending, slides — or lifts off (N < 0). F: the friction that really acts.
export function judge(Fneed, N, mus, muk) {
  if (N < -1e-9) return { state: "lifts", F: 0, Fmax: 0 };
  const Fmax = mus * N;
  const tol = 1e-6 * Math.max(1, Fmax);
  if (Math.abs(Fneed) < Fmax - tol) return { state: "holds", F: Fneed, Fmax };
  if (Math.abs(Fneed) <= Fmax + tol) return { state: "impending", F: Fneed, Fmax };
  // Sliding: kinetic friction, against the motion (the motion is the way F_need can't hold).
  return { state: "slides", F: Math.sign(Fneed) * (muk ?? mus) * N, Fmax, moves: Fneed > 0 ? "down" : "up" };
}

// ---- 2. A body with rough contacts ---------------------------------------------------------

// Forces given as a distance along the body are placed on it.
export function placeAlong(setup) {
  if (!(setup.forces || []).some((f) => f.along != null && typeof f.along === "number")) return setup;
  const [A, B] = [setup.body.points[0], setup.body.points[setup.body.points.length - 1]];
  const L = Math.hypot(B[0] - A[0], B[1] - A[1]);
  const forces = setup.forces.map((f) => (typeof f.along === "number" ? { ...f, at: [A[0] + ((B[0] - A[0]) * f.along) / L, A[1] + ((B[1] - A[1]) * f.along) / L] } : f));
  return { ...setup, forces };
}

export function bodyState(setup) {
  const s = placeAlong(setup);
  const rigid = solveRigidBody(s);
  const contacts = {};
  if (rigid.status === "determinate") {
    for (const q of s.supports.filter((x) => x.type === "rough")) {
      const N = rigid.values[`N_${q.id}`], F = rigid.values[`F_${q.id}`];
      contacts[q.id] = { N, Fneed: F, ...judge(F, N, q.mus, q.muk) };
    }
  }
  return { rigid, contacts, placed: s };
}

// ---- Both --------------------------------------------------------------------------

export const isBody = (setup) => !!setup.body;

export function solveFriction(setup) {
  if (isBody(setup)) {
    const { rigid, contacts, placed } = bodyState(setup);
    const values = { ...rigid.values };
    for (const [id, c] of Object.entries(contacts)) {
      values[`Fmax_${id}`] = c.Fmax;
      values[`mu_${id}`] = c.N > 0 ? Math.abs(c.Fneed) / c.N : NaN; // the smallest μ_s that holds it
    }
    if (setup.find) values.critical = criticalValue(setup);
    return { ...rigid, kind: "body", contacts, placed, values };
  }
  const b = blockState(setup);
  const values = { W: b.W, N: b.N, F: b.F, Fneed: b.Fneed, Fmax: b.Fmax, mu: b.N > 0 ? Math.abs(b.Fneed) / b.N : NaN };
  if (setup.tipping) values.x = b.x;
  if (setup.find && setup.tipping) {
    // Both ways it can go (Unit 9.2): the push (or slope) that starts it slipping, the one
    // that tips it, and so the one that happens first — the smaller.
    values.criticalSlip = criticalValue(setup);
    values.criticalTip = criticalValue(setup, { event: "tip" });
    values.critical = Math.min(values.criticalSlip, values.criticalTip);
    if (!Number.isFinite(values.critical)) values.critical = Number.isFinite(values.criticalSlip) ? values.criticalSlip : values.criticalTip;
  } else if (setup.find) values.critical = criticalValue(setup);
  const ok = b.state !== "lifts" && (!setup.find || Number.isFinite(values.critical));
  return {
    kind: "block", status: ok ? "determinate" : "unstable", state: b.state, moves: b.moves, values,
    message: b.state === "lifts" ? "The push lifts the crate off the surface: N would have to pull." : "",
  };
}

// Names and units of everything a stage can ask about.
export function frictionQuantities(setup, rigidQuantities) {
  const q = isBody(setup) ? { ...rigidQuantities } : {
    N: { label: "N", unit: "N" },
    F: { label: "F", unit: "N" },
    Fmax: { label: "\\mu_s N", unit: "N" },
    mu: { label: "\\mu_s", unit: "" },
  };
  for (const s of (isBody(setup) && setup.supports) || []) {
    if (s.type !== "rough") continue;
    q[`Fmax_${s.id}`] = { label: `\\mu_s N_${s.id}`, unit: "N" };
    q[`mu_${s.id}`] = { label: "\\mu_s", unit: "" };
  }
  if (setup.find) q.critical = { label: setup.find.symbol || "x", unit: setup.find.unit || "" };
  if (setup.tipping) {
    q.x = { label: "x", unit: "m" };
    if (setup.find) {
      q.criticalSlip = { label: `${setup.find.symbol || "x"}_{\\text{slip}}`, unit: setup.find.unit || "" };
      q.criticalTip = { label: `${setup.find.symbol || "x"}_{\\text{tip}}`, unit: setup.find.unit || "" };
    }
  }
  return q;
}
