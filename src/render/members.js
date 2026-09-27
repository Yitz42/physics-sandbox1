// members.js — truss members (Unit 5.1):
//   member { id, from, to, state?, label?, side?, alpha? }
//     a straight bar between two joints. state colours it once it's solved:
//     "tension" red, "compression" blue, "zero" grey (a zero-force member);
//     no state: the plain bar colour. Its label (e.g. "500 N (T)") is written
//     along the bar, just beside it and upright, on the `side` asked for
//     (a direction in metres; see bar-label.js).
// Returns { boxes, segments, labels } like the other shapes, or null for other types.

import { barBoxes } from "./labels.js";
import { drawAlongBar } from "./bar-label.js";

export function drawMember(cv, s, env, roleColor) {
  if (s.type !== "member") return null;
  const { ctx } = cv;
  const out = { boxes: [], segments: [], labels: [] };
  const a = cv.toScreen(s.from), b = cv.toScreen(s.to);
  const fill = s.state === "tension" ? roleColor("tension") : s.state === "compression" ? roleColor("compression") : s.state === "zero" ? env.faint : env.crate;
  ctx.save();
  ctx.globalAlpha = s.alpha ?? 1;
  ctx.lineCap = "round";
  const line = (w, color) => {
    ctx.strokeStyle = color;
    ctx.lineWidth = w;
    ctx.beginPath();
    ctx.moveTo(a[0], a[1]);
    ctx.lineTo(b[0], b[1]);
    ctx.stroke();
  };
  line(9, env.ink);
  line(6, fill);
  ctx.restore();
  out.segments.push([a, b]);
  out.boxes.push(...barBoxes(a, b, 9)); // the bar's whole thickness, for the labels
  if (s.label) {
    const color = s.state ? fill : env.ink;
    // The force is written along its own bar, beside it (bar-label.js), on the
    // side the scene asks for (s.side, a direction in metres: out of the truss).
    const side = s.side ? (() => { const m = [(s.from[0] + s.to[0]) / 2, (s.from[1] + s.to[1]) / 2], p = cv.toScreen(m), q = cv.toScreen([m[0] + s.side[0], m[1] + s.side[1]]); return [q[0] - p[0], q[1] - p[1]]; })() : null;
    const boxes = drawAlongBar(ctx, s.label, a, b, { thick: 9, side, color, size: 13, weight: 600 });
    if (boxes) out.boxes.push(...boxes);
    else {
      // Too short a bar for the text: an ordinary label, kept close to its own bar.
      const len = Math.hypot(b[0] - a[0], b[1] - a[1]) || 1;
      const n = [-(b[1] - a[1]) / len, (b[0] - a[0]) / len]; // across the bar
      const mid = [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2];
      const at = (k, d) => [mid[0] + n[0] * d * k, mid[1] + n[1] * d * k]; // k = ±1: which side of the bar
      // (Further out if it must — e.g. a short crossbar between two legs — but still by its own bar.)
      const spots = [at(1, 15), at(-1, 15), at(1, 24), at(-1, 24), at(1, 36), at(-1, 36), at(1, 50), at(-1, 50)];
      out.labels.push({ text: s.label, pos: spots[0], spots, align: "center", size: 13, weight: 600, color, maxMove: 56 });
    }
  }
  return out;
}
