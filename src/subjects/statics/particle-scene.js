// particle-scene.js — turns a particle setup into a list of shapes to draw.
//
// The renderer (src/render) knows how to draw arrows, lines, boxes, arcs …
// but knows nothing about physics. This file is the translator: it decides
// that a cable is a line to a hatched ceiling, that a weight is a crate,
// and that each force becomes an arrow on the free-body diagram (FBD).
//
// Layout:
//   • Only applied forces (Unit 1): one picture — the point and its arrows.
//   • Cables or weights (Unit 2): the "space diagram" (the real setup) on the
//     left, and the free-body diagram of the point on the right.

import { add, scale, sub, mag, angleDeg } from "../../core/vector.js";
import { format } from "../../core/units.js";
import { directionOf, magnitudeOf, particleQuantities } from "./particle.js";

const AXIS_DEG = { "+x": 0, "+y": 90, "-x": 180, "-y": 270 };
const AXIS_VEC = { "+x": [1, 0], "+y": [0, 1], "-x": [-1, 0], "-y": [0, -1] };

// Where the end of a cable is fixed.
export function anchorPoint(setup, force) {
  const A = setup.point.at;
  const d = directionOf(force);
  const a = force.anchor || {};
  const ceilingY = setup.ceiling ? setup.ceiling.y : a.y;
  const length = ceilingY != null && d[1] > 1e-6 ? ceilingY / d[1] : a.length || 2;
  return add(A, scale(d, length));
}

// Length of a force arrow in drawing units (metres of the picture).
function arrowLength(setup, force, m, maxKnown) {
  if (setup.forceScale) return m / setup.forceScale; // drawn to scale (drag-able)
  if (m == null) return 1.3; // unknown and not yet revealed: a neutral length
  return 0.8 + 0.9 * Math.min(1, Math.abs(m) / (maxKnown || 1));
}

// Label under an arrow, e.g. "T_{AB} = 245 N" or "T_{AB} = ?"
function arrowLabel(force, m, show) {
  if (m == null || !show) return `${force.symbol} = ?`;
  return `${force.symbol} = ${format(Math.abs(m), "N")}`;
}

// Angle marking between the reference axis and the force (or a slope triangle).
function angleMarks(force, at, len) {
  const dir = force.direction;
  if (!dir || typeof dir === "string" || force.kind === "weight" || force.hideAngle) return [];
  const d = directionOf(force);
  if (dir.slope) {
    const [dx, dy] = dir.slope;
    const k = Math.min(0.5, len * 0.4) / Math.hypot(dx, dy);
    const p0 = add(at, scale(d, len * 0.35));
    return [{ type: "triangle", at: p0, dx: dx * k, dy: dy * k, labels: [Math.abs(dx), Math.abs(dy), Math.hypot(dx, dy)] }];
  }
  const a0 = AXIS_DEG[dir.from];
  const r = Math.min(0.55, len * 0.45);
  return [
    { type: "line", from: at, to: add(at, scale(AXIS_VEC[dir.from], r * 1.6)), style: "reference" },
    { type: "arc", center: at, r, start: a0, end: angleDeg(d), label: `${+dir.angle.toFixed(1)}°` },
  ];
}

// Arrows for every force acting on the point, with tails at `at`.
function fbdArrows(setup, result, at, opts) {
  const shapes = [];
  const vals = result ? result.values : {};
  const knownMags = setup.forces.map(magnitudeOf).filter((m) => m != null);
  const maxKnown = Math.max(1, ...knownMags, ...(opts.reveal ? Object.values(vals).map(Math.abs) : []));
  for (const f of setup.forces) {
    if (opts.hide && opts.hide.includes(f.id)) continue;
    const known = magnitudeOf(f);
    const m = known ?? (opts.reveal ? vals[f.id] : null);
    const len = arrowLength(setup, f, m, maxKnown);
    const d = directionOf(f);
    const tip = add(at, scale(d, len));
    shapes.push({
      type: "arrow", id: f.id, from: at, to: tip,
      label: arrowLabel(f, m, known != null || opts.reveal),
      // "wrong" (red) marks an overloaded cable after Play
      role: (opts.flagged || []).includes(f.id) ? "wrong" : known == null ? "unknown" : "known",
    });
    if (opts.angles !== false) shapes.push(...angleMarks(f, at, len));
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
    const len = setup.forceScale ? mag(R) / setup.forceScale : 1.6;
    if (mag(R) > 1e-9) shapes.push({ type: "arrow", id: "R", from: at, to: add(at, scale(R, len / mag(R))), role: "resultant", label: `F_R = ${format(mag(R), "N")}` });
  }
  // Unbalanced force: the point can't stay put. Show which way it gets pushed.
  if (opts.reveal && result && result.status === "unstable" && mag(result.net) > 1e-6) {
    const n = result.net;
    shapes.push({ type: "arrow", id: "net", from: at, to: add(at, scale(n, 1.2 / mag(n))), role: "wrong", label: "ΣF ≠ 0" });
  }
  if (setup.target) {
    const t = setup.target;
    const d = directionOf({ direction: t.direction });
    const len = setup.forceScale ? t.magnitude / setup.forceScale : 1.6;
    shapes.push({ type: "arrow", id: "target", from: at, to: add(at, scale(d, len)), role: "target", label: `target ${format(t.magnitude, "N")}` });
  }
  return shapes;
}

// The real setup: ring, cables to supports, hanging crate.
function spaceDiagram(setup) {
  const A = setup.point.at;
  const shapes = [];
  if (setup.ceiling) {
    const c = setup.ceiling;
    shapes.push({ type: "support", from: [c.from, A[1] + c.y], to: [c.to, A[1] + c.y], normal: [0, -1] });
    if (c.forbidden) shapes.push({ type: "zone", from: [c.forbidden[0], A[1] + c.y], to: [c.forbidden[1], A[1] + c.y - 0.12], label: c.forbiddenLabel || "no anchors" });
  }
  for (const f of setup.forces) {
    if (f.kind === "cable") {
      const P = anchorPoint(setup, f);
      shapes.push({ type: "line", id: f.id, from: A, to: P, style: "cable" });
      const d = sub(P, A);
      if (!setup.ceiling) {
        const n = Math.abs(d[1]) >= Math.abs(d[0]) ? [0, -Math.sign(d[1])] : [-Math.sign(d[0]), 0];
        const t = [n[1] * 0.35, n[0] * 0.35];
        shapes.push({ type: "support", from: sub(P, t), to: add(P, t), normal: n });
      }
      shapes.push({ type: "point", at: P, label: f.anchor?.label || "", style: "pin" });
      shapes.push(...angleMarks(f, A, Math.min(1.2, mag(d))));
    } else if (f.kind === "weight") {
      const top = add(A, [0, -0.7]);
      shapes.push({ type: "line", id: f.id, from: A, to: top, style: "cable" });
      shapes.push({ type: "box", id: f.id, at: add(top, [0, -0.3]), w: 0.95, h: 0.6, label: f.mass != null ? `${+f.mass.toFixed(2)} kg` : f.symbol });
    }
  }
  shapes.push({ type: "point", at: A, label: setup.point.label || "", style: "ring" });
  return shapes;
}

// Main entry: every shape for the picture.
// opts: { reveal, hide: [ids], components, resultant, fbdOnly,
//         fbdSetup }  ← draw the FBD from a different (e.g. deliberately wrong)
//                      setup, while the space diagram still shows the real one
export function particleScene(setup, result, opts = {}) {
  const A = setup.point.at;
  const fs = opts.fbdSetup || setup;
  const hasBodies = setup.forces.some((f) => f.kind === "cable" || f.kind === "weight");
  if (!hasBodies || opts.fbdOnly) {
    return [{ type: "axes", at: add(A, [-2.6, -1.9]) }, ...fbdArrows(fs, result, A, opts), { type: "point", at: A, label: setup.point.label || "", style: "ring" }];
  }
  const space = spaceDiagram(setup);
  // Put the FBD to the right of the space diagram, with room to spare.
  const right = Math.max(A[0] + 1, ...space.filter((s) => s.to).map((s) => s.to[0]));
  const F = [right + 2.4, A[1]];
  return [
    ...space,
    { type: "text", at: add(A, [0, -2.6]), text: "Space diagram" },
    { type: "text", at: add(F, [0, -2.6]), text: `FBD of ${setup.point.label || "the point"}` },
    { type: "axes", at: add(F, [1.4, -1.6]) },
    ...fbdArrows(fs, result, F, opts),
    { type: "point", at: F, label: setup.point.label || "", style: "dot" },
  ];
}

// Where the FBD's point is drawn (the solve challenge draws arrows there).
export function fbdOrigin(setup) {
  const scene = particleScene(setup, null, {});
  const dot = scene.filter((s) => s.type === "point").pop();
  return dot.at;
}
