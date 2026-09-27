// supports.js — textbook symbols for supports (Unit 7 on):
//   supportSymbol { kind: "pin" | "roller" | "smooth" | "fixed" | "cable" | "none",
//                   at, normal, anchor?, label?, alpha? }
// `normal` is a unit vector (metres) from the support INTO the body: the symbol
// is drawn on the other side. Symbols are pixel-sized, like the other objects.
//   pin     a triangle on hatched ground, with the pin (a ring) at `at`
//   roller  a triangle on two small wheels, on hatched ground
//   smooth  a hatched surface the body rests on
//   fixed   a hatched block (a wall) the body is built into; the beam's end is square against it
//   cable   a line to its anchor, fixed to a small hatched ceiling or wall
//   link    a two-force member: a slim bar to its anchor, pinned at both ends
//           (a ring at the body, a pin on hatched ground at the anchor)
// Returns { boxes, segments, labels } like the other shapes, or null for other types.

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
  const ring = (q, r = 4.5) => {
    ctx.beginPath();
    ctx.arc(q[0], q[1], r, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
  };
  const cover = (pts) => {
    const xs = pts.map((q) => q[0]), ys = pts.map((q) => q[1]);
    out.boxes.push({ x0: Math.min(...xs), y0: Math.min(...ys), x1: Math.max(...xs), y1: Math.max(...ys) });
  };
  switch (s.kind) {
    case "pin": {
      poly([p, at(-14, 24), at(14, 24)]);
      hatch(ctx, at(0, 24), t, b, 22);
      ring(p);
      cover([at(-22, 0), at(22, 32)]);
      break;
    }
    case "roller": {
      poly([p, at(-12, 17), at(12, 17)]);
      ring(at(-6, 21.5), 4);
      ring(at(6, 21.5), 4);
      hatch(ctx, at(0, 26), t, b, 20);
      ring(p);
      cover([at(-20, 0), at(20, 34)]);
      break;
    }
    case "smooth": {
      hatch(ctx, at(0, 7), t, b, 26);
      cover([at(-26, 5), at(26, 15)]);
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
      // The anchor's pin: a triangle behind it, on hatched ground across the bar.
      const w = [-u[1], u[0]];
      const back = (along, depth) => [q[0] + w[0] * along + u[0] * depth, q[1] + w[1] * along + u[1] * depth];
      poly([q, back(-11, 18), back(11, 18)]);
      hatch(ctx, back(0, 18), w, u, 16);
      ring(q, 4);
      ring(p, 4);
      // The anchor's name (e.g. D), beside its pin, on the side away from the bar.
      if (s.anchorLabel) {
        const side = [q[0] - w[0] * 20, q[1] - w[1] * 20], other = [q[0] + w[0] * 20, q[1] + w[1] * 20];
        const beyond = [q[0] + u[0] * 34, q[1] + u[1] * 34];
        out.labels.push({ text: s.anchorLabel, pos: side, spots: [side, other, beyond], align: "center", size: 14, weight: 700, color: env.ink, plain: true, breaks: true });
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
      break;
    }
  }
  ctx.restore();
  // The support's name (A, B …) stays as close to its point as it can:
  // centred below the symbol, else just beside the symbol or the point (a
  // reaction arrow is often in the way below). A dimension line under it breaks.
  if (s.label) {
    const box = out.boxes[0];
    const mid = box ? (box.y0 + box.y1) / 2 + 4 : p[1];
    const spots = box
      ? [[(box.x0 + box.x1) / 2, box.y1 + 12, "center"], [box.x0 - 6, mid, "right"], [box.x1 + 6, mid, "left"],
        [p[0] - 12, p[1] + 16, "right"], [p[0] + 12, p[1] + 16, "left"], [p[0] - 12, p[1] - 12, "right"], [p[0] + 12, p[1] - 12, "left"]]
      : [[p[0], p[1] + 20, "center"], [p[0] + 12, p[1] + 16, "left"], [p[0] - 12, p[1] + 16, "right"]];
    out.labels.push({ text: s.label, pos: spots[0].slice(0, 2), spots, align: "center", size: 14, weight: 700, color: env.ink, plain: true, breaks: true });
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
