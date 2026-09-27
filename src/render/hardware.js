// hardware.js — pictures of tools and vehicles, so problems look real:
//   wrench   { from, to }          a box-end wrench: its ring around a hex nut at
//                                  `from` (the bolt, point O), its handle to `to`
//   trailer  { from, to }          a trailer's tow bar, hitch and jack stand in
//                                  front of its bed, and a front board and tailgate
//                                  (the bed itself is a beam from `from` = front to `to` = back)
// Pixel-sized details, like the other objects. Returns { boxes, segments, labels },
// or null for a shape type it doesn't know.

import { cssColor } from "./arrows.js";

export function drawHardware(cv, s, env) {
  if (s.type !== "wrench" && s.type !== "trailer") return null;
  const { ctx } = cv;
  const out = { boxes: [], segments: [], labels: [] };
  const p0 = cv.toScreen(s.from), p1 = cv.toScreen(s.to);
  const len = Math.hypot(p1[0] - p0[0], p1[1] - p0[1]) || 1;
  const u = [(p1[0] - p0[0]) / len, (p1[1] - p0[1]) / len]; // along the handle / bed
  const n = [-u[1], u[0]]; // across it
  const steel = cssColor("--c-steel", "#c9d0d9");
  const pt = (base, a, b) => [base[0] + u[0] * a + n[0] * b, base[1] + u[1] * a + n[1] * b];
  ctx.save();
  ctx.strokeStyle = env.ink;
  ctx.lineJoin = "round";
  ctx.lineWidth = 2;

  if (s.type === "wrench") {
    const R = 17; // the ring around the nut
    // Handle: a tapered bar from the ring to a rounded end.
    const a = pt(p0, R - 4, 8), b = pt(p1, 0, 6), c = pt(p1, 0, -6), d = pt(p0, R - 4, -8);
    ctx.fillStyle = steel;
    ctx.beginPath();
    ctx.moveTo(a[0], a[1]);
    ctx.lineTo(b[0], b[1]);
    const ang = Math.atan2(u[1], u[0]);
    ctx.arc(p1[0], p1[1], 6, ang + Math.PI / 2, ang - Math.PI / 2, true);
    ctx.lineTo(d[0], d[1]);
    ctx.fill();
    ctx.stroke();
    // Ring, then the hex nut inside it, then the bolt's end.
    ctx.beginPath();
    ctx.arc(p0[0], p0[1], R, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = cssColor("--c-nut", "#8f99a6");
    ctx.beginPath();
    for (let k = 0; k < 6; k++) {
      const t = ang + Math.PI / 6 + (k * Math.PI) / 3;
      const q = [p0[0] + 10 * Math.cos(t), p0[1] + 10 * Math.sin(t)];
      k ? ctx.lineTo(q[0], q[1]) : ctx.moveTo(q[0], q[1]);
    }
    ctx.closePath();
    ctx.fill();
    ctx.lineWidth = 1.5;
    ctx.stroke();
    out.boxes.push({ x0: p0[0] - R, y0: p0[1] - R, x1: p0[0] + R, y1: p0[1] + R });
    out.segments.push([p0, p1]);
  } else {
    // Trailer: an A-frame tow bar forward of the bed to the hitch coupler,
    // and a jack stand under the tow bar. "Forward" is away from the bed.
    const down = [0, 1];
    const under = [p0[0], p0[1] + 6]; // the bed's underside at the front
    const hitch = [p0[0] - u[0] * 62 + down[0] * 6, p0[1] - u[1] * 62 + down[1] * 6];
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(under[0] + n[0] * 5, under[1]);
    ctx.lineTo(hitch[0], hitch[1]);
    ctx.stroke();
    // Coupler: the cup that drops over the car's tow ball.
    ctx.fillStyle = env.ink;
    ctx.beginPath();
    ctx.arc(hitch[0], hitch[1], 5, 0, Math.PI * 2);
    ctx.fill();
    // Jack stand, partway along the tow bar.
    const j = [(under[0] + hitch[0]) / 2, (under[1] + hitch[1]) / 2];
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(j[0], j[1]);
    ctx.lineTo(j[0], j[1] + 24);
    ctx.moveTo(j[0] - 7, j[1] + 24);
    ctx.lineTo(j[0] + 7, j[1] + 24);
    ctx.stroke();
    // Front board and tailgate: short walls standing up at the two ends of the bed.
    ctx.lineWidth = 4;
    ctx.lineCap = "round";
    for (const e of [p0, p1]) {
      ctx.beginPath();
      ctx.moveTo(e[0], e[1] - 6);
      ctx.lineTo(e[0], e[1] - 30);
      ctx.stroke();
    }
    // What labels must keep off: the tow bar (a line), the hitch and the jack
    // stand — not the space under the front of the bed, where O's letter goes.
    out.segments.push([under, hitch]);
    out.boxes.push({ x0: hitch[0] - 7, y0: hitch[1] - 7, x1: hitch[0] + 7, y1: hitch[1] + 7 });
    out.boxes.push({ x0: j[0] - 8, y0: j[1], x1: j[0] + 8, y1: j[1] + 26 });
  }
  ctx.restore();
  return out;
}
