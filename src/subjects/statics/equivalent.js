// equivalent.js — equivalent force systems (Unit 5).
//
// Any set of forces and couple moments on a rigid body can be replaced by an
// EQUIVALENT system: one resultant force plus one couple moment at a point O,
//   F_R = ΣF          (F_Rx = ΣF_x, F_Ry = ΣF_y)
//   (M_R)_O = ΣM_O    (every force's moment about O, plus every couple moment)
// — the same push and the same turning effect. If F_R ≠ 0, the couple can be
// removed by sliding F_R sideways until its own moment about O is (M_R)_O:
// then ONE force, placed at the right spot, is equivalent to the whole system.
//
// setup = {
//   about:  { at: [x, y], label: "O" }   the point the system is moved to
//   forces: [{ id, symbol, magnitude | mass (kind "weight"), direction, at }]
//   moments: [{ id, symbol, magnitude, sense: +1 | -1, at }]   couple moments
//   line:   { dir: [1, 0] }   where the single resultant force should act: a
//           line through O (e.g. along the beam). Default: the x-axis.
//   Drawing: body, plates, dims, texts (as in couple.js), showResultant: true
//           draws the single resultant force at all times (explore)
// }
//
// result.values: "R.x", "R.y", "R" (size of F_R), "R.angle" (acute angle from
// the x-axis), "M" ((M_R)_O), "pos" (where the single resultant crosses the
// line, measured from O along line.dir), "d_R" (its perpendicular distance
// from O), plus each force's "<id>", "M_<id>", "d_<id>" (from couple.js).

import { cross2 } from "../../core/vector.js";
import { DEG } from "../../core/vector.js";
import { solveCouple } from "./couple.js";

// The direction of the line the single resultant force is placed on.
export const lineDir = (setup) => (setup.line && setup.line.dir) || [1, 0];

export function solveEquivalent(setup) {
  // The sums come from the couple solver: it adds up every force's moment about
  // O (and the couple moments) and the net force. netForce: true makes it
  // write the F_Rx and F_Ry equations too.
  const base = solveCouple({ ...setup, netForce: true });
  const v = { ...base.values };
  const R = [v["R.x"], v["R.y"]];
  v["R.angle"] = Math.atan2(Math.abs(R[1]), Math.abs(R[0])) / DEG;
  v.d_R = v.R > 1e-9 ? Math.abs(v.M) / v.R : 0;
  // Along the line O + s·dir, F_R's moment about O is s·(dir × F_R); set it equal to (M_R)_O.
  const across = cross2(lineDir(setup), R);
  let status = "resultant";
  let message;
  if (Math.abs(across) > 1e-9) v.pos = v.M / across;
  else if (v.R > 1e-9) message = "The resultant force runs along the line, so it can't be moved along it to make up the moment.";
  else message = "The forces cancel (F_R = 0), so the system is just a couple: no single force can replace it.";

  // Equations: F_Rx = ΣFx, F_Ry = ΣFy, then (M_R)_O = ΣM_O.
  const O = (setup.about && setup.about.label) || "O";
  const eqs = base.equations.filter((e) => e.id === "Rx" || e.id === "Ry");
  const Mp = base.equations.find((e) => e.id === "Mp");
  if (Mp) eqs.push({ ...Mp, lhs: `(M_R)_{${O}} = \\Sigma M_{${O}}` });
  return { status, message, values: v, equations: eqs, unknowns: [], net: R };
}

// Names and units for result.values.
export function equivalentQuantities(setup, baseQuantities) {
  const O = (setup.about && setup.about.label) || "O";
  return {
    ...baseQuantities,
    R: { label: "F_R", unit: "N" },
    "R.angle": { label: "\\theta", unit: "deg" },
    M: { label: `(M_R)_{${O}}`, unit: "N·m" },
    pos: { label: setup.posSymbol || "\\bar{x}", unit: "m" },
    d_R: { label: "d", unit: "m" },
  };
}
