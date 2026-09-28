// newton-scene.js — the picture for Newton's laws (Unit 1.1; physics in newton.js).
//
// Left, the MODEL: the body as it is — hanging from a cable under a ceiling, standing on a
// floor, on ice, or an elevator car on its cable — with its mass written on it and, if it
// accelerates, a dashed arrow beside it for a. Right, its FREE-BODY DIAGRAM: the body alone,
// its weight W from its centre, and every other force on it (a cable pulling from its top, the
// floor pushing up on its bottom, a push on its side). Arrows are drawn roughly to scale.

import { add, scale } from "../../core/vector.js";
import { format } from "../../core/units.js";
import { spreadPanels, shiftShape } from "../../render/panels.js";
import { solveNewton } from "./newton.js";

const DIR = { up: [0, 1], down: [0, -1], left: [-1, 0], right: [1, 0] };

export function newtonScene(setup, result, opts = {}) {
  const res = result || solveNewton(setup);
  const v = res.values;
  const look = setup.look || "floor";
  const w = look === "elevator" ? 1.2 : 1, h = look === "elevator" ? 1.5 : 1;
  const known = opts.reveal && res.status === "determinate";
  const forces = setup.forces || [];
  const sizeOf = (f) => (f.magnitude == null ? (known ? v[f.id] : null) : f.magnitude);
  const biggest = Math.max(v.W, ...forces.map((f) => sizeOf(f) || 0), 1);
  const len = (F) => (F == null ? 0.9 : Math.max(0.45, (1.5 * F) / biggest));
  const massText = setup.count != null ? `${setup.count} × ${setup.each} kg` : setup.weight != null ? (known ? format(v.m, "kg") : "m = ?") : `${format(v.m, "kg")}`;

  // ---- The model ----
  const model = [];
  const top = [0, h / 2], bottom = [0, -h / 2];
  if (look === "hanging" || look === "elevator") {
    model.push({ type: "support", from: [-0.9, 2.3], to: [0.9, 2.3], normal: [0, -1] });
    model.push({ type: "line", from: top, to: [0, 2.3], style: "cable" });
  } else {
    model.push({ type: "support", from: [-1.6, -h / 2], to: [1.6, -h / 2], normal: [0, 1], rough: look !== "ice" });
  }
  model.push({ type: "box", at: [0, 0], w, h, label: look === "elevator" ? "" : massText });
  if (look === "elevator") model.push({ type: "text", at: [0, -h / 2 - 0.3], text: `elevator, ${massText}` });
  // Pushes drawn on the model too (a hand on the crate), ending on its face.
  for (const f of forces.filter((q) => q.push)) {
    const d = DIR[f.direction], face = add([0, 0], [(-d[0] * w) / 2, (-d[1] * h) / 2]);
    model.push({ type: "arrow", id: f.id, from: add(face, scale(d, -0.9)), to: face, onBody: true, role: "known", label: `${f.symbol} = ${f.magnitude == null ? "?" : format(f.magnitude, "N")}` });
  }
  // The acceleration, beside the body (not a force: dashed, its own colour).
  const acc = setup.accel && Math.hypot(...setup.accel) > 1e-12 ? setup.accel : null;
  if (acc) {
    const u = scale(acc, 1 / Math.hypot(...acc));
    const at = [w / 2 + 0.45, -0.35 * u[1]];
    model.push({ type: "arrow", id: "a", from: at, to: add(at, scale(u, 0.7)), role: "component", label: `a = ${format(Math.hypot(...acc), "m/s^2")}` });
  }
  const g = setup.g ?? 9.81;
  model.push({ type: "note", lines: [`g = ${g} m/s²`, ...(setup.rating ? [`cable rated ${setup.rating} kN`] : [])] });

  // ---- The FBD ----
  const fbd = [{ type: "box", at: [0, 0], w, h }];
  fbd.push({ type: "arrow", id: "W", from: [0, 0], to: [0, -len(v.W)], role: "known", label: `W = ${setup.weight != null || known || setup.showW ? format(v.W, "N") : "?"}` });
  fbd.push({ type: "point", at: [0, 0], label: "", style: "dot" });
  for (const f of forces) {
    const d = DIR[f.direction];
    const F = sizeOf(f);
    const label = `${f.symbol} = ${F == null ? "?" : format(F, "N")}`;
    const role = f.magnitude == null ? "unknown" : "known";
    const face = [(d[0] * w) / 2, (d[1] * h) / 2];
    if (f.push || f.direction === "up" && look !== "hanging" && look !== "elevator") {
      // A push (or the floor's push N): ends on the face it pushes, from outside.
      const on = [(-d[0] * w) / 2, (-d[1] * h) / 2];
      fbd.push({ type: "arrow", id: f.id, from: add(on, scale(d, -len(F))), to: on, onBody: true, role, label });
    } else {
      fbd.push({ type: "arrow", id: f.id, from: face, to: add(face, scale(d, len(F))), role, label });
    }
  }

  const left = [-2.4, 2.4], right0 = [-2.4, 2.4];
  const offset = left[1] - right0[0] + 0.3;
  const right = [right0[0] + offset, right0[1] + offset];
  const capY = -2.5;
  const shapes = [{ type: "axes" }, ...model.map((q) => ({ ...q, panel: "left" })), ...fbd.map((q) => ({ ...shiftShape(q, offset), panel: "right" })),
    { type: "text", at: [0, capY], text: "Model", panel: "left" },
    { type: "text", at: [offset, capY], text: "Free-body diagram", panel: "right", caption: true }];
  return spreadPanels(shapes, { divider: left[1] + 0.15, left, right, y: [capY - 0.25, 2.6], margin: 0.1, size: opts.canvasSize,
    rightY: [-2.3, 2.4], capTop: capY + 0.2 });
}
