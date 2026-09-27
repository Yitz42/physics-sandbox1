// regions.js — flat shapes filled in (Unit 6.1: the parts of a composite area).
//   region { points: [[x, y], …], tint: 0 | 1 | 2 | 3, label?, alpha? }
// A filled polygon with an outline (a half circle comes as many points). Its
// edges are solid lines for the labels (they keep clear of them), and its inside
// is soft: a label may sit on it if it must — the part's own number sits inside.
// Returns { boxes, segments, labels } like the other shapes, or null for other types.

import { drawLabel } from "./arrows.js";

// Light fills that tell neighbouring parts apart (see-through, so dark mode works too).
const TINTS = ["rgba(59, 130, 246, 0.22)", "rgba(245, 158, 11, 0.26)", "rgba(16, 185, 129, 0.24)", "rgba(236, 72, 153, 0.22)"];

export function drawRegion(cv, s, env) {
  if (s.type !== "region") return null;
  const { ctx } = cv;
  const out = { boxes: [], segments: [], labels: [] };
  const pts = s.points.map((p) => cv.toScreen(p));
  ctx.save();
  ctx.globalAlpha = s.alpha ?? 1;
  ctx.beginPath();
  pts.forEach((p, i) => (i ? ctx.lineTo(p[0], p[1]) : ctx.moveTo(p[0], p[1])));
  ctx.closePath();
  ctx.fillStyle = TINTS[(s.tint || 0) % TINTS.length];
  ctx.fill();
  ctx.strokeStyle = env.ink;
  ctx.lineWidth = 1.8;
  ctx.stroke();
  ctx.restore();
  for (let i = 0; i < pts.length; i++) out.segments.push([pts[i], pts[(i + 1) % pts.length]]);
  const xs = pts.map((p) => p[0]), ys = pts.map((p) => p[1]);
  // (under: labels may sit on the shape freely — a centroid's letter goes right by its dot)
  out.boxes.push({ x0: Math.min(...xs), y0: Math.min(...ys), x1: Math.max(...xs), y1: Math.max(...ys), soft: true, under: true });
  if (s.label && s.labelAt) {
    const [x, y] = cv.toScreen(s.labelAt);
    out.boxes.push(drawLabel(ctx, s.label, x, y, { color: env.ink, size: 13, weight: 700 }));
  }
  return out;
}
