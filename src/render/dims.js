// dims.js — engineering-drawing rules for dimension lines, applied to every
// picture before it is drawn (see diagrams.js):
//   lowerDims()   finds where arrows cross each dimension line (`cuts`), so the
//                 line breaks there — dimensions stay close to the drawing
//   extendDims()  thin extension lines run from each end of a dimension to
//                 just short of the body it measures (a beam or a plate)
// A dimension can opt out: noExt (it has its own guide lines), role "arm"
// (a moment arm drawn at the lines it measures).

import { sub, add, scale, mag } from "../core/vector.js";

// Screen-space helpers.
const isPlain = (s) => s.type === "dim" && s.role !== "arm" && !s.noExt;

export function lowerDims(shapes, cv) {
  // Dimension lines stay close to the drawing (agreed with the owner): instead of
  // moving below an arrow that crosses one, the line BREAKS where the arrow
  // crosses it. Here each dimension gets its crossing points, `cuts` (pixels
  // along it from its start); the dimension's drawing leaves a gap at each.
  const dims = shapes.filter(isPlain);
  if (!dims.length) return shapes;
  const arrows = shapes.filter((s) => s.type === "arrow" && s.role !== "shadow" && s.role !== "component");
  const cutsOf = new Map();
  for (const d of dims) {
    const a = cv.toScreen(d.from), b = cv.toScreen(d.to);
    const cuts = [];
    for (const s of arrows) {
      const t = crossAt(a, b, cv.toScreen(s.from), cv.toScreen(s.to));
      if (t != null) cuts.push(t);
    }
    if (cuts.length) cutsOf.set(d, cuts);
  }
  if (!cutsOf.size) return shapes;
  return shapes.map((s) => (cutsOf.has(s) ? { ...s, cuts: cutsOf.get(s) } : s));
}

// Where segment p–q crosses segment a–b: the distance along a–b (pixels), or null.
function crossAt(a, b, p, q) {
  const r = sub(b, a), e = sub(q, p);
  const den = r[0] * e[1] - r[1] * e[0];
  if (Math.abs(den) < 1e-9) return null;
  const w = sub(p, a);
  const t = (w[0] * e[1] - w[1] * e[0]) / den; // along a–b, 0…1
  const u = (w[0] * r[1] - w[1] * r[0]) / den; // along p–q, 0…1
  return t > 0 && t < 1 && u >= 0 && u <= 1 ? t * mag(r) : null;
}

// Where a ray from P along u first meets segment a–b (distance t ≥ 0), or null.
function rayHit(P, u, a, b) {
  const e = sub(b, a);
  const den = u[0] * e[1] - u[1] * e[0];
  if (Math.abs(den) < 1e-12) return null;
  const w = sub(a, P);
  const t = (w[0] * e[1] - w[1] * e[0]) / den;
  const s = (w[0] * u[1] - w[1] * u[0]) / den;
  return t > 1e-9 && s >= -1e-9 && s <= 1 + 1e-9 ? t : null;
}

export function extendDims(shapes, cv) {
  // What a dimension can measure: beam centre lines, plate edges, truss members
  // (bars) and named points (joints) — an extension line runs out to the nearest.
  const edges = [];
  const points = shapes.filter((s) => s.type === "point" && s.label).map((s) => s.at);
  for (const s of shapes) {
    if (s.type === "beam") for (let i = 1; i < s.points.length; i++) edges.push({ a: s.points[i - 1], b: s.points[i], beam: s });
    if (s.type === "member" && (s.alpha ?? 1) > 0.5) edges.push({ a: s.from, b: s.to, gapPx: 4.5, far: true });
    if (s.type === "box" && s.passable) {
      const [x, y] = s.at, w = s.w / 2, h = s.h / 2;
      const c = [[x - w, y - h], [x + w, y - h], [x + w, y + h], [x - w, y + h]];
      for (let i = 0; i < 4; i++) edges.push({ a: c[i], b: c[(i + 1) % 4] });
    }
  }
  if (!edges.length && !points.length) return shapes;
  const out = [...shapes];
  // Don't run extension lines across the whole picture — but a truss's joint may be
  // well across from its dimension, so those reach further.
  const reach = cv.pxToWorld(160), farReach = cv.pxToWorld(420);
  for (const d of shapes.filter(isPlain)) {
    const e = sub(d.to, d.from);
    const len = mag(e);
    if (len < 1e-9) continue;
    const n = [-e[1] / len, e[0] / len];
    for (const end of [d.from, d.to]) {
      let best = null;
      for (const dir of [n, scale(n, -1)]) {
        for (const g of edges) {
          const t = rayHit(end, dir, g.a, g.b);
          if (t != null && t <= (g.far ? farReach : reach) && (!best || t < best.t)) best = { t, dir, beam: g.beam, gapPx: g.gapPx };
        }
        // A joint straight across from the dimension's end (within 3 px of the ray).
        for (const P of points) {
          const w = sub(P, end), t = w[0] * dir[0] + w[1] * dir[1];
          const off = Math.abs(w[0] * dir[1] - w[1] * dir[0]);
          if (t > 1e-9 && t <= farReach && off < cv.pxToWorld(3) && (!best || t < best.t - 1e-9)) best = { t, dir, gapPx: 9 }; // (its ring: 7 px, and a little)
        }
      }
      if (!best || best.t < cv.pxToWorld(8)) continue; // already touching
      // Stop just short of the body's surface (a beam is drawn thick), start just past the line.
      const halfPx = best.beam ? ((best.beam.width || 12) + 3) / 2 : best.gapPx != null ? best.gapPx - 4 : 0;
      // (It stops 2 px short of the body: close, without touching it.)
      out.push({ type: "line", style: "extension", from: add(end, scale(best.dir, -cv.pxToWorld(5))), to: add(end, scale(best.dir, best.t)), gapPx: halfPx + 2 });
    }
  }
  return out;
}

