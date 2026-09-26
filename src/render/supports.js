// supports.js — textbook symbols for supports (Unit 7 on):
//   supportSymbol { kind: "pin" | "roller" | "smooth" | "fixed" | "cable" | "none",
//                   at, normal, anchor?, label?, alpha? }
// `normal` is a unit vector (metres) from the support INTO the body: the symbol
// is drawn on the other side. Symbols are pixel-sized, like the other objects.
//   pin     a triangle on hatched ground, with the pin (a ring) at `at`
//   roller  a triangle on two small wheels, on hatched ground
//   smooth  a hatched surface the body rests on
//   fixed   a hatched wall the body is built into
//   cable   a line to its anchor, fixed to a small hatched ceiling or wall
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
  let far = at(0, 12); // where the label goes near
  switch (s.kind) {
    case "pin": {
      poly([p, at(-14, 24), at(14, 24)]);
      hatch(ctx, at(0, 24), t, b, 22);
      ring(p);
      cover([at(-22, 0), at(22, 32)]);
      far = at(-22, 20);
      break;
    }
    case "roller": {
      poly([p, at(-12, 17), at(12, 17)]);
      ring(at(-6, 21.5), 4);
      ring(at(6, 21.5), 4);
      hatch(ctx, at(0, 26), t, b, 20);
      ring(p);
      cover([at(-20, 0), at(20, 34)]);
      far = at(-20, 18);
      break;
    }
    case "smooth": {
      hatch(ctx, at(0, 7), t, b, 26);
      cover([at(-26, 5), at(26, 15)]);
      far = at(-26, 12);
      break;
    }
    case "fixed": {
      ctx.lineWidth = 3;
      hatch(ctx, p, t, b, 30);
      cover([at(-30, 0), at(30, 9)]);
      far = at(-30, 8);
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
      far = [p[0] + 12 * t[0], p[1] + 12 * t[1]];
      break;
    }
  }
  ctx.restore();
  // The support's name (A, B …), placed with the other labels so it dodges arrows.
  if (s.label) out.labels.push({ text: s.label, pos: [far[0] - 8 * Math.sign(t[0] || 1), far[1] + 4], align: "center", size: 14, weight: 700, color: env.ink, plain: true, maxMove: 30 });
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
