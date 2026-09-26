// fbd.js — shapes for a free-body diagram the STUDENT is drawing,
// plus "which arrow did they click?" hit-testing.
//
// Placed arrows are solid; the "shadow" arrow that follows the pointer while
// the student chooses a direction is drawn faint.

import { add, scale, distToSegment } from "../core/vector.js";

// placed: [{ id, label, dir }], ghost: { id, label, dir } or null
export function studentArrows({ origin, placed = [], ghost = null, length = 1.3 }) {
  const shapes = placed.map((p) => ({
    type: "arrow", id: p.id, from: origin, to: add(origin, scale(p.dir, length)),
    label: p.label, role: p.role || "student",
  }));
  if (ghost) {
    shapes.push({
      type: "arrow", id: "ghost", from: origin, to: add(origin, scale(ghost.dir, length)),
      label: ghost.label, role: "student", alpha: 0.4,
    });
  }
  return shapes;
}

// The arrow (from a list of shapes) closest to `point`, if within `tol` metres.
export function arrowAt(shapes, point, tol) {
  let best = null;
  let bestD = tol;
  for (const s of shapes) {
    if (s.type !== "arrow" || !s.id || s.id === "ghost") continue;
    const d = distToSegment(point, s.from, s.to);
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
