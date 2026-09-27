// fbd.js — shapes for a free-body diagram the STUDENT is drawing,
// plus "which arrow did they click?" hit-testing.
//
// Placed arrows are solid; the "shadow" arrow that follows the pointer while
// the student chooses a direction is drawn faint. A particle's arrows all
// start at one point (origin); a rigid body's arrows each sit at their own
// point (a support, the centre of gravity), and a fixed support's moment is
// a curved arrow.

import { add, scale, dot, distToSegment, mag, sub } from "../core/vector.js";

// The direction of the beam (a polyline, metres) that point P lies on, or null.
export function beamDirAt(points = [], P) {
  for (let i = 1; i < points.length; i++) {
    const a = points[i - 1], b = points[i];
    const l = mag(sub(b, a));
    if (l > 0 && distToSegment(P, a, b) < 1e-6) return scale(sub(b, a), 1 / l);
  }
  return null;
}

// How many pixels short of a point on a beam's centre line an arrow along
// `dir` must stop so that it just touches the beam's surface (`half`: half the
// beam's drawn thickness). A slanted arrow meets the surface further back; one
// running along the beam meets its rounded end.
export function surfaceGap(dir, beamDir, half) {
  const sin = Math.abs(dir[0] * beamDir[1] - dir[1] * beamDir[0]) / (mag(dir) || 1);
  return sin < 0.3 ? half : Math.min(half / sin, 3 * half);
}

// Where to draw a force arrow of `length` acting at point `at` in direction
// `dir`, keeping it OUTSIDE the body: `outward` points away from the body at
// that point. A force pointing into the body is drawn pushing on it (arrowhead
// at the point, tail outside); one pointing away is drawn pulling (tail at the
// point). With no `outward`, the tail is at the point.
export function placeArrow(at, dir, length, outward = null) {
  const push = outward && dot(dir, outward) < -1e-9;
  return push ? { from: add(at, scale(dir, -length)), to: at } : { from: at, to: add(at, scale(dir, length)) };
}

// placed: [{ id, label, dir, at?, outward?, moment?, sense? }], ghost: the same or null
export function studentArrows({ origin, placed = [], ghost = null, length = 1.3 }) {
  const shape = (p, id, alpha) => (p.moment
    ? { type: "moment", id, center: p.at || origin, sense: p.sense, rPx: 26, label: p.label, role: "student", alpha }
    : { type: "arrow", id, ...placeArrow(p.at || origin, p.dir, length, p.outward), label: p.label, role: p.role || "student", alpha });
  const shapes = placed.map((p) => shape(p, p.id));
  if (ghost) shapes.push(shape(ghost, "ghost", 0.4));
  return shapes;
}

// The arrow (from a list of shapes) closest to `point`, if within `tol` metres.
// With pxToWorld, curved moment arrows can be picked too (click near the curve).
export function arrowAt(shapes, point, tol, pxToWorld = null) {
  let best = null;
  let bestD = tol;
  for (const s of shapes) {
    if (!s.id || s.id === "ghost") continue;
    let d = Infinity;
    if (s.type === "arrow") d = distToSegment(point, s.from, s.to);
    else if (s.type === "moment" && pxToWorld) d = Math.abs(mag(sub(point, s.center)) - pxToWorld(s.rPx || 34));
    if (d < bestD) {
      bestD = d;
      best = s;
    }
  }
  return best;
}

// The allowed direction closest to where the pointer is (the "snap").
export function snapDirection(origin, point, directions) {
  const v = [point[0] - origin[0], point[1] - origin[1]];
  const len = Math.hypot(v[0], v[1]);
  if (len < 1e-9) return directions[0];
  let best = directions[0];
  let bestDot = -Infinity;
  for (const d of directions) {
    const dot = (d[0] * v[0] + d[1] * v[1]) / len;
    if (dot > bestDot) {
      bestDot = dot;
      best = d;
    }
  }
  return best;
}
