// particle-space.js — the "space diagram" of a particle problem: the real
// setup, as the textbook draws it — the ring (or pulley) at A, cables and
// springs running to their supports, and what hangs there (a crate, a lamp,
// a traffic light) or holds it up (a balloon).
//
// Supports, set in the setup:
//   ceiling { y, from, to, forbidden?, forbiddenLabel? }  cables going up end on it
//   ground  { y, from, to, forbidden?, forbiddenLabel? }  cables going down end on it
//                                                         (y is below A, so negative)
//   a force's anchor { label, length?, mount? }           otherwise the cable is
//          `length` long and ends on a small hatched wall — or, with
//          mount: "pole", on top of a street pole standing on the ground
//          (setup.poleBase: the ground's height below A, default −2.6 m).
// What hangs at A: a weight's `object` ("lamp", "trafficLight"; default a crate).
// What holds A up: an applied force with object: "balloon" (drawn above A).

import { add, scale, sub, mag, angleDeg } from "../../core/vector.js";
import { format } from "../../core/units.js";
import { directionOf, magnitudeOf } from "./particle.js";
import { pointsDelta } from "./directions.js";

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
  if (ceilingY != null && d[1] > 1e-6) return add(A, scale(d, ceilingY / d[1])); // up to the ceiling
  if (setup.ground && d[1] < -1e-6) return add(A, scale(d, setup.ground.y / d[1])); // down to the ground
  return add(A, scale(d, a.length || 2));
}

// Angle marking between the reference axis and the force (or a slope triangle).
// `ring` (0, 1, 2 …) gives each force's arc its own radius, so two angles
// measured from the same axis don't draw on top of each other.
// onBody (a load on a beam or other body): the mark keeps out of the body — a push's
// slope triangle sits by the arrow's outer end (its tail, `at`), and a pull's mark
// (whose tail is ON the body) moves out along the arrow, away from it.
export function angleMarks(force, at, len, ring = 0, { onBody = false } = {}) {
  const dir = force.direction;
  if (!dir || typeof dir === "string" || force.kind === "weight" || force.hideAngle) return [];
  if (dir.points) return []; // its direction comes from the coordinates (space diagram)
  const d = directionOf(force);
  const pull = onBody && !force.push;
  if (dir.slope) {
    const [dx, dy] = dir.slope;
    const k = Math.min(0.5, len * 0.4) / Math.hypot(dx, dy);
    // (on a body: the triangle spans 8 % … 48 % of a push from its tail, or 52 % … 92 % of a pull)
    const p0 = add(at, scale(d, len * (!onBody ? 0.35 : pull ? 0.52 : 0.08)));
    return [{ type: "triangle", at: p0, dx: dx * k, dy: dy * k, labels: [Math.abs(dx), Math.abs(dy), Math.hypot(dx, dy)] }];
  }
  const a0 = AXIS_DEG[dir.from];
  const r = Math.min(0.55, len * 0.45) * (1 + 0.45 * ring);
  const c = pull ? add(at, scale(d, len * 0.5)) : at; // a pull's angle is marked halfway out along it
  return [
    { type: "line", from: c, to: add(c, scale(AXIS_VEC[dir.from], r * 1.1)), style: "reference" }, // ends just past the arc
    { type: "arc", center: c, r, start: a0, end: angleDeg(d), label: `${+dir.angle.toFixed(1)}°` },
  ];
}

// Coordinates as a label, e.g. "B (4, 3)" (in m; the caption says so).
const coord = (v) => String(+v.toFixed(2)).replace("-", "−"); // a real minus sign
const coordLabel = (name, p) => `${name} (${coord(p[0])}, ${coord(p[1])})`;
export const usesPoints = (setup) => setup.forces.some((f) => f.direction && f.direction.points);

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
  // The wheel sits IN the cable (it rides on it), so the cable wraps round the
  // side of the wheel away from `mid` — under it, when both ends go up — and
  // presses the wheel toward `mid`. The side counterclockwise of `mid` leaves
  // the rim 90° further round (CCW), the other side 90° back, and the cable
  // lies in the groove from the first, on round the far side, to the second.
  const ccw = mid[0] * d1[1] - mid[1] * d1[0] > 0 ? 0 : 1;
  const a = sides.map((f) => angleDeg(directionOf(f)));
  const leave = [a[0] + (ccw === 0 ? 90 : -90), a[1] + (ccw === 1 ? 90 : -90)];
  sides.forEach((f, i) => {
    const t = (leave[i] * Math.PI) / 180;
    out.offset[f.id] = [PULLEY_R * Math.cos(t), PULLEY_R * Math.sin(t)];
  });
  out.wrap = [leave[ccw], leave[1 - ccw]]; // counterclockwise, through the side opposite `mid`
  return out;
}

// The real setup: ring, cables to supports, hanging crate.
export function spaceDiagram(setup) {
  const A = setup.point.at;
  const shapes = [];
  const pulley = pulleyWrap(setup);
  // Forces given by coordinates: mark the origin O (unless A is the origin),
  // so students can see the coordinates are measured from there. (The x-y
  // axes icon in the corner shows which way is +x and +y.)
  if (usesPoints(setup) && mag(A) > 1e-9) shapes.push({ type: "point", at: [0, 0], label: "O (0, 0)", style: "dot" });
  // Ceiling and ground: a long hatched line, with any no-anchor zone shaded red.
  for (const [c, down] of [[setup.ceiling, -1], [setup.ground, 1]]) {
    if (!c) continue;
    const y = A[1] + c.y;
    shapes.push({ type: "support", from: [A[0] + c.from, y], to: [A[0] + c.to, y], normal: [0, down] });
    if (c.forbidden) shapes.push({ type: "zone", from: [A[0] + c.forbidden[0], y], to: [A[0] + c.forbidden[1], y + down * 0.12], label: c.forbiddenLabel || "no anchors", labelBelow: down > 0 });
  }
  const poleBase = A[1] + (setup.poleBase ?? -2.6);
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
      const onCeiling = setup.ceiling && d[1] > 1e-6, onGround = setup.ground && d[1] < -1e-6;
      if (f.anchor && f.anchor.mount === "pole") {
        shapes.push({ type: "pole", from: P, to: [P[0], poleBase] }); // from/to: side-by-side layout moves both ends
      } else if (!onCeiling && !onGround) {
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
      else if (f.object === "trafficLight") shapes.push({ type: "trafficLight", id: f.id, at: top, w: 0.36, h: 0.95, label });
      else shapes.push({ type: "box", id: f.id, at: add(top, [0, -0.3]), w: 0.95, h: 0.6, label });
    } else if (f.object === "balloon") {
      // A balloon pulling A up: its net lift is a known force (buoyancy minus its weight).
      const m = magnitudeOf(f);
      shapes.push({ type: "balloon", id: f.id, at: A, r: 0.55, label: m != null ? `lift ${format(m, "N")}` : f.symbol });
    }
  }
  const pointLabel = usesPoints(setup) ? coordLabel(setup.point.label || "A", A) : setup.point.label || "";
  // A pulley at A (a cable runs over it): a wheel instead of a ring.
  // The wheel is a little smaller than the cable's path, so the cable shows in its groove.
  if (pulley) shapes.push({ type: "pulley", at: A, r: pulley.r * 0.8, cableR: pulley.r, wrap: pulley.wrap, straps: pulley.straps });
  shapes.push({ type: "point", at: A, label: pointLabel, style: setup.point.object === "pulley" ? "dot" : "ring" });
  return shapes;
}

