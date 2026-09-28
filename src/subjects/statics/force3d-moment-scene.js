// force3d-moment-scene.js — what a 3D moment picture adds (Units 4.7, 4.8), for force3d-scene.js:
//   • each force's position vector r from the moment point (dashed, when setup.showR);
//   • the moment vector M_O at the moment point, drawn with a DOUBLE head as textbooks draw
//     moments in 3D — a fixed length along its direction, its size in the label ("?" until
//     revealed, unless setup.showMoment is "always");
//   • an axis (setup.axis, Unit 4.8): a dashed line through its two points, and once revealed
//     the moment about it, M_a, as a double-headed arrow along it.
// Returns { shapes, fixed } — fixed: 3D points the picture's frame must keep in view.

import { format } from "../../core/units.js";
import { pointOf } from "./force3d.js";
import { momentOf, axisUnit, pointNameOf } from "./force3d-moment.js";

const add3 = (a, b) => [a[0] + b[0], a[1] + b[1], a[2] + b[2]];
const scale3 = (a, k) => [a[0] * k, a[1] * k, a[2] * k];

export function momentShapes(setup, v, at, size, reveal) {
  const shapes = [], fixed = [];
  const Oname = setup.about || "O";
  const O = pointOf(setup, Oname) || [0, 0, 0];
  if (setup.showR) {
    for (const f of setup.forces || []) {
      const m = momentOf(f, setup);
      if (m.error) continue;
      shapes.push({ type: "arrow", id: `r_${f.id}`, from: at(O), to: at(add3(O, m.r)), role: "component", label: `r_{${Oname}${pointNameOf(f)}}` });
    }
  }
  const M = [v["M.x"], v["M.y"], v["M.z"]];
  const Msize = Math.hypot(...M);
  const show = reveal || setup.showMoment === "always";
  if (Msize > 1e-9) {
    const tip = add3(O, scale3(M, (0.45 * size) / Msize));
    shapes.push({ type: "arrow", id: "M", from: at(O), to: at(tip), role: "resultant", double: true, label: `M_${Oname} = ${show ? format(Msize, "N·m") : "?"}` });
    fixed.push(tip);
  }
  const ax = axisUnit(setup);
  if (ax) {
    const A = pointOf(setup, setup.axis.from), B = pointOf(setup, setup.axis.to);
    const ext = scale3(ax.u, 0.25 * ax.len);
    const a0 = add3(A, scale3(ext, -1)), b0 = add3(B, ext);
    shapes.push({ type: "line", from: at(a0), to: at(b0), style: "reference" });
    fixed.push(a0, b0);
    if (show && Math.abs(v.Ma) > 1e-9) {
      const tip = add3(A, scale3(ax.u, Math.sign(v.Ma) * 0.4 * size));
      shapes.push({ type: "arrow", id: "Ma", from: at(A), to: at(tip), role: "target", double: true, label: `M_a = ${format(Math.abs(v.Ma), "N·m")}` });
      fixed.push(tip);
    }
  }
  return { shapes, fixed };
}
