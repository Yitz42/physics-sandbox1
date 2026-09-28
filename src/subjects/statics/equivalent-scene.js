// equivalent-scene.js — the picture for equivalent force systems (Unit 5).
//
// The body and its forces are drawn by the couple picture (couple-scene.js).
// On top, this adds the equivalent system, in purple:
//   setup.resultant: "single"  one force F_R where it must act (x̄ from O along the line)
//                    "at O"    F_R at O plus the couple moment (M_R)_O
// It appears once the answer is revealed, or all the time with
// setup.showResultant (explore). setup.hook adds a crane hook: a cable up from
// that point (build stage).

import { add, scale } from "../../core/vector.js";
import { format } from "../../core/units.js";
import { coupleScene, sizeOf, lengthPerNewton } from "./couple-scene.js";
import { lineDir } from "./equivalent.js";
import { equivalentShadow } from "./equivalent-tools.js";

const turn = (M) => (M > 0 ? "counterclockwise" : "clockwise");

export function equivalentScene(setup, result, opts = {}) {
  const shapes = coupleScene(setup, result, { ...opts, guesses: null, hideTotal: true });
  const v = result ? result.values : {};
  const size = sizeOf(setup);
  const k = lengthPerNewton(setup, size);
  const O = setup.about.at;

  if (setup.hook) {
    const h = setup.hook;
    const top = add(h.at, [0, h.height ?? 0.4 * size]);
    shapes.push({ type: "line", from: h.at, to: top, style: "cable" });
    shapes.push({ type: "support", from: add(top, [-0.12 * size, 0]), to: add(top, [0.12 * size, 0]), normal: [0, -1] });
    shapes.push({ type: "point", at: h.at, label: h.label || "", style: "pin" });
  }

  if (result && v.R != null && (opts.reveal || (setup.showResultant && !opts.preGuess))) {
    const R = [v["R.x"], v["R.y"]];
    const len = Math.max(0.1 * size, v.R * k);
    const u = v.R > 1e-9 ? scale(R, 1 / v.R) : [0, -1];
    const label = `F_R = ${format(v.R, "N")}`;
    if (setup.resultant === "at O") {
      if (v.R > 1e-9) shapes.push({ type: "arrow", id: "R", from: O, to: add(O, scale(u, len)), role: "resultant", label });
      if (Math.abs(v.M) > 1e-9) shapes.push({ type: "moment", center: O, sense: Math.sign(v.M), rPx: 32, role: "resultant", label: `(M_R)_O = ${v.M.toFixed(1)} N·m (${turn(v.M)})` });
    } else if (v.pos != null) {
      // One force, pushing on the body where it must act (arrowhead at the point).
      const P = add(O, scale(lineDir(setup), v.pos));
      shapes.push({ type: "arrow", id: "R", from: add(P, scale(u, -len)), to: P, role: "resultant", label });
      const off = setup.resultantDimOffset ?? -0.18 * size;
      const n = [-lineDir(setup)[1], lineDir(setup)[0]];
      shapes.push({ type: "dim", from: add(O, scale(n, off)), to: add(P, scale(n, off)), role: "resultant", label: `${setup.posSymbol ? setup.posSymbol.replace(/\\bar\{x\}/, "x̄") : "x̄"} = ${format(Math.abs(v.pos), "m")}`, labelOn: true });
    }
  }
  if (opts.guesses) shapes.push(...equivalentShadow(setup, result, opts.guesses, { k, size }));
  return shapes;
}
