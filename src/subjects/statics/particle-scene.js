// particle-scene.js — turns a particle setup into a list of shapes to draw.
//
// The renderer (src/render) knows how to draw arrows, lines, boxes, arcs …
// but knows nothing about physics. This file is the translator: it decides
// that a cable is a line to a hatched ceiling, that a weight is a crate,
// and that each force becomes an arrow on the free-body diagram (FBD).
//
// Layout:
//   • Only applied forces (Unit 1): one picture — the point and its arrows.
//   • Cables or weights (Unit 2): the "space diagram" (the real setup, drawn
//     by particle-space.js) on the left, and the free-body diagram of the
//     point on the right.

import { add, scale, sub, mag, angleDeg } from "../../core/vector.js";
import { format } from "../../core/units.js";
import { directionOf, magnitudeOf, particleQuantities, springName } from "./particle.js";
import { shadowShapes } from "./particle-shadow.js";
import { spaceDiagram, usesPoints, angleMarks } from "./particle-space.js";
import { spreadPanels } from "../../render/panels.js";

// Other scenes (moments, couples) and the tools use these, from here.
export { angleMarks, anchorPoint } from "./particle-space.js";

// Picture metres per newton. Stages that let students drag arrows fix it
// (setup.forceScale); otherwise the biggest force is drawn 1.7 m long.
// Arrows are proportional to their force, so "shadow" arrows of a
// student's answer (particle-shadow.js) can be compared by eye.
function lengthPerNewton(setup, maxKnown) {
  return setup.forceScale ? 1 / setup.forceScale : 1.7 / (maxKnown || 1);
}

// Length of a force arrow in drawing units (metres of the picture).
function arrowLength(setup, force, m, k) {
  if (setup.forceScale) return m / setup.forceScale; // drawn to scale (drag-able)
  if (m == null) return 1.3; // unknown and not yet revealed: a neutral length
  return Math.max(0.5, Math.abs(m) * k); // tiny forces still get a visible arrow
}

// Label under an arrow, e.g. "T_{AB} = 245 N" or "T_{AB} = ?"
function arrowLabel(force, m, show) {
  if (m == null || !show) return `${force.symbol} = ?`;
  return `${force.symbol} = ${format(Math.abs(m), "N")}`;
}

// Arrows for every force acting on the point, with tails at `at`.
function fbdArrows(setup, result, at, opts) {
  const shapes = [];
  const vals = result ? result.values : {};
  const knownMags = setup.forces.map(magnitudeOf).filter((m) => m != null);
  const maxKnown = Math.max(1, ...knownMags, ...(opts.reveal ? Object.values(vals).map(Math.abs) : []));
  const k = lengthPerNewton(setup, maxKnown);
  for (const f of setup.forces) {
    if (opts.hide && opts.hide.includes(f.id)) continue;
    const known = magnitudeOf(f);
    // An unknown the student has guessed: their shadow arrow takes its place.
    if (known == null && !opts.reveal && opts.guesses && Number.isFinite(opts.guesses[f.id])) continue;
    const m = known ?? (opts.reveal ? vals[f.id] : null);
    const len = arrowLength(setup, f, m, k);
    const d = directionOf(f);
    const tip = add(at, scale(d, len));
    shapes.push({
      type: "arrow", id: f.id, from: at, to: tip,
      label: arrowLabel(f, m, known != null || opts.reveal),
      // "wrong" (red) marks an overloaded cable after Test
      role: (opts.flagged || []).includes(f.id) ? "wrong" : known == null ? "unknown" : "known",
    });
    if (opts.angles !== false) shapes.push(...angleMarks(f, at, len, setup.forces.indexOf(f)));
    // Component arrows carry numbers, so they only appear once values are revealed.
    if (opts.components && opts.reveal && m != null && (opts.components === true || opts.components.includes(f.id))) {
      const v = scale(d, len);
      const names = particleQuantities(setup);
      const q = (axis) => `${names[`${f.id}.${axis}`].label} = ${format(m * d[axis === "x" ? 0 : 1], "N")}`;
      shapes.push({ type: "arrow", id: f.id, from: at, to: add(at, [v[0], 0]), role: "component", label: q("x") });
      shapes.push({ type: "arrow", id: f.id, from: add(at, [v[0], 0]), to: tip, role: "component", label: q("y"), labelSide: v[0] < 0 ? -1 : 1 });
    }
  }
  if (opts.resultant && opts.reveal && result && result.status === "resultant") {
    const R = [vals["R.x"], vals["R.y"]];
    const len = Math.max(0.5, mag(R) * k);
    if (mag(R) > 1e-9) shapes.push({ type: "arrow", id: "R", from: at, to: add(at, scale(R, len / mag(R))), role: "resultant", label: `F_R = ${format(mag(R), "N")}` });
  }
  // Unbalanced force: the point can't stay put. Show which way it gets pushed.
  if (opts.reveal && result && result.status === "unstable" && mag(result.net) > 1e-6) {
    const n = result.net;
    shapes.push({ type: "arrow", id: "net", from: at, to: add(at, scale(n, 1.2 / mag(n))), role: "wrong", label: "ΣF ≠ 0" });
  }
  // After a wrong answer: faint arrows showing what the student's numbers would look like.
  if (opts.guesses) shapes.push(...shadowShapes(setup, result, at, opts.guesses, k, opts.minX));
  if (setup.target) {
    const t = setup.target;
    const d = directionOf({ direction: t.direction });
    const len = setup.forceScale ? t.magnitude / setup.forceScale : 1.6;
    shapes.push({ type: "arrow", id: "target", from: at, to: add(at, scale(d, len)), role: "target", label: `target ${format(t.magnitude, "N")}` });
  }
  return shapes;
}

// What the forces act on, when the stage names it (setup.point.object):
// "eyebolt" or "bracket", fixed to a surface in direction setup.point.mount
// ([x, y]), or — if no mount is given — into the widest gap between the
// forces, so no arrow lies on top of it.
function mountShapes(setup, A) {
  const kind = setup.point.object;
  if (kind !== "eyebolt" && kind !== "bracket") return [];
  let dir = setup.point.mount;
  if (!dir) {
    const angles = setup.forces.map((f) => Math.atan2(...[...directionOf(f)].reverse())).sort((a, b) => a - b);
    let best = { gap: -1, mid: -Math.PI / 2 };
    angles.forEach((a, i) => {
      const next = i + 1 < angles.length ? angles[i + 1] : angles[0] + 2 * Math.PI;
      if (next - a > best.gap) best = { gap: next - a, mid: (a + next) / 2 };
    });
    dir = [Math.cos(best.mid), Math.sin(best.mid)];
  }
  const m = mag(dir) || 1;
  return [{ type: kind, at: A, dir: [dir[0] / m, dir[1] / m] }];
}

// Main entry: every shape for the picture.
// opts: { reveal, hide: [ids], components, resultant, fbdOnly,
//         fbdSetup }  ← draw the FBD from a different (e.g. deliberately wrong)
//                      setup, while the space diagram still shows the real one
export function particleScene(setup, result, opts = {}) {
  const A = setup.point.at;
  const fs = opts.fbdSetup || setup;
  const hasBodies = setup.forces.some((f) => ["cable", "spring", "weight"].includes(f.kind));
  if (!hasBodies || opts.fbdOnly) {
    return [{ type: "axes" }, ...mountShapes(fs, A), ...fbdArrows(fs, result, A, opts), { type: "point", at: A, label: setup.point.label || "", style: "ring" }];
  }
  const space = spaceDiagram(setup);
  // Two diagrams side by side with a soft line between them: the space
  // diagram on the left, the FBD on the right. spreadPanels (render/panels.js)
  // then centres each one in its half of the canvas.
  // The FBD's arrows reach up to FBD_REACH from its point in any direction
  // (the biggest force is drawn 1.7 m long; labels need room past the tips).
  const FBD_REACH = 2.3;
  const pts = space.flatMap((s) => [s.at, s.from, s.to].filter(Boolean));
  const x0 = Math.min(A[0] - 1, ...pts.map((p) => p[0])), x1 = Math.max(A[0] + 1, ...pts.map((p) => p[0]));
  const divider = x1 + 0.7;
  const F = [divider + 0.7 + FBD_REACH, A[1]];
  // Captions sit 3 m below A, or lower if the drawing reaches further down;
  // the space diagram's is centred under it.
  const capY = Math.min(A[1] - 3.0, ...pts.map((p) => p[1] - 1.1));
  const ys = [...pts.map((p) => p[1]), capY - 0.2, A[1] + FBD_REACH, A[1] - FBD_REACH];
  // Springs: their stiffness k (and unstretched length l₀) go on a line under
  // the caption, where there's always room.
  const springs = setup.forces.filter((f) => f.kind === "spring").map((f) =>
    `${springName(f)}: k = ${f.k} N/m${f.unstretched != null ? `, l₀ = ${+f.unstretched.toFixed(3)} m` : ""}`);
  if (springs.length) ys.push(capY - 0.5 * springs.length - 0.2);
  const shapes = [
    ...space,
    ...springs.map((text, i) => ({ type: "text", at: [(x0 + x1) / 2, capY - 0.5 * (i + 1)], text: `spring ${text}` })),
    { type: "text", at: [(x0 + x1) / 2, capY], text: usesPoints(setup) ? "Space diagram (coordinates in m)" : "Space diagram" },
    { type: "text", at: [F[0], capY], text: `FBD of ${setup.point.label || "the point"}` },
    { type: "axes" }, // drawn in the canvas corner
    // Wrong-answer arrows pointing left stop at the FBD's side of its half.
    ...fbdArrows(fs, result, F, { ...opts, minX: F[0] - FBD_REACH }),
    { type: "point", at: F, label: setup.point.label || "", style: "dot" },
  ];
  return spreadPanels(shapes, {
    divider, left: [x0, x1], right: [F[0] - FBD_REACH, F[0] + FBD_REACH],
    y: [Math.min(...ys), Math.max(...ys)], size: opts.canvasSize,
  });
}

// Where the FBD's point is drawn (the solve challenge draws arrows there).
// opts.canvasSize must match the picture's, since it changes the layout.
export function fbdOrigin(setup, opts = {}) {
  const scene = particleScene(setup, null, { canvasSize: opts.canvasSize });
  const dot = scene.filter((s) => s.type === "point").pop();
  return dot.at;
}
