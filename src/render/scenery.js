// scenery.js — more pictures of real things, so the same idea can appear in
// different settings (a stage's "situations", see core/content.js):
//   trafficLight { at, w, h, label }   a traffic light hanging from `at` (top of its
//                                      housing), housing w × h metres; label beside it
//   balloon      { at, r, label }      a hot-air / weather balloon tied at `at`
//                                      (bottom of its short rope), envelope radius r metres
//   pole         { from, to }          a street pole from its top `from` down to its foot
//                                      `to` (metres), standing on the ground
// drawScenery returns { boxes, segments, labels } like the other shape files,
// or null for a shape type it doesn't know. Drawing only — no physics.

import { cssColor } from "./arrows.js";

export function drawScenery(cv, s, env) {
  const { ctx } = cv;
  const S = cv.toScreen;
  const { ink } = env;
  const out = { boxes: [], segments: [], labels: [] };
  const label = (text, x, y) => text && out.labels.push({ text, pos: [x, y], align: "left", size: 13, weight: 500, color: ink, plain: true });
  switch (s.type) {
    case "trafficLight": {
      // A dark housing with red, amber and green lamps, hung from its top.
      const [x, y] = S(s.at);
      const w = s.w * cv.view.scale, h = s.h * cv.view.scale;
      ctx.save();
      ctx.lineWidth = 2;
      ctx.strokeStyle = ink;
      ctx.fillStyle = "#374151";
      ctx.beginPath();
      ctx.roundRect(x - w / 2, y, w, h, Math.min(6, w * 0.2));
      ctx.fill();
      ctx.stroke();
      const r = Math.min(w * 0.3, h / 7.5);
      ["#ef4444", "#f59e0b", "#22c55e"].forEach((c, i) => {
        ctx.fillStyle = c;
        ctx.beginPath();
        ctx.arc(x, y + (h * (i + 0.5)) / 3, r, 0, Math.PI * 2);
        ctx.fill();
      });
      ctx.restore();
      label(s.label, x + w / 2 + 10, y + h / 2);
      out.boxes.push({ x0: x - w / 2, y0: y, x1: x + w / 2, y1: y + h });
      return out;
    }
    case "balloon": {
      // An envelope (circle, slightly taller than wide) with a short rope
      // down to the tie point `at`, where the tethers meet.
      const [x, y] = S(s.at);
      const r = s.r * cv.view.scale;
      const cy = y - 0.9 * r - r; // centre of the envelope, above its rope
      ctx.save();
      ctx.lineWidth = 2;
      ctx.strokeStyle = ink;
      ctx.beginPath(); // the rope
      ctx.moveTo(x, y);
      ctx.lineTo(x, cy + r * 1.05);
      ctx.stroke();
      ctx.fillStyle = cssColor("--c-balloon", "#fca5a5");
      ctx.beginPath();
      ctx.ellipse(x, cy, r * 0.92, r * 1.05, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      ctx.lineWidth = 1; // two seams, so it reads as a balloon
      ctx.beginPath();
      ctx.ellipse(x, cy, r * 0.4, r * 1.05, 0, 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();
      label(s.label, x + r + 10, cy);
      out.boxes.push({ x0: x - r, y0: cy - r * 1.05, x1: x + r, y1: y });
      out.segments.push([[x, y], [x, cy + r]]);
      return out;
    }
    case "pole": {
      // A thick post from the ground up to where the wire is fixed, with a
      // short hatched strip of ground at its foot.
      const top = S(s.from), base = S(s.to);
      ctx.save();
      ctx.strokeStyle = ink;
      ctx.lineCap = "butt";
      ctx.lineWidth = 7;
      ctx.beginPath();
      ctx.moveTo(top[0], top[1]);
      ctx.lineTo(base[0], base[1]);
      ctx.stroke();
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.moveTo(base[0] - 22, base[1]);
      ctx.lineTo(base[0] + 22, base[1]);
      ctx.stroke();
      ctx.lineWidth = 1;
      for (let k = -22; k <= 22; k += 7) {
        ctx.beginPath();
        ctx.moveTo(base[0] + k, base[1]);
        ctx.lineTo(base[0] + k - 5, base[1] + 7);
        ctx.stroke();
      }
      ctx.restore();
      out.segments.push([top, base]);
      return out;
    }
    default:
      return null;
  }
}
