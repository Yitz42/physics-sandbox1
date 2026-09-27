// objects.js — pictures of real things, so problems look like the textbook's:
//   motor    { at }                   an electric motor seen end-on, shaft at `at` (pixel-sized)
//   lamp     { at, w, h, label }      a hanging lamp: cord attached at `at` (top), shade w × h metres
//   eyebolt  { at, dir }              an eyebolt: its eye at `at`, screwed into a surface
//                                     in direction `dir` (a unit vector, metres) — pixel-sized
//   bracket  { at, dir }              a wall bracket holding the point `at`; the wall is in
//                                     direction `dir` — pixel-sized
// drawObject returns { boxes, segments, labels } like the other shapes, or null
// for a shape type it doesn't know.

import { cssColor } from "./arrows.js";

// Hatched ground/wall line through (x, y) along screen direction t, hatch on side n.
function hatchedLine(ctx, x, y, t, n, half) {
  ctx.beginPath();
  ctx.moveTo(x - t[0] * half, y - t[1] * half);
  ctx.lineTo(x + t[0] * half, y + t[1] * half);
  ctx.stroke();
  ctx.save();
  ctx.lineWidth = 1;
  for (let k = -half; k <= half; k += 7) {
    const px = x + t[0] * k, py = y + t[1] * k;
    ctx.beginPath();
    ctx.moveTo(px, py);
    ctx.lineTo(px + n[0] * 7 - t[0] * 5, py + n[1] * 7 - t[1] * 5);
    ctx.stroke();
  }
  ctx.restore();
}

export function drawObject(cv, s, env) {
  const { ctx } = cv;
  const S = cv.toScreen;
  const { ink, paper } = env;
  const grey = cssColor("--c-line", "#d5dbe4");
  const out = { boxes: [], segments: [], labels: [] };
  ctx.save();
  try {
    switch (s.type) {
      case "motor": {
        // An electric motor seen end-on (a simple facsimile): a round housing
        // with cooling fins, bolted to a foot on the ground, and the shaft in
        // the middle — the shaft is what turns. Sized in pixels.
        const [x, y] = S(s.at);
        const R = 26;
        ctx.lineWidth = 2;
        ctx.strokeStyle = ink;
        // Foot and ground.
        ctx.fillStyle = grey;
        ctx.beginPath();
        ctx.moveTo(x - 14, y + R - 6);
        ctx.lineTo(x + 14, y + R - 6);
        ctx.lineTo(x + 22, y + R + 10);
        ctx.lineTo(x - 22, y + R + 10);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(x - 32, y + R + 10);
        ctx.lineTo(x + 32, y + R + 10);
        ctx.stroke();
        ctx.lineWidth = 1;
        for (let t = -30; t <= 30; t += 7) {
          ctx.beginPath();
          ctx.moveTo(x + t, y + R + 10);
          ctx.lineTo(x + t - 6, y + R + 17);
          ctx.stroke();
        }
        // Housing with fins.
        ctx.lineWidth = 2;
        for (let k = 0; k < 12; k++) {
          const a = (k * Math.PI) / 6;
          ctx.beginPath();
          ctx.moveTo(x + Math.cos(a) * R, y + Math.sin(a) * R);
          ctx.lineTo(x + Math.cos(a) * (R + 5), y + Math.sin(a) * (R + 5));
          ctx.stroke();
        }
        ctx.fillStyle = grey;
        ctx.beginPath();
        ctx.arc(x, y, R, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
        ctx.fillStyle = paper;
        ctx.beginPath();
        ctx.arc(x, y, R - 9, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
        // Shaft, with a key so you can see it turn.
        ctx.fillStyle = ink;
        ctx.beginPath();
        ctx.arc(x, y, 6, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = paper;
        ctx.fillRect(x - 1.5, y - 6, 3, 4);
        out.boxes.push({ x0: x - R - 6, y0: y - R - 6, x1: x + R + 6, y1: y + R + 18 });
        return out;
      }
      case "lamp": {
        // Shade (a wide cone seen from the side) and a glowing bulb under it.
        const [x, y] = S(s.at);
        const w = s.w * cv.view.scale, h = s.h * cv.view.scale;
        const topW = 0.28 * w;
        ctx.lineWidth = 2;
        ctx.strokeStyle = ink;
        ctx.fillStyle = "#fde68a"; // warm light
        ctx.beginPath();
        ctx.arc(x, y + h, 0.2 * w, 0, Math.PI);
        ctx.fill();
        ctx.stroke();
        ctx.fillStyle = env.crate;
        ctx.beginPath();
        ctx.moveTo(x - topW / 2, y);
        ctx.lineTo(x + topW / 2, y);
        ctx.lineTo(x + w / 2, y + h);
        ctx.lineTo(x - w / 2, y + h);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
        // The mass goes beside the shade.
        if (s.label) out.labels.push({ text: s.label, pos: [x + w / 2 + 10, y + h / 2], align: "left", size: 13, weight: 500, color: ink, plain: true });
        out.boxes.push({ x0: x - w / 2, y0: y, x1: x + w / 2, y1: y + h + 0.2 * w });
        return out;
      }
      case "eyebolt": {
        // A closed eye around the point, a threaded shank, a nut, and the surface it's screwed into.
        const [x, y] = S(s.at);
        const d = [s.dir[0], -s.dir[1]]; // screen y points down
        const n = [-d[1], d[0]];
        const R = 13, L = 52;
        ctx.strokeStyle = ink;
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.arc(x, y, R, 0, Math.PI * 2);
        ctx.stroke();
        // Shank with thread marks.
        const s0 = [x + d[0] * R, y + d[1] * R], s1 = [x + d[0] * L, y + d[1] * L];
        ctx.lineWidth = 5;
        ctx.beginPath();
        ctx.moveTo(s0[0], s0[1]);
        ctx.lineTo(s1[0], s1[1]);
        ctx.stroke();
        ctx.lineWidth = 1;
        ctx.strokeStyle = paper;
        for (let k = R + 12; k < L; k += 4) {
          const p = [x + d[0] * k, y + d[1] * k];
          ctx.beginPath();
          ctx.moveTo(p[0] - n[0] * 2.5, p[1] - n[1] * 2.5);
          ctx.lineTo(p[0] + n[0] * 2.5, p[1] + n[1] * 2.5);
          ctx.stroke();
        }
        // Nut against the surface, then the surface itself.
        ctx.strokeStyle = ink;
        ctx.lineWidth = 2;
        ctx.fillStyle = grey;
        const nut = [x + d[0] * (L - 4), y + d[1] * (L - 4)];
        ctx.beginPath();
        ctx.moveTo(nut[0] - n[0] * 8 - d[0] * 4, nut[1] - n[1] * 8 - d[1] * 4);
        ctx.lineTo(nut[0] + n[0] * 8 - d[0] * 4, nut[1] + n[1] * 8 - d[1] * 4);
        ctx.lineTo(nut[0] + n[0] * 8 + d[0] * 4, nut[1] + n[1] * 8 + d[1] * 4);
        ctx.lineTo(nut[0] - n[0] * 8 + d[0] * 4, nut[1] - n[1] * 8 + d[1] * 4);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
        ctx.lineWidth = 2.5;
        hatchedLine(ctx, s1[0], s1[1], n, d, 32);
        // What labels must keep off: the eye, the shank (a line) and the mount at
        // its end — not the whole rectangle around them, so the point's letter
        // can sit right next to the eye.
        out.segments.push([s0, s1]);
        out.boxes.push({ x0: x - R - 2, y0: y - R - 2, x1: x + R + 2, y1: y + R + 2 });
        out.boxes.push({ x0: s1[0] - 18, y0: s1[1] - 18, x1: s1[0] + 18, y1: s1[1] + 18 });
        return out;
      }
      case "bracket": {
        // An angle bracket bolted to a wall: a plate from the wall to the point, with a gusset.
        const [x, y] = S(s.at);
        const d = [s.dir[0], -s.dir[1]];
        const n = [-d[1], d[0]];
        const L = 46;
        const w0 = [x + d[0] * L, y + d[1] * L];
        ctx.lineJoin = "round";
        ctx.strokeStyle = ink;
        ctx.fillStyle = env.crate;
        ctx.lineWidth = 2;
        ctx.beginPath(); // the plate
        ctx.moveTo(x - n[0] * 6, y - n[1] * 6);
        ctx.lineTo(w0[0] - n[0] * 6, w0[1] - n[1] * 6);
        ctx.lineTo(w0[0] + n[0] * 22, w0[1] + n[1] * 22);
        ctx.lineTo(w0[0] - d[0] * 10 + n[0] * 22, w0[1] - d[1] * 10 + n[1] * 22);
        ctx.lineTo(x + n[0] * 6, y + n[1] * 6);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
        ctx.fillStyle = ink; // bolts
        for (const k of [2, 14]) {
          ctx.beginPath();
          ctx.arc(w0[0] - d[0] * 5 + n[0] * k, w0[1] - d[1] * 5 + n[1] * k, 2.5, 0, Math.PI * 2);
          ctx.fill();
        }
        ctx.lineWidth = 2.5;
        hatchedLine(ctx, w0[0] + n[0] * 8, w0[1] + n[1] * 8, n, d, 30);
        out.boxes.push({ x0: Math.min(x, w0[0]) - 24, y0: Math.min(y, w0[1]) - 24, x1: Math.max(x, w0[0]) + 24, y1: Math.max(y, w0[1]) + 24 });
        return out;
      }
      default:
        return null;
    }
  } finally {
    ctx.restore();
  }
}
