// mechanisms.js — drawings of springs and pulleys (Unit 2 on):
//   spring  { from, to, id, coils? }   a zig-zag spring between two points (metres);
//                                      short straight ends, coils in the middle
//   pulley  { at, r? }                 a pulley wheel centred at `at`, r in metres
//                                      (default 0.18 m), with its axle
// Like the other shape files, drawMechanism returns { boxes, segments, labels },
// or null for a shape type it doesn't know.

import { cssColor } from "./arrows.js";

export function drawMechanism(cv, s, env) {
  const { ctx } = cv;
  const S = cv.toScreen;
  const { ink, paper } = env;
  const out = { boxes: [], segments: [], labels: [] };
  switch (s.type) {
    case "spring": {
      const a = S(s.from), b = S(s.to);
      const len = Math.hypot(b[0] - a[0], b[1] - a[1]);
      if (len < 1) return out;
      const t = [(b[0] - a[0]) / len, (b[1] - a[1]) / len]; // along the spring
      const n = [-t[1], t[0]]; // across it
      const end = Math.min(14, len * 0.15); // straight bits at each end
      const coils = s.coils || 8;
      const amp = 7; // half the zig-zag's width, in pixels
      const at = (d, side) => [a[0] + t[0] * d + n[0] * side, a[1] + t[1] * d + n[1] * side];
      ctx.save();
      ctx.strokeStyle = env.lit ? cssColor("--c-force", "#1f5fbf") : ink; // lit: its force is highlighted
      ctx.lineWidth = env.lit ? 3 : 2;
      ctx.lineJoin = "round";
      ctx.beginPath();
      ctx.moveTo(a[0], a[1]);
      ctx.lineTo(...at(end, 0));
      const body = len - 2 * end;
      for (let k = 0; k < 2 * coils; k++) ctx.lineTo(...at(end + (body * (k + 0.5)) / (2 * coils), k % 2 ? -amp : amp));
      ctx.lineTo(...at(len - end, 0));
      ctx.lineTo(b[0], b[1]);
      ctx.stroke();
      ctx.restore();
      out.segments.push([a, b]); // labels keep off the spring
      return out;
    }
    case "pulley": {
      const [x, y] = S(s.at);
      const r = (s.r || 0.18) * cv.view.scale;
      ctx.save();
      ctx.lineWidth = 2.2;
      ctx.strokeStyle = ink;
      ctx.fillStyle = env.crate;
      ctx.beginPath();
      ctx.arc(x, y, r, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      // The groove the cable runs in, and the axle.
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.arc(x, y, r * 0.72, 0, Math.PI * 2);
      ctx.stroke();
      ctx.fillStyle = paper;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(x, y, Math.max(3, r * 0.2), 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      ctx.restore();
      out.boxes.push({ x0: x - r, y0: y - r, x1: x + r, y1: y + r, heavy: true });
      return out;
    }
    default:
      return null;
  }
}
