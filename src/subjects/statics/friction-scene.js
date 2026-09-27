// friction-scene.js — pictures for dry friction (Unit 9.1).
//
// A block: as for rigid bodies (agreed with the owner), the MODEL on the left — the
// ramp (or floor), the crate on it and the push — and on the right its FREE-BODY
// DIAGRAM: the crate alone, with its weight W, the surface's push N and friction F at
// the contact, and the push. The FBD shows once it's needed (setup.showFbd: "always",
// or once the answer is revealed); until then the model alone.
// A body with rough contacts (a ladder) is drawn by the rigid-body picture.

import { add, sub, scale } from "../../core/vector.js";
import { format } from "../../core/units.js";
import { spreadPanels, shiftShape } from "../../render/panels.js";
import { rigidBodyScene } from "./rigid-body-scene.js";
import { surfaceAxes, weightOfBlock, forceDir, isBody, placeAlong, solveFriction } from "./friction.js";

const deg = Math.PI / 180;
const angleOf = (v) => (Math.atan2(v[1], v[0]) * 180) / Math.PI;

export function frictionScene(setup, result, opts = {}) {
  if (isBody(setup)) return rigidBodyScene(placeAlong(setup), result, opts);
  return blockScene(setup, result || solveFriction(setup), opts);
}

// Where a line from the crate's centre G, in direction u, leaves the crate
// (w along the surface t, h across it, n).
function edgePoint(G, u, t, n, w, h) {
  const a = u[0] * t[0] + u[1] * t[1], b = u[0] * n[0] + u[1] * n[1];
  const k = Math.min(Math.abs(a) > 1e-9 ? w / 2 / Math.abs(a) : Infinity, Math.abs(b) > 1e-9 ? h / 2 / Math.abs(b) : Infinity);
  return add(G, scale(u, k));
}

function blockScene(setup, res, opts) {
  const { t, n, angle } = surfaceAxes(setup);
  const L = setup.ramp.length;
  const { w, h, at } = setup.block;
  const W = weightOfBlock(setup);
  const C = scale(t, at); // the middle of the crate's bottom face, where N and F act
  const G = add(C, scale(n, h / 2)); // its centre
  const forces = setup.forces || [];
  const k = (0.3 * L) / Math.max(1, W, ...forces.map((f) => f.magnitude)); // metres per newton
  const minLen = 0.1 * L;

  // ---- The model ----
  const model = [];
  const top = [L * t[0], L * t[1]];
  if (angle) {
    model.push({ type: "support", from: [-0.12 * L, 0], to: [top[0] + 0.1 * L, 0], normal: [0, 1] });
    model.push({ type: "ramp", points: [[0, 0], [top[0], 0], top] });
    model.push({ type: "arc", center: [0, 0], r: 0.2 * L, start: 0, end: angle, label: `${format(angle, "deg")}` });
  } else {
    model.push({ type: "support", from: [0, 0], to: [L, 0], normal: [0, 1] });
  }
  model.push({ type: "box", at: G, w, h, angle, label: setup.block.label || "" });
  const pushes = forces.map((f) => pushArrow(f, setup, G, t, n, w, h, Math.max(minLen, f.magnitude * k)));
  for (const p of pushes) model.push(...p);

  // ---- The FBD (when needed) ----
  const needed = setup.showFbd === "always" || opts.reveal || opts.showFbd;
  const size = L;
  const left = [Math.min(-0.16 * L, ...pushes.flat().filter((s) => s.from).map((s) => Math.min(s.from[0], s.to[0]))), Math.max(top[0], L) + 0.14 * L];
  // (Room for the steepest the ramp can be made, so a slider doesn't rescale the picture.)
  const steepest = setup.ramp.maxAngle ?? angle;
  const pushYs = pushes.flat().filter((s) => s.from).flatMap((s) => [s.from[1], s.to[1]]);
  const yTop = Math.max(L * Math.sin(steepest * deg), G[1] + 0.2 * L, ...pushYs) + 0.22 * L;
  const capY = -0.2 * size;
  if (!needed) {
    return [{ type: "axes" }, ...model, { type: "frame", frame: { xmin: left[0], xmax: left[1], ymin: capY - 0.1 * size, ymax: yTop } }];
  }
  const known = res.status === "determinate" && (opts.reveal || setup.showFbd === "always");
  const v = res.values;
  const fbd = [];
  fbd.push({ type: "box", at: G, w, h, angle });
  // W at the centre, straight down.
  fbd.push({ type: "arrow", id: "W", from: G, to: add(G, [0, -Math.max(minLen, W * k)]), role: "known", label: `W = ${format(W, "N")}` });
  fbd.push({ type: "point", at: G, label: "", style: "dot" });
  // N pushes on the bottom face, across the surface.
  const Nlen = known ? Math.max(minLen, v.N * k) : 0.2 * L;
  fbd.push({ type: "arrow", id: "N", from: sub(C, scale(n, Nlen)), to: C, role: "unknown", label: `N = ${known ? format(v.N, "N") : "?"}` });
  // F along the bottom face, from the contact: assumed up the slope until solved.
  const Fdir = known && v.F < 0 ? scale(t, -1) : t;
  const Flen = known ? Math.max(minLen * 0.8, Math.abs(v.F) * k) : 0.16 * L;
  if (!known || Math.abs(v.F) > 1e-6) {
    const from = add(C, scale(Fdir, Math.min(w / 2, 0.02 * L)));
    fbd.push({ type: "arrow", id: "F", from, to: add(from, scale(Fdir, Flen)), role: "unknown", label: `F = ${known ? format(Math.abs(v.F), "N") : "?"}` });
  }
  for (const p of pushes) fbd.push(...p);

  const right0 = [G[0] - 0.45 * L, G[0] + 0.45 * L];
  const offset = left[1] - right0[0] + 0.08 * L;
  const right = [right0[0] + offset, right0[1] + offset];
  const captions = [
    { type: "text", at: [(left[0] + left[1]) / 2, capY], text: "Model", panel: "left" },
    { type: "text", at: [(right[0] + right[1]) / 2, capY], text: "Free-body diagram", panel: "right" },
  ];
  const shapes = [{ type: "axes" }, ...model.map((s) => ({ ...s, panel: "left" })), ...fbd.map((s) => ({ ...shiftShape(s, offset), panel: "right" })), ...captions];
  const yLow = Math.min(capY - 0.08 * size, G[1] - Math.max(minLen, W * k) - 0.12 * L, C[1] - Nlen - 0.12 * L);
  return spreadPanels(shapes, { divider: left[1] + 0.04 * L, left, right, y: [yLow, yTop], margin: 0.04 * L, size: opts.canvasSize });
}

// A push (its arrowhead on the crate's face) or a rope's pull (starting at the crate),
// with its angle to the surface when it has one — an arc at the arrow's tail, from a
// dashed line along the surface.
function pushArrow(f, setup, G, t, n, w, h, len) {
  const u = forceDir(f, setup);
  const out = [];
  let from, to;
  if (f.rope) {
    from = edgePoint(G, u, t, n, w, h);
    to = add(from, scale(u, len));
  } else {
    to = edgePoint(G, scale(u, -1), t, n, w, h);
    from = sub(to, scale(u, len));
  }
  out.push({ type: "arrow", id: f.id, from, to, role: "known", label: `${f.symbol} = ${format(f.magnitude, "N")}` });
  if (f.tilt) {
    const s = f.along === "down" ? -1 : 1;
    const ref = scale(t, s);
    out.push({ type: "line", from, to: add(from, scale(ref, 0.7 * len)), style: "reference" });
    out.push({ type: "arc", center: from, r: 0.45 * len, start: angleOf(ref), end: angleOf(u), label: format(Math.abs(f.tilt), "deg") });
  }
  return out;
}
