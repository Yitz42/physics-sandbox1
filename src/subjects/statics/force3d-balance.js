// force3d-balance.js — a particle in equilibrium in 3D (Unit 3.4): every force on point A
// passes through it, so the only conditions are
//   ΣF_x = 0,  ΣF_y = 0,  ΣF_z = 0      — three equations, so up to THREE unknown sizes.
// setup.analysis: "equilibrium" (see force3d.js for the rest of the setup). Forces here may also be:
//   { magnitude: null }                            an unknown size (a cable tension …)
//   { kind: "cable" }                              can only pull: a negative tension means it goes slack
//   { kind: "weight", mass }                       W = mg, straight down (−z); mass: null = unknown W
//   { kind: "spring", k, unstretched? }            F = k s: its stretch s = F / k (and length l₀ + s)
// Each equation is data (core/equations.js), so the game can show it in symbols and numbers,
// offer wrong versions to choose from, and plant a slip for debug stages.

import { solveEquations } from "../../core/equations.js";
import { sigFig } from "../../core/units.js";
import { mag } from "../../core/vector.js";
import { directionOf3, describe, G } from "./force3d.js";
import { factorFor, componentSymbol } from "./force3d-tools.js";

const AX = ["x", "y", "z"];
const n4 = (v) => sigFig(v, 4);

// A force's size when it is known, else null.
export function sizeOf3(f, setup) {
  if (f.kind === "weight") return f.mass != null ? f.mass * G : f.magnitude ?? null;
  if (f.kind === "spring" && f.stretch != null) return f.k * f.stretch;
  const d = directionOf3(f, setup);
  return d.size ?? f.magnitude ?? null;
}

// One force's part of ΣF along axis i, as an equation term (null when it has none).
function termOf(f, setup, i) {
  const d = directionOf3(f, setup);
  if (d.error || Math.abs(d.u[i]) < 1e-12) return null;
  const value = sizeOf3(f, setup);
  const base = { id: f.id, symbol: f.symbol, value };
  if (f.kind === "weight") return { ...base, sign: -1, factor: null, signFixed: true }; // (straight down: only in ΣF_z)
  if (f.dir.from) {
    // A line from A to B: the fraction (Δ / r_AB) with its sign in front, like a 2D slope.
    // The classic slip, the position vector's part without dividing by the length, is its alt.
    const r = d.r[i];
    return {
      ...base, sign: Math.sign(r),
      factor: { tex: `\\tfrac{${n4(Math.abs(r))}}{${n4(d.len)}}`, value: Math.abs(r) / d.len, pre: true,
        alt: { tex: `(${n4(Math.abs(r))})`, value: Math.abs(r) },
        swapLabel: "Divide by the length (use the unit vector)", swapKind: "vector",
        swapReason: "multiplies by the position vector's part without dividing by its length — use the unit vector, $\\mathbf{u} = \\mathbf{r}/r$" },
    };
  }
  if (f.dir.components) return { ...base, symbol: componentSymbol(f.symbol, AX[i]), value: Math.abs(value * d.u[i]), sign: Math.sign(d.u[i]), factor: null };
  // Direction angles, or an azimuth and elevation: F cos α … (the cosine carries the sign).
  return { ...base, sign: 1, factor: factorFor(f, setup, i) };
}

export function balanceEquations(setup) {
  return AX.map((k, i) => ({
    id: `sumF${k}`, lhs: `\\Sigma F_${k}`, form: "zero",
    terms: (setup.forces || []).map((f) => termOf(f, setup, i)).filter(Boolean),
  }));
}

// Solve ΣF = 0. Returns { status, message, values, unknowns, equations, net }.
//   status: "determinate" | "indeterminate" (more than 3 unknowns, or they can't be told apart)
//           | "unstable" (the forces can't balance, or a cable would have to push)
export function solveBalance3d(setup) {
  const forces = setup.forces || [];
  const values = {};
  for (const f of forces) {
    const d = directionOf3(f, setup);
    if (d.error) return { status: "unstable", message: d.error, values, unknowns: [], equations: [], net: [0, 0, 0] };
  }
  const equations = balanceEquations(setup);
  const unknowns = forces.filter((f) => sizeOf3(f, setup) == null).map((f) => f.id);
  let status = "determinate", message = "";
  let solved = {};
  if (unknowns.length > 3) {
    status = "indeterminate";
    message = `There are ${unknowns.length} unknown forces but only 3 equations (ΣFx = 0, ΣFy = 0, ΣFz = 0). Equilibrium alone can't decide how they share the load: statically indeterminate.`;
  } else if (unknowns.length) {
    const sol = solveEquations(equations, unknowns);
    solved = sol.values;
    if (sol.status === "indeterminate") {
      status = "indeterminate";
      message = "The unknown forces can't be told apart (they lie in one plane or along one line), so equilibrium can't decide how they share the load.";
    } else if (sol.status === "inconsistent") {
      status = "unstable";
      message = "The unknown forces all lie in one plane, so nothing can balance the part of the load across it. The point moves.";
    }
  }
  // Every force as a vector, now that the unknown sizes are (maybe) known.
  const net = [0, 0, 0];
  for (const f of forces) {
    const d = directionOf3(f, setup);
    const F = sizeOf3(f, setup) ?? solved[f.id];
    if (d.r) {
      AX.forEach((k, i) => (values[`${f.id}.r${k}`] = d.r[i]));
      values[`${f.id}.r`] = d.len;
    }
    if (F == null || !Number.isFinite(F)) continue;
    const v = d.u.map((c) => c * F);
    describe(values, f.id, v);
    values[f.id] = F; // (signed: a negative tension shows a cable that would have to push)
    v.forEach((c, i) => (net[i] += c));
    if (f.kind === "spring") {
      values[`${f.id}.k`] = f.k;
      values[`${f.id}.s`] = F / f.k;
      if (f.unstretched != null) values[`${f.id}.l`] = f.unstretched + F / f.k;
    }
  }
  if (status === "determinate") {
    const slack = forces.find((f) => f.kind === "cable" && values[f.id] < -1e-6);
    if (slack) {
      status = "unstable";
      message = `Cable ${slack.symbol.replace(/[{}]/g, "").replace("T_", "")} would have to PUSH (${values[slack.id].toFixed(1)} N). Cables can only pull, so it goes slack and the point moves.`;
    } else if (!unknowns.length && mag(net) > 1e-6) {
      status = "unstable";
      message = "These forces don't balance: ΣF ≠ 0, so the point moves.";
    }
  }
  if (status === "indeterminate") net.fill(0);
  return { status, message, values, unknowns, equations, net };
}
