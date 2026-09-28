// force3d-moment.js — moments in 3D (Units 4.7 and 4.8), setup.analysis: "moment".
//
// A force F acting at point A has a moment about point O
//   M_O = r × F,  r = r_A − r_O  (from O to ANY point on the force's line; A is the handiest)
//   M_x = r_y F_z − r_z F_y,   M_y = r_z F_x − r_x F_z,   M_z = r_x F_y − r_y F_x
// a vector along the axis the force tends to turn the body about (right-hand rule).
// Several forces: M_O = Σ r × F. About an AXIS through O (Unit 4.8), only the part of M_O
// along it turns the body:  M_a = u_a · M_O = u_a · (r × F)  (a scalar; + means the right-hand
// turn about u_a), and as a vector M_a u_a.
// setup (see force3d.js for points and force directions):
//   about: "O"                    the moment point (a point name)
//   forces: [{ id, symbol, magnitude, dir, at: "A" }]  (a force along a line acts at its first point)
//   axis: { from: "O", to: "C" }  optional: also the moment about this axis (through O)
//   body: ["O", "A", "B"]         the bar or pipe the forces act on (drawn as a bent bar)
// values: per force F: F.x … (force3d.js), r_F.x r_F.y r_F.z (its position vector from O),
//   M_F.x M_F.y M_F.z M_F; the total M.x M.y M.z M (N·m), M.alpha M.beta M.gamma;
//   with an axis: ua.x ua.y ua.z (its unit vector) and Ma (N·m, signed).

import { mag } from "../../core/vector.js";
import { directionOf3, describe, pointOf } from "./force3d.js";

const AX = ["x", "y", "z"];
export const cross = (r, F) => [r[1] * F[2] - r[2] * F[1], r[2] * F[0] - r[0] * F[2], r[0] * F[1] - r[1] * F[0]];
export const dot3 = (a, b) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];

// Where a force acts: its `at` point, else (along a line) its first point.
export const pointNameOf = (f) => f.at || (f.dir && f.dir.from) || null;

// The force's vector, r (from the moment point) and its moment — or { error }.
export function momentOf(f, setup) {
  const d = directionOf3(f, setup);
  if (d.error) return { error: d.error };
  const F = d.u.map((c) => c * (d.size ?? f.magnitude));
  const O = pointOf(setup, setup.about || "O") || [0, 0, 0];
  const P = pointOf(setup, pointNameOf(f));
  if (!P) return { error: `Force ${f.id} needs a point to act at (at: "A").` };
  const r = [P[0] - O[0], P[1] - O[1], P[2] - O[2]];
  return { F, r, M: cross(r, F), d };
}

// The axis's unit vector, or null.
export function axisUnit(setup) {
  const a = setup.axis;
  if (!a) return null;
  const A = pointOf(setup, a.from), B = pointOf(setup, a.to);
  const v = [B[0] - A[0], B[1] - A[1], B[2] - A[2]];
  const L = mag(v);
  return L > 0 ? { u: v.map((c) => c / L), v, len: L } : null;
}

export function solveMoment3d(setup) {
  const values = {};
  const total = [0, 0, 0];
  for (const f of setup.forces || []) {
    const m = momentOf(f, setup);
    if (m.error) return { status: "unstable", message: m.error, values };
    describe(values, f.id, m.F);
    if (m.d.r) {
      AX.forEach((k, i) => (values[`${f.id}.r${k}`] = m.d.r[i]));
      values[`${f.id}.r`] = m.d.len;
    }
    AX.forEach((k, i) => {
      values[`r_${f.id}.${k}`] = m.r[i];
      values[`M_${f.id}.${k}`] = m.M[i];
      total[i] += m.M[i];
    });
    values[`M_${f.id}`] = mag(m.M);
  }
  describe(values, "M", total);
  const ax = axisUnit(setup);
  if (ax) {
    AX.forEach((k, i) => (values[`ua.${k}`] = ax.u[i]));
    values.Ma = dot3(ax.u, total);
  }
  return { status: "resultant", message: "", values };
}
