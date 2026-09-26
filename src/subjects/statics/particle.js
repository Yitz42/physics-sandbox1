// particle.js — forces that all act through one point (a "particle").
//
// Two kinds of problem, chosen by setup.analysis:
//   "resultant"    Unit 1: add the forces up.  F_Rx = ΣFx, F_Ry = ΣFy,
//                  F_R = √(F_Rx² + F_Ry²), θ = tan⁻¹(|F_Ry| / |F_Rx|)
//   "equilibrium"  Unit 2: the point is at rest, so ΣFx = 0 and ΣFy = 0.
//                  Any force with magnitude: null is an unknown to solve for.
//
// A force in setup.forces looks like:
//   { id: "T_AB", symbol: "T_{AB}", magnitude: null, direction: {...}, kind: "cable" }
//   kind: "applied" (default), "cable" (can only pull), "weight" (uses mass, points down)

import { scale, sum, mag, DEG } from "../../core/vector.js";
import { solveEquations } from "../../core/equations.js";
import { format } from "../../core/units.js";
import { directionVector, componentFactors } from "./directions.js";

export const G = 9.81; // m/s², gravitational acceleration

// Magnitude of a force in N, or null if it is unknown.
export function magnitudeOf(force) {
  if (force.kind === "weight" && force.mass != null) return force.mass * G;
  return force.magnitude ?? null;
}

export function directionOf(force, opts) {
  return force.kind === "weight" ? [0, -1] : directionVector(force.direction, opts);
}

// One force's component along one axis, as an equation term (or null if zero).
function termFor(f, axis) {
  const c = f.kind === "weight" ? (axis === "x" ? null : { sign: -1, factor: null }) : componentFactors(f.direction)[axis];
  return c && { id: f.id, sign: c.sign, symbol: f.symbol, value: magnitudeOf(f), factor: c.factor };
}

// Build the equations as data (see core/equations.js). setup.analysis picks which:
//   "components"  F_x = F cos θ, F_y = F sin θ for each force   (Unit 1 basics)
//   "resultant"   F_Rx = ΣFx, F_Ry = ΣFy                         (Unit 1)
//   "equilibrium" ΣFx = 0, ΣFy = 0                               (Unit 2)
// `valueKey` says which entry of result.values a "define" equation equals.
export function buildEquations(setup) {
  if (setup.analysis === "components") {
    const names = particleQuantities(setup);
    return setup.forces.flatMap((f) => ["x", "y"].map((axis) => ({
      id: `${f.id}.${axis}`, valueKey: `${f.id}.${axis}`, lhs: names[`${f.id}.${axis}`].label,
      terms: [termFor(f, axis) || { id: f.id, sign: 1, symbol: "0", value: 0, factor: null }],
      form: "define", result: { value: 0, unit: "N" },
    })));
  }
  const make = (axis) => {
    const terms = setup.forces.map((f) => termFor(f, axis)).filter(Boolean);
    return setup.analysis === "resultant"
      ? { id: `R${axis}`, valueKey: `R.${axis}`, lhs: `F_{R${axis}} = \\Sigma F_${axis}`, terms, form: "define", result: { value: 0, unit: "N" } }
      : { id: `sumF${axis}`, lhs: `\\Sigma F_${axis}`, terms, form: "zero" };
  };
  return [make("x"), make("y")];
}

// Solve the particle problem. Returns:
//   { status, message, values, net, equations }
//   status: "resultant" | "determinate" | "indeterminate" | "unstable"
//   values: every number a stage might ask about, by name:
//           "<id>" magnitude, "<id>.x", "<id>.y" components,
//           and for resultants "R.x", "R.y", "R", "R.angle" (acute angle from the x-axis)
//   net:    unbalanced force [Fx, Fy] (non-zero means the point accelerates)
export function solveParticle(setup) {
  const equations = buildEquations(setup);
  const values = {};
  const unknowns = setup.forces.filter((f) => magnitudeOf(f) == null).map((f) => f.id);
  let status, message;

  if (setup.analysis === "resultant" || setup.analysis === "components") {
    status = "resultant"; // nothing to solve for: just add up components
  } else if (unknowns.length > 2) {
    status = "indeterminate";
    message = `There are ${unknowns.length} unknown forces but only 2 equations (ΣFx = 0, ΣFy = 0). ` +
      "Equilibrium alone can't decide how the load is shared, so this is statically indeterminate.";
  } else {
    const sol = solveEquations(equations, unknowns);
    Object.assign(values, sol.values);
    if (sol.status === "indeterminate") {
      status = "indeterminate";
      message = "The unknown forces can't be told apart (they act along the same line), so equilibrium can't decide how they share the load.";
    } else if (sol.status === "inconsistent") {
      status = "unstable";
      message = unknowns.length === 2
        ? "The two unknown forces act along the same line, so nothing can balance the sideways part of the load. The point moves."
        : "These forces can't balance: ΣF ≠ 0, so the point accelerates.";
    } else {
      status = "determinate";
      // Cables can only pull. A negative tension would mean the cable pushes.
      const slack = setup.forces.find((f) => f.kind === "cable" && values[f.id] < -1e-6);
      if (slack) {
        status = "unstable";
        message = `Cable ${slack.id.replace("T_", "")} would need to push (${format(values[slack.id], "N")}). ` +
          "Cables can only pull, so it goes slack and the point moves.";
      }
    }
  }

  // Components of every force, now that unknown magnitudes are (maybe) known.
  const vectors = [];
  for (const f of setup.forces) {
    const m = magnitudeOf(f) ?? values[f.id];
    if (m == null) continue;
    const v = scale(directionOf(f), m);
    values[f.id] = m;
    values[`${f.id}.x`] = v[0];
    values[`${f.id}.y`] = v[1];
    vectors.push(v);
  }
  const net = status === "indeterminate" ? [0, 0] : sum(vectors);

  if (status === "resultant") {
    values["R.x"] = net[0];
    values["R.y"] = net[1];
    values["R"] = mag(net);
    values["R.angle"] = Math.atan2(Math.abs(net[1]), Math.abs(net[0])) / DEG;
    for (const eq of equations) eq.result.value = values[eq.valueKey];
  } else if (status === "unstable" && mag(net) < 1e-6) {
    // Slack cable: drop the pushing cable and see which way the rest pulls.
    const pulling = setup.forces.filter((f) => !(f.kind === "cable" && values[f.id] < 0));
    net.splice(0, 2, ...sum(pulling.map((f) => scale(directionOf(f), values[f.id] ?? 0))));
  }

  return { status, message, values, net, equations, unknowns };
}

// Names and units of everything in result.values, for labels and input boxes.
export function particleQuantities(setup) {
  const q = {};
  // Component labels the way textbooks write them: F → F_x, F_1 → F_{1x}, T_{AB} → (T_{AB})_x
  const comp = (symbol, axis) => {
    const simple = symbol.match(/^([A-Za-z])_(\w)$/);
    if (simple) return `${simple[1]}_{${simple[2]}${axis}}`;
    return symbol.includes("_") ? `(${symbol})_${axis}` : `${symbol}_${axis}`;
  };
  for (const f of setup.forces) {
    q[f.id] = { label: f.symbol, unit: "N" };
    q[`${f.id}.x`] = { label: comp(f.symbol, "x"), unit: "N" };
    q[`${f.id}.y`] = { label: comp(f.symbol, "y"), unit: "N" };
  }
  Object.assign(q, {
    "R.x": { label: "F_{Rx}", unit: "N" },
    "R.y": { label: "F_{Ry}", unit: "N" },
    R: { label: "F_R", unit: "N" },
    "R.angle": { label: "\\theta", unit: "deg" },
  });
  return q;
}
