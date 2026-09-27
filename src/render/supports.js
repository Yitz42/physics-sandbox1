// supports.js — textbook symbols for supports (Unit 7 on):
//   supportSymbol { kind: "pin" | "roller" | "smooth" | "rough" | "fixed" | "cable" | "none",
//                   at, normal, anchor?, label?, alpha? }
// `normal` is a unit vector (metres) from the support INTO the body: the symbol
// is drawn on the other side. Symbols are pixel-sized, like the other objects.
//   pin     a triangle on hatched ground, with the pin (a ring) at `at`
//   roller  a triangle on two small wheels, on hatched ground
//   smooth  a hatched surface the body rests on
//   rough   the same, its face drawn with small teeth: it grips (friction, Unit 9.1)
//   fixed   a hatched block (a wall) the body is built into; the beam's end is square against it
//   cable   a line to its anchor, fixed to a small hatched ceiling or wall
//   link    a two-force member: a slim bar to its anchor, pinned at both ends
//           (a ring at the body, a pin on hatched ground at the anchor)
// Returns { boxes, segments, labels } like the other shapes, or null for other types.
//
// Object boundaries (a rule for every drawing): each part a symbol draws —
// triangle, wheels, hatching, a link's bar — is reported as a box, so labels
// keep clear of it (render/labels.js keeps a gap around every box).

import { barBoxes, LETTER_CLEAR } from "./labels.js";
import { letterDrop } from "./arrows.js";

// A pin's size, the same for every pin (a support's or a link's anchor), in pixels.
const PIN = { half: 14, depth: 24, ground: 22, ring: 4.5 };

export function drawSupportSymbol(cv, s, env) {
  if (s.type !== "supportSymbol") return null;
  const { ctx } = cv;
  const out = { boxes: [], segments: [], labels: [] };
  if (s.kind === "none") return out;
  const p = cv.toScreen(s.at);
  const n = [s.normal[0], -s.normal[1]]; // screen y points down
  const b = [-n[0], -n[1]]; // from the body toward the support
  const t = [-n[1], n[0]]; // along the surface
  const at = (along, back) => [p[0] + t[0] * along + b[0] * back, p[1] + t[1] * along + b[1] * back];
  ctx.save();
  ctx.globalAlpha = s.alpha ?? 1;
  ctx.strokeStyle = env.ink;
  ctx.fillStyle = env.paper;
  ctx.lineWidth = 2;
  const poly = (pts, fill = true) => {
    ctx.beginPath();
    pts.forEach((q, i) => (i ? ctx.lineTo(q[0], q[1]) : ctx.moveTo(q[0], q[1])));
    ctx.closePath();
    if (fill) ctx.fill();
    ctx.stroke();
  };
  // A pin: its triangle (apex at the pin), hatched ground behind it, the ring —
  // in the frame (along, back) — and its outline, for the labels.
  const pinAt = (apex, along, back) => {
    const pt = (a, d) => [apex[0] + along[0] * a + back[0] * d, apex[1] + along[1] * a + back[1] * d];
    poly([apex, pt(-PIN.half, PIN.depth), pt(PIN.half, PIN.depth)]);
    hatch(ctx, pt(0, PIN.depth), along, back, PIN.ground);
    ring(apex, PIN.ring);
    // Its true outline: the ring, the triangle in slices that widen with depth, and
    // the hatched strip — so a letter can come right up beside the pin.
    wholeOf(pt, -PIN.ground, PIN.ground, -PIN.ring, PIN.depth + 8);
    outline(pt, -PIN.ring, PIN.ring, -PIN.ring, PIN.ring, along);
    triangle(pt, PIN.half, 0, PIN.depth, along);
    outline(pt, -PIN.ground, PIN.ground, PIN.depth, PIN.depth + 8, along);
  };
  // A symbol's outline, from its extent in its own frame (u along the ground,
  // v back into it): pt(u, v) → pixels. Level or upright, one box covers it
  // exactly. Tilted, one screen box would cover a lot of empty space round it
  // (where the slope's angle number goes), so it's covered by thin slices
  // across the ground line instead — the object-boundaries rule: true outlines.
  // symbolBox keeps the whole extent, for placing the support's letter.
  let symbolBox = null;
  const boxOf = (cs) => ({ x0: Math.min(...cs.map((c) => c[0])), y0: Math.min(...cs.map((c) => c[1])), x1: Math.max(...cs.map((c) => c[0])), y1: Math.max(...cs.map((c) => c[1])) });
  // The symbol's whole extent (for its letter), when its outline comes in pieces.
  const wholeOf = (pt, u0, u1, v0, v1) => (symbolBox = boxOf([pt(u0, v0), pt(u1, v0), pt(u0, v1), pt(u1, v1)]));
  // A triangle with its apex at depth v0, widening to ±half at v1: slices 4 px deep.
  const triangle = (pt, half, v0, v1, dir = t) => {
    const n = Math.max(1, Math.ceil((v1 - v0) / 4));
    for (let i = 0; i < n; i++) {
      const a = v0 + ((v1 - v0) * i) / n, c = v0 + ((v1 - v0) * (i + 1)) / n;
      const w = (half * (c - v0)) / (v1 - v0) + 1; // (its 2 px outline)
      outline(pt, -w, w, a, c, dir);
    }
  };
  const outline = (pt, u0, u1, v0, v1, dir = t) => {
    const whole = boxOf([pt(u0, v0), pt(u1, v0), pt(u0, v1), pt(u1, v1)]);
    if (!symbolBox) symbolBox = whole;
    if (Math.abs(dir[0] * dir[1]) < 0.02) return out.boxes.push(whole);
    const n = Math.max(1, Math.ceil((u1 - u0) / 6));
    for (let i = 0; i < n; i++) {
      const a = u0 + ((u1 - u0) * i) / n, c = u0 + ((u1 - u0) * (i + 1)) / n;
      out.boxes.push(boxOf([pt(a, v0), pt(c, v0), pt(a, v1), pt(c, v1)]));
    }
  };
  const ring = (q, r = 4.5) => {
    ctx.beginPath();
    ctx.arc(q[0], q[1], r, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
  };
  // The area a symbol covers, from two opposite corners in its own frame
  // (all four corners count, so a tilted symbol's box really covers it).
  const cover = ([p1, p2]) => {
    const along = (q) => (q[0] - p[0]) * t[0] + (q[1] - p[1]) * t[1];
    const back = (q) => (q[0] - p[0]) * b[0] + (q[1] - p[1]) * b[1];
    outline(at, Math.min(along(p1), along(p2)), Math.max(along(p1), along(p2)), Math.min(back(p1), back(p2)), Math.max(back(p1), back(p2)));
  };
  // On a slope (not level ground, not a wall): mark the slope's angle at the
  // low end of the ground line, between the level and the slope. It's an angle
  // mark like any other (render/angles.js), drawn after everything else, so its
  // number keeps clear of the reaction arrows too: the arc grows outward and the
  // dashed level line reaches out to meet it.
  const tilt = (Math.atan2(Math.abs(s.normal[0]), s.normal[1]) * 180) / Math.PI;
  const incline = (c, half) => {
    if (!(tilt > 1 && tilt < 89)) return;
    const e1 = [c[0] - t[0] * half, c[1] - t[1] * half], e2 = [c[0] + t[0] * half, c[1] + t[1] * half];
    const [Q, R] = e1[1] > e2[1] ? [e1, e2] : [e2, e1]; // Q: the low end (screen y is down)
    const v = [R[0] - Q[0], -(R[1] - Q[1])]; // up the slope, in world directions (y up)
    const level = v[0] >= 0 ? 0 : 180; // the level side, toward the slope
    const slope = (Math.atan2(v[1], v[0]) * 180) / Math.PI;
    (out.arcs ||= []).push({ type: "arc", center: cv.toWorld(Q), r: 22 / cv.view.scale, start: level, end: slope, label: `${Math.round(tilt)}°` });
  };
  switch (s.kind) {
    case "pin": {
      pinAt(p, t, b);
      incline(at(0, PIN.depth), PIN.ground);
      break;
    }
    case "roller": {
      poly([p, at(-12, 17), at(12, 17)]);
      ring(at(-6, 21.5), 4);
      ring(at(6, 21.5), 4);
      hatch(ctx, at(0, 26), t, b, 20);
      ring(p);
      // (Its true outline: ring, triangle, wheels, hatched strip.)
      wholeOf(at, -20, 20, -4.5, 34);
      outline(at, -5.5, 5.5, -5.5, 5.5);
      triangle(at, 12, 0, 17);
      outline(at, -11, 11, 17, 26);
      outline(at, -20, 20, 26, 34);
      incline(at(0, 26), 20);
      break;
    }
    case "smooth": {
      hatch(ctx, at(0, 7), t, b, 26);
      cover([at(-26, 5), at(26, 15)]);
      incline(at(0, 7), 26);
      break;
    }
    case "rough": {
      // A hatched surface whose face has small teeth, the textbook's sign for a rough (gripping) surface.
      hatch(ctx, at(0, 7), t, b, 26);
      ctx.save();
      ctx.lineWidth = 1.4;
      ctx.beginPath();
      for (let k = -26; k <= 26; k += 4) {
        const q = at(k, (k / 4) % 2 === 0 ? 7 : 3.5);
        if (k === -26) ctx.moveTo(q[0], q[1]);
        else ctx.lineTo(q[0], q[1]);
      }
      ctx.stroke();
      ctx.restore();
      cover([at(-26, 2), at(26, 15)]);
      incline(at(0, 7), 26);
      break;
    }
    case "fixed": {
      // A block the body is mounted in: a hatched box behind a heavy wall face.
      const box = [at(-30, 0), at(30, 0), at(30, 16), at(-30, 16)];
      poly(box);
      ctx.save();
      ctx.beginPath();
      box.forEach((q, i) => (i ? ctx.lineTo(q[0], q[1]) : ctx.moveTo(q[0], q[1])));
      ctx.closePath();
      ctx.clip();
      ctx.lineWidth = 1;
      for (let k = -44; k <= 30; k += 7) {
        const a0 = at(k, 0), a1 = at(k + 16, 16);
        ctx.beginPath();
        ctx.moveTo(a0[0], a0[1]);
        ctx.lineTo(a1[0], a1[1]);
        ctx.stroke();
      }
      ctx.restore();
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(...at(-30, 0));
      ctx.lineTo(...at(30, 0));
      ctx.stroke();
      cover([at(-30, 0), at(30, 16)]);
      break;
    }
    case "link": {
      const q = cv.toScreen(s.anchor);
      const len = Math.hypot(q[0] - p[0], q[1] - p[1]) || 1;
      const u = [(q[0] - p[0]) / len, (q[1] - p[1]) / len]; // from the body to the anchor
      // The bar: a slim outlined strip.
      ctx.lineCap = "round";
      ctx.lineWidth = 7;
      ctx.beginPath();
      ctx.moveTo(p[0], p[1]);
      ctx.lineTo(q[0], q[1]);
      ctx.stroke();
      ctx.strokeStyle = env.paper;
      ctx.lineWidth = 3.5;
      ctx.stroke();
      ctx.strokeStyle = env.ink;
      ctx.lineWidth = 2;
      out.segments.push([p, q]);
      out.boxes.push(...barBoxes(p, q, 7));
      // The anchor's pin — the same pin as a pin support — square to its wall
      // when it has one (anchorNormal: from the wall into the room), else lined up with the bar.
      const away = s.anchorNormal ? [-s.anchorNormal[0], s.anchorNormal[1]] : u; // from the pin into the wall (screen)
      const w = [-away[1], away[0]];
      pinAt(q, w, away);
      ring(p, 4);
      // The anchor's name (e.g. D), beside its pin, clear of the triangle and the ground.
      if (s.anchorLabel) {
        const off = PIN.ground + 12;
        const spots = [[-off, PIN.depth / 2], [off, PIN.depth / 2], [-off, -8], [off, -8]].map(([a, d]) => [q[0] + w[0] * a + away[0] * d, q[1] + w[1] * a + away[1] * d + 5]);
        spots.push([q[0] - u[0] * 30, q[1] - u[1] * 30 + 5]);
        out.labels.push({ text: s.anchorLabel, pos: spots[0], spots, align: "center", size: 14, weight: 700, color: env.ink, plain: true, breaks: true });
      }
      break;
    }
    case "cable": {
      const q = cv.toScreen(s.anchor);
      ctx.beginPath();
      ctx.moveTo(p[0], p[1]);
      ctx.lineTo(q[0], q[1]);
      ctx.stroke();
      out.segments.push([p, q]);
      // The anchor: a short hatched ceiling/wall across the cable, beyond its end.
      const len = Math.hypot(q[0] - p[0], q[1] - p[1]) || 1;
      const u = [(q[0] - p[0]) / len, (q[1] - p[1]) / len];
      hatch(ctx, q, [-u[1], u[0]], u, 16);
      ring(p, 3.5);
      const ends = [[-16, 0], [16, 0], [-16, 9], [16, 9]].map(([a, d]) => [q[0] - u[1] * a + u[0] * d, q[1] + u[0] * a + u[1] * d]);
      out.boxes.push({ x0: Math.min(...ends.map((e) => e[0])), y0: Math.min(...ends.map((e) => e[1])), x1: Math.max(...ends.map((e) => e[0])), y1: Math.max(...ends.map((e) => e[1])) });
      break;
    }
  }
  ctx.restore();
  // The support's name (A, B …) stays as close to its point as it can:
  // centred below the symbol, else just beside the symbol or the point (a
  // reaction arrow is often in the way below). A dimension line under it breaks.
  if (s.label) {
    // (A link's or cable's boxes are its bar and far anchor: its letter goes by its point.)
    const box = s.kind === "link" || s.kind === "cable" ? null : symbolBox || out.boxes[0];
    const mid = box ? (box.y0 + box.y1) / 2 : p[1];
    const spots = box
      // (First choice: straight below the symbol, just outside its clear gap — CLEAR, labels.js.)
      // (Tight letter boxes, labelBox: 6.3 px above a letter's middle, 1.5 px at its sides.)
      // Then right beside the pin itself (level with it, clear of the symbol under it), then
      // beside the symbol.
      ? [[(box.x0 + box.x1) / 2, box.y1 + 6.6 + LETTER_CLEAR, "center"], [p[0] - 10, p[1] - 1, "right"], [p[0] + 10, p[1] - 1, "left"],
        [box.x0 - 2 - LETTER_CLEAR, mid, "right"], [box.x1 + 2 + LETTER_CLEAR, mid, "left"],
        [p[0] - 10, p[1] + 12, "right"], [p[0] + 10, p[1] + 12, "left"], [p[0] - 10, p[1] - 10, "right"], [p[0] + 10, p[1] - 10, "left"]]
      : [[p[0], p[1] + 14, "center"], [p[0] + 10, p[1] + 10, "left"], [p[0] - 10, p[1] + 10, "right"]];
    out.labels.push({ text: s.label, pos: spots[0].slice(0, 2), spots, align: "center", size: 14, weight: 700, color: env.ink, plain: true, breaks: true, clear: LETTER_CLEAR, tight: letterDrop(s.label) });
  }
  return out;
}

// A ground line of half-length `half` through `c` along `t`, hatched on side `b`.
function hatch(ctx, c, t, b, half) {
  ctx.beginPath();
  ctx.moveTo(c[0] - t[0] * half, c[1] - t[1] * half);
  ctx.lineTo(c[0] + t[0] * half, c[1] + t[1] * half);
  ctx.stroke();
  ctx.save();
  ctx.lineWidth = 1;
  for (let k = -half + 4; k <= half; k += 7) {
    const x = c[0] + t[0] * k, y = c[1] + t[1] * k;
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x + b[0] * 7 - t[0] * 5, y + b[1] * 7 - t[1] * 5);
    ctx.stroke();
  }
  ctx.restore();
}
