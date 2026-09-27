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
import { directionOf, magnitudeOf, particleQuantities, springName } from "./particle.js";
import { pointsDelta } from "./directions.js";
import { shadowShapes } from "./particle-shadow.js";
import { spreadPanels } from "../../render/panels.js";

const AXIS_DEG = { "+x": 0, "+y": 90, "-x": 180, "-y": 270 };
const AXIS_VEC = { "+x": [1, 0], "+y": [0, 1], "-x": [-1, 0], "-y": [0, -1] };

// Where the end of a cable is fixed.
export function anchorPoint(setup, force) {
  const A = setup.point.at;
  // A cable given by two points ends exactly at the second point.
  if (force.direction && force.direction.points) return add(A, pointsDelta(force.direction));
  const d = directionOf(force);
  const a = force.anchor || {};
  const ceilingY = setup.ceiling ? setup.ceiling.y : a.y;
  const length = ceilingY != null && d[1] > 1e-6 ? ceilingY / d[1] : a.length || 2;
  return add(A, scale(d, length));
}

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

// Angle marking between the reference axis and the force (or a slope triangle).
// `ring` (0, 1, 2 …) gives each force's arc its own radius, so two angles
// measured from the same axis don't draw on top of each other.
export function angleMarks(force, at, len, ring = 0) {
  const dir = force.direction;
  if (!dir || typeof dir === "string" || force.kind === "weight" || force.hideAngle) return [];
  if (dir.points) return []; // its direction comes from the coordinates (space diagram)
  const d = directionOf(force);
  if (dir.slope) {
    const [dx, dy] = dir.slope;
    const k = Math.min(0.5, len * 0.4) / Math.hypot(dx, dy);
    const p0 = add(at, scale(d, len * 0.35));
    return [{ type: "triangle", at: p0, dx: dx * k, dy: dy * k, labels: [Math.abs(dx), Math.abs(dy), Math.hypot(dx, dy)] }];
  }
  const a0 = AXIS_DEG[dir.from];
  const r = Math.min(0.55, len * 0.45) * (1 + 0.45 * ring);
  return [
    { type: "line", from: at, to: add(at, scale(AXIS_VEC[dir.from], r * 1.1)), style: "reference" }, // ends just past the arc
    { type: "arc", center: at, r, start: a0, end: angleDeg(d), label: `${+dir.angle.toFixed(1)}°` },
  ];
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

// Coordinates as a label, e.g. "B (4, 3)" (in m; the caption says so).
const coord = (v) => String(+v.toFixed(2)).replace("-", "−"); // a real minus sign
const coordLabel = (name, p) => `${name} (${coord(p[0])}, ${coord(p[1])})`;
const usesPoints = (setup) => setup.forces.some((f) => f.direction && f.direction.points);

// A pulley at A: the cable shared by two forces (same `shared` name) runs
// over the wheel, so each side leaves the rim where it is tangent to it —
// not from the centre. Returns
//   r        the wheel's radius (m)
//   offset   { forceId: [dx, dy] } — where each side leaves the rim, from A
//   wrap     [startDeg, endDeg] — the cable in the groove, counterclockwise
//   straps   directions of the other ropes and the hanger, tied to the axle
// (null when the point isn't a pulley).
const PULLEY_R = 0.45;
function pulleyWrap(setup) {
  if (setup.point.object !== "pulley") return null;
  const out = { r: PULLEY_R, offset: {}, wrap: null, straps: [] };
  const sides = setup.forces.filter((f) => f.kind === "cable" && f.shared);
  const others = setup.forces.filter((f) => !sides.includes(f) && (f.kind === "cable" || f.kind === "weight"));
  out.straps = others.map((f) => directionOf(f));
  if (sides.length !== 2) return out;
  const [d1, d2] = sides.map((f) => directionOf(f));
  const mid = add(d1, d2); // the cable pulls the wheel this way (between its two sides)
  // The side counterclockwise of `mid` leaves the rim 90° further round (CCW);
  // the other side 90° back. The cable lies in the groove between them, over `mid`.
  const ccw = mid[0] * d1[1] - mid[1] * d1[0] > 0 ? 0 : 1;
  const a = sides.map((f) => angleDeg(directionOf(f)));
  const leave = [a[0] + (ccw === 0 ? 90 : -90), a[1] + (ccw === 1 ? 90 : -90)];
  sides.forEach((f, i) => {
    const t = (leave[i] * Math.PI) / 180;
    out.offset[f.id] = [PULLEY_R * Math.cos(t), PULLEY_R * Math.sin(t)];
  });
  out.wrap = [leave[1 - ccw], leave[ccw]];
  return out;
}

// The real setup: ring, cables to supports, hanging crate.
function spaceDiagram(setup) {
  const A = setup.point.at;
  const shapes = [];
  const pulley = pulleyWrap(setup);
  // Forces given by coordinates: mark the origin O (unless A is the origin),
  // so students can see the coordinates are measured from there. (The x-y
  // axes icon in the corner shows which way is +x and +y.)
  if (usesPoints(setup) && mag(A) > 1e-9) shapes.push({ type: "point", at: [0, 0], label: "O (0, 0)", style: "dot" });
  if (setup.ceiling) {
    const c = setup.ceiling;
    shapes.push({ type: "support", from: [c.from, A[1] + c.y], to: [c.to, A[1] + c.y], normal: [0, -1] });
    if (c.forbidden) shapes.push({ type: "zone", from: [c.forbidden[0], A[1] + c.y], to: [c.forbidden[1], A[1] + c.y - 0.12], label: c.forbiddenLabel || "no anchors" });
  }
  for (const f of setup.forces) {
    if (f.kind === "cable" || f.kind === "spring") {
      // Over a pulley, the cable leaves the rim (and its anchor moves with it,
      // so the drawn cable keeps exactly the force's direction).
      const off = (pulley && pulley.offset[f.id]) || [0, 0];
      const start = add(A, off);
      const P = add(anchorPoint(setup, f), off);
      if (f.kind === "spring") {
        shapes.push({ type: "spring", id: f.id, from: A, to: P });
      } else {
        shapes.push({ type: "line", id: f.id, from: start, to: P, style: "cable" });
      }
      const d = sub(P, start);
      if (!setup.ceiling) {
        const n = Math.abs(d[1]) >= Math.abs(d[0]) ? [0, -Math.sign(d[1])] : [-Math.sign(d[0]), 0];
        const t = [n[1] * 0.35, n[0] * 0.35];
        shapes.push({ type: "support", from: sub(P, t), to: add(P, t), normal: n });
      }
      if (f.direction.points) {
        // Faint legs of the right triangle: across, then up (no numbers —
        // students work them out from the coordinates).
        const corner = [P[0], A[1]];
        shapes.push({ type: "line", from: A, to: corner, style: "reference" }, { type: "line", from: corner, to: P, style: "reference" });
        shapes.push({ type: "point", at: P, label: coordLabel((f.direction.names || [])[1] || "B", f.direction.points[1]), style: "pin" });
      } else {
        shapes.push({ type: "point", at: P, label: f.anchor?.label || "", style: "pin" });
      }
      // The angle is marked where the cable leaves (the pulley's rim, or A).
      shapes.push(...angleMarks(f, start, Math.min(1.2, mag(d)), setup.forces.indexOf(f)));
    } else if (f.kind === "weight") {
      const top = add(A, [0, -0.7 - (pulley ? pulley.r : 0)]); // below the wheel, if there is one
      const label = f.mass != null ? `${+f.mass.toFixed(2)} kg` : f.symbol;
      shapes.push({ type: "line", id: f.id, from: A, to: top, style: "cable" });
      // What hangs there: a crate, or a real object the stage names (object: "lamp").
      if (f.object === "lamp") shapes.push({ type: "lamp", id: f.id, at: top, w: 0.9, h: 0.5, label });
      else shapes.push({ type: "box", id: f.id, at: add(top, [0, -0.3]), w: 0.95, h: 0.6, label });
    }
  }
  const pointLabel = usesPoints(setup) ? coordLabel(setup.point.label || "A", A) : setup.point.label || "";
  // A pulley at A (a cable runs over it): a wheel instead of a ring.
  // The wheel is a little smaller than the cable's path, so the cable shows in its groove.
  if (pulley) shapes.push({ type: "pulley", at: A, r: pulley.r * 0.8, cableR: pulley.r, wrap: pulley.wrap, straps: pulley.straps });
  shapes.push({ type: "point", at: A, label: pointLabel, style: setup.point.object === "pulley" ? "dot" : "ring" });
  return shapes;
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
