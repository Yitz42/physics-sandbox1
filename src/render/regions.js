// regions.js — flat shapes filled in (Unit 7.1: the parts of a composite area).
//   region { points: [[x, y], …], tint: 0 | 1 | 2 | 3, label?, alpha?, hole? }
//   hole: true — a hole cut out of the parts drawn before it (Unit 7.2): filled with
//   the page colour, so it looks cut through, and outlined dashed inside a solid edge.
// A filled polygon with an outline (a half circle comes as many points). Its
// edges are solid lines for the labels (they keep clear of them), and its inside
// is soft: a label may sit on it if it must — the part's own number sits inside.
//   leader { at: [x, y], dir: [dx, dy], label }
// A leader, as on a drawing: a thin line with a small arrowhead touching a
// round edge at `at`, running out along `dir` to a short shoulder where its
// label ("⌀1 m") sits — a hole's size, written clear of the hole.
// Returns { boxes, segments, labels } like the other shapes, or null for other types.

import { drawLabel } from "./arrows.js";

// Light fills that tell neighbouring parts apart (see-through, so dark mode works too).
const TINTS = ["rgba(59, 130, 246, 0.22)", "rgba(245, 158, 11, 0.26)", "rgba(16, 185, 129, 0.24)", "rgba(236, 72, 153, 0.22)"];

export function drawRegion(cv, s, env) {
  if (s.type === "leader") return drawLeader(cv, s, env);
  if (s.type !== "region") return null;
  const { ctx } = cv;
  const out = { boxes: [], segments: [], labels: [] };
  const pts = s.points.map((p) => cv.toScreen(p));
  ctx.save();
  ctx.globalAlpha = s.alpha ?? 1;
  ctx.beginPath();
  pts.forEach((p, i) => (i ? ctx.lineTo(p[0], p[1]) : ctx.moveTo(p[0], p[1])));
  ctx.closePath();
  ctx.fillStyle = s.hole ? env.paper : TINTS[(s.tint || 0) % TINTS.length];
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

const LEADER_PX = 30; // the slanted part's length
const SHOULDER_PX = 10; // the short level part the label sits at

function drawLeader(cv, s, env) {
  const { ctx } = cv;
  const out = { boxes: [], segments: [], labels: [] };
  const a = cv.toScreen(s.at);
  const len = Math.hypot(s.dir[0], s.dir[1]) || 1;
  const u = [s.dir[0] / len, -s.dir[1] / len]; // (screen y points down)
  const b = [a[0] + u[0] * LEADER_PX, a[1] + u[1] * LEADER_PX];
  const side = u[0] >= 0 ? 1 : -1;
  const c = [b[0] + side * SHOULDER_PX, b[1]];
  ctx.save();
  ctx.strokeStyle = env.ink;
  ctx.fillStyle = env.ink;
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(a[0], a[1]);
  ctx.lineTo(b[0], b[1]);
  ctx.lineTo(c[0], c[1]);
  ctx.stroke();
  // The arrowhead, touching the edge.
  const h = 6, w = 2.5, n = [-u[1], u[0]];
  ctx.beginPath();
  ctx.moveTo(a[0], a[1]);
  ctx.lineTo(a[0] + u[0] * h + n[0] * w, a[1] + u[1] * h + n[1] * w);
  ctx.lineTo(a[0] + u[0] * h - n[0] * w, a[1] + u[1] * h - n[1] * w);
  ctx.closePath();
  ctx.fill();
  ctx.restore();
  out.segments.push([a, b], [b, c]);
  if (s.label) {
    const align = side > 0 ? "left" : "right";
    const x = c[0] + side * 6; // (clear of the shoulder by more than a label's 4 px gap)
    out.labels.push({ text: s.label, pos: [x, c[1]], spots: [[x, c[1], align], [x, c[1] - 8, align], [x, c[1] + 8, align]], align, size: 13, weight: 600, color: env.ink, maxMove: 10 });
  }
  return out;
}
