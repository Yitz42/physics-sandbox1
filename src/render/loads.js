// loads.js — drawings for loads spread along a beam (Unit 6 on):
//   distload { id?, profile: [[x, yTop], …], base, labels: [{ at, text }], splits?: [[p, q]],
//              role?, alpha?, dashed? }
//            a distributed load: the outline of the load curve (profile, in metres,
//            left to right), filled lightly, with a row of small arrows pushing down
//            onto the beam at height `base`. It floats gapPx (default 7) pixels
//            above `base` so the arrowheads sit on the beam's top edge.
//   wheel    { at, rPx? }   a wheel under a beam (e.g. a trailer's axle), touching at `at`
// Like shapes.js, each returns { boxes, segments, labels } for label placement,
// or null for a shape type it doesn't know.

export function drawLoadShape(cv, s, env, roleColor) {
  const { ctx } = cv;
  const S = cv.toScreen;
  const out = { boxes: [], segments: [], labels: [] };
  if (s.type === "distload") {
    const gap = s.gapPx ?? 7;
    const top = s.profile.map((p) => {
      const [x, y] = S(p);
      return [x, y - gap];
    });
    const baseY = S([0, s.base])[1] - gap;
    if (top.length < 2) return out;
    const color = roleColor(s.role || "known");
    ctx.save();
    ctx.globalAlpha = s.alpha ?? 1;
    // Light fill under the curve, so the load reads as an AREA (its resultant is that area).
    ctx.fillStyle = color;
    ctx.globalAlpha = 0.1 * (s.alpha ?? 1);
    ctx.beginPath();
    ctx.moveTo(top[0][0], baseY);
    for (const p of top) ctx.lineTo(p[0], p[1]);
    ctx.lineTo(top[top.length - 1][0], baseY);
    ctx.closePath();
    ctx.fill();
    ctx.globalAlpha = s.alpha ?? 1;
    // The outline of the curve.
    ctx.strokeStyle = color;
    ctx.lineWidth = 1.8;
    if (s.dashed) ctx.setLineDash([6, 4]);
    ctx.beginPath();
    top.forEach((p, i) => (i ? ctx.lineTo(p[0], p[1]) : ctx.moveTo(p[0], p[1])));
    ctx.stroke();
    ctx.setLineDash([]);
    // Dashed lines splitting the area into pieces (e.g. a trapezoid → rectangle + triangle).
    ctx.save();
    ctx.setLineDash([5, 4]);
    ctx.lineWidth = 1.2;
    for (const [p, q] of s.splits || []) {
      const a = S(p), b = S(q);
      ctx.beginPath();
      ctx.moveTo(a[0], a[1] - gap);
      ctx.lineTo(b[0], b[1] - gap);
      ctx.stroke();
    }
    ctx.restore();
    // A row of small arrows, about every 22 px, from the curve down to the beam.
    const x0 = top[0][0], x1 = top[top.length - 1][0];
    const count = Math.max(2, Math.round((x1 - x0) / 22) + 1);
    ctx.lineWidth = 1.4;
    for (let i = 0; i < count; i++) {
      const x = x0 + ((x1 - x0) * i) / (count - 1);
      const y = heightAt(top, x);
      if (baseY - y < 7) continue; // too short to draw (the load is ~zero here)
      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.lineTo(x, baseY - 4);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(x, baseY);
      ctx.lineTo(x - 3.5, baseY - 7);
      ctx.lineTo(x + 3.5, baseY - 7);
      ctx.closePath();
      ctx.fill();
    }
    ctx.restore();
    for (let i = 1; i < top.length; i++) out.segments.push([top[i - 1], top[i]]);
    const ys = top.map((p) => p[1]);
    // Labels may not cover the load (but may if there's no other room).
    out.boxes.push({ x0, y0: Math.min(...ys), x1, y1: baseY, soft: true });
    for (const l of s.labels || []) {
      const [x, y] = S(l.at);
      out.labels.push({ text: l.text, pos: [x, y - gap - 12], align: "center", size: 13, weight: 600, color, maxMove: 50 });
    }
    return out;
  }
  if (s.type === "wheel") {
    const [x, y] = S(s.at);
    const r = s.rPx || 13;
    ctx.save();
    ctx.strokeStyle = env.ink;
    ctx.fillStyle = env.paper;
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.arc(x, y + 6 + r, r, 0, Math.PI * 2); // just under the beam's bottom edge
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = env.ink;
    ctx.beginPath();
    ctx.arc(x, y + 6 + r, 3, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
    out.boxes.push({ x0: x - r, y0: y + 6, x1: x + r, y1: y + 6 + 2 * r });
    return out;
  }
  return null;
}

// Height (screen y) of the outline at screen x, by straight lines between its points.
function heightAt(top, x) {
  for (let i = 1; i < top.length; i++) {
    const [ax, ay] = top[i - 1], [bx, by] = top[i];
    if (x <= bx + 1e-6) return bx - ax < 1e-9 ? Math.min(ay, by) : ay + ((by - ay) * (x - ax)) / (bx - ax);
  }
  return top[top.length - 1][1];
}
