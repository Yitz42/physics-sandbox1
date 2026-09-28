// friction-scene.js — pictures for dry friction (Unit 9.1).
//
// A block: as for rigid bodies (agreed with the owner), the MODEL on the left — the
// ramp (or floor), the crate on it and the push — and on the right its FREE-BODY
// DIAGRAM: the crate alone, with its weight W, the surface's push N and friction F at
// the contact, and the push. The FBD shows once it's needed (setup.showFbd: "always";
// "unknowns" — from the start, N and F as "?"; or once the answer is revealed);
// until then the model alone.
// A body with rough contacts (a ladder) is drawn by the rigid-body picture.

import { add, sub, scale } from "../../core/vector.js";
import { format } from "../../core/units.js";
import { clone, setPath } from "../../core/paths.js";
import { spreadPanels, shiftShape } from "../../render/panels.js";
import { rigidBodyScene } from "./rigid-body-scene.js";
import { surfaceAxes, weightOfBlock, forceDir, isBody, solveFriction } from "./friction.js";
import { pushPoint, tipSide } from "./friction-tip.js";
import { bodyPicture } from "./friction-ladder.js";

export { bodyPicture }; // (a ladder's picture: friction-ladder.js)

const deg = Math.PI / 180;
const angleOf = (v) => (Math.atan2(v[1], v[0]) * 180) / Math.PI;

export function frictionScene(setup, result, opts = {}) {
  if (isBody(setup)) return rigidBodyScene(bodyPicture(setup), result, opts);
  // Once a "where does motion start?" answer is revealed, the picture shows that
  // moment: the push (or slope) at the value found, friction at its limit.
  let res = result || solveFriction(setup);
  if (setup.find && !setup.find.quiet && opts.reveal && Number.isFinite(res.values.critical)) {
    const at = clone(setup);
    setPath(at, setup.find.path, res.values.critical);
    const r = solveFriction(at);
    return blockScene(at, { ...r, values: { ...r.values, critical: res.values.critical } }, opts);
  }
  return blockScene(setup, res, opts);
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
  // setup.find: the number the question asks for (a push, the angle) — shown as "?"
  // until the answer is revealed, then as the value found.
  // (find.quiet: the stage finds the number for its own use and asks nothing about it —
  // a build stage whose push is on a slider.)
  const asked = setup.find && !setup.find.quiet ? setup.find.path : null;
  const found = asked && opts.reveal && Number.isFinite(res.values.critical) ? res.values.critical : null;

  // ---- The model ----
  const model = [];
  const top = [L * t[0], L * t[1]];
  if (angle) {
    model.push({ type: "support", from: [-0.12 * L, 0], to: [top[0] + 0.1 * L, 0], normal: [0, 1] });
    model.push({ type: "ramp", points: [[0, 0], [top[0], 0], top] });
    // (The angle the question asks for shows as θ = ? until the answer is revealed.)
    const text = asked === "ramp.angle" ? (found != null ? `θ = ${format(found, "deg")}` : "θ = ?") : format(angle, "deg");
    model.push({ type: "arc", center: [0, 0], r: 0.2 * L, start: 0, end: angle, label: text });
  } else {
    model.push({ type: "support", from: [0, 0], to: [L, 0], normal: [0, 1] });
  }
  model.push({ type: "box", at: G, w, h, angle, label: setup.block.label || "" });
  // The numbers the student needs, in a key in a free corner.
  // (A crate that can tip, Unit 9.2: its size and each push's height matter too.)
  const sizes = setup.tipping ? [`crate ${format(w, "m")} wide × ${format(h, "m")} tall`, ...forces.filter((f) => f.height != null).map((f) => `${f.symbol} acts ${format(f.height, "m")} up`)] : [];
  model.push({ type: "note", lines: [`W = ${format(W, "N")}`, `μ_s = ${setup.mus}`, ...(setup.muk != null ? [`μ_k = ${setup.muk}`] : []), ...sizes] });
  // The corner O it would tip about, and — once it tips — a faint outline of it tipping over.
  const O = setup.tipping ? add(C, scale(t, tipSide(setup) * (w / 2))) : null;
  if (O) {
    model.push({ type: "point", at: O, label: "O", style: "dot" });
    if (res.state === "tips") {
      const turn = -tipSide(setup) * 12 * deg; // (clockwise about the right-hand corner)
      const rel = sub(G, O);
      const G2 = add(O, [rel[0] * Math.cos(turn) - rel[1] * Math.sin(turn), rel[0] * Math.sin(turn) + rel[1] * Math.cos(turn)]);
      model.push({ type: "box", at: G2, w, h, angle: angle + turn / deg, dashed: true, alpha: 0.35, passable: true });
    }
  }
  // (A push set to zero on a slider isn't drawn: nothing pushes.)
  const pushes = forces.filter((f) => f.magnitude > 1e-9).map((f) => {
    const unknown = asked === `forces.#${f.id}.magnitude`;
    const size = unknown ? found : f.magnitude;
    return pushArrow(f, setup, G, t, n, w, h, size == null ? 0.2 * L : Math.max(minLen, size * k), unknown ? (size == null ? "?" : format(size, "N")) : null);
  });
  for (const p of pushes) model.push(...p);

  // ---- The FBD (when needed) ----
  // (showFbd "unknowns": the FBD from the start, with N and F as "?" — a debug stage,
  // where their values would give the answer away.)
  const needed = setup.showFbd === "always" || setup.showFbd === "unknowns" || opts.reveal || opts.showFbd;
  const size = L;
  const left = [Math.min(-0.16 * L, ...pushes.flat().filter((s) => s.from).map((s) => Math.min(s.from[0], s.to[0]))), Math.max(top[0], L) + 0.14 * L];
  // (Room for the steepest the ramp can be made, so a slider doesn't rescale the picture.)
  const steepest = setup.ramp.maxAngle ?? angle;
  const pushYs = pushes.flat().filter((s) => s.from).flatMap((s) => [s.from[1], s.to[1]]);
  const yTop = Math.max(L * Math.sin(steepest * deg), G[1] + 0.2 * L, ...pushYs) + 0.22 * L;
  // Captions under everything: the FBD's W and N reach down below the crate.
  const Wlen = Math.max(minLen, W * k);
  const Nlen = res.status === "determinate" && (opts.reveal || setup.showFbd === "always") ? Math.max(minLen, res.values.N * k) : 0.2 * L;
  const capY = Math.min(-0.2 * size, G[1] - Wlen - 0.17 * L, C[1] - Nlen * n[1] - 0.17 * L);
  if (!needed) {
    // (No FBD, no captions: just room under the ground for the slope's angle.)
    return [{ type: "axes" }, ...model, { type: "frame", frame: { xmin: left[0], xmax: left[1], ymin: -0.16 * size, ymax: yTop - 0.08 * size } }];
  }
  const known = res.status === "determinate" && (opts.reveal || setup.showFbd === "always");
  const v = res.values;
  const fbd = [];
  fbd.push({ type: "box", at: G, w, h, angle });
  // W at the centre, straight down.
  fbd.push({ type: "arrow", id: "W", from: G, to: add(G, [0, -Wlen]), role: "known", label: `W = ${format(W, "N")}` });
  fbd.push({ type: "point", at: G, label: "", style: "dot" });
  // N pushes on the bottom face, across the surface — uphill of the middle, so its
  // tail leans away from W's arrow instead of running along it (for a crate treated
  // as a particle, where along the face N acts doesn't matter).
  // (A crate that can tip: N where the moments put it, x behind the corner O — at O
  // itself once it tips.)
  const Nat = setup.tipping && known && Number.isFinite(v.x)
    ? add(C, scale(t, tipSide(setup) * (w / 2 - Math.max(0, Math.min(w, v.x)))))
    : add(C, scale(t, 0.3 * w));
  fbd.push({ type: "arrow", id: "N", from: sub(Nat, scale(n, Nlen)), to: Nat, onBody: true, role: "unknown", label: `N = ${known ? format(v.N, "N") : "?"}` });
  // F along the bottom face's line, out from its corner on the side it points to:
  // assumed up the slope until solved.
  const Fdir = known && v.F < 0 ? scale(t, -1) : t;
  const Flen = known ? Math.max(minLen * 0.8, Math.abs(v.F) * k) : 0.16 * L;
  if (!known || Math.abs(v.F) > 1e-6) {
    const from = add(C, scale(Fdir, w / 2));
    fbd.push({ type: "arrow", id: "F", from, to: add(from, scale(Fdir, Flen)), role: "unknown", label: `F = ${known ? format(Math.abs(v.F), "N") : "?"}` });
  }
  for (const p of pushes) fbd.push(...p);
  if (O) fbd.push({ type: "point", at: O, label: "O", style: "dot" });
  // How far N acts behind O (Unit 9.2): a dimension just under the base, from O to N —
  // the number the explore stage is about (N and W can be close to one line).
  if (O && known && Number.isFinite(v.x) && v.x > 0.02) {
    const down = scale(n, -0.07 * L);
    fbd.push({ type: "dim", from: add(O, down), to: add(Nat, down), label: `x = ${format(v.x, "m")}`, noExt: true });
  }

  // The FBD's own extent: it is drawn at its own size, bigger than the model when its
  // half has room (render/panels.js). From the crate and the longest an arrow can be
  // (0.3 of L), not from the arrows themselves — so a slider never resizes it.
  const reach = 0.3 * L + Math.max(w, h);
  const right0 = [G[0] - reach - 0.1 * L, G[0] + reach + 0.1 * L];
  const rightY = [G[1] - reach - 0.06 * L, G[1] + reach + 0.02 * L];
  const offset = left[1] - right0[0] + 0.08 * L;
  const right = [right0[0] + offset, right0[1] + offset];
  const captions = [
    { type: "text", at: [(left[0] + left[1]) / 2, capY], text: "Model", panel: "left" },
    { type: "text", at: [(right[0] + right[1]) / 2, capY], text: "Free-body diagram", panel: "right", caption: true },
  ];
  const shapes = [{ type: "axes" }, ...model.map((s) => ({ ...s, panel: "left" })), ...fbd.map((s) => ({ ...shiftShape(s, offset), panel: "right" })), ...captions];
  const yLow = capY - 0.08 * size;
  return spreadPanels(shapes, { divider: left[1] + 0.04 * L, left, right, y: [yLow, yTop], margin: 0.04 * L, size: opts.canvasSize,
    rightY, capTop: capY + 0.06 * L });
}

// A push (its arrowhead on the crate's face) or a rope's pull (starting at the crate),
// with its angle to the surface when it has one — an arc at the arrow's tail, from a
// dashed line along the surface.
function pushArrow(f, setup, G, t, n, w, h, len, value = null) {
  const u = forceDir(f, setup);
  const out = [];
  let from, to;
  // (A push at a given height, Unit 9.2, meets the crate's face at that height.)
  const C = sub(G, scale(n, h / 2));
  const at = f.height != null ? (([a, b]) => add(C, add(scale(t, a), scale(n, b))))(pushPoint(f, setup)) : null;
  if (f.rope) {
    from = at || edgePoint(G, u, t, n, w, h);
    to = add(from, scale(u, len));
  } else {
    to = at || edgePoint(G, scale(u, -1), t, n, w, h);
    from = sub(to, scale(u, len));
  }
  // (A push is labelled at its outer end, like any arrow pushing on a body.)
  out.push({ type: "arrow", id: f.id, from, to, ...(f.rope ? {} : { onBody: true }), role: value ? "unknown" : "known", label: `${f.symbol} = ${value || format(f.magnitude, "N")}` });
  if (f.tilt) {
    const s = f.along === "down" ? -1 : 1;
    const ref = scale(t, s);
    out.push({ type: "line", from, to: add(from, scale(ref, 0.7 * len)), style: "reference" });
    out.push({ type: "arc", center: from, r: 0.45 * len, start: angleOf(ref), end: angleOf(u), label: format(Math.abs(f.tilt), "deg") });
  }
  return out;
}
