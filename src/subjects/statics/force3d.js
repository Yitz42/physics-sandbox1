// force3d.js — forces in three dimensions (Unit 2.3).
//
// A force in space is a Cartesian vector F = F_x i + F_y j + F_z k, with size
// F = √(F_x² + F_y² + F_z²). Its direction can be given (textbook, ch. 2.4–2.5) by:
//   • its coordinate direction angles α, β, γ — from the +x, +y and +z axes:
//       F_x = F cos α, F_y = F cos β, F_z = F cos γ,  and  cos²α + cos²β + cos²γ = 1
//   • an azimuth θ (in the x-y plane, from +x toward +y) and an elevation φ (up from
//     the x-y plane):  F_z = F sin φ,  F' = F cos φ,  F_x = F' cos θ,  F_y = F' sin θ
//   • a line from point A to point B (a cable):  r_AB = r_B − r_A,  u_AB = r_AB / r_AB,
//     F = F u_AB
//   • its components directly.
//
// setup:
//   points: { A: [x, y, z], … }        named points, metres
//   forces: [{ id, symbol, magnitude, dir }]
//     dir: { angles: [α, β, γ] }        (γ may be null: then gamma: "acute" | "obtuse" picks
//                                        which of the two directions it is)
//          { azimuth: θ, elevation: φ }
//          { from: "A", to: "B" }
//          { components: [F_x, F_y, F_z] }  (magnitude is then worked out)
//   resultant: true                     also the resultant F_R = ΣF (values R, R.x …)
//   analysis: "equilibrium"             a particle at rest: ΣF = 0 finds up to three unknown sizes
//                                       (force3d-balance.js; weights, springs, cables that can't push)
// values, for each force id F: F (size), F.x F.y F.z, F.ux F.uy F.uz, F.alpha F.beta
//   F.gamma (degrees); along a line also F.rx F.ry F.rz F.r (metres).

import { mag, dot } from "../../core/vector.js";
import { solveBalance3d } from "./force3d-balance.js";
import { solveMoment3d } from "./force3d-moment.js";

export const G = 9.81; // m/s²

const DEG = Math.PI / 180;
const cosd = (a) => Math.cos(a * DEG);
const acosd = (c) => Math.acos(Math.max(-1, Math.min(1, c))) / DEG;

export const pointOf = (setup, name) => (setup.points || {})[name];

// A force's unit vector (and, along a line, its position vector), or { error }.
export function directionOf3(f, setup) {
  if (f.kind === "weight") return { u: [0, 0, -1] }; // straight down (z is up)
  const d = f.dir || {};
  if (d.components) {
    const m = mag(d.components);
    return m > 0 ? { u: d.components.map((c) => c / m), size: m } : { error: "A force with no components has no direction." };
  }
  if (d.from) {
    const A = pointOf(setup, d.from), B = pointOf(setup, d.to);
    const r = [B[0] - A[0], B[1] - A[1], B[2] - A[2]];
    const len = mag(r);
    return len > 0 ? { u: r.map((c) => c / len), r, len } : { error: `${d.from} and ${d.to} are the same point.` };
  }
  if (d.azimuth != null) {
    const [t, p] = [d.azimuth, d.elevation];
    return { u: [cosd(p) * cosd(t), cosd(p) * Math.sin(t * DEG), Math.sin(p * DEG)] };
  }
  if (d.angles) {
    const [a, b, g] = d.angles;
    const ca = cosd(a), cb = cosd(b);
    let cg;
    if (g != null) cg = cosd(g);
    else {
      const left = 1 - ca * ca - cb * cb;
      if (left < -1e-9) return { error: `No direction makes both α = ${a}° and β = ${b}°: $\\cos^2\\alpha + \\cos^2\\beta$ is already more than 1.` };
      cg = (d.gamma === "obtuse" ? -1 : 1) * Math.sqrt(Math.max(0, left));
    }
    const sum = ca * ca + cb * cb + cg * cg;
    if (Math.abs(sum - 1) > 1e-6) return { error: `These three angles don't make a direction: $\\cos^2\\alpha + \\cos^2\\beta + \\cos^2\\gamma$ = ${sum.toFixed(3)}, not 1.` };
    return { u: [ca, cb, cg] };
  }
  return { error: `Force ${f.id} has no direction.` };
}

// The force as a vector [F_x, F_y, F_z].
export function vectorOf(f, setup) {
  const d = directionOf3(f, setup);
  if (d.error) return null;
  const F = d.size ?? f.magnitude;
  return d.u.map((c) => c * F);
}

// Size and direction angles of a vector, into values under a name.
export function describe(values, name, v) {
  const F = mag(v);
  values[name] = F;
  ["x", "y", "z"].forEach((k, i) => (values[`${name}.${k}`] = v[i]));
  ["ux", "uy", "uz"].forEach((k, i) => (values[`${name}.${k}`] = F > 0 ? v[i] / F : 0));
  ["alpha", "beta", "gamma"].forEach((k, i) => (values[`${name}.${k}`] = F > 0 ? acosd(v[i] / F) : 90));
}

export function solveForce3d(setup) {
  if (setup.analysis === "equilibrium") return solveBalance3d(setup);
  if (setup.analysis === "moment") return solveMoment3d(setup); // M_O = r × F (Units 4.7, 4.8)
  const values = {};
  for (const f of setup.forces || []) {
    const d = directionOf3(f, setup);
    if (d.error) return { status: "unstable", message: d.error, values };
    const v = d.u.map((c) => c * (d.size ?? f.magnitude));
    describe(values, f.id, v);
    if (d.r) {
      ["rx", "ry", "rz"].forEach((k, i) => (values[`${f.id}.${k}`] = d.r[i]));
      values[`${f.id}.r`] = d.len;
    }
  }
  if (setup.resultant) {
    const R = [0, 1, 2].map((i) => (setup.forces || []).reduce((s, f) => s + values[`${f.id}.${["x", "y", "z"][i]}`], 0));
    describe(values, "R", R);
  }
  return { status: "resultant", message: "", values };
}

// A component's symbol: F → F_x, F_1 → F_{1x}, T_{AB} → T_{ABx}.
export function componentSymbol(sym, k) {
  const m = /^([A-Za-z])_\{?([^}]*)\}?$/.exec(sym);
  return m ? `${m[1]}_{${m[2]}${k}}` : `${sym}_${k}`;
}

// Names and units of everything a stage can ask about.
export function force3dQuantities(setup) {
  const q = {};
  const add = (name, sym) => {
    q[name] = { label: sym, unit: "N" };
    for (const k of ["x", "y", "z"]) q[`${name}.${k}`] = { label: componentSymbol(sym, k), unit: "N" };
    for (const k of ["ux", "uy", "uz"]) q[`${name}.${k}`] = { label: `u_${k[1]}`, unit: "" };
    q[`${name}.alpha`] = { label: "\\alpha", unit: "deg" };
    q[`${name}.beta`] = { label: "\\beta", unit: "deg" };
    q[`${name}.gamma`] = { label: "\\gamma", unit: "deg" };
  };
  for (const f of setup.forces || []) {
    add(f.id, f.symbol);
    if (f.kind === "spring") {
      const n = (f.dir && f.dir.from) ? `${f.dir.from}${f.dir.to}` : f.id;
      q[`${f.id}.s`] = { label: `s_{${n}}`, unit: "m" };
      q[`${f.id}.l`] = { label: `l_{${n}}`, unit: "m" };
    }
    const d = f.dir || {};
    if (d.from) {
      const line = `${d.from}${d.to}`;
      for (const k of ["x", "y", "z"]) q[`${f.id}.r${k}`] = { label: `(r_{${line}})_${k}`, unit: "m" };
      q[`${f.id}.r`] = { label: `r_{${line}}`, unit: "m" };
    }
  }
  if (setup.resultant) add("R", "F_R");
  if (setup.analysis === "moment") {
    // M_O = r × F: each force's, and the total (N·m); with an axis, M_a along it.
    const O = setup.about || "O";
    const mom = (name, sym) => {
      q[name] = { label: sym, unit: "N·m" };
      for (const k of ["x", "y", "z"]) q[`${name}.${k}`] = { label: `(${sym})_${k}`, unit: "N·m" };
      q[`${name}.alpha`] = { label: "\\alpha", unit: "deg" };
      q[`${name}.beta`] = { label: "\\beta", unit: "deg" };
      q[`${name}.gamma`] = { label: "\\gamma", unit: "deg" };
    };
    mom("M", `M_{${O}}`);
    for (const f of setup.forces || []) {
      mom(`M_${f.id}`, `M_{${f.symbol}}`);
      for (const k of ["x", "y", "z"]) q[`r_${f.id}.${k}`] = { label: `r_${k}`, unit: "m" };
    }
    if (setup.axis) q.Ma = { label: "M_a", unit: "N·m" };
  }
  return q;
}

export { cosd, acosd, DEG, dot };
