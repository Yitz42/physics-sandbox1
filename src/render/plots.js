// plots.js — shear and moment diagrams drawn under a beam (Units 8.2–8.3).
//   plot { points: [[x, y], …], base: y, name: "V", tint: 0 | 1, marks: [{ at: [x, y], text, below?, side? }],
//          dashed?, alpha? }
// points: the curve in metres, already scaled (the scene turns newtons into
// metres), from the baseline at the left end to the baseline at the right end —
// two points at the same x make a jump. base: the baseline's height.
// Draws the baseline (the zero line), the area between it and the curve lightly
// filled, the curve itself, the diagram's name at the left ("V", "M") and a
// value at each mark (a dot on the curve, the number above it — below for a
// negative value). dashed: a student's sketch (a debug stage), drawn dashed.
// Returns { boxes, segments, labels } like the other shapes, or null for other types.

import { cssColor } from "./arrows.js";

const FILLS = ["rgba(31, 95, 191, 0.14)", "rgba(194, 65, 12, 0.14)"]; // shear blue, moment orange (see-through)
const LINES = [["--c-force", "#1f5fbf"], ["--c-unknown", "#c2410c"]];

export function drawPlot(cv, s, env) {
  if (s.type !== "plot") return null;
  const { ctx } = cv;
  const out = { boxes: [], segments: [], labels: [] };
  const pts = s.points.map((p) => cv.toScreen(p));
  if (pts.length < 2) return out;
  const [, yb] = cv.toScreen([0, s.base]);
  const x0 = pts[0][0], x1 = pts[pts.length - 1][0];
  const tint = s.tint || 0;
  const line = cssColor(...LINES[tint % LINES.length]);
  ctx.save();
  ctx.globalAlpha = s.alpha ?? 1;
  // The filled area between the curve and the zero line.
  ctx.beginPath();
  ctx.moveTo(x0, yb);
  for (const p of pts) ctx.lineTo(p[0], p[1]);
  ctx.lineTo(x1, yb);
  ctx.closePath();
  ctx.fillStyle = FILLS[tint % FILLS.length];
  if (!s.dashed) ctx.fill();
  // The zero line.
  ctx.strokeStyle = env.ink;
  ctx.lineWidth = 1.2;
  ctx.beginPath();
  ctx.moveTo(x0, yb);
  ctx.lineTo(x1, yb);
  ctx.stroke();
  // The curve.
  ctx.strokeStyle = line;
  ctx.lineWidth = 2.2;
  ctx.lineJoin = "round";
  if (s.dashed) ctx.setLineDash([6, 4]);
  ctx.beginPath();
  pts.forEach((p, i) => (i ? ctx.lineTo(p[0], p[1]) : ctx.moveTo(p[0], p[1])));
  ctx.stroke();
  ctx.setLineDash([]);
  // Marks: a dot at each value written.
  ctx.fillStyle = line;
  for (const m of s.marks || []) {
    const [x, y] = cv.toScreen(m.at);
    ctx.beginPath();
    ctx.arc(x, y, 2.6, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();

  // Labels keep off the curve and the zero line; the filled area is soft.
  for (let i = 1; i < pts.length; i++) out.segments.push([pts[i - 1], pts[i]]);
  out.segments.push([[x0, yb], [x1, yb]]);
  const ys = pts.map((p) => p[1]);
  out.boxes.push({ x0, y0: Math.min(yb, ...ys), x1, y1: Math.max(yb, ...ys), soft: true, under: true });
  // The name, left of the zero line (with its unit).
  if (s.name) out.labels.push({ text: s.name, pos: [x0 - 10, yb], spots: [[x0 - 10, yb, "right"]], align: "right", size: 15, weight: 700, color: line, maxMove: 12 });
  for (const m of s.marks || []) {
    const [x, y] = cv.toScreen(m.at);
    const up = !m.below;
    const d = up ? -13 : 13;
    // m.side: +1 prefers the right of the point, −1 the left, 0 straight above (below).
    const right = [[x + 7, y + d, "left"], [x + 10, y, "left"]], left = [[x - 7, y + d, "right"], [x - 10, y, "right"]];
    const middle = [[x, y + d, "center"], [x, y + 2 * d, "center"]];
    const spots = m.side > 0 ? [...right, ...middle, ...left] : m.side < 0 ? [...left, ...middle, ...right] : [...middle, ...right, ...left];
    out.labels.push({ text: m.text, pos: spots[0].slice(0, 2), spots, align: spots[0][2], size: 12, weight: 600, color: env.ink, maxMove: 30, yields: true });
  }
  return out;
}
