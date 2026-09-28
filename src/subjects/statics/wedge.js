// wedge.js — a wedge driven under a block to lift it (Unit 9.3).
//
// The picture (textbook set-up): a block rests on a wedge's sloping top face, its left side
// against a guide wall. Push the wedge LEFT with P and the block rises. Every contact is
// rough and, at impending motion, gives a normal force N and friction μ N against the
// sliding there:
//   1  block on the wedge's top face (slope α): N₁ across the face, F₁ = μ₁N₁ along it
//   2  block against the wall:                    N₂ (to the right), F₂ = μ₂N₂ (up or down)
//   3  wedge on the floor:                        N₃ (up),           F₃ = μ₃N₃ (level)
// Each body is a particle (its forces all meet near enough): two equations each —
//   block:  ΣF_x: N₂ − N₁ sin α − s μ₁N₁ cos α = 0
//           ΣF_y: N₁ cos α − s μ₁N₁ sin α − s μ₂N₂ − W = 0
//   wedge:  ΣF_x: N₁ sin α + s μ₁N₁ cos α + s μ₃N₃ − P = 0
//           ΣF_y: N₃ − N₁ cos α + s μ₁N₁ sin α − W_w = 0
// s = +1 while driving the wedge IN (block going up: friction on the block acts down, and
// on the wedge to the right); s = −1 when pulling it OUT (block coming down: all reversed).
// P is the push to the left. Driving in, P > 0. For "out", P < 0 means the wedge must be
// PULLED out (it's self-locking: it stays put with no push); P > 0 means it would squirt
// out by itself unless held.
//
// setup: { wedge: { angle, length, tip }, block: { w, h }, weight | mass, wedgeWeight?,
//          mus (all three) or mu: { wedge, wall, floor }, motion: "in" | "out" }
// values: N1 N2 N3 F1 F2 F3 P, and Pout (the pull that withdraws it: −P for "out"),
//         selfLocking (1 if it stays put without a pull, else 0).

import { fixedTex, sigFig } from "../../core/units.js";
import { G } from "./particle.js";

const deg = Math.PI / 180;
const num = (v) => sigFig(v, 4);

export const weightOn = (setup) => (setup.weight != null ? setup.weight : (setup.mass || 0) * G);

// The three coefficients (one number for all, or each named).
export function musOf(setup) {
  const all = setup.mus ?? 0;
  const m = setup.mu || {};
  return { m1: m.wedge ?? all, m2: m.wall ?? all, m3: m.floor ?? all };
}

// The forces for one way of moving (s = +1 in, −1 out); opts.swap: a sin/cos slip.
export function wedgeForces(setup, s, opts = {}) {
  const a = setup.wedge.angle * deg;
  let sin = Math.sin(a), cos = Math.cos(a);
  if (opts.swap) [sin, cos] = [cos, sin];
  const { m1, m2, m3 } = { ...musOf(setup), ...(opts.mus || {}) };
  const W = opts.W ?? weightOn(setup), Ww = setup.wedgeWeight || 0;
  const along = sin + s * m1 * cos; // N₂ per N₁
  const N1 = W / (cos - s * m1 * sin - s * m2 * along);
  const N2 = N1 * along;
  const N3 = Ww + N1 * (cos - s * m1 * sin);
  const P = N1 * along + s * m3 * N3;
  return { N1, N2, N3, F1: m1 * N1, F2: m2 * N2, F3: m3 * N3, P };
}

// The pull that starts the wedge moving OUT. Normally the block slides down the wedge's face
// and along the wall (all frictions reversed). But a flat wedge (tan α < μ₁) grips the block
// too well for that: the wall would have to PULL the block to make it slide, and a wall can
// only push. Then the block just rides out on the wedge, nothing sliding but the floor:
// P_out = μ₃(W + W_w). Either way, a positive pull means it's self-locking.
export function pullOut(setup) {
  const out = wedgeForces(setup, -1);
  const { m3 } = musOf(setup);
  const Pout = out.N2 < 0 ? m3 * (weightOn(setup) + (setup.wedgeWeight || 0)) : -out.P;
  return { Pout, selfLocking: Pout > 1e-9 ? 1 : 0, ridesOut: out.N2 < 0 ? 1 : 0 };
}

export function solveWedge(setup) {
  const s = setup.motion === "out" ? -1 : 1;
  const f = wedgeForces(setup, s);
  const values = { ...f, W: weightOn(setup), ...pullOut(setup) };
  const ok = [f.N1, f.N2, f.N3].every((n) => Number.isFinite(n) && n > 0);
  return { status: ok ? "determinate" : "unstable", values,
    message: ok ? "" : s > 0 ? "With this much friction the wedge jams: no push can drive it in (a normal force would have to pull)."
      : "This wedge is too flat to slide out from under the block: the block would ride out with it (the wall can't pull it back)." };
}

export function wedgeQuantities() {
  const q = {};
  for (const k of ["N1", "N2", "N3", "F1", "F2", "F3"]) q[k] = { label: `${k[0]}_${k[1]}`, unit: "N" };
  return { ...q, P: { label: "P", unit: "N" }, Pout: { label: "P_{\\text{out}}", unit: "N" }, W: { label: "W", unit: "N" } };
}

// ---- Equations (four "zero" lines, as data) --------------------------------------------

export function wedgeEquations(setup) {
  const s = setup.motion === "out" ? -1 : 1;
  const a = num(setup.wedge.angle);
  const { m1, m2, m3 } = musOf(setup);
  const W = weightOn(setup), Ww = setup.wedgeWeight || 0;
  const trig = (fn) => ({ tex: `\\${fn} ${a}^\\circ`, value: fn === "sin" ? Math.sin(setup.wedge.angle * deg) : Math.cos(setup.wedge.angle * deg),
    alt: { tex: `\\${fn === "sin" ? "cos" : "sin"} ${a}^\\circ`, value: fn === "sin" ? Math.cos(setup.wedge.angle * deg) : Math.sin(setup.wedge.angle * deg) } });
  const N = (i, sign, fn) => ({ id: `N${i}`, sign, symbol: `N_${i}`, value: null, ...(fn ? { factor: trig(fn) } : {}) });
  // A friction force μN: its own id (so it lights up with its arrow), written μ₁N₁ …
  const F = (i, m, sign, fn) => ({ id: `F${i}`, sign, symbol: `\\mu_${i} N_${i}`, numTex: `${num(m)}\\,N_${i}${fn ? `\\${fn} ${a}^\\circ` : ""}`, value: null, ...(fn ? { factor: trig(fn) } : {}) });
  const eqs = [
    { id: "blockX", lhs: "\\text{Block: } \\Sigma F_x", title: "\\text{Block } \\Sigma F_x", form: "zero", terms: [N(2, 1), N(1, -1, "sin"), F(1, m1, -s, "cos")] },
    { id: "blockY", lhs: "\\text{Block: } \\Sigma F_y", title: "\\text{Block } \\Sigma F_y", form: "zero", terms: [N(1, 1, "cos"), F(1, m1, -s, "sin"), F(2, m2, -s), { id: "W", sign: -1, symbol: "W", value: W, unit: "N" }] },
    { id: "wedgeX", lhs: "\\text{Wedge: } \\Sigma F_x", title: "\\text{Wedge } \\Sigma F_x", form: "zero", terms: [N(1, 1, "sin"), F(1, m1, s, "cos"), F(3, m3, s), { id: "P", sign: -1, symbol: "P", value: null }] },
    { id: "wedgeY", lhs: "\\text{Wedge: } \\Sigma F_y", title: "\\text{Wedge } \\Sigma F_y", form: "zero", terms: [N(3, 1), N(1, -1, "cos"), F(1, m1, s, "sin"), ...(Ww ? [{ id: "Ww", sign: -1, symbol: "W_w", value: Ww, unit: "N" }] : [])] },
  ];
  return eqs;
}

export function wedgeSummary(setup, result, { reveal = true } = {}) {
  const v = (result || solveWedge(setup)).values;
  if (!reveal) return [];
  const lines = [`N_1 = ${fixedTex(v.N1, "N")},\\quad N_2 = ${fixedTex(v.N2, "N")},\\quad N_3 = ${fixedTex(v.N3, "N")}`];
  if (setup.motion === "out") lines.push(`P = ${fixedTex(v.P, "N")}\\ (\\text{to the left})\\ \\Rightarrow\\ ${v.selfLocking ? "\\text{it must be PULLED out with } " + fixedTex(v.Pout, "N") + "\\text{: self-locking}" : "\\text{it slides out by itself unless held: not self-locking}"}`);
  else lines.push(`P = ${fixedTex(v.P, "N")}\\ (\\text{push to drive it in})`);
  return lines;
}

// ---- Answers that common slips give -------------------------------------------------

export function wedgeMistakes(setup, name) {
  const s = setup.motion === "out" ? -1 : 1;
  const v = solveWedge(setup).values;
  const right = v[name];
  const list = [];
  const add = (value, message, kind) => {
    if (!Number.isFinite(value) || Math.abs(value - right) < 1e-6 * Math.max(1, Math.abs(right))) return;
    if (!list.some((m) => Math.abs(m.value - value) < 1e-9)) list.push({ value, message, kind });
  };
  const alt = (opts, sign = s) => (name === "Pout" ? -wedgeForces(setup, -1, opts).P : wedgeForces(setup, sign, opts)[name]);
  if (name === "Pout" && v.ridesOut) return list; // (it rides out: only the floor's friction, nothing to slip on)
  if (!["N1", "N2", "N3", "P", "Pout", "F1", "F2", "F3"].includes(name)) return list;
  add(alt({ swap: true }), "Sin and cos swapped: α is measured from the level, so the wedge face's normal is $\\alpha$ from the VERTICAL — $N_1$'s level part is $N_1\\sin\\alpha$.", "trig");
  add(alt({ mus: { m1: 0 } }), "The friction between the block and the wedge is missing: that face is rough too, $F_1 = \\mu_s N_1$ along it.", "missing");
  add(alt({ mus: { m2: 0 } }), "The friction at the wall is missing: the block slides along it, so $F_2 = \\mu_s N_2$ acts there too.", "missing");
  add(alt({ mus: { m3: 0 } }), "The friction under the wedge is missing: the floor is rough, $F_3 = \\mu_s N_3$.", "missing");
  if (name !== "Pout") add(alt({}, -s), "Every friction force points the wrong way: it acts AGAINST each surface's sliding. Driving the wedge in, the block rises — friction on it points down.", "direction");
  if (setup.mass != null) add(alt({ W: setup.mass }), "That uses the mass in kg. The weight is $W = mg$ in newtons.", "weight");
  return list;
}
