// dims.js — engineering-drawing rules for dimension lines, applied to every
// picture before it is drawn (see diagrams.js):
//   lowerDims()   a dimension line that an arrow runs across moves down (with
//                 every dimension below it), until it clears the arrow and the
//                 arrow's label, so its value can sit right on the line
//   extendDims()  thin extension lines run from each end of a dimension to
//                 just short of the body it measures (a beam or a plate)
// A dimension can opt out: noExt (it has its own guide lines), role "arm"
// (a moment arm drawn at the lines it measures).

import { sub, add, scale, mag } from "../core/vector.js";

const ROOM_PX = 46; // below an arrow's tip: room for its label, then the dimension

// Screen-space helpers.
const isPlain = (s) => s.type === "dim" && s.role !== "arm" && !s.noExt;

export function lowerDims(shapes, cv) {
  const dims = shapes.filter((s) => isPlain(s) && Math.abs(s.from[1] - s.to[1]) < 1e-9); // horizontal ones
  if (!dims.length) return shapes;
  const arrows = shapes.filter((s) => s.type === "arrow" && s.role !== "shadow" && s.role !== "component");
  const shift = new Map(); // dim → pixels to move down
  // Work from the top dimension down, so moving one pushes the ones below it too.
  const byY = [...dims].sort((a, b) => cv.toScreen(a.from)[1] - cv.toScreen(b.from)[1]);
  let pushed = 0; // how far the dimensions below have been pushed so far
  for (const d of byY) {
    const a = cv.toScreen(d.from), b = cv.toScreen(d.to);
    const y = a[1] + pushed;
    const x0 = Math.min(a[0], b[0]), x1 = Math.max(a[0], b[0]);
    let need = 0;
    for (const s of arrows) {
      const p = cv.toScreen(s.from), q = cv.toScreen(s.to);
      const top = Math.min(p[1], q[1]), bottom = Math.max(p[1], q[1]);
      const xs = [p[0], q[0]];
      const inside = xs.some((x) => x > x0 + 2 && x < x1 - 2);
      if (inside && top < y && bottom > y - 4) need = Math.max(need, bottom + ROOM_PX - y);
    }
    pushed += need;
    if (pushed > 0) shift.set(d, pushed);
  }
  if (!shift.size) return shapes;
  return shapes.map((s) => {
    const px = shift.get(s);
    if (!px) return s;
    const dy = cv.pxToWorld(px);
    return { ...s, from: [s.from[0], s.from[1] - dy], to: [s.to[0], s.to[1] - dy] };
  });
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
  // The bodies a dimension can measure: beam centre lines and plate edges.
  const edges = [];
  for (const s of shapes) {
    if (s.type === "beam") for (let i = 1; i < s.points.length; i++) edges.push({ a: s.points[i - 1], b: s.points[i], beam: s });
    if (s.type === "box" && s.passable) {
      const [x, y] = s.at, w = s.w / 2, h = s.h / 2;
      const c = [[x - w, y - h], [x + w, y - h], [x + w, y + h], [x - w, y + h]];
      for (let i = 0; i < 4; i++) edges.push({ a: c[i], b: c[(i + 1) % 4] });
    }
  }
  if (!edges.length) return shapes;
  const out = [...shapes];
  const reach = cv.pxToWorld(160); // don't run extension lines across the whole picture
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
          if (t != null && t <= reach && (!best || t < best.t)) best = { t, dir, beam: g.beam };
        }
      }
      if (!best || best.t < cv.pxToWorld(8)) continue; // already touching
      // Stop just short of the body's surface (a beam is drawn thick), start just past the line.
      const halfPx = best.beam ? ((best.beam.width || 12) + 3) / 2 : 0;
      out.push({ type: "line", style: "extension", from: add(end, scale(best.dir, -cv.pxToWorld(5))), to: add(end, scale(best.dir, best.t)), gapPx: halfPx + 4 });
    }
  }
  return out;
}

