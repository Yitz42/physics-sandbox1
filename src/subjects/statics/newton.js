// newton.js — Newton's laws and units for one body (Unit 1.1).
//
//   W = m g                   weight (N) from mass (kg); g = 9.81 m/s² on Earth (setup.g elsewhere)
//   ΣF = m a                  the second law; at rest or at steady speed a = 0: ΣF = 0 (the first law)
// and the third: whatever pulls on the body, the body pulls back on it just as hard.
//
// setup:
//   mass (kg) — or count × each (a load of crates), or weight (N) to find the mass from
//   g:      m/s² (default 9.81)
//   forces: [{ id, symbol, magnitude | null, direction: "up" | "down" | "left" | "right", push? }]
//           at most one magnitude: null — the unknown, found from ΣF = m a
//   accel:  [a_x, a_y] (m/s², default [0, 0]) — only its part along the unknown force's line is
//           used; the rest of the acceleration comes out of the net force, a = F/m
//   look:   "hanging" | "floor" | "ice" | "elevator" (the picture only)
// values: m, g, W, WkN, the unknown force (by its id), Fx, Fy, Fnet, a, ax, ay.

import { fixedTex, sigFig } from "../../core/units.js";

export const EARTH_G = 9.81;
const DIR = { up: [0, 1], down: [0, -1], left: [-1, 0], right: [1, 0] };
const num = (v) => sigFig(v, 4);

export const massOf = (setup) => (setup.weight != null ? setup.weight / (setup.g ?? EARTH_G)
  : setup.count != null ? setup.count * setup.each : setup.mass);

// opts: slips for the mistakes list — noG (W = m), divideG (W = m/g), g10 (g = 10),
// noAccel (ΣF = 0 though it accelerates), accelSign (a the wrong way).
export function newtonState(setup, opts = {}) {
  const g = opts.g10 ? 10 : setup.g ?? EARTH_G;
  const m = opts.noG && setup.weight != null ? setup.weight : opts.divideG && setup.weight != null ? setup.weight * g : massOf(setup);
  const W = opts.noG ? m : opts.divideG ? m / g : m * g;
  const a = opts.noAccel ? [0, 0] : (setup.accel || [0, 0]).map((x) => (opts.accelSign ? -x : x));
  let Fx = 0, Fy = -W, unknown = null;
  for (const f of setup.forces || []) {
    if (f.magnitude == null) { unknown = f; continue; }
    const d = DIR[f.direction];
    Fx += f.magnitude * d[0]; Fy += f.magnitude * d[1];
  }
  const values = { m, g, W, WkN: W / 1000 };
  if (unknown) {
    // ΣF = m a along the unknown's line (setup.accel's part along it): its size is what's left over.
    const d = DIR[unknown.direction];
    const F = (m * a[0] - Fx) * d[0] + (m * a[1] - Fy) * d[1];
    values[unknown.id] = F;
    Fx += F * d[0]; Fy += F * d[1];
  }
  // Across the unknown's line nothing holds it: the net force there accelerates it (a = F/m).
  Object.assign(values, { ax: Fx / m, ay: Fy / m });
  Object.assign(values, { Fx, Fy, Fnet: Math.hypot(Fx, Fy), a: Math.hypot(values.ax, values.ay) });
  return { values, unknown };
}

export function solveNewton(setup) {
  const { values, unknown } = newtonState(setup);
  const ok = !unknown || values[unknown.id] >= -1e-9;
  return { status: ok ? "determinate" : "unstable", values,
    message: ok ? "" : `${unknown.symbol} would have to act the other way — a cable can only pull, a floor only push.` };
}

export function newtonQuantities(setup) {
  const q = { m: { label: "m", unit: "kg" }, W: { label: "W", unit: "N" }, WkN: { label: "W", unit: "kN" }, g: { label: "g", unit: "m/s^2" },
    Fnet: { label: "F_{\\text{net}}", unit: "N" }, a: { label: "a", unit: "m/s^2" }, ax: { label: "a_x", unit: "m/s^2" }, ay: { label: "a_y", unit: "m/s^2" } };
  for (const f of setup.forces || []) q[f.id] = { label: f.symbol, unit: "N" };
  return q;
}

// W = m g, then ΣF = m a along each axis that has forces (as "zero" lines: ΣF − m a = 0).
export function newtonEquations(setup) {
  const { values: v, unknown } = newtonState(setup);
  const eqs = [];
  const gTex = { tex: "g", numTex: `(${num(v.g)}\\,\\text{m/s}^2)`, value: v.g, alt: { tex: "", numTex: "", value: 1 }, swapKind: "weight", swapReason: "leaves out g: a mass in kg isn't a force — multiply by g to get newtons" };
  eqs.push({ id: "W", lhs: "W", title: "W", form: "define", result: { value: v.W, unit: "N" },
    terms: [{ id: "m", sign: 1, symbol: "m", value: v.m, unit: "kg", factor: gTex }] });
  for (const axis of ["x", "y"]) {
    const d = axis === "x" ? 0 : 1;
    const terms = [];
    for (const f of setup.forces || []) {
      const c = { up: [0, 1], down: [0, -1], left: [-1, 0], right: [1, 0] }[f.direction][d];
      if (c) terms.push({ id: f.id, sign: c, symbol: f.symbol, value: f.magnitude ?? null, unit: "N" });
    }
    if (axis === "y") terms.push({ id: "W", sign: -1, symbol: "W", value: v.W, unit: "N" });
    const acc = axis === "x" ? v.ax : v.ay;
    if (!terms.length) continue;
    // The unknown's axis (or a balanced one): ΣF − m a = 0. Any other axis: the net force F, then a = F/m.
    const onAxis = unknown && { up: 1, down: 1, left: 0, right: 0 }[unknown.direction] === d;
    const moving = onAxis && Math.abs(acc) > 1e-12;
    if (moving) terms.push({ id: "ma", sign: -1, symbol: `m a_${axis}`, value: v.m * acc, numTex: `(${num(v.m)}\\,\\text{kg})(${num(acc)}\\,\\text{m/s}^2)` });
    if (onAxis || Math.abs(acc) < 1e-12) {
      eqs.push({ id: `sumF${axis}`, lhs: moving ? `\\Sigma F_${axis} - m a_${axis}` : `\\Sigma F_${axis}`, title: `\\Sigma F_${axis}`, form: "zero", terms });
    } else {
      // Nothing balances this axis: the net force, then a = F/m (the summary line).
      eqs.push({ id: `sumF${axis}`, lhs: `F_{${axis}}`, title: `F_${axis}`, form: "define", terms, result: { value: axis === "x" ? v.Fx : v.Fy, unit: "N" } });
    }
  }
  return eqs;
}

export function newtonSummary(setup, result, { reveal = true } = {}) {
  const v = (result || solveNewton(setup)).values;
  const lines = [`W = mg = (${num(v.m)}\\,\\text{kg})(${num(v.g)}\\,\\text{m/s}^2) = ${fixedTex(v.W, "N")} = ${fixedTex(v.WkN, "kN", 3)}`];
  if (!reveal) return lines;
  const unknown = (setup.forces || []).find((f) => f.magnitude == null);
  if (unknown) lines.push(`${unknown.symbol} = ${fixedTex(v[unknown.id], "N")}${v.a > 1e-12 ? "" : "\\quad(\\text{at rest: } \\Sigma F = 0)"}`);
  if (v.a > 1e-12) lines.push(`F_{\\text{net}} = ${fixedTex(v.Fnet, "N")},\\quad a = \\dfrac{F_{\\text{net}}}{m} = ${fixedTex(v.a, "m/s^2", 2)}`);
  return lines;
}

// Answers that common slips give.
export function newtonMistakes(setup, name) {
  const v = solveNewton(setup).values;
  const right = v[name];
  const list = [];
  const add = (value, message, kind) => {
    if (!Number.isFinite(value) || Math.abs(value - right) < 1e-6 * Math.max(1, Math.abs(right))) return;
    if (!list.some((m) => Math.abs(m.value - value) < 1e-9)) list.push({ value, message, kind });
  };
  const alt = (opts) => newtonState(setup, opts).values[name];
  if (name === "m") {
    add(alt({ divideG: true }), "Multiplied by g instead of dividing: $m = W/g$.", "weight");
    add(alt({ noG: true }), "That's the weight in newtons, not the mass. Mass is $W/g$, in kilograms.", "weight");
    return list;
  }
  add(alt({ noG: true }), "That's the mass in kg, not a force. Weight is $W = mg$, in newtons.", "weight");
  add(alt({ divideG: true }), "Divided by g: weight is mass TIMES g, $W = mg$.", "weight");
  if ((setup.g ?? EARTH_G) === EARTH_G) add(alt({ g10: true }), "Use g = 9.81 m/s², not 10.", "rounding");
  if (name === "WkN") add(v.W, "That's in newtons. 1 kN = 1000 N: divide by 1000.", "calculator");
  if (name === "W") add(v.WkN, "That's in kilonewtons. The answer wants newtons: 1 kN = 1000 N.", "calculator");
  if ((setup.forces || []).some((f) => f.magnitude == null && f.id === name)) {
    add(alt({ noAccel: true }), "That's what holds it at rest. It's accelerating: ΣF = m a, not 0 — the unknown must also give the m a.", "concept");
    add(alt({ accelSign: true }), "The acceleration's direction is flipped: speeding up going up (or slowing down going down) means a points UP.", "sign");
  }
  if (name === "a") add(v.Fnet / v.W, "Divided by the weight: $a = F/m$ with m in kilograms.", "weight");
  return list;
}
